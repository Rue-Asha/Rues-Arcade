<script lang="ts">
	import type { Snippet } from 'svelte';
	import Art from './Art.svelte';

	interface Props {
		slug?: string;
		place: 'home' | 'start' | 'lobby';
		// token name
		colour?: string;
		children: Snippet;
	}

	let { slug, place, colour, children }: Props = $props();

	const c = $derived(colour ?? 'primary');
</script>

<div
	class="banner {place}"
	class:toned={colour !== undefined}
	style="--c: var(--{c}); --tint: var(--{c}-tint, var(--surface)); --edge: var(--{c}-ledge, var(--shadow))"
>
	<div class="copy">
		{@render children()}
	</div>
	<div class="art">
		<Art {slug} {place} />
	</div>
</div>

<style>
	.banner {
		position: relative;
		overflow: hidden;
		isolation: isolate;
		display: flex;
		flex-direction: column;
		border-radius: var(--radius-xl);
		background: var(--surface);
		box-shadow: 0 var(--ledge) 0 var(--shadow);
	}

	.toned {
		background: var(--tint);
		box-shadow: 0 var(--ledge) 0 var(--edge);
	}

	/* drawn above the art, which would cover an inset shadow */
	.toned::after {
		content: '';
		position: absolute;
		inset: 0 0 auto;
		z-index: 2;
		height: 3px;
		background: var(--c);
	}

	.copy {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 10px;
		min-width: 0;
		padding: 20px;
	}

	.art {
		position: absolute;
		top: 0;
		right: 0;
		width: min(85%, 380px);
		aspect-ratio: 560 / 240;
		opacity: 0.4;
		mask-image: linear-gradient(to left, #000 35%, transparent), linear-gradient(to bottom, #000 50%, transparent);
		mask-composite: intersect;
	}

	.lobby .art {
		aspect-ratio: 560 / 170;
	}

	@media (min-width: 1024px) {
		.banner {
			display: grid;
			grid-template-columns: minmax(0, 1fr) 560px;
			min-height: 240px;
		}

		.banner.lobby {
			min-height: 180px;
		}

		.copy {
			padding: 32px;
		}

		.art {
			position: relative;
			width: auto;
			aspect-ratio: auto;
			opacity: 1;
			mask-image: none;
			background: linear-gradient(90deg, transparent, rgb(5 4 31 / 0.25));
		}
	}
</style>
