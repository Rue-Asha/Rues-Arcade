<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getDemo } from '#lib/demo/context.ts';
	import { pulse } from '#lib/motion.ts';
	import { play } from '#lib/sound.ts';

	interface Props {
		action?: string;
		onrelease: () => void;
		label: string;
		// a small button in a corner; what it shows floats over the page while held
		corner?: boolean;
		children: Snippet;
	}

	let { action, onrelease, label, corner = false, children }: Props = $props();

	let held = $state(false);

	const demo = $derived(getDemo());
	const expected = $derived(demo !== null && action !== undefined && demo.expected === action);
	const shown = $derived(held || demo !== null);

	function hold(e: PointerEvent) {
		if (held || demo) return;
		held = true;
		play('reveal');
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function release() {
		if (!held) return;
		held = false;
		onrelease();
	}

	function tap() {
		if (demo) onrelease();
	}

	function keydown(e: KeyboardEvent) {
		if (demo) return;
		if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
			e.preventDefault();
			if (!held) {
				held = true;
				play('reveal');
			}
		}
	}

	function keyup(e: KeyboardEvent) {
		if (e.key === ' ' || e.key === 'Enter') release();
	}
</script>

<div class="htv" class:held class:corner class:demo={demo !== null} data-action={action}>
	<div class="window" aria-live="polite">
		{#if shown}
			<div class="content" use:pulse>
				{#if demo}<span class="tag">[Demo]</span>{/if}
				{@render children()}
			</div>
		{:else if !corner}
			<div class="cover">
				<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="M3 3l18 18"></path>
					<path d="M10.6 5.1A10 10 0 0 1 12 5c5 0 9 4.5 10 7a13 13 0 0 1-3 4.2"></path>
					<path d="M6.6 6.6A13 13 0 0 0 2 12c1 2.5 5 7 10 7a9.7 9.7 0 0 0 4.4-1"></path>
					<path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"></path>
				</svg>
				<span class="label">Verdeckt</span>
				<span class="muted">Gedrückt halten, nur du schaust hin.</span>
			</div>
		{/if}
	</div>
	<button
		type="button"
		class="hold"
		class:expected
		disabled={demo !== null && !expected}
		data-demo={expected ? 'expected' : undefined}
		onclick={tap}
		onpointerdown={hold}
		onpointerup={release}
		onpointercancel={release}
		onkeydown={keydown}
		onkeyup={keyup}
		onblur={release}
		oncontextmenu={(e) => e.preventDefault()}
	>
		{label}
	</button>
</div>

<style>
	.htv {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.window {
		display: grid;
		min-height: 220px;
		border-radius: 20px;
		background: var(--surface);
		box-shadow: 0 var(--ledge) 0 var(--shadow);
		overflow: hidden;
	}

	.cover,
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 24px;
		text-align: center;
	}

	.cover {
		color: var(--muted);
		background: repeating-linear-gradient(-45deg, transparent 0 12px, rgb(255 255 255 / 0.025) 12px 24px);
	}

	.hold {
		min-height: 64px;
		padding: 0 24px;
		border: 0;
		border-radius: var(--radius);
		background: var(--primary);
		color: var(--on-primary);
		font: 700 18px/1.1 var(--font-ui);
		box-shadow: 0 var(--ledge) 0 var(--primary-ledge);
		cursor: pointer;
		user-select: none;
		-webkit-user-select: none;
		-webkit-touch-callout: none;
		touch-action: none;
		transition:
			transform 0.07s ease-out,
			box-shadow 0.07s ease-out;
	}

	.tag {
		align-self: center;
		padding: 4px 10px;
		border-radius: 6px;
		background: var(--gold);
		color: var(--ink);
		font: 600 12px/1.4 var(--font-ui);
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.hold:disabled {
		cursor: not-allowed;
		opacity: 0.45;
	}

	.expected {
		outline: 3px solid var(--gold);
		outline-offset: 4px;
		animation: beckon 1.2s var(--ease-out) infinite;
	}

	@keyframes beckon {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.8;
		}
	}

	.held .hold {
		transform: translateY(var(--ledge));
		box-shadow: 0 0 0 transparent;
		background: var(--primary-press);
	}

	.corner .window {
		display: contents;
	}

	.corner .content {
		position: fixed;
		inset: auto 0 76px;
		z-index: 30;
		width: min(560px, 100% - 32px);
		max-height: 70svh;
		margin-inline: auto;
		border-radius: 20px;
		background: var(--surface);
		box-shadow:
			0 0 0 2px var(--line),
			0 var(--ledge) 0 var(--shadow);
		overflow-y: auto;
		pointer-events: none;
	}

	.corner.demo .content {
		position: static;
		inset: auto;
		width: auto;
		max-height: none;
		margin: 0;
	}

	.corner .hold {
		min-width: 44px;
		min-height: 44px;
		padding: 0 14px;
		border: 1px solid var(--line);
		background: var(--raised);
		color: var(--text);
		font-size: 14px;
		box-shadow: 0 4px 0 var(--shadow);
	}

	.corner.held .hold {
		background: var(--line);
		color: var(--text);
	}
</style>
