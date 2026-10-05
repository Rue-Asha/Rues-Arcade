import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const saved = new Map<string, string>();

vi.mock('#lib/storage.ts', () => ({
	read: (key: string) => saved.get(key) ?? null,
	write: (key: string, value: string) => void saved.set(key, value),
	remove: (key: string) => void saved.delete(key)
}));

let contexts = 0;
let tones = 0;

class FakeParam {
	value = 0;
	setValueAtTime() {}
	linearRampToValueAtTime() {}
	exponentialRampToValueAtTime() {}
}

class FakeNode {
	frequency = new FakeParam();
	gain = new FakeParam();
	Q = new FakeParam();
	type = '';
	connect() {
		return this;
	}
	start() {
		tones++;
	}
	stop() {}
}

class FakeAudioContext {
	currentTime = 0;
	state = 'running';
	destination = new FakeNode();
	constructor() {
		contexts++;
	}
	resume() {
		return Promise.resolve();
	}
	createOscillator() {
		return new FakeNode();
	}
	createGain() {
		return new FakeNode();
	}
	createBiquadFilter() {
		return new FakeNode();
	}
}

function browser(withAudio: boolean) {
	const win = new EventTarget() as EventTarget & { AudioContext?: unknown };
	if (withAudio) win.AudioContext = FakeAudioContext;
	vi.stubGlobal('window', win);
	return win;
}

const load = () => import('#lib/sound.ts');
const interact = (win: EventTarget) => win.dispatchEvent(new Event('pointerdown'));

beforeEach(() => {
	vi.resetModules();
	saved.clear();
	contexts = 0;
	tones = 0;
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('sound', () => {
	it('Scenario: Mute is remembered', async () => {
		browser(true);
		const first = await load();
		first.setMuted(true);

		vi.resetModules();
		const win = browser(true);
		const reloaded = await load();
		interact(win);
		reloaded.play('press');

		expect(reloaded.muted.value).toBe(true);
		expect(saved.get('arcade:muted')).toBe('1');
		expect(tones).toBe(0);
	});

	it('Scenario: No sound before first interaction', async () => {
		const win = browser(true);
		const sound = await load();
		sound.play('reveal');

		expect(contexts).toBe(0);
		expect(tones).toBe(0);

		interact(win);
		sound.play('reveal');
		expect(contexts).toBe(1);
		expect(tones).toBeGreaterThan(0);
	});

	it('Scenario: WebAudio unavailable stays silent', async () => {
		const win = browser(false);
		const sound = await load();
		interact(win);

		for (const s of ['press', 'reveal', 'correct', 'wrong', 'win'] as const) {
			expect(() => sound.play(s)).not.toThrow();
		}
		expect(contexts).toBe(0);
	});

	it('every effect plays when unmuted', async () => {
		const win = browser(true);
		const sound = await load();
		interact(win);
		for (const s of ['press', 'reveal', 'correct', 'wrong', 'win'] as const) {
			const before = tones;
			sound.play(s);
			expect(tones, s).toBeGreaterThan(before);
		}
	});

	it('unmuting is remembered too', async () => {
		browser(true);
		const sound = await load();
		sound.setMuted(true);
		sound.setMuted(false);
		expect(saved.get('arcade:muted')).toBe('0');
		expect(sound.muted.value).toBe(false);
	});
});
