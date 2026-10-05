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
