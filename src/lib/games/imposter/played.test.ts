import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ContentItem } from '#lib/content/types.ts';
import type { Player } from '#lib/engine/types.ts';
import { imposter, type ImposterAction, type ImposterState } from './engine.ts';
import { knownBy, record } from './played.svelte.ts';

const everyone: Player[] = [
	{ id: 'player-1', name: 'Alex' },
	{ id: 'guest-1', name: 'Bo' },
	{ id: 'player-3', name: 'Cleo' }
];

const content: ContentItem[] = [1, 2].map((id) => ({ id, a: `crew ${id}`, b: `imposter ${id}` }));

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
	fetchMock = vi.fn(() => Promise.resolve(new Response(null, { status: 204 })));
	vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => vi.unstubAllGlobals());

// dispatches like the play route: every transition goes through onchange
function play(players: Player[], types: ImposterAction['type'][], seed = 3) {
	let s: ImposterState = imposter.init({ players, config: {}, content, seed });
	for (const type of types) {
		const next = imposter.reduce(s, { type } as ImposterAction);
		record(s, next);
		s = next;
	}
	return s;
}

const posts = () => fetchMock.mock.calls.map(([url, init]) => [url, JSON.parse(init.body)]);

const reading = (n: number): ImposterAction['type'][] => Array.from({ length: n }, () => ['handover', 'seen'] as const).flat();

describe('imposter record', () => {
	it('Scenario: Imposter skipped pair is not recorded', () => {
		const s = play(everyone, ['handover', 'seen', 'handover', 'skip']);
		expect(fetchMock).not.toHaveBeenCalled();
		const first = imposter.init({ players: everyone, config: {}, content, seed: 3 }).pairId;
		expect(s.pairId).not.toBe(first);
		fetchMock.mockClear();
		const t2 = play(everyone, ['handover', 'seen', 'handover', 'skip', ...reading(3), 'reveal']);
		expect(posts()).toEqual([['/api/imposter/played', { pairId: t2.pairId, playerIds: [1, 3] }]]);
	});

	it('Scenario: Imposter guests are never recorded', () => {
		play(everyone, [...reading(3), 'reveal']);
		expect(posts().map(([, body]) => body.playerIds)).toEqual([[1, 3]]);

		fetchMock.mockClear();
		play(
			[
				{ id: 'guest-1', name: 'Bo' },
				{ id: 'guest-2', name: 'Cleo' },
				{ id: 'guest-3', name: 'Dani' }
			],
			[...reading(3), 'reveal']
		);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('Scenario: Imposter reveal records once', () => {
		play(everyone, [...reading(3), 'reveal', 'reveal', 'unmask', 'reveal', 'reveal', 'nextRound', ...reading(3)]);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
});

describe('imposter knownBy', () => {
	it('lists round players on the pair in round order, never guests or outsiders', () => {
		const played = [
			{ pairId: 5, playerIds: [3, 1, 9] },
			{ pairId: 6, playerIds: [1] }
		];
		expect(knownBy(everyone, played, 5)).toEqual(['Alex', 'Cleo']);
		expect(knownBy(everyone, played, 7)).toEqual([]);
	});
});
