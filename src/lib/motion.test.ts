import { afterEach, describe, expect, it, vi } from 'vitest';
import { band, burst, fault, phaseOut, pop, rise, scatter, turn } from './motion.ts';

const reduce = (on: boolean) =>
	vi.stubGlobal('matchMedia', (q: string) => ({ matches: on && q.includes('reduce') }));

const fake = () => ({ animate: vi.fn() }) as unknown as HTMLElement & { animate: ReturnType<typeof vi.fn> };
const node = {} as Element;

afterEach(() => vi.unstubAllGlobals());

describe('motion helpers', () => {
	it('Scenario: Reduced motion zeroes every motion helper', () => {
		reduce(true);
		for (const config of [rise(node), phaseOut(node), pop(node), band(node)]) expect(config.duration).toBe(0);

		const [a, b, c, d, e] = [fake(), fake(), fake(), fake(), fake()];
		burst(a);
		turn(b);
		fault(c, d);
		scatter([e, fake()]);
		for (const n of [a, b, c, d, e]) expect(n.animate).not.toHaveBeenCalled();
	});

	it('transitions take their durations from the motion tokens', () => {
		reduce(false);
		expect(rise(node).duration).toBe(420);
		expect(phaseOut(node).duration).toBe(180);
		expect(pop(node).duration).toBe(420);
		expect(band(node).duration).toBe(420);
		expect(rise(node, { delay: 60 }).delay).toBe(60);
	});

	it('phase out fades and lifts, pop scales up, band grows from the left', () => {
		reduce(false);
		expect(phaseOut(node).css!(0, 1)).toBe('opacity:0;transform:translateY(-8px)');
		expect(phaseOut(node).css!(1, 0)).toBe('opacity:1;transform:translateY(0px)');
		expect(pop(node).css!(0, 1)).toContain('scale(0.92)');
		expect(pop(node).css!(1, 0)).toContain('scale(1)');
		expect(band(node).css!(0, 1)).toContain('scaleX(0)');
		expect(band(node).css!(1, 0)).not.toContain('transform-origin');
	});

	it('pop overshoots and phase out starts slow', () => {
		reduce(false);
		const p = pop(node);
		expect(Math.max(...[0.5, 0.6, 0.7, 0.8].map((t) => p.easing!(t)))).toBeGreaterThan(1);
		expect(phaseOut(node).easing!(0.5)).toBeLessThan(0.5);
		expect(phaseOut(node).easing!(1)).toBeCloseTo(1, 5);
	});

	it('animates with the documented timings when motion is allowed', () => {
		reduce(false);
		const [a, b, c, d] = [fake(), fake(), fake(), fake()];
		burst(a);
		turn(b);
		fault(c, d);
		expect(a.animate.mock.calls[0][1].duration).toBe(560);
		expect(b.animate.mock.calls[0][1]).toMatchObject({ duration: 1120, iterations: 1 });
		expect(c.animate.mock.calls[0][1].duration).toBe(360);
		expect(d.animate.mock.calls[0][1].duration).toBe(800);

		const pieces = [fake(), fake(), fake()];
		scatter(pieces);
		expect(pieces.map((p) => p.animate.mock.calls[0][1])).toMatchObject([
			{ duration: 840, delay: 0 },
			{ duration: 840, delay: 30 },
			{ duration: 840, delay: 60 }
		]);
	});

	it('fault runs with only one of its two nodes', () => {
		reduce(false);
		const stamp = fake();
		fault(undefined, stamp);
		expect(stamp.animate).toHaveBeenCalledOnce();
	});
});
