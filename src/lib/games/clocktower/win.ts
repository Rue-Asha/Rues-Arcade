import type { Alignment, ClocktowerState, Question, Seat } from './types.ts';

export const living = (seats: Seat[]) => seats.filter((s) => s.alive).length;

const sameQuestion = (a: Question, b: Question) => a.kind === b.kind && a.seat === b.seat;
export const open = (s: ClocktowerState, q: Question) => s.questions.some((x) => sameQuestion(x, q));

// Run after deaths, `before` being the state just before them. Good wins when the Demon died, evil when only two are
// left, good first when both happen at once. What the app can't decide alone becomes a question for the next dusk
// and sets no winner: a Demon death the true Scarlet Woman may take over (alive, 5 or more alive before it), and an
// executed true Saint. The Recluse is never the Demon, since only the tracked Demon seat counts.
export function check(
	before: ClocktowerState,
	after: ClocktowerState,
	executed: number | null = null
): { winner: Alignment | null; questions: Question[] } {
	const demon = before.demon;
	if (demon !== null && before.seats[demon].alive && !after.seats[demon].alive) {
		const sw = after.seats.findIndex((s) => s.alive && s.character === 'scarlet-woman');
		if (sw < 0 || living(before.seats) < 5) return { winner: 'good', questions: [] };
		return { winner: null, questions: [{ kind: 'scarlet-woman', seat: sw }] };
	}
	if (living(after.seats) <= 2) return { winner: 'evil', questions: [] };
	const saint = executed !== null && before.seats[executed].alive && after.seats[executed].character === 'saint';
	return { winner: null, questions: saint ? [{ kind: 'saint', seat: executed }] : [] };
}

// Asked at dusk after a day: exactly 3 alive, nobody executed, and a living true Mayor.
export function duskQuestions(s: ClocktowerState): Question[] {
	if (!s.today || s.today.executed !== null || living(s.seats) !== 3) return [];
	const mayor = s.seats.findIndex((x) => x.alive && x.character === 'mayor');
	return mayor < 0 ? [] : [{ kind: 'mayor', seat: mayor }];
}

// The storyteller's answer: the winner it decides, if any. A yes to the Scarlet Woman is applied by the reducer.
export function decided(q: Question, yes: boolean): Alignment | null {
	switch (q.kind) {
		case 'scarlet-woman':
			return yes ? null : 'good';
		case 'saint':
			return yes ? 'evil' : null;
		case 'mayor':
			return yes ? 'good' : null;
	}
}
