import { setTimeout } from 'node:timers/promises';
import credentials from '~/../credentials.json';
import { getTokenNameByAddress } from '~/utils';
import type { TransactionData } from '~/types';
import { ChartLinks } from '~/constants';
import config from '~/../config.json';
import events from '~/events';
import store from '~/store';
import WebSocket from 'ws';


let socket: WebSocket;

export function createWebSocket() {
	if (socket) return;

	console.log('Attempting to connect to WebSocket...');

	socket = new WebSocket('wss://feed-api.cielo.finance/api/v1/ws', {
		headers: {
			'X-Api-Key': credentials.cieloApiKey
		}
	});

	socket.on('message', async (data) => {
		try {
			const payload = JSON.parse(data as any);

			switch (payload.type) {
				case 'tx': {
					const data = payload.data as TransactionData;

					// Assuming only buys are recorded
					const address = data.token1_address;

					const isEthereum = address.startsWith('0x');
					if (!store.getName(address)) {
						const name = await getTokenNameByAddress(address, isEthereum);
						if (name) store.setName(address, name);
					}


					const name = store.getName(address) ?? 'Unknown';

					if (store.store[address]?.find(a => a.tx === data.tx_hash)) return;

					store.addToKey(address, { buyer: data.wallet, tx: data.tx_hash, date: Date.now() });

					const updates = store.store[address] ?? [];

					if (updates.length >= config.buys.tts.min && updates.length < config.buys.tts.max) {
						events.emit('tts', `${name}, ${updates.length}`);
					}

					store.setChart(address, (isEthereum ? ChartLinks.Ethereum : ChartLinks.Solana) + address);

					events.emit('store-updated');
					// notify(payload.data as TransactionData);
				} break;

				case 'feed_subscribed': {
					console.log('Successfully subscribed to feed.');
				} break;
			}
		} catch (error) {
			console.error('Failed to parse message from Cielo WebSocket:', error);
		}
	});

	socket.on('open', () => {
		console.log('WebSocket connected.');

		socket.send(JSON.stringify({
			type: 'subscribe_feed',
			filter: {
				tx_types: ['swap'],
				new_trade: true
			}
		}));
	});

	socket.on('close', async () => {
		console.log(`WebSocket closed. Attempting reconnect in 5000ms`);
		await setTimeout(5000);
		createWebSocket();
	});
}