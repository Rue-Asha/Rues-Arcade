export type Point = { x: number; y: number };

const MAX_SEAT = 76;

// degrees clockwise from the top
export function angleOf(seat: number, count: number): number {
	return (seat * 360) / count;
}

function around(count: number, box: number, d: number): Point[] {
	const centre = box / 2;
	const radius = (box - d) / 2;
	return Array.from({ length: count }, (_, i) => {
		const a = (angleOf(i, count) * Math.PI) / 180;
		return { x: centre + radius * Math.sin(a), y: centre - radius * Math.cos(a) };
	});
}

// the seat boxes are squares, so two seats clear each other when either axis does
function clear(at: Point[], d: number): boolean {
	for (let i = 0; i < at.length; i++)
		for (let j = i + 1; j < at.length; j++)
			if (Math.abs(at[i].x - at[j].x) < d - 1e-6 && Math.abs(at[i].y - at[j].y) < d - 1e-6) return false;
	return true;
}

// the largest seat box that fits `count` seats on the circle inside a square box
export function seatSize(count: number, box: number): number {
	for (let d = Math.min(MAX_SEAT, Math.floor(box / 3)); d > 20; d--) if (clear(around(count, box, d), d)) return d;
	return 20;
}

// seat centres relative to the box's top-left corner; seat 1 on top, then clockwise
export function seatPositions(count: number, box: number): Point[] {
	return around(count, box, seatSize(count, box));
}

const f = (n: number) => Math.round(n * 100) / 100;

function polar(centre: number, r: number, deg: number): Point {
	const a = (deg * Math.PI) / 180;
	return { x: centre + r * Math.sin(a), y: centre - r * Math.cos(a) };
}

// the ornament under the seats, in the plane's own pixels: one arc of the ring per pair of neighbouring seats (so a dead
// seat can dash its two), a hairline ring hugging the seats' outer edge, one just inside them, twelve clock ticks
// between that and the centre, and a small star for the hub
export function ornament(count: number, box: number) {
	const d = seatSize(count, box);
	const at = around(count, box, d);
	const centre = box / 2;
	const r = (box - d) / 2;
	const inner = r - d / 2 - 6;
	const links = at.map((p, i) => {
		const q = at[(i + 1) % count];
		return `M${f(p.x)} ${f(p.y)}A${f(r)} ${f(r)} 0 0 1 ${f(q.x)} ${f(q.y)}`;
	});
	const ticks = Array.from({ length: 12 }, (_, k) => {
		const long = k % 3 === 0;
		const a = polar(centre, inner - 2, k * 30);
		const b = polar(centre, inner - (long ? 14 : 8), k * 30);
		return `M${f(a.x)} ${f(a.y)}L${f(b.x)} ${f(b.y)}`;
	}).join('');
	const hub = Math.max(10, inner * 0.16);
	const star = Array.from({ length: 16 }, (_, k) => polar(centre, k % 2 === 0 ? hub * 1.8 : hub, k * 22.5));
	const rosette = `M${star.map((p) => `${f(p.x)} ${f(p.y)}`).join('L')}Z`;
	return { r, outer: box / 2 - 1, inner, links, ticks, rosette, hub };
}
