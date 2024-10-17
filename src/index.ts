import '~/lib/web';

import { initialize } from '~/lib/elevenlabs';
import config from '~/../config.json';
import { Client } from '~/lib';


global.clients = [];

async function init() {
	await initialize();

	for (const account of config.accounts) {
		try {
			const client = new Client(account);
			await client.initialize();
			global.clients.push(client);
		} catch (error) {
			console.error(`Error while logging in with ${account.phone}`, error);
		}
	}
}

init();