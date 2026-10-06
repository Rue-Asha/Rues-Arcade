<script lang="ts">
	import type { Survey } from '#lib/content/types.ts';
	import type { Player } from '#lib/engine/types.ts';
	import { savedId } from '#lib/players.ts';
	import Button from '#lib/ui/Button.svelte';
	import type { FeudConfig, FeudTeam } from './engine.ts';

	interface Props {
		teams: FeudTeam[];
		players: Player[];
		rounds: number;
		surveys: Survey[];
		onstart(config: unknown): void;
		onback(): void;
	}

	let { teams, players, rounds, surveys, onstart, onback }: Props = $props();

	function start() {
		onstart({
			teams: [teams[0], teams[1]],
			surveys: surveys.slice(0, rounds),
			tiebreak: surveys[rounds],
			saved: players.flatMap((p) => savedId(p.id) ?? [])
		} satisfies FeudConfig);
	}
</script>

<div class="stack">
	<h2><span>{teams[0].name}</span> gegen <span>{teams[1].name}</span></h2>
	<div class="row">
		<Button variant="ghost" size="sm" onclick={onback}>Zurück</Button>
		<Button variant="primary" onclick={start}>Start</Button>
	</div>
</div>
