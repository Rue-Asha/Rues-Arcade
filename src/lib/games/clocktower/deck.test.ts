import { describe, expect, it } from 'vitest';
import { characters } from './characters.ts';
import { slides, voteTimeline, type Slide } from './deck.ts';
import { required } from './setup.ts';
import { sectorOf } from './circle.ts';
import { sweepAt, threshold } from './vote.ts';

const counts = (n: number) => slides(n).find((s) => s.id === 'town')!;
const voting = (n: number) => slides(n).find((s) => s.id === 'voting')!;

function texts(slide: Slide): string[] {
	return [
		slide.eyebrow,
		slide.title,
		slide.lead,
		slide.note,
		slide.baron,
		slide.vote?.caption,
		...(slide.cards ?? []).flatMap((c) => [c.label, c.title, c.text, c.win]),
		...(slide.steps ?? []).flatMap((s) => [s.n, s.title, s.text]),
		...(slide.rows ?? []).flat()
	].filter((t): t is string => t !== undefined);
}

describe('clocktower deck', () => {
	it('Scenario: Role-count slide for every count', () => {
		for (let n = 5; n <= 15; n++) {
			const slide = counts(n);
			const plain = required(n, false);
			const baron = required(n, true);
			expect(slide.counts, `${n}`).toEqual([
				{ team: 'townsfolk', n: plain.townsfolk, label: 'Townsfolk' },
				{ team: 'outsider', n: plain.outsider, label: 'Outsider' },
				{ team: 'minion', n: plain.minion, label: 'Minions' },
				{ team: 'demon', n: plain.demon, label: 'Dämon' }
			]);
			expect(baron.townsfolk, `${n}`).toBe(plain.townsfolk - 2);
			expect(baron.outsider, `${n}`).toBe(plain.outsider + 2);
			expect(slide.baron, `${n}`).toBe(`Mit dem Baron: ${baron.townsfolk} Townsfolk und ${baron.outsider} Outsider`);
			if (n <= 6) expect(slide.note, `${n}`).toBe('keine Minion/Dämon-Info');
			else expect(slide.note, `${n}`).toBeUndefined();
			expect(slide.dots?.length, `${n}`).toBe(n);
		}
	});

	it('Scenario: Voting slide uses half the players', () => {
		for (const [n, text] of [
			[5, '3 Stimmen nötig'],
			[12, '6 Stimmen nötig'],
			[15, '8 Stimmen nötig']
		] as const) {
			expect(voting(n).vote).toEqual({ alive: n, needed: threshold(n), caption: `${n} leben, ${text}` });
			expect(voting(n).vote!.caption, `${n}`).toContain(text);
		}
	});

	it('Scenario: Voting slide timeline follows the count', () => {
		for (let n = 5; n <= 15; n++) {
			const t = voteTimeline(n);
			const need = Math.ceil(n / 2);
			expect(t.seats, `${n}`).toBe(n);
			expect(t.nominee).toBe(0);
			expect(t.voters, `${n}`).toHaveLength(need);
			expect(t.at, `${n}`).toHaveLength(need);
			expect(new Set(t.voters).size, `${n}`).toBe(need);
			for (const v of t.voters) expect(v > 0 && v < n, `${n} voter ${v}`).toBe(true);
			for (let j = 1; j < need; j++) {
				expect(t.voters[j], `${n}`).toBeGreaterThan(t.voters[j - 1]);
				expect(t.at[j], `${n}`).toBeGreaterThan(t.at[j - 1]);
			}
			// the hand starts on the boundary after the nominee's sector and turns at a constant speed through n sectors
			expect(t.start, `${n}`).toBe(0.5);
			const per = t.handMs / n;
			expect(per, `${n}`).toBeGreaterThan(0);
			const count = (ms: number) => t.at.filter((a) => a <= ms).length;
			const first = sweepAt(0, t.nominee, n, per)!;
			expect(first.hand, `${n}`).toBeCloseTo(t.start, 9);
			for (const ms of [0, per * 0.25, per * 1.5, t.handMs - 1]) {
				expect(sweepAt(ms, t.nominee, n, per)!.hand, `${n} at ${ms}`).toBeCloseTo(t.start + ms / per, 9);
			}
			// each voter's time is the hand's entry into its sector, and the count steps there in sweep order
			t.voters.forEach((v, j) => {
				expect(sweepAt(t.at[j], t.nominee, n, per)!.seat, `${n} voter ${v}`).toBe(v);
				if (t.at[j] > 0) expect(sweepAt(t.at[j] - 1, t.nominee, n, per)!.seat, `${n} before voter ${v}`).not.toBe(v);
				expect(sectorOf(sweepAt(t.at[j], t.nominee, n, per)!.hand * (360 / n), n), `${n} voter ${v}`).toBe(v);
				expect(count(t.at[j]), `${n} at voter ${v}`).toBe(j + 1);
				if (j > 0) expect(count(t.at[j] - 1), `${n} before voter ${v}`).toBe(j);
			});
			// the nominee votes last: the hand ends in its sector
			expect(sweepAt(t.handMs - 1, t.nominee, n, per)!.seat, `${n}`).toBe(t.nominee);
			expect(sweepAt(t.handMs, t.nominee, n, per), `${n}`).toBeNull();
			expect(t.at.at(-1)!, `${n}`).toBeLessThan(t.handMs - per);
			expect(count(t.handMs + t.holdMs), `${n}`).toBe(threshold(n));
			expect(t.holdMs).toBeGreaterThan(0);
		}
	});

	it('Scenario: Official win wording in the deck', () => {
		const all = [5, 9, 15].flatMap((n) => slides(n).flatMap(texts)).join('\n');
		expect(all).toContain('nur noch zwei');
		expect(all).not.toMatch(/outnumber/i);
		expect(all).not.toContain('mehr Böse als Gute');
		expect(all).not.toContain('mehr Böse als Gut');
	});

	it('has unique ids, the six app slides and ends with credits and the sheet', () => {
		const list = slides(9);
		expect(new Set(list.map((s) => s.id)).size).toBe(list.length);
		const titles = list.map((s) => s.title);
		for (const t of [
			'Das Grimoire',
			'Die Nacht in der App',
			'Karten zeigen',
			'Der Tag-Timer',
			'Nominieren und abstimmen',
			'Das Ende'
		])
			expect(titles, t).toContain(t);
		expect(list.at(-1)!.kind).toBe('sheet');
		expect(list.at(-2)!.kind).toBe('credits');
		const vote = list.find((s) => s.id === 'app-vote')!;
		expect(texts(vote).join(' ')).toMatch(/antippen/);
		expect(texts(vote).join(' ')).toMatch(/Leertaste/);
	});

	it('lists every character in a role slide exactly once', () => {
		const ids = slides(9).flatMap((s) => s.roles ?? []);
		expect([...ids].sort()).toEqual(characters.map((c) => c.id).sort());
	});

	it('names the icon source and the owner on the credits slide', () => {
		const credits = texts(slides(9).find((s) => s.kind === 'credits')!).join(' ');
		expect(credits).toContain('game-icons.net');
		expect(credits).toContain('CC BY 3.0');
		expect(credits).toContain('The Pandemonium Institute');
	});

	it('uses neutral copy', () => {
		const all = slides(9).flatMap(texts).join('\n');
		expect(all).not.toContain('!');
	});
});
