<script lang="ts">
	interface Props {
		total: number;
		left: number;
	}

	let { total, left }: Props = $props();
</script>

<span class="lives" role="img" aria-label="{left} von {total} Leben">
	{#each { length: total }, i (i)}
		<svg class:off={i >= left} width="18" height="18" viewBox="0 0 24 24" fill={i < left ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true">
			<path d="M12 20.5s-7.5-4.6-7.5-10.6A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.7c0 6-7.5 10.6-7.5 10.6z"></path>
		</svg>
	{/each}
</span>

<style>
	.lives {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		color: var(--heart, var(--imposter));
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
