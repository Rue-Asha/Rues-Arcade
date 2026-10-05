import { read, write } from '#lib/storage.ts';

export type Sfx = 'press' | 'reveal' | 'correct' | 'wrong' | 'win';

const KEY = 'arcade:muted';

export const muted: { value: boolean } = { value: read(KEY) === '1' };

export function setMuted(m: boolean): void {
	muted.value = m;
	write(KEY, m ? '1' : '0');
}

type Win = Window & { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };

let ctx: AudioContext | null = null;

// Autoplay policy (iOS above all): the context may only be born inside a user gesture.
function unlock() {
	window.removeEventListener('pointerdown', unlock, true);
	window.removeEventListener('keydown', unlock, true);
	const AC = (window as Win).AudioContext ?? (window as Win).webkitAudioContext;
	if (AC) ctx = new AC();
}

if (typeof window !== 'undefined') {
	window.addEventListener('pointerdown', unlock, true);
	window.addEventListener('keydown', unlock, true);
}

interface Tone {
	type: OscillatorType;
	from: number;
	to?: number;
	at?: number;
	dur: number;
	gain: number;
	cutoff?: number;
}

function tone(ac: AudioContext, { type, from, to, at = 0, dur, gain, cutoff }: Tone) {
	const t = ac.currentTime + at;
	const osc = ac.createOscillator();
	const amp = ac.createGain();
	osc.type = type;
	osc.frequency.setValueAtTime(from, t);
	if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
	amp.gain.setValueAtTime(0.0001, t);
	amp.gain.linearRampToValueAtTime(gain, t + 0.008);
	amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
	if (cutoff) {
		const lp = ac.createBiquadFilter();
		lp.type = 'lowpass';
		lp.frequency.setValueAtTime(cutoff, t);
		osc.connect(lp).connect(amp);
	} else {
		osc.connect(amp);
	}
	amp.connect(ac.destination);
	osc.start(t);
	osc.stop(t + dur + 0.02);
}

const effects: Record<Sfx, (ac: AudioContext) => void> = {
	press: (ac) => tone(ac, { type: 'triangle', from: 440, to: 300, dur: 0.07, gain: 0.14 }),
	reveal: (ac) => {
		tone(ac, { type: 'sine', from: 320, to: 960, dur: 0.3, gain: 0.16 });
		tone(ac, { type: 'triangle', from: 480, to: 1440, at: 0.05, dur: 0.28, gain: 0.05 });
	},
	correct: (ac) => {
		tone(ac, { type: 'square', from: 659.25, dur: 0.14, gain: 0.07, cutoff: 2400 });
		tone(ac, { type: 'square', from: 987.77, at: 0.09, dur: 0.22, gain: 0.07, cutoff: 2400 });
	},
	wrong: (ac) => {
		tone(ac, { type: 'sawtooth', from: 196, to: 98, dur: 0.34, gain: 0.12, cutoff: 900 });
		tone(ac, { type: 'sawtooth', from: 185, to: 92, dur: 0.34, gain: 0.08, cutoff: 900 });
	},
	win: (ac) => {
		[523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
			tone(ac, { type: 'square', from: f, at: i * 0.1, dur: i === 3 ? 0.55 : 0.16, gain: 0.07, cutoff: 2600 })
		);
		tone(ac, { type: 'triangle', from: 261.63, at: 0.3, dur: 0.6, gain: 0.1 });
	}
};

export function play(s: Sfx): void {
	if (muted.value || !ctx) return;
	if (ctx.state === 'suspended') void ctx.resume();
	effects[s](ctx);
}
