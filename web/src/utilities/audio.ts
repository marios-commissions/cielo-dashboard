import sleep from './sleep';


export const queue: SpeechSynthesisUtterance[] = [];

let isPlaying = false;

export function playQueue() {
	if (isPlaying || queue.length === 0) return;

	isPlaying = true;

	const playNext = async () => {
		while (queue.length > 0) {
			const msg = queue.shift(); // Get the next audio msg
			if (!msg) continue;


			await playAudio(msg);
			await sleep(1000); // Wait 1 second between speeches
		}

		isPlaying = false;
	};

	playNext();
}


function playAudio(audio: SpeechSynthesisUtterance) {
	return new Promise((resolve) => {
		audio.onend = resolve;
		speechSynthesis.speak(audio);
	});
}