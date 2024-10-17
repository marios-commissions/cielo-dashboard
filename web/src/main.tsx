import './index.css';

import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';

import DataProvider from './providers/websocket-provider';
import App from './app';


createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<DataProvider>
			<App />
		</DataProvider>
	</StrictMode>,
);
