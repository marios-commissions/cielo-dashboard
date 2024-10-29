import '~/lib/web';

import credentials from '~/../credentials.json';
import { initialize } from '~/lib/elevenlabs';
import { Client } from '~/lib';


global.clients = [];

async function init() {
	await initialize();

	for (const account of credentials.accounts) {
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