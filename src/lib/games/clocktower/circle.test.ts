import { describe, expect, it } from 'vitest';
import { angleOf, ornament, sectorOf, seatPositions, seatSize, tickAngles, wedge } from './circle.ts';

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
				expect(o.ticks.match(/M/g), label).toHaveLength(count);
				for (const path of [o.ticks, o.rosette]) for (const n of nums(path)) expect(n, label).toBeGreaterThanOrEqual(0);
				for (const n of nums(o.ticks)) expect(n, label).toBeLessThanOrEqual(box);
				expect(o.outer, label).toBeLessThanOrEqual(box / 2);
				expect(o.inner, label).toBeLessThan(o.outer);
				expect(o.inner, label).toBeGreaterThan(0);
			}
		}
	});

	it('Scenario: Ticks divide the circle into n sectors', () => {
		const nums = (path: string) => [...path.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
		for (const box of [358, 640]) {
			for (const count of counts) {
				const label = `${count} seats in ${box}px`;
				const o = ornament(count, box);
				const centre = box / 2;
				const ticks = o.ticks.split('M').filter(Boolean).map(nums);
				expect(ticks, label).toHaveLength(count);
				expect(tickAngles(count), label).toHaveLength(count);
				ticks.forEach(([x0, y0, x1, y1], k) => {
					const want = ((k + 0.5) * 360) / count;
					expect(tickAngles(count)[k], `${label}, tick ${k}`).toBeCloseTo(want, 9);
					// halfway between seats k + 1 and k + 2
					expect(want, `${label}, tick ${k}`).toBeCloseTo((angleOf(k, count) + angleOf(k + 1, count)) / 2, 9);
					for (const [x, y] of [[x0, y0], [x1, y1]]) {
						const deg = ((Math.atan2(x - centre, centre - y) * 180) / Math.PI + 360) % 360;
						expect(deg, `${label}, tick ${k}`).toBeCloseTo(want, 0);
						const r = Math.hypot(x - centre, y - centre);
						expect(r, `${label}, tick ${k}`).toBeLessThanOrEqual(o.inner);
						expect(r, `${label}, tick ${k}`).toBeGreaterThan(0);
					}
				});
			}
		}
	});

	it('Scenario: Sector of an angle', () => {
		for (const deg of [0, 25.7, 359, -10]) expect(sectorOf(deg, 7), `${deg}°`).toBe(0);
		expect(sectorOf(25.72, 7)).toBe(1);
		expect(sectorOf(12, 15)).toBe(1);
		// every tick is a boundary and belongs to the next seat clockwise
		for (const count of counts) tickAngles(count).forEach((deg, k) => expect(sectorOf(deg, count), `${count}: ${deg}°`).toBe((k + 1) % count));
		expect(sectorOf(360 + 25.72, 7)).toBe(1);
	});

	it("wedge spans the seat's sector from the centre to the outer ring", () => {
		const nums = (path: string) => [...path.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
		for (const box of [358, 640]) {
			for (const count of counts) {
				const centre = box / 2;
				const o = ornament(count, box);
				for (const seat of [0, count - 1]) {
					const path = wedge(seat, count, box);
					expect(path, `${count}/${seat}`).toMatch(/^M[^A]+L[^A]+A[^A]+Z$/);
					const [cx, cy, x0, y0, , , , , , x1, y1] = nums(path);
					expect(Math.hypot(cx - centre, cy - centre)).toBeLessThan(0.01);
					const deg = (x: number, y: number) => ((Math.atan2(x - centre, centre - y) * 180) / Math.PI + 360) % 360;
					const half = 180 / count;
					expect(deg(x0, y0)).toBeCloseTo((angleOf(seat, count) - half + 360) % 360, 1);
					expect(deg(x1, y1)).toBeCloseTo((angleOf(seat, count) + half) % 360, 1);
					expect(Math.hypot(x0 - centre, y0 - centre)).toBeCloseTo(o.outer, 1);
				}
			}
		}
	});
});
