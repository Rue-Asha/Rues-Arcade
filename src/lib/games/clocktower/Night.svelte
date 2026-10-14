<script lang="ts">
	import type { ScreenProps } from '#lib/games/registry.ts';
	import { play } from '#lib/sound.ts';
	import Button from '#lib/ui/Button.svelte';
	import { whoAll } from './label.ts';
	import Questions from './Questions.svelte';
	import type { ClocktowerState } from './types.ts';

	let { state: game, dispatch }: ScreenProps = $props();

	const s = $derived(game as ClocktowerState);
	const night = $derived(s.night!);
	const here = $derived(night.screens[night.at]);
	const step = $derived('step' in here ? night.steps[here.step] : null);

	$effect(() => {
		if (here.screen === 'dusk') play('bell');
	});
</script>

{#if here.screen === 'dusk'}
	<section class="panel stack dusk" aria-labelledby="phase">
		<h2 id="phase">Alle schlafen ein</h2>
		<p class="muted">Alle schließen die Augen.</p>
		<div class="row">
			<Button variant="primary" onclick={() => dispatch({ type: 'next' })}>Weiter</Button>
		</div>
	</section>
	<Questions state={s} {dispatch} />
{:else if here.screen === 'question'}
	<Questions state={s} {dispatch} question={here.question} />
{:else if step}
	<section class="panel stack dusk" aria-labelledby="phase">
		<h2 id="phase">Wecke {whoAll(s.seats, step.seats)}</h2>
		<div class="row">
			<Button variant="primary" onclick={() => dispatch({ type: 'next' })}>Weiter</Button>
		</div>
	</section>
{/if}

<style>
	.dusk {
		padding: 20px;
		text-align: center;
		align-items: center;
	}

	.dusk h2,
	.dusk p {
		margin: 0;
	}
</style>
