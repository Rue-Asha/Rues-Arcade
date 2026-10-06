<script lang="ts">
	import { onMount } from 'svelte';
	import type { Survey } from '#lib/content/types.ts';
	import type { SetupProps } from '#lib/games/registry.ts';
	import { savedId } from '#lib/players.ts';
	import Button from '#lib/ui/Button.svelte';
	import Card from '#lib/ui/Card.svelte';
	import { type FeudConfig } from './engine.ts';

	let { players, onstart }: SetupProps = $props();

	const ROUNDS = 3;

	let surveys = $state<Survey[]>([]);

	onMount(async () => {
		const res = await fetch('/api/content/feud_surveys');
		if (res.ok) surveys = await res.json();
	});

	function start() {
		const team = (name: string, offset: number) => ({
			name,
			players: players.filter((_, i) => i % 2 === offset).map((p) => p.id)
		});
		onstart({
			teams: [team('Team A', 0), team('Team B', 1)],
			surveys: surveys.slice(0, ROUNDS),
			tiebreak: surveys[ROUNDS] ?? surveys[0],
			saved: players.flatMap((p) => savedId(p.id) ?? [])
		} satisfies FeudConfig);
	}
</script>

<Card tone="feud_surveys">
	<div class="stack">
		<h2>Teams</h2>
		<p class="muted">{players.length} Spieler</p>
		<Button variant="primary" disabled={surveys.length === 0} onclick={start}>Weiter</Button>
	</div>
</Card>
