<script lang="ts">
	import type { SetupProps } from '#lib/games/registry.ts';
	import Button from '#lib/ui/Button.svelte';
	import { DEFAULT_ROUNDS, ROUND_OPTIONS, type MostLikelyConfig } from './engine.ts';

	let { players, onstart }: SetupProps = $props();

	let rounds = $state<MostLikelyConfig['rounds']>(DEFAULT_ROUNDS);
</script>

<div class="stack">
	<section class="panel stack" aria-labelledby="crew">
		<h2 id="crew">Dabei sind</h2>
		<ol class="chips rise" aria-labelledby="crew">
			{#each players as p (p.id)}
				<li>{p.name}</li>
			{/each}
		</ol>
		<p class="muted">Pro Runde liest eine Person den Spruch vor, auf drei zeigen alle gleichzeitig.</p>
	</section>

	<section class="panel stack" aria-labelledby="rounds">
		<div class="head">
			<h2 id="rounds">Runden</h2>
			<p class="muted">Eine Runde: ein Spruch, ein Titel.</p>
		</div>
		<div class="seg" role="group" aria-labelledby="rounds">
			{#each ROUND_OPTIONS as r (r)}
				<button type="button" class="opt" aria-pressed={rounds === r} onclick={() => (rounds = r)}>{r}</button>
			{/each}
		</div>
	</section>

	<div class="row">
		<Button variant="primary" onclick={() => onstart({ rounds } satisfies MostLikelyConfig)}>Los geht's</Button>
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
		background: var(--most-likely-tint);
		box-shadow: 0 3px 0 var(--most-likely-ledge);
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
		background: var(--most-likely);
		border-color: var(--most-likely);
		color: var(--ink);
		box-shadow: 0 4px 0 var(--most-likely-ledge);
	}
</style>
