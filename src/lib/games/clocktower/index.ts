import type { GameEntry, Status } from '#lib/games/registry.ts';
import Deck from './Deck.svelte';
import { clocktower as def, shape } from './engine.ts';
import Screen from './Screen.svelte';
import Setup from './Setup.svelte';
import type { ClocktowerState } from './types.ts';
import { living } from './win.ts';

function status(s: ClocktowerState): Status {
	const n = s.seats.length;
	const alive = `${living(s.seats)} von ${n} leben`;
	switch (s.phase.kind) {
		case 'setup':
			return { parts: ['Aufbau'], progress: null };
		case 'reveal':
			return { parts: ['Rollen', `Platz ${s.phase.seat + 1} / ${n}`], progress: null };
		case 'night':
			return { parts: [`Nacht ${s.night!.number}`, alive], progress: null };
		case 'dawn':
		case 'day':
			return { parts: [`Tag ${s.today!.number}`, alive], progress: null };
		case 'over':
			return { parts: ['Spielende'], progress: null };
	}
}

export const entry: GameEntry = {
	def,
	Screen,
	Setup,
	Explanation: Deck,
	shape,
	countFirst: true,
	status,
	variant: (s: ClocktowerState) => (s.phase.kind === 'dawn' || s.phase.kind === 'day' ? 'day' : 'night'),
	pitch: 'Eine Stadt sucht ihren Dämon, die Bösen lügen, eine Person erzählt.'
};
