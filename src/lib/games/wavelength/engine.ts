import type { ContentItem } from '#lib/content/types.ts';
import { next, pick, type Rng } from '#lib/engine/rng.ts';
import type { GameDef, Player } from '#lib/engine/types.ts';

export interface WavelengthConfig {
	// player ids per team
	teams: string[][];
	rounds: number;
}

// 21 equal positions over the semicircle; the target is five adjacent bands scoring 2-3-4-3-2
export const DIAL_DEGREES = 180;
export const BAND_DEGREES = DIAL_DEGREES / 21;
export const MIN_TEAM_SIZE = 2;
export const MAX_TEAM_SIZE = 3;
export const MIN_TEAMS = 2;
export const MAX_TEAMS = 6;
export const ROUND_OPTIONS = [1, 2, 3, 4, 5];
export const DEFAULT_ROUNDS = 3;

export type WavelengthPhase = 'prep' | 'reveal' | 'guess' | 'result' | 'gameOver';

export interface WavelengthTeam {
	name: string;
	players: Player[];
	score: number;
}

export interface WavelengthState {
	rng: Rng;
	// a = left end, b = right end
	pool: ContentItem[];
	used: number[];
	teams: WavelengthTeam[];
	rounds: number;
	// one round = every team took one turn
	roundIndex: number;
	teamIndex: number;
	spectrum: ContentItem;
	// degrees, 0 = left extreme
	target: number;
	dial: number;
	phase: WavelengthPhase;
	lastScore: number | null;
}

export type WavelengthAction =
	| { type: 'show' }
	| { type: 'redraw' }
	| { type: 'guess' }
	| { type: 'dial'; value: number }
	| { type: 'lockIn' }
	| { type: 'next' }
	| { type: 'again' };

export function scoreFor(target: number, dial: number): number {
	const diff = Math.abs(target - dial);
	if (diff <= 0.5 * BAND_DEGREES) return 4;
	if (diff <= 1.5 * BAND_DEGREES) return 3;
	if (diff <= 2.5 * BAND_DEGREES) return 2;
	return 0;
}

export function targetBands(target: number): { from: number; to: number; points: number }[] {
	const b = BAND_DEGREES;
	return [
		{ from: target - 2.5 * b, to: target - 1.5 * b, points: 2 },
		{ from: target - 1.5 * b, to: target - 0.5 * b, points: 3 },
		{ from: target - 0.5 * b, to: target + 0.5 * b, points: 4 },
		{ from: target + 0.5 * b, to: target + 1.5 * b, points: 3 },
		{ from: target + 1.5 * b, to: target + 2.5 * b, points: 2 }
	];
}

export function psychic(s: WavelengthState): Player {
	const team = s.teams[s.teamIndex];
	return team.players[s.roundIndex % team.players.length];
}

export function winners(s: WavelengthState): WavelengthTeam[] {
	const best = Math.max(...s.teams.map((t) => t.score));
	return s.teams.filter((t) => t.score === best);
}

const clamp = (v: number) => Math.min(DIAL_DEGREES, Math.max(0, v));

function draw(s: WavelengthState, avoid?: number): WavelengthState {
	const available = s.pool.filter((p) => !s.used.includes(p.id));
	const exhausted = available.length === 0;
	// a redraw on an exhausted pool must still change the spectrum
	const from = !exhausted
		? available
		: s.pool.length > 1 && avoid !== undefined
			? s.pool.filter((p) => p.id !== avoid)
			: s.pool;
	const [spectrum, r1] = pick(s.rng, from);
	const margin = 2.5 * BAND_DEGREES;
	const [v, rng] = next(r1);
	return {
		...s,
		rng,
		spectrum,
		used: exhausted ? [spectrum.id] : [...s.used, spectrum.id],
		target: margin + v * (DIAL_DEGREES - 2 * margin)
	};
}

function newTurn(s: WavelengthState): WavelengthState {
	return { ...draw(s), dial: DIAL_DEGREES / 2, lastScore: null, phase: 'prep' };
}

export const wavelength: GameDef<WavelengthState, WavelengthAction, WavelengthConfig> = {
	slug: 'wavelength',
	name: 'Wavelength',
	colour: 'wavelength',
	// 2–6 teams of 2–3 players
	minPlayers: 4,
	maxPlayers: 18,
	minContent: 1,
	contentType: 'wavelength_spectra',
	stateVersion: 1,
	init({ players, config, content, seed }) {
		const byId = new Map(players.map((p) => [p.id, p]));
		return newTurn({
			rng: { state: seed >>> 0 },
			pool: [...content],
			used: [],
			teams: config.teams.map((ids, i) => ({
				name: `Team ${i + 1}`,
				players: ids.map((id) => byId.get(id)!),
				score: 0
			})),
			rounds: config.rounds,
			roundIndex: 0,
			teamIndex: 0,
			spectrum: content[0],
			target: DIAL_DEGREES / 2,
			dial: DIAL_DEGREES / 2,
			phase: 'prep',
			lastScore: null
		});
	},
	reduce(s, action) {
		switch (action.type) {
			case 'show':
				return s.phase === 'prep' ? { ...s, phase: 'reveal' } : s;
			case 'redraw':
				return s.phase === 'prep' || s.phase === 'reveal' ? draw(s, s.spectrum.id) : s;
			case 'guess':
				return s.phase === 'reveal' ? { ...s, phase: 'guess', dial: DIAL_DEGREES / 2 } : s;
			case 'dial':
				return s.phase === 'guess' ? { ...s, dial: clamp(action.value) } : s;
			case 'lockIn': {
				if (s.phase !== 'guess') return s;
				const points = scoreFor(s.target, s.dial);
				const teams = s.teams.map((t, i) => (i === s.teamIndex ? { ...t, score: t.score + points } : t));
				return { ...s, teams, lastScore: points, phase: 'result' };
			}
			case 'next': {
				if (s.phase !== 'result') return s;
				if (s.teamIndex < s.teams.length - 1) return newTurn({ ...s, teamIndex: s.teamIndex + 1 });
				const roundIndex = s.roundIndex + 1;
				if (roundIndex >= s.rounds) return { ...s, phase: 'gameOver' };
				return newTurn({ ...s, teamIndex: 0, roundIndex });
			}
			case 'again':
				if (s.phase !== 'gameOver') return s;
				return newTurn({
					...s,
					teams: s.teams.map((t) => ({ ...t, score: 0 })),
					roundIndex: 0,
					teamIndex: 0
				});
		}
		return s;
	},
	phase(s) {
		return s.phase;
	}
};
