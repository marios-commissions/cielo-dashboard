// @ts-nocheck
import { CopyCheck, CopyIcon } from 'lucide-react';
import { useEffect, useState } from 'react';


interface CopyFieldProps extends React.ComponentProps<'div'> {
	value: string;
}

function CopyField(props: CopyFieldProps) {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (copied) {
			navigator.clipboard.writeText(props.value);

			const timeout = setTimeout(() => setCopied(false), 1000);
			return () => clearTimeout(timeout);
		}
	}, [copied]);

	const content = props.value.slice(0, 3) + '...' + props.value.slice(-3);

	return <div {...props} className='flex items-center gap-2'>
		<p
			className='w-auto bg-transparent outline-none font-semibold text-neutral-400'
		>
			{content}
		</p>
		<button className='' onClick={() => !copied && setCopied(true)}>
			{copied ? <CopyCheck size={16} /> : <CopyIcon size={16} />}
		</button>
	</div>;
}

export default CopyField;