import type { GameDef, Player } from '#lib/engine/types.ts';
import type { GameEntry } from '#lib/games/registry.ts';
import Deck from './Deck.svelte';
import Screen from './Screen.svelte';
import Setup from './Setup.svelte';

// placeholder until the reducer lands; shaped like the real state's seats and setup phase
interface Seat {
	player: Player;
	character: string | null;
	believed: string | null;
	alive: boolean;
	ghostVote: boolean;
}

interface ClocktowerState {
	seats: Seat[];
	phase: { kind: 'setup' };
}

const def: GameDef<ClocktowerState, { type: string }, Record<string, never>> = {
	slug: 'clocktower',
	name: 'Blood on the Clocktower',
	colour: 'clocktower',
	minPlayers: 5,
	maxPlayers: 15,
	minContent: 0,
	contentType: 'none',
	stateVersion: 1,
	init: ({ players }) => ({
		seats: players.map((player) => ({ player, character: null, believed: null, alive: true, ghostVote: true })),
		phase: { kind: 'setup' }
	}),
	reduce: (state) => state,
	phase: (state) => state.phase.kind
};

const shape: ClocktowerState = def.init({
	players: [{ id: '', name: '' }],
	config: {},
	content: [],
	seed: 0
});

export const entry: GameEntry = {
	def,
	Screen,
	Setup,
	Explanation: Deck,
	shape,
	countFirst: true,
	status: () => ({ parts: ['Aufbau'], progress: null }),
	pitch: 'Eine Stadt sucht ihren Dämon, die Bösen lügen, eine Person erzählt.'
};
