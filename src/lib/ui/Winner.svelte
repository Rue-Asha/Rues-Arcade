<script lang="ts">
	import { onMount } from 'svelte';
	import { pop, reducedMotion, scatter } from '#lib/motion.ts';

	interface Props {
		names: string[];
		label?: string;
		note?: string;
		colour?: string;
	}

	let { names, label, note, colour }: Props = $props();

	const tint = $derived(colour ? `var(--${colour})` : 'var(--c, var(--gold))');
	const tie = $derived(names.length > 1);

	let flying = $state(false);
	onMount(() => {
		flying = !reducedMotion();
	});

	const fly = (node: HTMLElement) => scatter([...node.children] as HTMLElement[]);
</script>

<section class="winner" style="--band: {tint}">
	<div class="band">
		{#if label}<p class="label">{label}</p>{/if}
		{#if tie}
			<h2 in:pop|global>Unentschieden</h2>
			<p class="names">{names.join(' · ')}</p>
		{:else}
			<h2 in:pop|global>{names[0]}</h2>
		{/if}
	</div>
	{#if note}<p class="note">{note}</p>{/if}
	{#if flying}
		<div class="pieces" aria-hidden="true" use:fly>
			{#each { length: 12 } as _, i (i)}
				<span class="piece" class:gold={i % 2 === 1} data-piece></span>
			{/each}
		</div>
	{/if}
</section>

<style>
	.winner {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 12px;
		min-width: 0;
	}

	.band {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 24px 16px;
		border-radius: var(--radius-lg);
		background: var(--band);
		color: var(--ink);
		text-align: center;
	}

	.label {
		color: inherit;
	}

	h2 {
		max-width: 100%;
		font-weight: 800;
		font-size: clamp(32px, 9vw, 64px);
		line-height: 1;
		letter-spacing: -0.03em;
		overflow-wrap: anywhere;
	}

	.names {
		font-weight: 700;
		font-size: 19px;
		overflow-wrap: anywhere;
	}

	.note {
		font-weight: 600;
		font-size: 17px;
		text-align: center;
	}

	.pieces {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 0;
		height: 0;
		pointer-events: none;
	}

	.piece {
		position: absolute;
		left: -6px;
		top: -6px;
		width: 12px;
		height: 12px;
		border-radius: 3px;
		background: var(--band);
		opacity: 0;
	}

	.gold {
		background: var(--gold);
	}
</style>
