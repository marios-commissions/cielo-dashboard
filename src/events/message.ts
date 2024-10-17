import { NewMessage, type NewMessageEvent } from 'telegram/events';
import streamToString from '~/utils/streamToString';
import ElevenLabs from '~/lib/elevenlabs';
import config from '~/../config.json';
import Parser from '~/lib/parser';
import events from '~/lib/events';
import store from '~/lib/store';


export const listener = new NewMessage({ chats: ['5347402666', '2045865476'] });

export async function handler(event: NewMessageEvent) {
	const text = event.message.rawText;
	if (!text) {
		return;
	}

	if (!event.message.text?.includes('Swapped')) return;

	const address = Parser.parseAddress(event.message.text);
	if (!address) return;

	if (!store.getName(address)) {
		const name = await getTokenNameByAddress(address);
		if (name) store.setName(address, name);
	}


	const links = Parser.parseLinks(event.message);

	const [buyer] = event.message.text.split('\n');
	const tx = links['ViewTx'];

	if (store.store[address]?.find(a => a.tx === tx)) return;

	store.addToKey(address, { buyer, tx, date: Date.now() });

	const updates = store.store[address] ?? [];

	if (updates?.length >= config.minimumBuys.tts) {
		const name = store.getName(address);
		const stream = await ElevenLabs.textToSpeech.convert(config.elevenlabs.voiceId, {
			text: `${updates.length} wallets bought ${name}`
		});

		console.info('Streaming...');
		const content = await streamToString(stream);
		console.log('Streamed.');

		events.emit('tts', content?.buffer);
	}


	const chart = links['Chart'];
	if (!chart) return;

	store.setChart(address, chart);
}

async function getTokenNameByAddress(address: string) {
	console.log(address);
	const request = await fetch('https://api.dexscreener.com/latest/dex/tokens/' + address).catch(() => null);
	if (!request) return 'Unknown';

	const json = await request.json();
	const firstPair = json?.pairs?.[0];

	console.log(json);
	return firstPair && `${firstPair.baseToken?.name} (${firstPair.baseToken?.symbol})`;
}