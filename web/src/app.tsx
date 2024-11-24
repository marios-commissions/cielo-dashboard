import { useMemo, useState, useEffect } from 'react';
import { ExternalLink, EyeOff } from 'lucide-react';

import { useData, type EntityUpdate } from './providers/websocket-provider';
import compare from './utilities/compare';
import config from '../../config.json';


function App() {
	const { data, isLoading, isDataReady } = useData();
	const [tapped, setTapped] = useState(false);

	const [hiddenTokens, setHiddenTokens] = useState<Record<string, { count: number; }>>(() => JSON.parse(localStorage.getItem('hiddenTokens') || '{}'));

	// Update local storage when hiddenTokens state changes
	useEffect(() => {
		localStorage.setItem('hiddenTokens', JSON.stringify(hiddenTokens));
	}, [hiddenTokens]);

	// Memoize grouped data by number of buys and address
	const grouped = useMemo(() => {
		const result: Record<number, Record<string, EntityUpdate[]>> = {};
		const store = data.payload.store;

		for (const [address, updates] of Object.entries(store)) {
			const buys = updates.length;

			// Skip if buys are below minimum display threshold
			if (buys < config.buys.display.min || updates.length > config.buys.display.max) continue;

			result[buys] ??= {};
			result[buys][address] = updates;
		}

		return result;
	}, [data]);

	const sortedData = useMemo(() => Object.entries(grouped).sort(([amountA], [amountB]) => Number(amountB) - Number(amountA)), [grouped]);

	const filteredData = useMemo(() => {
		const res = [];

		for (const chunk of sortedData) {
			const [amount, coins] = chunk;

			const visible = Object.entries(coins).filter(([c]) => !hiddenTokens[c]);
			if (visible.length) res.push([amount, Object.fromEntries(visible)]);
		}

		return res;
	}, [sortedData, hiddenTokens]);

	// Hide All Button Handler
	const hideAll = () => {
		const payload = {};
		for (const [, coins] of sortedData) {
			for (const [coin, buys] of Object.entries(coins)) {
				payload[coin] = { count: buys.length };
			}
		}

		setHiddenTokens(payload);
	};

	// Toggle individual hide for tokens
	const toggleHideToken = (address: string, currentBuys: number) => {
		setHiddenTokens((prevHiddenTokens) => {
			if (prevHiddenTokens[address]) {
				const { [address]: _, ...rest } = prevHiddenTokens; // Remove the token from hidden
				return rest;
			} else {
				return { ...prevHiddenTokens, [address]: { count: currentBuys } }; // Add the token with its buy count
			}
		});
	};

	// Cleanup hidden tokens that are no longer present or unhide if buys have increased
	useEffect(() => {
		if (!isDataReady) return;

		const currentHiddenTokens = { ...hiddenTokens };

		for (const [, coins] of sortedData) {
			for (const [address, buys] of Object.entries(coins)) {
				const hidden = hiddenTokens[address];
				if (!hidden) continue;

				if (buys.length === hidden.count) continue;

				delete currentHiddenTokens[address];
			}
		}

		if (compare(hiddenTokens, currentHiddenTokens)) {
			setHiddenTokens(currentHiddenTokens);
		}
	}, [sortedData, hiddenTokens, isDataReady]);
	// useEffect(() => {
	// 	if (!isDataReady) return;

	// 	const allTokens = sortedData.flatMap(([, coins]) => Object.keys(coins));
	// 	const validHiddenTokens = Object.entries(hiddenTokens).reduce((acc, [address, { count }]) => {
	// 		if (allTokens.includes(address)) {
	// 			const currentBuys = Object.keys(grouped).reduce((acc, key) => {
	// 				return grouped[key][address] ? grouped[key][address].length : acc;
	// 			}, 0);

	// 			if (currentBuys > count) {
	// 				// Unhide the token and update the count if buys have increased
	// 				acc[address] = { count: currentBuys };
	// 			} else {
	// 				acc[address] = { count };
	// 			}
	// 		}
	// 		return acc;
	// 	}, {});

	// Only update hiddenTokens if the new state is different from the current state
	// 	if (JSON.stringify(validHiddenTokens) !== JSON.stringify(hiddenTokens)) {
	// 		setHiddenTokens(validHiddenTokens);
	// 	}
	// }, [isDataReady, sortedData, grouped, hiddenTokens]);


	return (
		<div className='flex flex-col'>
			<div className='px-4 py-1 w-full flex flex-col gap-2'>
				{!tapped && <button className='bg-neutral-800 w-full border border-neutral-700 font-semibold rounded-md p-2' onClick={() => setTapped(true)}>
					Tap me to activate TTS
				</button>}
				<div className='flex gap-2'>
					<button className='bg-neutral-800 w-full border border-neutral-700 font-semibold rounded-md p-1' onClick={hideAll}>
						Hide All
					</button>
					<button className='bg-neutral-800 w-full border border-neutral-700 font-semibold rounded-md p-1' onClick={() => setHiddenTokens({})}>
						Unhide All
					</button>
				</div>
				<div className='w-full h-0.5 bg-neutral-800' />
			</div>

			{isLoading && <span className='p-2'>Connecting...</span>}
			{!isLoading && filteredData.length === 0 && <span className='p-2'>No purchases have been captured. When one gets captured, it will appear here.</span>}

			{/* Hide All Button */}

			{filteredData.map(([amount, coins]) => Object.keys(coins).length && (
				<>
					<div key={amount} className='flex gap-6 px-4 py-2 w-full'>
						<span className='text-2xl font-bold min-w-[50px]'>{amount}</span>
						<div className='w-full grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2'>
							{Object.entries(coins).map(([address, updates]) => {
								const currentBuys = updates.length;
								const isHidden = hiddenTokens[address] && hiddenTokens[address].count === currentBuys;
								if (isHidden) return null; // Don't render hidden tokens if buy count hasn't increased

								return (
									<div
										key={address}
										role='button'
										className='flex p-2 w-full rounded-md bg-neutral-800 border border-neutral-700 items-start overflow-clip'
									>
										<div className='flex flex-col overflow-hidden'>
											{data.payload.names[address] && <span className='truncate'>{data.payload.names[address]}</span>}
										</div>
										<div className='flex ml-auto gap-2'>
											<button onClick={() => toggleHideToken(address, currentBuys)}>
												<EyeOff size={18} />
											</button>
											{data.payload.charts[address] && (
												<a target='_blank' href={data.payload.charts[address]} role='button'>
													<ExternalLink size={18} />
												</a>
											)}
										</div>
									</div>
								);
							})}
						</div>
					</div>
					<div className='w-full h-0.5 bg-neutral-800' />
				</>
			))}
		</div>
	);
}

export default App;
