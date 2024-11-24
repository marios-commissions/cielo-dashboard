import config from '~/../config.json';
import { WebSocketServer } from 'ws';
import events from '~/events';
import store from '~/store';


export const ws = new WebSocketServer({ port: config.web.port });

ws.on('connection', (socket) => {
	console.info('Client connected to WebSocket server.');

	function sendUpdate() {
		const payload = JSON.stringify({
			type: 'STORE_UPDATE',
			data: {
				store: store.store,
				charts: store.charts,
				names: store.names
			},
		});

		socket.send(payload);
	}

	function sendTTS(content: string) {
		const payload = JSON.stringify({
			type: 'TTS',
			data: content
		});

		socket.send(payload);
	}

	events.on('store-updated', sendUpdate);
	events.on('tts', sendTTS);

	socket.on('error', console.error);

	socket.on('close', () => {
		console.info('Client disconnected from WebSocket server.');
		events.off('store-updated', sendUpdate);
		events.off('tts', sendTTS);
	});

	setTimeout(() => sendUpdate(), 500);
});

ws.on('listening', () => {
	console.info('WebSocket server listening on port 8098');
});