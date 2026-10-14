<script lang="ts">
	import type { ScreenProps } from '#lib/games/registry.ts';
	import Circle from './Circle.svelte';
	import type { ClocktowerAction, ClocktowerState } from './types.ts';

	let { state: game, dispatch }: ScreenProps = $props();

	const s = $derived(game as ClocktowerState);
	const send = (action: ClocktowerAction) => dispatch(action);

	let picked = $state<number | null>(null);

	function tap(i: number) {
		if (picked === null) picked = i;
		else if (picked === i) picked = null;
		else {
			send({ type: 'swap', a: picked, b: i });
			picked = null;
		}
	}
</script>

<div class="board stack">
	<section class="panel stack seats" aria-labelledby="seats">
		<h2 id="seats">Sitzordnung</h2>
		<Circle
			seats={s.seats}
			size="setup"
			marked={picked === null ? [] : [picked]}
			onseat={tap}
			onswap={(from, to) => send({ type: 'move', from, to })}
			onmove={(from, to) => send({ type: 'move', from, to })}
		/>
		<p class="muted">Tippt zwei Plätze an, um sie zu tauschen, oder zieht einen Platz an eine andere Stelle.</p>
	</section>
</div>

<style>
	/* the circle takes the panel's full width: 15 seats need every pixel of a 390px phone */
	.seats {
		padding: 16px 0;
	}

	.seats > :global(h2),
	.seats > :global(p) {
		padding-inline: 16px;
	}
</style>
