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
