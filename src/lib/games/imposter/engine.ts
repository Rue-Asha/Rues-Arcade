import type { ContentItem } from '#lib/content/types.ts';
import { int, pick, type Rng } from '#lib/engine/rng.ts';
import type { GameDef, Player } from '#lib/engine/types.ts';

export type ImposterConfig = Record<string, never>;

export type ImposterPhase = 'handover' | 'view' | 'crew' | 'unmask';

export interface ImposterState {
	rng: Rng;
	players: Player[];
	// a = crew question, b = imposter question
	pool: ContentItem[];
	used: number[];
	round: number;
	pairId: number;
	// {NAME}/{NAME2} already resolved for this round
	crew: string;
	imposter: string;
	imposterIndex: number;
	phase: ImposterPhase;
	revealIndex: number;
	// crew question / imposter uncovered in the crew and unmask phases
	shown: boolean;
}

export type ImposterAction =
	| { type: 'handover' }
	| { type: 'seen' }
	| { type: 'reveal' }
	| { type: 'unmask' }
	| { type: 'nextRound' }
	| { type: 'skip' };

const TOKENS = ['{NAME}', '{NAME2}'];

function draw(rng: Rng, pool: ContentItem[], used: number[], avoid?: number) {
	const available = pool.filter((p) => !used.includes(p.id));
	if (available.length > 0) {
		const [pair, r] = pick(rng, available);
		return { pair, used: [...used, pair.id], rng: r };
	}
	// a skip on an exhausted pool must still change the pair
	const fresh = pool.length > 1 && avoid !== undefined ? pool.filter((p) => p.id !== avoid) : pool;
	const [pair, r] = pick(rng, fresh);
	return { pair, used: [pair.id], rng: r };
}

function bind(rng: Rng, players: Player[], pair: ContentItem) {
	const text = `${pair.a} ${pair.b}`;
	const left = [...players];
	let crew = pair.a;
	let imposter = pair.b;
	let r = rng;
	for (const token of TOKENS) {
		if (!text.includes(token) || left.length === 0) continue;
		let i: number;
		[i, r] = int(r, 0, left.length - 1);
		const [player] = left.splice(i, 1);
		crew = crew.split(token).join(player.name);
		imposter = imposter.split(token).join(player.name);
	}
	return { crew, imposter, rng: r };
}

function deal(s: ImposterState, avoid?: number): ImposterState {
	const d = draw(s.rng, s.pool, s.used, avoid);
	const b = bind(d.rng, s.players, d.pair);
	let { crew, imposter, rng } = b;
	if (d.pair.interchangeable === true) {
		let coin: number;
		[coin, rng] = int(rng, 0, 1);
		if (coin === 1) [crew, imposter] = [imposter, crew];
	}
	return {
		...s,
		rng,
		used: d.used,
		pairId: d.pair.id,
		crew,
		imposter,
		phase: 'handover',
		revealIndex: 0,
		shown: false
	};
}

function newRound(s: ImposterState): ImposterState {
	const dealt = deal(s);
	const [imposterIndex, rng] = int(dealt.rng, 0, s.players.length - 1);
	return { ...dealt, rng, imposterIndex, round: s.round + 1 };
}

export const imposter: GameDef<ImposterState, ImposterAction, ImposterConfig> = {
	slug: 'imposter',
	name: 'Imposter',
	colour: 'imposter',
	minPlayers: 3,
	maxPlayers: 12,
	minContent: 1,
	contentType: 'imposter_pairs',
	stateVersion: 1,
	init({ players, content, seed }) {
		return newRound({
			rng: { state: seed >>> 0 },
			players: [...players],
			pool: [...content],
			used: [],
			round: 0,
			pairId: 0,
			crew: '',
			imposter: '',
			imposterIndex: 0,
			phase: 'handover',
			revealIndex: 0,
			shown: false
		});
	},
	reduce(s, action) {
		switch (action.type) {
			case 'handover':
				return s.phase === 'handover' ? { ...s, phase: 'view' } : s;
			case 'seen':
				if (s.phase !== 'view') return s;
				return s.revealIndex < s.players.length - 1
					? { ...s, phase: 'handover', revealIndex: s.revealIndex + 1 }
					: { ...s, phase: 'crew', shown: false };
			case 'reveal':
				return (s.phase === 'crew' || s.phase === 'unmask') && !s.shown ? { ...s, shown: true } : s;
			case 'unmask':
				return s.phase === 'crew' && s.shown ? { ...s, phase: 'unmask', shown: false } : s;
			case 'nextRound':
				return s.phase === 'unmask' && s.shown ? newRound(s) : s;
			case 'skip':
				// as in the archive the imposter stays; only the pair and the reveal restart
				return s.phase === 'handover' || s.phase === 'view' ? deal(s, s.pairId) : s;
		}
		return s;
	},
	phase(s) {
		return s.phase;
	}
};
