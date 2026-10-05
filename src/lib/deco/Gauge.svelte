<svelte:options namespace="svg" />

<script lang="ts">
	import { polar, semi, wedge } from '#lib/deco/motifs.ts';

	interface Props {
		cx: number;
		cy: number;
		r: number;
		face: string;
		needle?: number;
	}

	let { cx, cy, r, face, needle = 100 }: Props = $props();

	const step = 180 / 21;
	const mixes = [34, 62, 100, 62, 34];
	const bands = $derived(
		mixes.map((m, i) => ({
			d: wedge(cx, cy, r, (10.43 - i) * step, (9.43 - i) * step),
			fill: m === 100 ? 'var(--wavelength)' : `color-mix(in srgb, var(--wavelength) ${m}%, ${face})`
		}))
	);
	const ticks = $derived(
		Array.from({ length: 20 }, (_, i) => [polar(cx, cy, r * 0.99, 180 - (i + 1) * step), polar(cx, cy, r * 0.935, 180 - (i + 1) * step)])
	);
</script>

<g>
	<path d="{semi(cx, cy, r)}Z" style="fill:{face}" />
	{#each bands as band, i (i)}
		<path class="band" d={band.d} style="fill:{band.fill}" />
	{/each}
	<g style="stroke:var(--line);stroke-width:{r * 0.014}">
		{#each ticks as [[x1, y1], [x2, y2]], i (i)}
			<line x1={x1.toFixed(2)} y1={y1.toFixed(2)} x2={x2.toFixed(2)} y2={y2.toFixed(2)} />
		{/each}
	</g>
	<line
		class="needle"
		x1={cx}
		y1={cy}
		x2={cx - r * 0.92}
		y2={cy}
		style="stroke:var(--gold);stroke-width:{r * 0.045};stroke-linecap:round;transform-origin:{cx}px {cy}px;transform:rotate({needle}deg)"
	/>
	<path d={semi(cx, cy, r)} style="fill:none;stroke:var(--wavelength);stroke-width:{r * 0.027}" />
	<circle {cx} {cy} r={r * 0.08} style="fill:var(--gold);stroke:var(--gold-ledge);stroke-width:{r * 0.0264}" />
</g>

<style>
	.needle {
		transform-box: view-box;
	}
</style>
