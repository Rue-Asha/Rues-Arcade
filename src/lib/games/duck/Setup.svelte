<script lang="ts">
	import type { SetupProps } from '#lib/games/registry.ts';
	import Button from '#lib/ui/Button.svelte';
	import { DEFAULT_TARGET, TARGET_OPTIONS, type DuckConfig } from './engine.ts';

	let { players, onstart }: SetupProps = $props();

	let target = $state<DuckConfig['target']>(DEFAULT_TARGET);
</script>

<div class="stack">
	<section class="panel stack" aria-labelledby="crew">
		<h2 id="crew">{players.length} Spieler</h2>
		<ol class="chips">
			{#each players as p (p.id)}
				<li>{p.name}</li>
			{/each}
		</ol>
		<p class="muted">Alle spielen für sich. Chuck the Duck geht nach jedem Wort reihum weiter.</p>
	</section>

	<section class="panel stack" aria-labelledby="target">
		<div class="head">
			<h2 id="target">Zielpunkte</h2>
			<p class="muted">Das Spiel endet, sobald jemand die Zielpunkte erreicht oder alle Buchstaben von DUCKY verliert.</p>
		</div>
		<div class="seg" role="group" aria-labelledby="target">
			{#each TARGET_OPTIONS as t (t)}
				<button type="button" class="opt" aria-pressed={target === t} onclick={() => (target = t)}>{t}</button>
			{/each}
		</div>
	</section>

	<div class="row">
		<Button variant="primary" onclick={() => onstart({ target } satisfies DuckConfig)}>Los geht's</Button>
	</div>
</div>

<style>
	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 8px 16px;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.chips li {
		padding: 8px 14px;
		border-radius: var(--radius-sm);
		background: var(--duck-tint);
		box-shadow: inset 0 -3px 0 var(--duck-ledge);
		font-weight: 700;
		overflow-wrap: anywhere;
	}

	.seg {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.opt {
		display: grid;
		place-items: center;
		min-width: 56px;
		min-height: 48px;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: var(--raised);
		box-shadow: 0 4px 0 var(--shadow);
		font-weight: 700;
		font-size: 16px;
		cursor: pointer;
		user-select: none;
		touch-action: manipulation;
		transition:
			transform 0.07s ease-out,
			box-shadow 0.07s ease-out;
	}

	.opt:active {
		transform: translateY(4px);
		box-shadow: 0 0 0 transparent;
	}

	.opt[aria-pressed='true'] {
		background: var(--duck);
		border-color: var(--duck);
		color: var(--ink);
		box-shadow: 0 4px 0 var(--duck-ledge);
	}
</style>
