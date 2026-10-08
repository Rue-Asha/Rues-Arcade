<script lang="ts">
	import type { Snippet } from 'svelte';
	import { burst, turn } from '#lib/motion.ts';

	interface Props {
		shown: boolean;
		covered: Snippet;
		children: Snippet;
	}

	let { shown, covered, children }: Props = $props();

	const play = (node: HTMLElement) => burst(node);
	const spin = (node: HTMLElement) => turn(node);
</script>

{#if shown}
	<div class="card" data-testid="reveal" use:play>
		<span class="sun" aria-hidden="true" use:spin></span>
		<div class="inner">
			{@render children()}
		</div>
	</div>
{:else}
	<div class="covered" data-testid="covered">
		{@render covered()}
	</div>
{/if}

<style>
	.card,
	.covered {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 240px;
		padding: 24px;
		border-radius: 20px;
		text-align: center;
	}

	.card {
		position: relative;
		overflow: hidden;
		isolation: isolate;
		background: var(--reveal);
		color: var(--on-reveal);
		box-shadow: 0 6px 0 var(--gold-ledge);
	}

	.sun {
		position: absolute;
		inset: -40%;
		z-index: -1;
		background: repeating-conic-gradient(rgb(255 255 255 / 0.08) 0 10deg, transparent 10deg 20deg);
		pointer-events: none;
	}

	.inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		max-width: 100%;
	}

	.covered {
		gap: 10px;
		background: var(--raised);
		box-shadow: 0 var(--ledge) 0 var(--shadow);
	}
</style>
