<script lang="ts">
	import type { Place } from '#lib/deco/motifs.ts';
	import Grid from './Grid.svelte';
	import Spark from './Spark.svelte';

	interface Props {
		place: Place;
	}

	let { place }: Props = $props();

	const start = $derived(place === 'start');
	const width = $derived(start ? 560 : 400);
	const height = $derived(start ? 240 : 150);
	// a row of covered letters, one of them guessed, and the one-word hint above it
	const count = $derived(start ? 6 : 5);
	const size = $derived(start ? 52 : 40);
	const gap = $derived(start ? 12 : 10);
	const left = $derived((width - count * size - (count - 1) * gap) / 2);
	const top = $derived(start ? 128 : 78);
	const odd = $derived(start ? 3 : 2);
	const bubble = $derived(start ? { x: 92, y: 34, w: 168, h: 58 } : { x: 70, y: 16, w: 124, h: 44 });
</script>

<svg viewBox="0 0 {width} {height}" preserveAspectRatio="xMidYMid slice">
	<Grid {width} {height} opacity={start ? 0.3 : 0.25} />

	<g style="fill:var(--raised);stroke:var(--c);stroke-width:2.5;stroke-linejoin:round">
		<rect x={bubble.x} y={bubble.y} width={bubble.w} height={bubble.h} rx="14" />
		<path d="M{bubble.x + 30} {bubble.y + bubble.h - 1.5}l6 {start ? 18 : 14} 14 -{start ? 18 : 14}" />
	</g>
	<rect x={bubble.x + 22} y={bubble.y + bubble.h / 2 - 6} width={bubble.w * 0.5} height="12" rx="6" style="fill:var(--c)" />
	<rect x={bubble.x + 30 + bubble.w * 0.5} y={bubble.y + bubble.h / 2 - 4} width="18" height="8" rx="4" style="fill:var(--muted)" />

	{#each Array.from({ length: count }, (_, i) => i) as i (i)}
		{@const x = left + i * (size + gap)}
		{#if i === odd}
			<g class="odd">
				<rect {x} y={top} width={size} height={size} rx="10" style="fill:var(--c);stroke:var(--ink);stroke-width:2.5" />
				<circle cx={x + size / 2} cy={top + size / 2} r={size / 7} style="fill:var(--ink)" />
			</g>
		{:else}
			<rect {x} y={top} width={size} height={size} rx="10" style="fill:var(--raised);stroke:var(--line);stroke-width:2" />
			<circle cx={x + size / 2} cy={top + size / 2} r={size / 9} style="fill:var(--muted)" />
		{/if}
	{/each}
	<rect class="caret" x={left + count * (size + gap) - gap / 2} y={top + 8} width="4" height={size - 16} rx="2" style="fill:var(--c)" />
	<rect x="40" y={top + size + 18} width={width - 80} height="3" rx="1.5" style="fill:var(--line)" />

	{#if start}
		<Spark x={492} y={52} scale={0.8} fill="var(--gold)" />
		<Spark x={34} y={200} scale={0.55} fill="var(--c)" />
	{/if}
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: 100%;
	}

	.odd {
		transform-box: fill-box;
	}

	@media (prefers-reduced-motion: no-preference) {
		.odd {
			animation: lift 4s var(--ease-out) infinite;
		}

		.caret {
			animation: blink 1.1s steps(1) infinite;
		}

		@keyframes lift {
			0%,
			70%,
			100% {
				transform: translateY(0);
			}
			80% {
				transform: translateY(-7px);
			}
		}

		@keyframes blink {
			0%,
			100% {
				opacity: 1;
			}
			50% {
				opacity: 0;
			}
		}
	}
</style>
