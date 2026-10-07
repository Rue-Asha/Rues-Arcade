<script lang="ts">
	import type { Snippet } from 'svelte';
	import { phaseOut, rise } from '#lib/motion.ts';

	interface Props {
		key: unknown;
		children: Snippet;
	}

	let { key, children }: Props = $props();

	// A phase that comes back while its screen is still leaving would resume that screen, marks and all, so every
	// change gets a screen of its own.
	let changes = 0;
	const turn = $derived.by(() => {
		void key;
		return ++changes;
	});

	// Svelte calls this as the outro begins: from then on taps, screen readers and the demo see only the incoming
	// screen. An earlier outgoing one still fading is finished, not detached: Svelte places new screens next to the
	// nodes it owns, and removes that one itself once its outro ends.
	function leave(node: HTMLElement) {
		for (const old of node.parentElement?.querySelectorAll(':scope > [data-leaving]') ?? [])
			for (const a of old.getAnimations()) a.finish();
		node.setAttribute('data-leaving', '');
		node.setAttribute('aria-hidden', 'true');
		node.inert = true;
		for (const el of node.querySelectorAll('[data-demo]')) el.removeAttribute('data-demo');
		return phaseOut(node);
	}
</script>

<div class="host" data-stage-host>
	{#key turn}
		<div class="stage" data-stage in:rise={{ delay: 60 }} out:leave>
			{@render children()}
		</div>
	{/key}
</div>

<style>
	/* outgoing and incoming share the one cell, so the page doesn't jump while both are there */
	.host {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
	}

	.stage {
		grid-area: 1 / 1;
	}
</style>
