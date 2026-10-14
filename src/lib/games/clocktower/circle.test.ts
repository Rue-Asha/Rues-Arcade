import { describe, expect, it } from 'vitest';
import { angleOf, ornament, seatPositions, seatSize } from './circle.ts';

const counts = Array.from({ length: 11 }, (_, i) => i + 5);

describe('clocktower circle', () => {
	it('Scenario: Circle geometry for five to fifteen seats', () => {
		for (const box of [340, 640]) {
			for (const count of counts) {
				const at = seatPositions(count, box);
				const d = seatSize(count, box);
				const label = `${count} seats in ${box}px`;
				expect(at, label).toHaveLength(count);
				expect(d, label).toBeGreaterThanOrEqual(44);

				// seat 1 at the top, centred horizontally
				expect(at[0].x, label).toBeCloseTo(box / 2, 5);
				expect(at[0].y, label).toBeCloseTo(d / 2, 5);

				// clockwise at equal angles around the centre
				const centre = box / 2;
				const angles = at.map((p) => (Math.atan2(p.x - centre, centre - p.y) * 180) / Math.PI);
				for (let i = 0; i < count; i++) {
					const want = (i * 360) / count;
					const got = (angles[i] + 360) % 360;
					expect(got, `${label}, seat ${i + 1}`).toBeCloseTo(want % 360, 5);
					expect(angleOf(i, count)).toBeCloseTo(want, 5);
				}
				const radius = at.map((p) => Math.hypot(p.x - centre, p.y - centre));
				for (const r of radius) expect(r, label).toBeCloseTo(radius[0], 5);

				// no two seat boxes overlap, every box inside the container
				for (let i = 0; i < count; i++) {
					expect(at[i].x - d / 2, label).toBeGreaterThanOrEqual(-1e-9);
					expect(at[i].y - d / 2, label).toBeGreaterThanOrEqual(-1e-9);
					expect(at[i].x + d / 2, label).toBeLessThanOrEqual(box + 1e-9);
					expect(at[i].y + d / 2, label).toBeLessThanOrEqual(box + 1e-9);
					for (let j = i + 1; j < count; j++) {
						const apart = Math.abs(at[i].x - at[j].x) >= 44 || Math.abs(at[i].y - at[j].y) >= 44;
						expect(apart, `${label}, seats ${i + 1} and ${j + 1} overlap`).toBe(true);
					}
				}
			}
		}
	});

	it('Scenario: Circle ornament connects the seats', () => {
		const nums = (path: string) => [...path.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
		for (const box of [340, 640]) {
			for (const count of counts) {
				const label = `${count} seats in ${box}px`;
				const at = seatPositions(count, box);
				const o = ornament(count, box);
				expect(o.links, label).toHaveLength(count);
				// every link is an arc of the ring from one seat's centre to the next one's
				o.links.forEach((path, i) => {
					const [x0, y0, , , , , , x1, y1] = nums(path);
					const next = at[(i + 1) % count];
					expect(Math.hypot(x0 - at[i].x, y0 - at[i].y), `${label}, link ${i + 1} start`).toBeLessThan(0.01);
					expect(Math.hypot(x1 - next.x, y1 - next.y), `${label}, link ${i + 1} end`).toBeLessThan(0.01);
				});
				expect(o.ticks.match(/M/g), label).toHaveLength(12);
				for (const path of [o.ticks, o.rosette]) for (const n of nums(path)) expect(n, label).toBeGreaterThanOrEqual(0);
				for (const n of nums(o.ticks)) expect(n, label).toBeLessThanOrEqual(box);
				expect(o.outer, label).toBeLessThanOrEqual(box / 2);
				expect(o.inner, label).toBeLessThan(o.outer);
				expect(o.inner, label).toBeGreaterThan(0);
			}
		}
	});
});
