<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="facts" data-testid="day-facts">{@render children()}</div>

<style>
	.facts {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		align-self: center;
		box-sizing: border-box;
		width: min(100%, 36ch);
		padding: 10px 16px;
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
		background: var(--surface);
		color: var(--text);
		font-size: 16px;
		font-weight: 700;
		line-height: 1.4;
		text-align: center;
		text-wrap: balance;
	}

	.facts :global(p),
	.facts :global(ul) {
		margin: 0;
		padding: 0;
		list-style: none;
		color: inherit;
	}

	.facts :global(.hint) {
		font-weight: 400;
	}

	.facts :global(.pair) {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0 20px;
	}
</style>
