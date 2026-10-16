<script lang="ts">
	import type { Snippet } from 'svelte';
	import { reducedMotion } from '#lib/motion.ts';
	import { angleOf, ornament, seatPositions, seatSize, wedge } from './circle.ts';
	import { byId } from './characters.ts';
	import CharacterIcon from './CharacterIcon.svelte';
	import type { CharacterId, Seat } from './types.ts';

	interface Props {
		seats: Seat[];
		size?: 'setup' | 'play';
		label?: (i: number) => string | null;
		token?: (i: number) => CharacterId | null;
		marked?: number[];
		pointed?: number[];
		block?: number | null;
		// seat units, fractional while it turns; values past the last seat keep turning clockwise
		hand?: number | null;
		handMs?: number;
		sector?: number | null;
		rings?: (i: number) => { nominee: boolean; nominator: boolean };
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
		pointed = [],
		block = null,
		hand = null,
		handMs = 0,
		sector = null,
		rings,
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
	const centre = $derived(2 * (deco.inner - 4));
	const ribbon = $derived(Math.min(56, (box - d) * Math.sin(Math.PI / count) - 8));

	function spoken(i: number): string {
		const seat = seats[i];
		const character = token?.(i) ?? null;
		const head = `Platz ${i + 1}, ${seat.player.name}${character === null ? '' : `, ${byId[character].name}`}`;
		if (seat.alive) return head;
		return `${head}, tot, ${seat.ghostVote ? 'Stimme' : 'keine Stimme'}`;
	}

	// the press: a scale-in and a gold glow while held, a spring past full size and a ripple on the tap
	let held: Animation[] = [];

	function letGo() {
		for (const a of held) a.cancel();
		held = [];
	}

	function pressIn(i: number) {
		const el = buttons[i];
		letGo();
		if (disabled?.(i) || reducedMotion() || typeof el.animate !== 'function') return;
		const ripple = el.querySelector<HTMLElement>('[data-ripple]')!;
		held = [
			el.animate([{ scale: 1 }, { scale: 0.93 }], { duration: 90, easing: 'ease-out', fill: 'forwards' }),
			ripple.animate([{ opacity: 0 }, { opacity: 0.6 }], { duration: 90, easing: 'ease-out', fill: 'forwards' })
		];
	}

	function spring(i: number) {
		const el = buttons[i];
		letGo();
		if (reducedMotion() || typeof el.animate !== 'function') return;
		el.animate([{ scale: 0.93 }, { scale: 1.06, offset: 0.45 }, { scale: 1 }], { duration: 340, easing: 'ease-out' });
		el.querySelector<HTMLElement>('[data-ripple]')!.animate(
			[
				{ transform: 'scale(1)', opacity: 0.7 },
				{ transform: 'scale(1.6)', opacity: 0 }
			],
			{ duration: 460, easing: 'ease-out' }
		);
	}

	function press(i: number) {
		if (drag !== null || disabled?.(i)) return;
		spring(i);
		navigator.vibrate?.(10);
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
		if (e.button > 0) return;
		pressIn(i);
		if (!onswap) return;
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
		letGo();
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

{#snippet glyph(kind: 'axe' | 'hand' | 'check', struck = false)}
	<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
		{#if kind === 'axe'}
			<g transform="rotate(45 12 12)">
				<rect x="11" y="3" width="2.4" height="19" rx="1.2" />
				<path d="M13 3.5H9.5C6 3.5 3.5 5.5 3 8.2C3.5 11 6 13 9.5 13H13Z" />
			</g>
		{:else if kind === 'hand'}
			<path d="M8.5 12V6M11.5 11V4.5M14.5 11V5M17.5 12V7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" />
			<path d="M7.2 11h11.6v3.5c0 4-2.8 6.8-6.3 6.8-2.4 0-4-1-5.3-2.8L4.6 14.4a1.4 1.4 0 0 1 2.2-1.7z" />
			{#if struck}
				<path class="gap" d="M4 20L20 4" />
				<path data-strike d="M4 20L20 4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
			{/if}
		{:else}
			<path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
		{/if}
	</svg>
{/snippet}

<div class="circle" data-circle data-size={size} style:--box="{box}px" style:--seat="{d}px" style:--ribbon="{ribbon}px" style:--max="{MAX[size]}px" bind:clientWidth={width}>
	<div class="plane" style:width="{box}px" style:height="{box}px">
		{#if sector !== null}
			<svg class="sector" viewBox="0 0 {box} {box}" width={box} height={box} aria-hidden="true" focusable="false">
				<path data-sector={sector + 1} aria-hidden="true" d={wedge(sector, count, box)} />
			</svg>
		{/if}
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
			{@const avail = rings?.(i)}
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
				data-pointed={pointed.includes(i) ? '' : undefined}
				data-block={block === i ? '' : undefined}
				aria-label={spoken(i)}
				aria-disabled={why !== null}
				title={why ?? undefined}
				style:left="{at[i].x - d / 2}px"
				style:top="{at[i].y - d / 2}px"
				style:touch-action={onswap ? 'none' : undefined}
				bind:this={buttons[i]}
				onclick={() => press(i)}
				onkeydown={(e) => key(e, i)}
				onpointerdown={(e) => down(e, i)}
				onpointermove={moving}
				onpointerup={up}
				onpointerleave={letGo}
				onpointercancel={() => {
					letGo();
					drag = null;
				}}
			>
				{#if avail?.nominee}<span class="avail nominee" data-avail="nominee" aria-hidden="true"></span>{/if}
				{#if avail?.nominator}<span class="avail nominator" data-avail="nominator" aria-hidden="true"></span>{/if}
				<span class="ripple" data-ripple aria-hidden="true"></span>
				{#if dying.includes(i)}<span class="pulse" data-pulse aria-hidden="true"></span>{/if}
				<span class="no">{i + 1}</span>
				{#if icon}<CharacterIcon id={icon} size={Math.round(d * 0.47)} />{/if}
				<span class="name" title={seat.player.name}>{seat.player.name}</span>
				{#if text}<span class="tag">{text}</span>{/if}
				{#if block === i}<span class="badge block" data-badge="block" aria-hidden="true">{@render glyph('axe')}</span>{/if}
				{#if !seat.alive}
					<span class="badge ghost" data-badge="ghost" data-spent={seat.ghostVote ? undefined : ''} aria-hidden="true">
						{@render glyph('hand', !seat.ghostVote)}
					</span>
				{/if}
				{#if pointed.includes(i)}<span class="badge check" data-badge="check" aria-hidden="true">{@render glyph('check')}</span>{/if}
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
			<div class="centre" data-centre style:--centre="{centre}px">{@render center()}</div>
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

	.sector {
		position: absolute;
		inset: 0;
		pointer-events: none;
		fill: var(--clocktower);
		fill-opacity: 0.15;
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
		--cut: var(--raised);
		cursor: pointer;
		touch-action: manipulation;
		user-select: none;
	}

	.ripple {
		position: absolute;
		inset: -4px;
		border: 2px solid var(--gold);
		border-radius: 50%;
		box-shadow: 0 0 8px var(--gold);
		opacity: 0;
		pointer-events: none;
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
		--cut: var(--surface);
	}

	.seat[data-dead] .name {
		text-decoration: line-through;
	}

	.seat[data-ghost] {
		border-color: var(--gold);
	}

	.seat[data-marked] {
		border-color: var(--clocktower);
		background: var(--clocktower-tint);
		color: var(--text);
		--cut: var(--clocktower-tint);
	}

	.seat[data-pointed] {
		box-shadow: 0 0 0 3px var(--gold);
	}

	/* nomination rings just outside the node: solid turquoise at d/2 + 3px, dashed orange at d/2 + 7px */
	.avail {
		position: absolute;
		inset: -6px;
		border: 2px solid var(--nominee);
		border-radius: 50%;
		pointer-events: none;
	}

	.nominator {
		inset: -10px;
		border: 2px dashed var(--nominator);
	}

	/* round badges docked just outside the rim, cut off the node by a ring in its face colour: the block at 45°, the
	   ghost vote at 135° and the check at 225°; under an icon the ribbon takes the lower rim, so they move to 45° */
	.badge {
		--b: calc(var(--seat) * 0.4);
		--diag: calc((var(--seat) / 2 + 2px) * 0.7071);
		--dx: var(--diag);
		--dy: calc(var(--diag) * -1);
		position: absolute;
		z-index: 2;
		left: calc(50% + var(--dx) - var(--b) / 2);
		top: calc(50% + var(--dy) - var(--b) / 2);
		display: grid;
		place-items: center;
		width: var(--b);
		height: var(--b);
		border-radius: 50%;
		box-shadow: 0 0 0 2px var(--cut);
		pointer-events: none;
	}

	.badge svg {
		width: 72%;
		height: 72%;
	}

	.block {
		background: var(--clocktower);
		color: var(--ink);
	}

	.ghost {
		--dy: var(--diag);
		background: var(--ghost);
		color: var(--ghost-ink);
	}

	.ghost[data-spent] {
		border: 2px solid var(--spent);
		background: var(--cut);
		color: var(--spent);
	}

	.gap {
		fill: none;
		stroke: var(--cut);
		stroke-width: 5.5;
		stroke-linecap: round;
	}

	.check {
		--dx: calc(var(--diag) * -1);
		--dy: var(--diag);
		background: var(--gold);
		color: var(--ink);
	}

	.holds .badge {
		--dx: var(--diag);
		--dy: calc(var(--diag) * -1);
	}

	.grab {
		opacity: 0.7;
	}

	.drop {
		outline: 3px dashed var(--gold);
		outline-offset: 3px;
	}

	/* a death, at dawn and on the execution alike: a red ring pulses out while the node sinks 4px and fades, then it
	   rises back in the dead style */
	.dying {
		animation: death 1000ms var(--ease-out) 1;
	}

	.pulse {
		position: absolute;
		inset: -4px;
		border: 3px solid var(--clocktower);
		border-radius: 50%;
		opacity: 0;
		pointer-events: none;
		animation: death-ring 1000ms ease-out 1;
	}

	@keyframes death {
		0% {
			transform: none;
			opacity: 1;
		}
		25% {
			transform: translateY(4px);
			opacity: 1;
		}
		65% {
			transform: translateY(4px);
			opacity: 0.35;
		}
		100% {
			transform: none;
			opacity: 1;
		}
	}

	@keyframes death-ring {
		0% {
			transform: scale(1);
			opacity: 0.9;
		}
		100% {
			transform: scale(1.7);
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.dying,
		.pulse {
			animation: none;
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

	/* a disc just inside the inner hairline ring */
	.centre {
		position: absolute;
		left: 50%;
		top: 50%;
		width: var(--centre);
		height: var(--centre);
		transform: translate(-50%, -50%);
		border-radius: 50%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		pointer-events: none;
	}

	.centre > :global(*),
	.centre :global(button),
	.centre :global(a) {
		pointer-events: auto;
	}
</style>
