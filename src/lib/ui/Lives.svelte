<script lang="ts">
	import { ease, reducedMotion } from '#lib/motion.ts';

	interface Props {
		total: number;
		// hearts: how many are left. strike: how many pods are filled
		left: number;
		icon?: 'heart' | 'strike';
		size?: number;
	}

	let { total, left, icon = 'heart', size = 18 }: Props = $props();

	const strike = $derived(icon === 'strike');
	let pods: SVGSVGElement[] = [];
	let seen: number | null = null;

	// a pod that fills pops; the ones already filled when this mounted stay still
	$effect(() => {
		if (strike && seen !== null && left > seen && !reducedMotion())
			pods[left - 1]?.animate(
				[
					{ transform: 'scale(0.4)', opacity: 0.3 },
					{ transform: 'scale(1.3)', opacity: 1, offset: 0.55 },
					{ transform: 'scale(1)', opacity: 1 }
				],
				{ duration: 420, easing: ease }
			);
		seen = left;
	});
</script>

<span class="lives" class:strike role="img" aria-label="{left} von {total} {strike ? 'Fehlern' : 'Leben'}">
	{#each { length: total }, i (i)}
		{#if strike}
			<svg bind:this={pods[i]} class:off={i >= left} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
				<rect x="2.5" y="2.5" width="19" height="19" rx="5" fill={i < left ? 'currentColor' : 'none'}></rect>
				<path d="M8 8l8 8M16 8l-8 8" style:stroke={i < left ? 'var(--ink)' : 'currentColor'}></path>
			</svg>
		{:else}
			<svg class:off={i >= left} width={size} height={size} viewBox="0 0 24 24" fill={i < left ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true">
				<path d="M12 20.5s-7.5-4.6-7.5-10.6A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.7c0 6-7.5 10.6-7.5 10.6z"></path>
			</svg>
		{/if}
	{/each}
</span>

<style>
	.lives {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		color: var(--heart, var(--imposter));
	}

	.strike {
		gap: 8px;
		color: var(--strike, var(--imposter));
	}

	svg {
		transition:
			transform 0.3s var(--ease-out),
			opacity 0.3s;
	}

	.off {
		color: var(--heart-off, var(--off));
		transform: scale(0.85);
	}
</style>
