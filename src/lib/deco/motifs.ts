export type Place = 'home' | 'tile' | 'start' | 'lobby' | 'play';
export type Motif = 'home' | 'dial' | 'masks' | 'crew' | 'rings' | 'corner' | 'neutral';

export function motifFor(_slug: string | undefined, _place: Place): Motif {
	throw new Error('motifFor: not implemented');
}
