import { ExternalLink } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useData } from './providers/websocket-provider';
import CopyField from './components/copy-field';


function App() {
	const { data, isLoading } = useData();
	const [tapped, setTapped] = useState(false);

	const sortedData = useMemo(() => Object.entries(data.payload.store).sort(([addressA, updatesA], [addressB, updatesB]) => {
		const totalBuysA = updatesA.length;
		const totalBuysB = updatesB.length;
		return totalBuysB - totalBuysA;
	}), [data]);

	return (
		<div className='grid p-4 grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2'>
			{!tapped ? <button className='bg-neutral-800 border border-neutral-700 font-semibold rounded-md' onClick={() => setTapped(true)}>
				Tap me to activate TTS
			</button> : null}
			{isLoading && 'Connecting...'}
			{!isLoading && Object.keys(data.payload.store).length === 0 && 'No purchases have been captured. When one gets captured, it will appear here.'}
			{Object.keys(data.payload.store).length !== 0 && sortedData.map(([address, updates]) => {
				return (
					<div key={address} className='flex p-2 w-full rounded-md bg-neutral-800 border border-neutral-700 items-start overflow-clip'>
						<div className='flex flex-col overflow-hidden' key={address}>
							<span>
								<span className='text-xl font-bold'>{updates.length}</span> buy{updates.length > 1 ? 's' : ''}
							</span>
							{data.payload.names[address] && <span className='truncate'>{data.payload.names[address]}</span>}
							<CopyField className='truncate' value={address} />
						</div>
						{data.payload.charts[address] && <a className='ml-auto' target='_blank' href={data.payload.charts[address]} role='button'>
							<ExternalLink size={18} />
						</a>}
					</div>
				);
			})}
		</div>
	);
}

export default App;
