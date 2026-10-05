<script lang="ts">
	import { getDemo } from '#lib/demo/context.ts';
	import { BAND_DEGREES, DIAL_DEGREES, targetBands } from './engine.ts';

	interface Props {
		value: number;
		left: string;
		right: string;
		// shows the scoring bands around it
		target?: number | null;
		needle?: boolean;
		// makes the dial an input
		ondial?: (value: number) => void;
	}

	let { value, left, right, target = null, needle = false, ondial }: Props = $props();

	const CX = 120;
	const CY = 120;
	const R = 110;

	const demo = $derived(ondial ? getDemo() : null);
	const expected = $derived(demo !== null && demo.expected === 'dial');
	const live = $derived(ondial !== undefined && (demo === null || expected));

	let svg = $state<SVGSVGElement>();
	let dragging = $state(false);

	const clamp = (v: number) => Math.min(DIAL_DEGREES, Math.max(0, v));

	function pt(angle: number, radius: number) {
		const rad = (angle * Math.PI) / 180;
		return { x: CX - radius * Math.cos(rad), y: CY - radius * Math.sin(rad) };
	}

	function wedge(from: number, to: number, radius = R) {
		const a = pt(clamp(from), radius);
		const b = pt(clamp(to), radius);
		return `M ${CX} ${CY} L ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${radius} ${radius} 0 0 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)} Z`;
	}

	const ticks = Array.from({ length: 20 }, (_, i) => (i + 1) * BAND_DEGREES);
	const bands = $derived(target === null ? [] : targetBands(target));

	function angleAt(e: PointerEvent) {
		const box = svg!.getBoundingClientRect();
		const k = 240 / box.width;
		const x = (e.clientX - box.left) * k;
		const y = (e.clientY - box.top) * k;
		const a = (Math.atan2(CY - y, CX - x) * 180) / Math.PI;
		// below the pivot the pointer sticks to the nearer end
		return a >= 0 ? a : a > -90 ? 0 : DIAL_DEGREES;
	}

	function down(e: PointerEvent) {
		e.preventDefault();
		dragging = true;
		svg!.focus();
		ondial!(angleAt(e));
	}

	function move(e: PointerEvent) {
		if (dragging) ondial!(angleAt(e));
	}

	function up() {
		dragging = false;
	}

	const keys: Record<string, (v: number) => number> = {
		ArrowRight: (v) => v + 1,
		ArrowUp: (v) => v + 1,
		ArrowLeft: (v) => v - 1,
		ArrowDown: (v) => v - 1,
		Home: () => 0,
		End: () => DIAL_DEGREES
	};

	function key(e: KeyboardEvent) {
		const step = keys[e.key];
		if (!step) return;
		e.preventDefault();
		ondial!(clamp(step(Math.round(value))));
	}

	const label = $derived(
		target === null
			? 'Skala'
			: `Ziel bei ${Math.round(target)}°${needle ? `, Zeiger bei ${Math.round(value)}°` : ''}`
	);
</script>

<svelte:window onpointermove={move} onpointerup={up} onpointercancel={up} />

{#snippet face()}
	<path d={wedge(0, DIAL_DEGREES)} class="base" />
	{#if bands.length}
		<g class="bands">
			{#each bands as band (band.from)}
				{@const mid = pt((band.from + band.to) / 2, R * 0.8)}
				<path d={wedge(band.from, band.to)} class="band p{band.points}" />
				<text x={mid.x} y={mid.y} class="pts">{band.points}</text>
			{/each}
		</g>
	{/if}
	{#each ticks as t (t)}
		{@const a = pt(t, R)}
		{@const b = pt(t, R - 7)}
		<line x1={a.x} y1={a.y} x2={b.x} y2={b.y} class="tick" />
	{/each}
	{#if needle}
		<line
			x1={CX}
			y1={CY}
			x2={CX - R + 8}
			y2={CY}
			class="needle"
			class:dragging
			style="transform: rotate({value}deg)"
		/>
	{/if}
	{#if needle && target === null}
		<text x={CX} y={CY - 46} class="mystery">?</text>
	{/if}
	<path d={wedge(0, DIAL_DEGREES)} class="rim" />
	<circle cx={CX} cy={CY} r="9" class="hub" />
{/snippet}

<figure class="dial" class:live class:expected data-action={ondial ? 'dial' : undefined} data-demo={expected ? 'expected' : undefined}>
	{#if ondial}
		<svg
			bind:this={svg}
			viewBox="0 0 240 132"
			role="slider"
			tabindex={live ? 0 : -1}
			aria-label="Zeiger"
			aria-valuemin={0}
			aria-valuemax={DIAL_DEGREES}
			aria-valuenow={Math.round(value)}
			aria-valuetext="{Math.round(value)}°"
			aria-disabled={!live}
			onpointerdown={live ? down : undefined}
			onkeydown={live ? key : undefined}
		>
			{@render face()}
		</svg>
	{:else}
		<svg viewBox="0 0 240 132" role="img" aria-label={label}>
			{@render face()}
		</svg>
	{/if}
	<figcaption class="ends">
		<span class="end">{left}</span>
		<span class="end right">{right}</span>
	</figcaption>
</figure>

<style>
	.dial {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 12px;
		width: 100%;
		max-width: 560px;
		margin: 0 auto;
	}

	svg {
		display: block;
		width: 100%;
		height: auto;
		border-radius: 12px;
	}

	.live svg {
		cursor: grab;
		touch-action: none;
	}

	.live svg:active {
		cursor: grabbing;
	}

	.expected::after {
		content: '';
		position: absolute;
		inset: -8px;
		border: 3px solid var(--gold);
		border-radius: 18px;
		pointer-events: none;
		animation: beckon 1.2s var(--ease-out) infinite;
	}

	@keyframes beckon {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.45;
		}
	}

	.base {
		fill: var(--raised);
	}

	.rim {
		fill: none;
		stroke: var(--line);
		stroke-width: 3;
	}

	.tick {
		stroke: var(--line);
		stroke-width: 1.5;
	}

	.bands {
		transform-box: view-box;
		transform-origin: 120px 120px;
		animation: fan 0.6s var(--ease-out) both;
	}

	@keyframes fan {
		from {
			opacity: 0;
			transform: scale(0.4) rotate(-12deg);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}

	.band {
		fill: var(--wavelength);
	}

	.p3 {
		fill: color-mix(in srgb, var(--wavelength) 62%, var(--raised));
	}

	.p2 {
		fill: color-mix(in srgb, var(--wavelength) 34%, var(--raised));
	}

	.pts {
		fill: var(--ink);
		font: 400 9px var(--font-data);
		text-anchor: middle;
		dominant-baseline: central;
	}

	.needle {
		stroke: var(--gold);
		stroke-width: 5;
		stroke-linecap: round;
		transform-box: view-box;
		transform-origin: 120px 120px;
		transition: transform 0.18s var(--ease-out);
	}

	.needle.dragging {
		transition: none;
	}

	.hub {
		fill: var(--gold);
		stroke: var(--gold-ledge);
		stroke-width: 3;
	}

	.mystery {
		fill: var(--muted);
		font: 800 28px var(--font-ui);
		text-anchor: middle;
	}

	.ends {
		display: flex;
		justify-content: space-between;
		gap: 16px;
	}

	.end {
		max-width: 48%;
		padding: 8px 12px;
		border-radius: var(--radius-sm);
		background: var(--raised);
		font-weight: 700;
		font-size: 17px;
		line-height: 1.2;
		overflow-wrap: anywhere;
	}

	.right {
		text-align: right;
	}
</style>
