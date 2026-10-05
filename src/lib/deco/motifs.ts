export type Place = 'home' | 'tile' | 'start' | 'lobby' | 'play';
export type Motif = 'home' | 'dial' | 'masks' | 'crew' | 'rings' | 'corner' | 'neutral';

const own: Record<string, Motif> = { imposter: 'masks', wavelength: 'dial' };

export function motifFor(slug: string | undefined, place: Place): Motif {
	if (place === 'home') return 'home';
	if (place === 'lobby') return 'crew';
	if (place === 'tile' && slug === undefined) return 'corner';
	const motif = slug === undefined ? undefined : Object.hasOwn(own, slug) ? own[slug] : undefined;
	if (!motif) return 'neutral';
	return place === 'play' ? 'rings' : motif;
}

const f = (n: number) => n.toFixed(2);

// angle in degrees, 0 = right, 90 = up (screen y grows downwards)
export function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
	const a = (deg * Math.PI) / 180;
	return [cx + r * Math.cos(a), cy - r * Math.sin(a)];
}

export function semi(cx: number, cy: number, r: number): string {
	return `M${f(cx - r)} ${f(cy)}A${r} ${r} 0 0 1 ${f(cx + r)} ${f(cy)}`;
}

export function wedge(cx: number, cy: number, r: number, from: number, to: number): string {
	const [x1, y1] = polar(cx, cy, r, from);
	const [x2, y2] = polar(cx, cy, r, to);
	return `M${cx} ${cy}L${f(x1)} ${f(y1)}A${r} ${r} 0 0 1 ${f(x2)} ${f(y2)}Z`;
}
