import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

import config from '../../../config.json';
import sleep from '../utilities/sleep';


export type EntityUpdate = {
	change: string;
	tx: string;
	date: number;
};

type DataProviderProps = {
	children: React.ReactNode;
};

type Data = {
	payload: {
		store: Record<string, EntityUpdate[]>;
		charts: Record<string, string>;
		names: Record<string, string>;
	};
};

type DataProviderState = {
	ws: WebSocket | null;
	isLoading: boolean;
	setData: (data: Data) => void;
	data: Data;
};

const initial = {
	data: { payload: { store: {}, charts: {}, names: {} } },
	ws: null,
	isLoading: true,
	setData: () => null
};

const DataProviderContext = createContext<DataProviderState>(initial);

function DataProvider({ children, ...props }: DataProviderProps) {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [data, setData] = useState<Data>({ payload: { store: {}, charts: {}, names: {} } });

	const ws = useRef<WebSocket | null>(null);

	const ctx = {
		data,
		setData,


		isLoading,
		get ws() {
			return ws.current;
		}
	};

	useEffect(() => {
		function onUnload() {
			ws.current?.close();
		}

		function createSocket() {
			if (ws.current) return;

			setIsLoading(true);

			const socket = new WebSocket('ws://' + config.web.externalIp + ':' + config.web.port);

			socket.binaryType = 'arraybuffer';

			ws.current = socket;

			socket.addEventListener('close', async () => {
				ws.current = null;

				console.log('Socket closed, waiting 1000ms then retrying...');
				await sleep(1000);

				createSocket();
			});

			socket.addEventListener('open', () => {
				console.info('Socket opened');
				setIsLoading(false);
			});

			socket.addEventListener('message', (event) => {
				try {
					if (event.data instanceof ArrayBuffer) {
						const blob = new Blob([event.data]);
						const src = URL.createObjectURL(blob);
						const audio = new Audio(src);
						audio.play();

						return;
					}

					const payload = JSON.parse(event.data);

					switch (payload.type) {
						case 'STORE_UPDATE': {
							console.log(payload);
							setData({ payload: payload.data });
						} break;
					}
				} catch (e) {
					console.error('!!! Failed parsing WebSocket message !!!');
				}
			});
		}

		createSocket();
		document.addEventListener('beforeunload', onUnload);

		return () => {
			document.removeEventListener('beforeunload', onUnload);
			ws.current!.close();
		};
	}, []);

	return <DataProviderContext.Provider key={Object.keys(data.payload).length} {...props} value={ctx} >
		{children}
	</DataProviderContext.Provider>;
}

export function useData() {
	const context = useContext(DataProviderContext);

	if (context === undefined) {
		throw new Error('useData must be used within an DataProvider');
	}

	return context;
}

export default DataProvider;