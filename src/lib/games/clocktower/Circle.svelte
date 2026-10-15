<script lang="ts">
	import type { Snippet } from 'svelte';
	import { angleOf, ornament, seatPositions, seatSize } from './circle.ts';
	import { byId } from './characters.ts';
	import CharacterIcon from './CharacterIcon.svelte';
	import type { CharacterId, Seat } from './types.ts';

	interface Props {
		seats: Seat[];
		size?: 'setup' | 'play';
		label?: (i: number) => string | null;
		token?: (i: number) => CharacterId | null;
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
		token,
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
	// a name ribbon under an icon may be wider than its node but must keep clear of the neighbours
	const ribbon = $derived(Math.min(56, (box - d) * Math.sin(Math.PI / count) - 8));

	function spoken(i: number): string {
		const seat = seats[i];
		const character = token?.(i) ?? null;
		const head = `Platz ${i + 1}, ${seat.player.name}${character === null ? '' : `, ${byId[character].name}`}`;
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

<div class="circle" data-circle data-size={size} style:--box="{box}px" style:--seat="{d}px" style:--ribbon="{ribbon}px" style:--max="{MAX[size]}px" bind:clientWidth={width}>
	<div class="plane" style:width="{box}px" style:height="{box}px">
		<svg class="ornament" data-deco data-motif="circle" viewBox="0 0 {box} {box}" width={box} height={box} aria-hidden="true" focusable="false">
			<circle class="hair" cx={box / 2} cy={box / 2} r={deco.outer} />
			<circle class="hair" cx={box / 2} cy={box / 2} r={deco.inner} />
			<path class="ticks" data-ticks={count} d={deco.ticks} />
			<circle class="hair" cx={box / 2} cy={box / 2} r={deco.hub * 2.6} />
			<path class="rosette" d={deco.rosette} />
			{#each deco.links as link, i (i)}
				<path class="ring" data-ring class:gap={!seats[i].alive || !seats[(i + 1) % count].alive} d={link} />
			{/each}
		</svg>
		{#each seats as seat, i (seat.player.id)}
			{@const why = disabled?.(i) ?? null}
			{@const text = label?.(i) ?? null}
			{@const icon = token?.(i) ?? null}
			<button
				type="button"
				class="seat"
				class:dying={dying.includes(i)}
				class:grab={drag?.from === i}
				class:drop={drag?.over === i}
				class:holds={icon !== null}
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
				{#if icon}<CharacterIcon id={icon} size={Math.round(d * 0.47)} />{/if}
				<span class="name" title={seat.player.name}>{seat.player.name}</span>
				{#if text}<span class="tag">{text}</span>{/if}
				{#if !seat.alive}
					<span class="mark" data-spent={seat.ghostVote ? undefined : ''} aria-hidden="true">
						<svg viewBox="0 0 48 22" preserveAspectRatio="none" focusable="false" aria-hidden="true">
							<rect class="rim" x="1" y="1" width="46" height="20" rx="10" />
							<rect class="notch" x="4" y="4" width="40" height="14" rx="7" />
						</svg>
						<span class="glyphs">{seat.ghostVote ? '✕ ●' : '✕ ○'}</span>
					</span>
				{/if}
				{#if marked.includes(i)}<span class="badge hand-up" aria-hidden="true">✓</span>{/if}
				{#if block === i}<span class="badge on-block" aria-hidden="true">▼</span>{/if}
			</button>
		{/each}
		{#if hand !== null}
			<div class="clock" aria-hidden="true">
				<div class="hand" data-hand style:--angle="{angleOf(hand, count)}deg" style:--ms="{handMs}ms">
					<span class="arm"></span>
					<span class="tip" data-hand-tip></span>
				</div>
				<span class="hub" data-hub></span>
			</div>
		{/if}
		{#if center}
			<div class="centre">{@render center()}</div>
		{/if}
	</div>
</div>

<style>
	/* room for the number pills over the top seats and the name ribbons under the bottom ones */
	.circle {
		width: 100%;
		max-width: var(--max);
		margin-inline: auto;
		padding-block: 8px;
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
		--name: clamp(15px, calc(var(--seat) * 0.3), 20px);
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

	/* a small pill straddling the top rim, narrow enough to stay clear of the badge slot at 45° */
	.no {
		position: absolute;
		top: -2px;
		left: 50%;
		z-index: 1;
		min-width: 14px;
		height: 14px;
		padding: 0 2px;
		transform: translate(-50%, -50%);
		border-radius: 7px;
		background: var(--raised);
		box-shadow: 0 0 0 1px var(--line);
		font-size: 12px;
		font-weight: 700;
		line-height: 14px;
		text-align: center;
	}

	.name {
		max-width: calc(var(--seat) - 8px);
		font-size: var(--name);
		font-weight: 600;
		line-height: 1.1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* with an icon the icon takes the face and the name moves to a ribbon over the lower rim */
	.holds :global(svg.icon) {
		position: absolute;
		left: 50%;
		top: calc(50% - var(--seat) * 0.04);
		transform: translate(-50%, -50%);
	}

	.holds .name {
		position: absolute;
		top: calc(50% + var(--seat) * 0.28);
		left: 50%;
		max-width: var(--ribbon);
		line-height: 1.05;
		padding: 0 4px;
		transform: translateX(-50%);
		border: 1px solid var(--line);
		border-radius: 4px;
		background: var(--raised);
	}

	.tag {
		position: absolute;
		top: 100%;
		margin-top: 4px;
		font-size: 11px;
		color: var(--muted);
		white-space: nowrap;
	}

	.holds .tag {
		top: calc(50% + var(--seat) * 0.28 + var(--name) * 1.05 + 6px);
	}

	.seat[data-dead] {
		border-style: dashed;
		background: var(--surface);
		color: var(--muted);
	}

	.seat[data-dead] .name {
		text-decoration: line-through;
	}

	/* a wax-seal coin: its own solid face, a gold rim and a notched inner rim, so the glyphs sit on a known background;
	   a spent token loses the notches */
	.mark {
		position: absolute;
		bottom: -8px;
		right: -4px;
		display: grid;
		place-items: center;
		min-width: 40px;
		height: 22px;
		padding: 0 8px;
		border-radius: 11px;
		background: var(--gold-tint);
		box-shadow: 0 1px 0 var(--gold-ledge);
		color: var(--text);
		font-size: 12px;
		font-weight: 700;
		line-height: 1;
		white-space: nowrap;
	}

	.mark[data-spent] {
		background: var(--surface);
		box-shadow: none;
	}

	.mark svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		fill: none;
		pointer-events: none;
	}

	.rim {
		stroke: var(--gold);
		stroke-width: 1.5;
		vector-effect: non-scaling-stroke;
	}

	.notch {
		stroke: var(--gold);
		stroke-width: 1;
		stroke-dasharray: 1.5 2.5;
		vector-effect: non-scaling-stroke;
	}

	.mark[data-spent] .rim {
		stroke: var(--line);
	}

	.mark[data-spent] .notch {
		display: none;
	}

	.glyphs {
		position: relative;
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
		z-index: 0;
		left: 50%;
		top: 0;
		width: 0;
		height: 100%;
		pointer-events: none;
		transform: rotate(var(--angle));
		transition: transform var(--ms) linear;
	}

	/* under the seats: the hand reaches from the hub to the pointed seat's rim and vanishes behind it */
	.clock {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.arm {
		position: absolute;
		left: -3px;
		top: var(--seat);
		width: 6px;
		height: calc(50% - var(--seat));
		border-radius: 3px 3px 1px 1px;
		background: var(--clocktower);
		clip-path: polygon(30% 0, 70% 0, 100% 100%, 0 100%);
	}

	.tip {
		position: absolute;
		left: -6px;
		top: calc(var(--seat) - 7px);
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--clocktower);
		box-shadow: 0 0 0 3px var(--raised);
	}

	.hub {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 22px;
		height: 22px;
		transform: translate(-50%, -50%);
		border-radius: 50%;
		background: var(--clocktower);
		box-shadow: 0 0 0 4px var(--raised), 0 0 0 5px var(--clocktower);
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
