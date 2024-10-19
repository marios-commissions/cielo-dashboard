import sleep from './sleep';


export const queue: Blob[] = [];

let isPlaying = false;

export function playQueue() {
	if (isPlaying || queue.length === 0) return;

	isPlaying = true;

	const playNext = async () => {
		while (queue.length > 0) {
			const blob = queue.shift(); // Get the next audio blob
			if (!blob) continue;

			const src = URL.createObjectURL(blob);
			const audio = new Audio(src);

			await playAudio(audio);
			await sleep(1000); // Wait 1 second between speeches
		}

		isPlaying = false;
	};

	playNext();
}


function playAudio(audio: InstanceType<typeof Audio>) {
	return new Promise((resolve) => {
		audio.play();
		audio.onended = resolve;
	});
}