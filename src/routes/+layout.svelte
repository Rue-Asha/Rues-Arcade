<script lang="ts">
	import type { Snippet } from 'svelte';
	import '../app.css';

	let { children }: { children: Snippet } = $props();
</script>

<header class="top shell">
	<a class="brand" href="/">
		<span class="letter" aria-hidden="true">RA</span>
		<span class="name">Rue's Arcade</span>
	</a>
</header>

<main class="shell page">
	{@render children()}
</main>

<style>
	.top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding-block: 16px;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 14px;
		min-height: 48px;
		text-decoration: none;
	}

	.letter {
		display: grid;
		place-items: center;
		min-width: 48px;
		height: 48px;
		padding: 0 8px;
		border-radius: var(--radius);
		background: var(--gold);
		color: var(--ink);
		font: 12px var(--font-data);
		box-shadow: 0 4px 0 var(--gold-ledge);
	}

	.name {
		font-weight: 800;
		font-size: 22px;
		letter-spacing: -0.025em;
	}

	.page {
		padding-block: 8px 48px;
	}

	@media (min-width: 768px) {
		.top {
			padding-block: 24px;
		}
	}
</style>
