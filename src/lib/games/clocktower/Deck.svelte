<script lang="ts">
	import type { ExplanationProps } from '#lib/games/registry.ts';
	import { reducedMotion } from '#lib/theme.ts';
	import Button from '#lib/ui/Button.svelte';
	import { slides } from './deck.ts';
	import Slide from './Slide.svelte';

	let { count, onclose }: ExplanationProps = $props();

	const list = $derived(slides(count));

	// a fresh token per change keeps a slide that is still leaving apart from the one that comes back
	let frame = $state.raw({ token: 0, at: 0 });
	let dir = 1;

	function go(delta: number) {
		const at = Math.min(Math.max(frame.at + delta, 0), list.length - 1);
		if (at === frame.at) return;
		dir = delta;
		frame = { token: frame.token + 1, at };
	}

	// the incoming slide enters from the side it is next to, the outgoing one leaves the other way; reduced motion fades only
	function change(node: Element, { leaving = false }: { leaving?: boolean } = {}) {
		const fade = reducedMotion();
		const sign = leaving ? -dir : dir;
		return {
			duration: 320,
			css: (t: number, u: number) => (fade ? `opacity: ${t}` : `opacity: ${t}; transform: translateX(${sign * u * 48}px)`)
		};
	}

	let down: { x: number; y: number } | null = null;

	const guarded = (e: Event) => e.target instanceof Element && e.target.closest('button, a, [data-no-nav]') !== null;

	function press(e: PointerEvent) {
		down = e.button === 0 && !guarded(e) ? { x: e.clientX, y: e.clientY } : null;
	}

	function release(e: PointerEvent) {
		if (down === null) return;
		const dx = e.clientX - down.x;
		const dy = e.clientY - down.y;
		down = null;
		if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy)) return go(dx < 0 ? 1 : -1);
		if (Math.abs(dx) > 10 || Math.abs(dy) > 10) return;
		const box = (e.currentTarget as Element).getBoundingClientRect();
		go(e.clientX < box.left + box.width / 2 ? -1 : 1);
	}

	function key(e: KeyboardEvent) {
		if (e.altKey || e.ctrlKey || e.metaKey) return;
		if (e.key === 'ArrowRight') go(1);
		else if (e.key === 'ArrowLeft') go(-1);
	}
</script>

<svelte:window onkeydown={key} />

<section class="deck" aria-label="Erklärung">
	<h1 class="sr-only">Erklärung</h1>
	<div class="bar">
		<Button variant="ghost" size="sm" square label="Zurück" onclick={() => go(-1)} disabled={frame.at === 0}>
			<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg>
		</Button>
		<p class="progress" data-testid="deck-progress" aria-live="polite">{frame.at + 1} / {list.length}</p>
		<Button variant="ghost" size="sm" square label="Weiter" onclick={() => go(1)} disabled={frame.at === list.length - 1}>
			<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"></path></svg>
		</Button>
		<span class="gap"></span>
		<Button variant="secondary" size="sm" onclick={onclose}>Schließen</Button>
	</div>
	<div class="stage" role="group" aria-label="Folien" data-testid="deck-stage" onpointerdown={press} onpointerup={release} onpointercancel={() => (down = null)}>
		{#each [frame] as f (f.token)}
			<div class="frame" in:change out:change={{ leaving: true }}>
				<Slide slide={list[f.at]} />
			</div>
		{/each}
	</div>
</section>

<style>
	/* a presentation: it covers the arcade header so the sheet slide gets the whole screen */
	.deck {
		position: fixed;
		inset: 0;
		z-index: 10;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		padding: 8px;
		background: var(--ground);
	}

	.bar,
	.stage {
		width: 100%;
		max-width: 1400px;
	}

	.bar {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.progress {
		min-width: 6ch;
		margin: 0;
		font-family: var(--font-data);
		font-size: 18px;
		text-align: center;
	}

	.gap {
		flex: 1;
	}

	.stage {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: minmax(0, 1fr);
		flex: 1;
		min-height: 0;
		overflow: hidden;
		border: 2px solid var(--line);
		border-radius: var(--radius-lg);
		background: var(--ground);
		touch-action: pan-y;
		-webkit-user-select: none;
		user-select: none;
	}

	.frame {
		display: grid;
		grid-area: 1 / 1;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: minmax(0, 1fr);
		min-height: 0;
		min-width: 0;
	}

	@media (min-width: 768px) {
		.deck {
			padding: 10px 16px 14px;
		}
	}
</style>
