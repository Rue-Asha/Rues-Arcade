import { byId } from './characters.ts';
import type { ClocktowerState, NightScreen, NightStep, NightStepKind, Question } from './types.ts';

// research/rules.md §3 (TPI night sheet, Trouble Brewing)
const FIRST: NightStepKind[] = [
	'minion-info', 'demon-info', 'poisoner', 'washerwoman', 'librarian', 'investigator', 'chef', 'empath', 'fortune-teller',
	'butler', 'spy'
];
const OTHER: NightStepKind[] = [
	'poisoner', 'monk', 'scarlet-woman', 'imp', 'ravenkeeper', 'empath', 'fortune-teller', 'undertaker', 'butler', 'spy'
];

const notes: Partial<Record<NightStepKind, string>> = { ravenkeeper: 'nur wenn heute Nacht gestorben' };

function slot(state: ClocktowerState, night: number, kind: NightStepKind): NightStep[] {
	const { seats, demon } = state;
	const step = (woken: number, as: NightStep['as']): NightStep => ({ kind, seats: [woken], as, note: notes[kind] ?? null });
	switch (kind) {
		case 'minion-info': {
			const minions = seats.flatMap((s, i) => (s.character && byId[s.character].team === 'minion' ? [i] : []));
			return seats.length >= 7 && minions.length > 0 ? [{ kind, seats: minions, as: null, note: null }] : [];
		}
		case 'demon-info':
			return seats.length >= 7 && demon !== null ? [{ kind, seats: [demon], as: null, note: null }] : [];
		case 'imp':
			return demon !== null && seats[demon].alive ? [step(demon, 'imp')] : [];
		case 'scarlet-woman':
			// her character is already 'imp'; she wakes in her slot only on the night of the takeover
			return state.history
				.filter((e) => e.kind === 'scarlet-woman' && e.night === night && seats[e.to].alive)
				.map((e) => step(e.to, 'imp'));
		case 'undertaker':
			if (state.lastExecution === null) return [];
	}
	return seats.flatMap((s, i) =>
		s.alive && (s.character === kind || (s.character === 'drunk' && s.believed === kind)) ? [step(i, kind as NightStep['as'])] : []
	);
}

// Built at dusk: dead seats are skipped (the Ravenkeeper still wakes if alive at dusk); a starpass's "new Imp" step is
// inserted during the night by the reducer, not here.
export function nightSteps(state: ClocktowerState, night: number): NightStep[] {
	return (night === 1 ? FIRST : OTHER).flatMap((kind) => slot(state, night, kind));
}

export function nightScreens(night: number, steps: NightStep[], questions: Question[]): NightScreen[] {
	return [
		{ screen: 'dusk' },
		...questions.map((question) => ({ screen: 'question' as const, question })),
		...steps.flatMap((_, step) => (['wake', 'card', 'circle', 'sleep'] as const).map((screen) => ({ screen, step }))),
		...(night >= 2 ? [{ screen: 'deaths' as const }] : [])
	];
}
