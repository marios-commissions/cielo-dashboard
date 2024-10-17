import { Api } from 'telegram';


export function parseAddress(content: string) {
	return content.match(/([1-9A-HJ-NP-Za-km-z]{32,44}|(\b0x[a-f0-9]{40}\b))/mi)?.[0];
}

export function parseLinks(message: Api.Message): Record<string, string> {
	if (!message?.entities) return {};

	return Object.fromEntries(message.entities
		.filter(e => e.className === 'MessageEntityTextUrl')
		.map(e => {
			const entity = (e as Api.MessageEntityTextUrl);
			const name = message.rawText.substr(entity.offset, entity.length);

			return [name, entity.url];
		}));
}

export function parseCoinName(message: Api.Message) {
	// const entities = message.entities?.filter(e => e.className === 'MessageEntityHashtag');
	// if (!entities) return null;

	// const entity = (entities[2] as Api.MessageEntityHashtag);
	// const text = message.rawText.slice(entity.offset);
	const name = message.rawText.match(/#([A-Za-z0-9$ ]+)(?= (On|@))/mi);

	return name ? name[0].trim().slice(1) : null;
}

export default { parseAddress, parseLinks, parseCoinName };