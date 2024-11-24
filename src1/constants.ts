import type { TelegramClientParams } from 'telegram/client/telegramBaseClient';
import path from 'path';


export const Paths = {
	Files: path.join(__dirname, '..', 'files')
};

export const ClientOptions: TelegramClientParams = {
	autoReconnect: true,
};

export const SessionName = '.keepsecret';