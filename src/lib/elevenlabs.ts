import credentials from '~/../credentials.json';
import { ElevenLabsClient } from 'elevenlabs';


const client = new ElevenLabsClient({ apiKey: credentials.elevenlabs.apiKey });

export async function initialize() {
	console.log('ElevenLabs initialized.');

	try {
		const { voices } = await client.voices.getAll();

		const formatted = voices.map((voice) => [
			'-----',
			`Name: ${voice.name}`,
			`ID: ${voice.voice_id}`,
			`Preview: ${voice.preview_url}`,
			'-----'
		].join('\n'));

		console.warn(formatted.join('\n\n'));
	} catch (error) {
		console.error('Failed to get available voices. This is likely due to a way bigger issue.', error);
		process.exit(-1);
	}
}

export default client;