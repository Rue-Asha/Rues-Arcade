<script lang="ts">
	import type { Snippet } from 'svelte';
	import { angleOf, ornament, seatPositions, seatSize } from './circle.ts';
	import type { Seat } from './types.ts';

	interface Props {
		seats: Seat[];
		size?: 'setup' | 'play';
		label?: (i: number) => string | null;
		marked?: number[];
		block?: number | null;
		hand?: number | null;
		handMs?: number;
		dying?: number[];
		disabled?: (i: number) => string | null;
		onseat?: (i: number) => void;
		onswap?: (a: number, b: number) => void;
		onmove?: (from: number, to: number) => void;
		center?: Snippet;
	}

	let {
		seats,
		size = 'play',
		label,
		marked = [],
		block = null,
		hand = null,
		handMs = 0,
		dying = [],
		disabled,
		onseat,
		onswap,
		onmove,
		center
	}: Props = $props();

	const MAX = { setup: 360, play: 640 } as const;

	let width = $state(340);
	let drag = $state<{ from: number; x: number; y: number; over: number | null } | null>(null);
	let buttons: HTMLButtonElement[] = [];

	const count = $derived(seats.length);
	const box = $derived(Math.max(240, Math.min(width, MAX[size])));
	const d = $derived(seatSize(count, box));
	const at = $derived(seatPositions(count, box));
	const deco = $derived(ornament(count, box));

	function spoken(i: number): string {
		const seat = seats[i];
		const head = `Platz ${i + 1}, ${seat.player.name}`;
		if (seat.alive) return head;
		return `${head}, tot, ${seat.ghostVote ? 'Stimme' : 'keine Stimme'}`;
	}

	function press(i: number) {
		if (drag !== null || disabled?.(i)) return;
		onseat?.(i);
	}

	function focus(i: number) {
		buttons[(i + count) % count]?.focus();
	}

	function key(e: KeyboardEvent, i: number) {
		const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
		if (step === 0) return;
		e.preventDefault();
		if (e.shiftKey && onmove) {
			const to = (i + step + count) % count;
			onmove(i, to);
			// the seat keeps focus at its new place once the list has re-rendered
			queueMicrotask(() => requestAnimationFrame(() => focus(to)));
		} else focus(i + step);
	}

	function down(e: PointerEvent, i: number) {
		if (!onswap || e.button > 0) return;
		drag = { from: i, x: e.clientX, y: e.clientY, over: null };
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function overOf(e: PointerEvent): number | null {
		const el = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-seat]');
		return el === null || el === undefined ? null : Number(el.dataset.seat) - 1;
	}

	function moving(e: PointerEvent) {
		if (drag === null) return;
		if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 8 && drag.over === null) return;
		const over = overOf(e);
		drag = { ...drag, over: over === drag.from ? null : over };
	}

	function up(e: PointerEvent) {
		if (drag === null) return;
		const { from } = drag;
		const to = overOf(e);
		const dragged = drag.over !== null || Math.hypot(e.clientX - drag.x, e.clientY - drag.y) >= 8;
		if (!dragged) {
			drag = null;
			return;
		}
		// the click that follows the pointerup of a drag must not count as a tap
		setTimeout(() => (drag = null), 0);
		if (to !== null && to !== from) onswap?.(from, to);
	}
</script>

<div class="circle" data-circle data-size={size} style:--box="{box}px" style:--seat="{d}px" style:--max="{MAX[size]}px" bind:clientWidth={width}>
	<div class="plane" style:width="{box}px" style:height="{box}px">
		<svg class="ornament" data-deco data-motif="circle" viewBox="0 0 {box} {box}" width={box} height={box} aria-hidden="true" focusable="false">
			<circle class="hair" cx={box / 2} cy={box / 2} r={deco.outer} />
			<circle class="hair" cx={box / 2} cy={box / 2} r={deco.inner} />
			<path class="ticks" d={deco.ticks} />
			<circle class="hair" cx={box / 2} cy={box / 2} r={deco.hub * 2.6} />
			<path class="rosette" d={deco.rosette} />
			{#each deco.links as link, i (i)}
				<path class="ring" data-ring class:gap={!seats[i].alive || !seats[(i + 1) % count].alive} d={link} />
			{/each}
		</svg>
		{#each seats as seat, i (seat.player.id)}
			{@const why = disabled?.(i) ?? null}
			{@const text = label?.(i) ?? null}
			<button
				type="button"
				class="seat"
				class:dying={dying.includes(i)}
				class:grab={drag?.from === i}
				class:drop={drag?.over === i}
				data-seat={i + 1}
				data-dead={seat.alive ? undefined : ''}
				data-ghost={!seat.alive && seat.ghostVote ? '' : undefined}
				data-marked={marked.includes(i) ? '' : undefined}
				data-block={block === i ? '' : undefined}
				aria-label={spoken(i)}
				aria-disabled={why !== null}
				title={why ?? undefined}
				style:left="{at[i].x}px"
				style:top="{at[i].y}px"
				style:touch-action={onswap ? 'none' : undefined}
				bind:this={buttons[i]}
				onclick={() => press(i)}
				onkeydown={(e) => key(e, i)}
				onpointerdown={(e) => down(e, i)}
				onpointermove={moving}
				onpointerup={up}
				onpointercancel={() => (drag = null)}
			>
				<span class="no">{i + 1}</span>
				<span class="name">{seat.player.name}</span>
				{#if text}<span class="tag">{text}</span>{/if}
				{#if !seat.alive}
					<span class="mark" aria-hidden="true">{seat.ghostVote ? '✕ ●' : '✕ ○'}</span>
				{/if}
				{#if marked.includes(i)}<span class="badge hand-up" aria-hidden="true">✓</span>{/if}
				{#if block === i}<span class="badge on-block" aria-hidden="true">▼</span>{/if}
			</button>
		{/each}
		{#if hand !== null}
			<div class="hand" data-hand style:--angle="{angleOf(hand, count)}deg" style:--ms="{handMs}ms" aria-hidden="true"></div>
		{/if}
		{#if center}
			<div class="centre">{@render center()}</div>
		{/if}
	</div>
</div>

<style>
	.circle {
		width: 100%;
		max-width: var(--max);
		margin-inline: auto;
		display: flex;
		justify-content: center;
	}

	.plane {
		position: relative;
		flex: none;
		max-width: 100%;
	}

	/* paths only, under the seats; the seats' opaque faces keep every line away from their text */
	.ornament {
		position: absolute;
		inset: 0;
		overflow: visible;
		pointer-events: none;
		fill: none;
		stroke: var(--gold);
	}

	.ring {
		stroke-width: 2;
		stroke-opacity: 0.6;
		stroke-linecap: round;
	}

	.ring.gap {
		stroke-dasharray: 2 6;
		stroke-opacity: 0.45;
	}

	.hair {
		stroke-width: 1;
		stroke-opacity: 0.35;
	}

	.ticks {
		stroke-width: 1.5;
		stroke-opacity: 0.45;
		stroke-linecap: round;
	}

	.rosette {
		stroke-width: 1;
		stroke-opacity: 0.4;
		stroke-linejoin: round;
	}

	.seat {
		position: absolute;
		z-index: 1;
		width: var(--seat);
		height: var(--seat);
		transform: translate(-50%, -50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0;
		padding: 2px;
		border: 2px solid var(--line);
		border-radius: 50%;
		background: var(--raised);
		color: var(--text);
		font: inherit;
		line-height: 1.05;
		cursor: pointer;
		touch-action: manipulation;
		user-select: none;
	}

	.seat[aria-disabled='true'] {
		cursor: not-allowed;
		opacity: 0.6;
	}

	.seat:focus-visible {
		outline: 3px solid var(--gold);
		outline-offset: 2px;
	}

	.no {
		font-weight: 800;
		font-size: 15px;
	}

	.name {
		max-width: 100%;
		font-size: 11px;
		font-weight: 600;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.tag {
		position: absolute;
		top: 100%;
		margin-top: 2px;
		font-size: 11px;
		color: var(--muted);
		white-space: nowrap;
	}

	.seat[data-dead] {
		border-style: dashed;
		background: var(--surface);
		color: var(--muted);
	}

	.seat[data-dead] .name {
		text-decoration: line-through;
	}

	.mark {
		position: absolute;
		bottom: -4px;
		right: -6px;
		padding: 0 4px;
		border-radius: 8px;
		background: var(--surface);
		border: 1px solid var(--line);
		font-size: 10px;
		color: var(--text);
	}

	.seat[data-ghost] {
		border-color: var(--gold);
	}

	.seat[data-marked] {
		border-color: var(--clocktower);
		background: var(--clocktower-tint);
		color: var(--text);
	}

	.seat[data-block] {
		border-color: var(--clocktower);
		box-shadow: 0 0 0 3px var(--clocktower);
	}

	.badge {
		position: absolute;
		top: -6px;
		right: -6px;
		min-width: 20px;
		padding: 0 4px;
		border-radius: 10px;
		background: var(--clocktower);
		color: var(--ink);
		font-size: 12px;
		font-weight: 800;
		text-align: center;
	}

	.grab {
		opacity: 0.7;
	}

	.drop {
		outline: 3px dashed var(--gold);
		outline-offset: 3px;
	}

	.dying {
		animation: dying 1.2s var(--ease-out) 1 both;
	}

	@keyframes dying {
		from {
			transform: translate(-50%, -50%) scale(1.25);
			opacity: 0.4;
		}
		to {
			transform: translate(-50%, -50%) scale(1);
		}
	}

	/* a zero-width box over the plane's height turns about the centre without its corners leaving the plane; an
	   inset:0 square would widen the page while it rotates */
	.hand {
		position: absolute;
		left: 50%;
		top: 0;
		width: 0;
		height: 100%;
		pointer-events: none;
		transform: rotate(var(--angle));
		transition: transform var(--ms) linear;
	}

	.hand::before {
		content: '';
		position: absolute;
		left: -2px;
		top: calc(var(--seat) + 4px);
		width: 4px;
		height: calc(50% - var(--seat) - 4px);
		border-radius: 2px;
		background: var(--clocktower);
	}

	.centre {
		position: absolute;
		inset: calc(var(--seat) + 16px);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		pointer-events: none;
	}

	.centre :global(button),
	.centre :global(a) {
		pointer-events: auto;
	}
</style>
