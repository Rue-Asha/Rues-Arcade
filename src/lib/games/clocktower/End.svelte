<script lang="ts">
	import type { ScreenProps } from '#lib/games/registry.ts';
	import Button from '#lib/ui/Button.svelte';
	import type { ClocktowerState } from './types.ts';

	let { state: game, dispatch }: ScreenProps = $props();

	const s = $derived(game as ClocktowerState);
</script>

<section class="panel stack gap" aria-labelledby="phase">
	<h2 id="phase">Ende {s.phase.kind}</h2>
	<div class="row">
		<Button variant="primary" onclick={() => dispatch({ type: 'next' })}>Weiter</Button>
	</div>
</section>

<style>
	.gap {
		padding: 20px;
	}
</style>
