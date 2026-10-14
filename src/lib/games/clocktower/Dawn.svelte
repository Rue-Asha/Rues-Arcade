<script lang="ts">
	import { onMount } from 'svelte';
	import { reducedMotion } from '#lib/theme.ts';
	import { play } from '#lib/sound.ts';
	import Button from '#lib/ui/Button.svelte';
	import Circle from './Circle.svelte';
	import type { ClocktowerAction, ClocktowerState } from './types.ts';

	interface Props {
		state: ClocktowerState;
		dispatch: (action: ClocktowerAction) => void;
	}

	let { state: s, dispatch }: Props = $props();

	const screen = $derived(s.phase.kind === 'dawn' ? s.phase.screen : 'wake');
	const deaths = $derived(s.today!.deaths);
	const names = $derived(deaths.map((i) => s.seats[i].player.name));

	let minutes = $state(8);

	const said = $derived(
		names.length === 0
			? 'Niemand ist gestorben'
			: names.length === 1
				? `${names[0]} ist gestorben`
				: `${names.slice(0, -1).join(', ')} und ${names.at(-1)} sind gestorben`
	);

	onMount(() => {
		if (screen === 'wake') play('bell');
	});

	const step = (by: number) => (minutes = Math.min(59, Math.max(1, minutes + by)));
</script>

{#if screen === 'wake'}
	<section class="panel stack pad" aria-labelledby="phase">
		<h2 id="phase">Alle aufwachen</h2>
		<p class="muted">Die erzählende Person begrüßt die Stadt und verkündet den Morgen.</p>
		<div class="row">
			<Button variant="primary" onclick={() => dispatch({ type: 'next' })}>Weiter</Button>
		</div>
	</section>
{:else if screen === 'deaths'}
	<section class="stack" aria-labelledby="phase">
		<h2 id="phase" class="said">{said}</h2>
		<Circle seats={s.seats} dying={reducedMotion() ? [] : deaths} />
		<div class="row">
			<Button variant="primary" onclick={() => dispatch({ type: 'next' })}>Weiter</Button>
		</div>
	</section>
{:else}
	<section class="panel stack pad" aria-labelledby="phase">
		<h2 id="phase">Tagestimer</h2>
		<div class="set">
			<Button variant="secondary" square label="Minute weniger" onclick={() => step(-1)}>
				<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"></path></svg>
			</Button>
			<output class="minutes" data-testid="minutes">{minutes} min</output>
			<Button variant="secondary" square label="Minute mehr" onclick={() => step(1)}>
				<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14M12 5v14"></path></svg>
			</Button>
		</div>
		<div class="row">
			<Button variant="primary" onclick={() => dispatch({ type: 'timer', minutes, now: Date.now() })}>Timer starten</Button>
			<Button variant="ghost" onclick={() => dispatch({ type: 'timer', minutes: null, now: Date.now() })}>Ohne Timer</Button>
		</div>
	</section>
{/if}

<style>
	.pad {
		padding: 20px;
	}

	.said {
		text-align: center;
	}

	.set {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 20px;
	}

	.minutes {
		min-width: 4.5em;
		text-align: center;
		font: 400 40px/1 var(--font-num);
		font-variant-numeric: tabular-nums;
	}
</style>
