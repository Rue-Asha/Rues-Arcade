<script lang="ts">
	import type { ScreenProps } from '#lib/games/registry.ts';
	import Button from '#lib/ui/Button.svelte';
	import Circle from './Circle.svelte';
	import type { ClocktowerState } from './types.ts';

	let { state: game, dispatch }: ScreenProps = $props();

	const s = $derived(game as ClocktowerState);
	const today = $derived(s.today!);
</script>

{#if s.phase.kind === 'day' && s.phase.screen === 'grimoire'}
	<section class="stack" aria-labelledby="phase">
		<h2 id="phase" class="sr-only">Tag {today.number}</h2>
		<Circle seats={s.seats} block={today.block} />
	</section>
{:else}
	<section class="panel stack pad" aria-labelledby="phase">
		<h2 id="phase">Tag {s.phase.kind}</h2>
		<div class="row">
			<Button variant="primary" onclick={() => dispatch({ type: 'next' })}>Weiter</Button>
		</div>
	</section>
{/if}

<style>
	.pad {
		padding: 20px;
	}
</style>
