import type { PairPlayed } from '#lib/content/types.ts';
import type { Player } from '#lib/engine/types.ts';
import { savedId } from '#lib/players.ts';
import type { ImposterState } from './engine.ts';

export function record(prev: unknown, next: unknown) {
	const before = prev as ImposterState;
	const after = next as ImposterState;
	if (before.phase !== 'crew' || before.shown || after.phase !== 'crew' || !after.shown) return;
	const playerIds = after.players.flatMap((p) => savedId(p.id) ?? []);
	if (playerIds.length === 0) return;
	void fetch('/api/imposter/played', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ pairId: after.pairId, playerIds })
	});
}

export function knownBy(players: Player[], played: PairPlayed[], pairId: number): string[] {
	const ids = played.find((p) => p.pairId === pairId)?.playerIds ?? [];
	return players.filter((p) => ids.includes(savedId(p.id) ?? -1)).map((p) => p.name);
}

let cache = $state<{ key: number; played: PairPlayed[] } | null>(null);
let requested: number | null = null;

export function history(key: number): PairPlayed[] | null {
	if (requested !== key) {
		requested = key;
		void fetch('/api/imposter/played').then(async (res) => {
			if (res.ok && requested === key) cache = { key, played: await res.json() };
		});
	}
	return cache?.key === key ? cache.played : null;
}
