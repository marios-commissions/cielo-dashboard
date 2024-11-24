import './index.css';

import { createRoot } from 'react-dom/client';

import DataProvider from './providers/websocket-provider';
import App from './app';


createRoot(document.getElementById('root')!).render(
	<DataProvider>
		<App />
	</DataProvider>
);
