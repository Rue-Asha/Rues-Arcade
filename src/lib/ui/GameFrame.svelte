<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		hero: Snippet;
		children?: Snippet;
		actions?: Snippet;
		rail?: Snippet;
	}

	let { hero, children, actions, rail }: Props = $props();
</script>

<div class="frame" class:railed={rail} data-frame>
	<section class="stage" data-frame="stage">
		<div class="hero" data-hero>
			{@render hero()}
		</div>
		{#if children}
			<div class="body">
				{@render children()}
			</div>
		{/if}
		{#if actions}
			<div class="actions" data-frame="actions">
				{@render actions()}
			</div>
		{/if}
	</section>
	{#if rail}
		<aside class="rail" data-frame="rail">
			{@render rail()}
		</aside>
	{/if}
</div>

<style>
	.frame {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--gap);
		align-items: start;
	}

	@media (min-width: 1024px) {
		.railed {
			grid-template-columns: minmax(0, 1fr) 380px;
		}
	}

	.stage {
		display: flex;
		flex-direction: column;
		gap: 16px;
		min-width: 0;
		padding: 20px;
		border-radius: var(--radius-xl);
		background: var(--surface);
		box-shadow: 0 var(--ledge) 0 var(--shadow);
		text-align: left;
	}

	.hero {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		text-align: center;
	}

	.body {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px;
	}

	.rail {
		min-width: 0;
	}
</style>
