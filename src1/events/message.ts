import { NewMessage, type NewMessageEvent } from 'telegram/events';
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
		const name = await getTokenNameByAddress(address, address.startsWith('0x'));
		if (name) store.setName(address, name);
	}

	const name = store.getName(address);
	const links = Parser.parseLinks(event.message);

	const [buyer] = event.message.text.split('\n');
	const tx = links['ViewTx'];

	if (store.store[address]?.find(a => a.tx === tx)) return;

	store.addToKey(address, { buyer, tx, date: Date.now() });

	const updates = store.store[address] ?? [];

	if (updates.length >= config.buys.tts.min && updates.length < config.buys.tts.max) {
		events.emit('tts', `${name}, ${updates.length}`);
	}


	const chart = links['Chart'];
	if (!chart) return;

	store.setChart(address, chart);
}