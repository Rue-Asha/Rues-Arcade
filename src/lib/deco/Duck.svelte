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
	// the duck is drawn in a 100 × 80 box and placed by its top-left corner
	const x = $derived(start ? 232 : 150);
	const y = $derived(start ? 70 : 28);
	const scale = $derived(start ? 1.25 : 1.05);
</script>

{#snippet chip(cx: number, cy: number, word: string)}
	<g transform="translate({cx - 38} {cy - 17})">
		<rect width="76" height="34" rx="9" style="fill:var(--raised);stroke:var(--duck);stroke-width:2" />
		<text x="38" y="23" style="fill:var(--text);color:var(--text);font:700 15px var(--font-ui);text-anchor:middle">{word}</text>
	</g>
{/snippet}

<svg viewBox="0 0 {width} {height}" preserveAspectRatio="xMidYMid slice">
	<Grid {width} {height} opacity={start ? 0.3 : 0.25} />
	<g style="fill:none;stroke-linecap:round">
		<ellipse cx={x + 50 * scale} cy={y + 78 * scale} rx={70 * scale} ry={9 * scale} style="stroke:var(--duck);stroke-opacity:0.45;stroke-width:3" />
		<ellipse cx={x + 50 * scale} cy={y + 78 * scale} rx={104 * scale} ry={15 * scale} style="stroke:var(--line);stroke-width:3" />
		<ellipse cx={x + 50 * scale} cy={y + 78 * scale} rx={140 * scale} ry={21 * scale} style="stroke:var(--line);stroke-opacity:0.6;stroke-width:2" />
	</g>
	<g transform="translate({x} {y}) scale({scale})">
		<g class="bob">
			<path d="M14 52 L4 30 L28 44Z" style="fill:var(--duck);stroke:var(--ink);stroke-width:2.5;stroke-linejoin:round" />
			<ellipse cx="46" cy="56" rx="38" ry="20" style="fill:var(--duck);stroke:var(--ink);stroke-width:2.5" />
			<circle cx="70" cy="28" r="17" style="fill:var(--duck);stroke:var(--ink);stroke-width:2.5" />
			<path d="M84 24 Q100 26 98 32 Q94 38 84 36Z" style="fill:var(--gold);stroke:var(--ink);stroke-width:2.5;stroke-linejoin:round" />
			<circle cx="74" cy="23" r="3" style="fill:var(--ink)" />
			<path d="M30 54 Q44 42 60 52 Q46 66 30 54Z" style="fill:var(--duck-ledge)" />
		</g>
	</g>
	{#if start}
		<path d="M110 170 Q280 -10 450 64" style="fill:none;stroke:var(--duck);stroke-width:2.5;stroke-dasharray:3 9;stroke-linecap:round;stroke-opacity:0.8" />
		{@render chip(110, 186, 'Haus')}
		{@render chip(456, 64, 'Maus')}
		<Spark x={516} y={176} scale={0.8} fill="var(--gold)" />
		<Spark x={60} y={56} scale={0.55} fill="var(--duck)" />
	{/if}
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: 100%;
	}

	.bob {
		transform-box: fill-box;
		transform-origin: 50% 100%;
	}

	@media (prefers-reduced-motion: no-preference) {
		.bob {
			animation: bob 3.2s ease-in-out infinite;
		}

		@keyframes bob {
			0%,
			100% {
				transform: translateY(0) rotate(0deg);
			}
			50% {
				transform: translateY(-3px) rotate(-3deg);
			}
		}
	}
</style>
