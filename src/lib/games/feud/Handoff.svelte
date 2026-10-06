<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ease, reducedMotion } from '#lib/motion.ts';

	interface Props {
		// token name of the team's colour
		colour: string;
		label: string;
		team: string;
		note: string;
		children: Snippet;
	}

	let { colour, label, team, note, children }: Props = $props();

	// Stage's rise transform would become the containing block of a fixed element, so it lives on <body>
	function lift(node: HTMLElement) {
		document.body.append(node);
		if (!reducedMotion())
			node.animate(
				[
					{ transform: 'translateY(24px)', opacity: 0 },
					{ transform: 'none', opacity: 1 }
				],
				{ duration: 380, easing: ease }
			);
		return { destroy: () => node.remove() };
	}
</script>

<section class="handoff" data-testid="handoff" aria-label="Übergabe" style="--team: var(--{colour})" use:lift>
	<div class="inner">
		<p class="label">{label}</p>
		<h2>{team}</h2>
		<p class="note">{note}</p>
		<div class="row">
			{@render children()}
		</div>
	</div>
</section>

<style>
	.handoff {
		position: fixed;
		inset: 0;
		z-index: 40;
		display: grid;
		place-items: center;
		padding: 24px var(--gutter);
		background: var(--team);
		color: var(--ink);
		overflow-y: auto;
	}

	.inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		max-width: 560px;
		text-align: center;
	}

	.label {
		color: inherit;
	}

	h2 {
		font-weight: 800;
		font-size: clamp(44px, 12vw, 96px);
		line-height: 0.95;
		letter-spacing: -0.03em;
		overflow-wrap: anywhere;
	}

	.note {
		font-weight: 600;
		font-size: 19px;
	}

	.row {
		justify-content: center;
		margin-top: 8px;
	}
</style>
