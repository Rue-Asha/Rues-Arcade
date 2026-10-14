<script lang="ts">
	import type { ScreenProps } from '#lib/games/registry.ts';
	import Button from '#lib/ui/Button.svelte';
	import Circle from './Circle.svelte';
	import Dawn from './Dawn.svelte';
	import Timer from './Timer.svelte';
	import type { ClocktowerState } from './types.ts';

	let { state: game, dispatch }: ScreenProps = $props();

	const s = $derived(game as ClocktowerState);
	const today = $derived(s.today!);
	const screen = $derived(s.phase.kind === 'day' ? s.phase.screen : null);
</script>

{#if s.phase.kind === 'dawn'}
	<Dawn state={s} {dispatch} />
{:else if screen === 'grimoire'}
	<section class="stack" aria-labelledby="phase">
		<h2 id="phase" class="sr-only">Tag {today.number}</h2>
		{#if today.deadline !== null}<Timer deadline={today.deadline} />{/if}
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
