export interface Rng {
	state: number;
}

// mulberry32: the whole generator state is one uint32, so it serialises with the game state.
export function next(rng: Rng): [number, Rng] {
	const state = (rng.state + 0x6d2b79f5) >>> 0;
	let t = state;
	t = Math.imul(t ^ (t >>> 15), t | 1);
	t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
	return [((t ^ (t >>> 14)) >>> 0) / 4294967296, { state }];
}

export function int(rng: Rng, min: number, max: number): [number, Rng] {
	const [v, r] = next(rng);
	return [min + Math.floor(v * (max - min + 1)), r];
}

export function pick<T>(rng: Rng, list: readonly T[]): [T, Rng] {
	const [i, r] = int(rng, 0, list.length - 1);
	return [list[i], r];
}

export function shuffle<T>(rng: Rng, list: readonly T[]): [T[], Rng] {
	const out = [...list];
	let r = rng;
	for (let i = out.length - 1; i > 0; i--) {
		let j: number;
		[j, r] = int(r, 0, i);
		[out[i], out[j]] = [out[j], out[i]];
	}
	return [out, r];
}
