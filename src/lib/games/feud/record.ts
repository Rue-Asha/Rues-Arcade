import type { FeudState } from './engine.ts';

export function record(prev: unknown, next: unknown) {
	const before = (prev as FeudState).closed;
	const { closed, config } = next as FeudState;
	for (const surveyId of closed.filter((id) => !before.includes(id)))
		void fetch('/api/feud/played', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ surveyId, playerIds: config.saved })
		});
}
