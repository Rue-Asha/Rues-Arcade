import type { ContentItem, ContentType } from '#lib/content/types.ts';

export type { Rng } from './rng';

export interface Player {
	id: string;
	name: string;
}

export interface GameDef<S, A extends { type: string }, C> {
	slug: string;
	name: string;
	// token name, e.g. 'imposter'
	colour: string;
	minPlayers: number;
	maxPlayers: number;
	minContent: number;
	contentType: ContentType;
	stateVersion: number;
	init(input: { players: Player[]; config: C; content: ContentItem[]; seed: number }): S;
	reduce(state: S, action: A): S;
	phase(state: S): string;
}

export interface DemoStep<A> {
	action: A;
	tip: string;
}

export interface DemoScript<A, C> {
	players: string[];
	config: C;
	content: ContentItem[];
	seed: number;
	steps: DemoStep<A>[];
}
