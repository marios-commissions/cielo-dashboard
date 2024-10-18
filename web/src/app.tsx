import { ExternalLink } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useData, type EntityUpdate } from './providers/websocket-provider';
import config from '../../config.json';


function App() {
	const { data, isLoading } = useData();
	const [tapped, setTapped] = useState(false);

	const grouped = useMemo(() => {
		const result: Record<number, Record<string, EntityUpdate[]>> = {};
		const store = data.payload.store;

		// Iterate over the 'store' object which holds the coin transaction history
		for (const [address, updates] of Object.entries(store)) {
			const buys = updates.length;

			if (buys < config.minimumBuys.display) continue;

			result[buys] ??= {};
			result[buys][address] = updates;
			// const value = store[coin];
			// const numBuys = value.length; // Get the number of transactions (buys)

			// // If the number of buys (numBuys) is not yet a key in 'result', initialize it as an array
			// if (!result[numBuys]) {
			// 	result[numBuys] = [];
			// }

			// // Push the coin into the respective group based on the number of buys
			// result[numBuys].push(coin);
		}

		return result;
	}, [data]);

	console.log(grouped);


	const sortedData = useMemo(() => Object.entries(grouped).sort(([amountA], [amountB]) => Number(amountB) - Number(amountA)), [grouped]);

	return (
		<div className='flex flex-col'>
			{!tapped ? <div className='px-4 py-1 w-full flex flex-col gap-2'>
				<button className='bg-neutral-800 w-full border border-neutral-700 font-semibold rounded-md' onClick={() => setTapped(true)}>
					Tap me to activate TTS
				</button>
				<div className='w-full h-0.5 bg-neutral-800' />
			</div> : null}
			{isLoading && 'Connecting...'}
			{!isLoading && sortedData.length === 0 && 'No purchases have been captured. When one gets captured, it will appear here.'}
			{sortedData.map(([amount, coins]) => <>
				<div key={amount} className='flex gap-6 px-4 py-2 w-full'>
					<span className='text-2xl font-bold min-w-[50px]'>{amount}</span>
					<div className='w-full grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2'>
						{Object.entries(coins).map(([address, updates]) => {
							return (
								<div
									key={address}
									role='button'
									className='flex p-2 w-full rounded-md bg-neutral-800 border border-neutral-700 items-start overflow-clip'
									onClick={(event) => {
										const textArea = document.createElement('textarea');

										textArea.style.position = 'fixed';
										textArea.style.left = '-999999px';
										textArea.value = address;

										document.body.appendChild(textArea);
										textArea.focus();
										textArea.select();

										try {
											document.execCommand('copy');
										} catch (err) {
											console.error('Unable to copy to clipboard', err);
										} finally {
											textArea.remove();
										}
									}}
								>
									<div className='flex flex-col overflow-hidden' key={address}>
										{data.payload.names[address] && <span className='truncate'>{data.payload.names[address]}</span>}
									</div>
									{data.payload.charts[address] && <a className='ml-auto' target='_blank' href={data.payload.charts[address]} role='button'>
										<ExternalLink size={18} />
									</a>}
								</div>
							);
						})}
					</div>

				</div>
				<div className='w-full h-0.5 bg-neutral-800' />
			</>)}
		</div >
	);
}

export default App;
