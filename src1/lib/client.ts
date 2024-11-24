import { ClientOptions, SessionName } from '~/constants';
import { TelegramClient } from 'telegram';
import * as Listeners from '~/events';
import input from 'input';


interface ExtendedClientOptions {
	apiId: number;
	apiHash: string;
	phone: string;
}

class Client extends TelegramClient {
	apiId: number;
	apiHash: string;
	phone: string;

	constructor({ apiId, apiHash, phone }: ExtendedClientOptions) {
		super(SessionName + phone, apiId, apiHash, ClientOptions);

		this.apiId = apiId;
		this.apiHash = apiHash;
		this.phone = phone;
	}

	async initialize() {
		await this.start({
			phoneNumber: this.phone,
			password: async () => input.text(`Please enter your password for ${this.phone}: `),
			phoneCode: async () => input.text(`Please enter the code you received at ${this.phone}: `),
			onError: (e) => console.error('Failed to log in:', e.message)
		});

		this._log.info(`Successfully logged in with ${this.phone}.`);

		for (const listener in Listeners) {
			const event = Listeners[listener as keyof typeof Listeners];

			this.addEventHandler(event.handler, event.listener);
		}
	}
}

export default Client;