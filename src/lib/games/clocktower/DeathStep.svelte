<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import Circle from './Circle.svelte';
	import { who, whoAll } from './label.ts';
	import type { ClocktowerAction, ClocktowerState } from './types.ts';

	interface Props {
		state: ClocktowerState;
		dispatch: (action: ClocktowerAction) => void;
	}

	let { state: s, dispatch }: Props = $props();

	// the noted target, or the Imp after a starpass, until the storyteller changes it
	let picked = $state<number[] | null>(null);
	const selected = $derived(picked ?? (s.night!.target === null ? [] : [s.night!.target]));

	function toggle(i: number) {
		picked = selected.includes(i) ? selected.filter((x) => x !== i) : [...selected, i].sort((a, b) => a - b);
	}
</script>

<section class="stack death" aria-labelledby="phase">
	<div class="panel stack head">
		<span class="label">Nur für dich</span>
		<h2 id="phase">Wer ist heute Nacht gestorben?</h2>
		<p class="muted" data-testid="deaths">{selected.length ? whoAll(s.seats, selected) : 'Niemand'}</p>
	</div>
	<Circle
		seats={s.seats}
		marked={selected}
		label={(i) => (s.seats[i].alive ? null : 'bereits tot')}
		disabled={(i) => (s.seats[i].alive ? null : 'bereits tot')}
		onseat={toggle}
	/>
	<div class="row none">
		<button type="button" class="chip" aria-pressed={selected.length === 0} onclick={() => (picked = [])}>Niemand</button>
	</div>
	<div class="dock">
		<div class="nav">
			<Button variant="primary" onclick={() => dispatch({ type: 'deaths', seats: selected })}>Weiter</Button>
			<div class="row">
				<Button variant="ghost" size="sm" onclick={() => dispatch({ type: 'back' })}>Zurück</Button>
			</div>
		</div>
	</div>
</section>

<style>
	.death {
		gap: 16px;
	}

	.head {
		padding: 20px;
		gap: 8px;
	}

	.head h2,
	.head p {
		margin: 0;
	}

	.none {
		justify-content: center;
	}

	.chip {
		min-height: 44px;
		padding: 0 18px;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: var(--raised);
		color: var(--text);
		font: 600 16px/1.1 var(--font-ui);
		cursor: pointer;
		touch-action: manipulation;
	}

	.chip[aria-pressed='true'] {
		border-color: var(--gold);
		background: var(--gold-tint);
		box-shadow: inset 0 0 0 1px var(--gold);
	}

	.dock {
		position: sticky;
		bottom: 0;
		z-index: 2;
		padding: 8px 0 4px;
		background: var(--ground);
	}

	.nav {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
</style>
