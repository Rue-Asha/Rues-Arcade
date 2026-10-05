<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { muted, setMuted } from '#lib/sound.ts';
	import '../app.css';

	let { children }: { children: Snippet } = $props();

	let silent = $state(false);
	onMount(() => (silent = muted.value));

	function toggle() {
		silent = !silent;
		setMuted(silent);
	}
</script>

<header class="top shell">
	<a class="brand" href="/">
		<span class="letter" aria-hidden="true">RA</span>
		<span class="name">Rue's Arcade</span>
	</a>
	<button class="mute" type="button" onclick={toggle} aria-label={silent ? 'Ton einschalten' : 'Ton ausschalten'}>
		<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<path d="M4 9.5h3.5L12 5v14l-4.5-4.5H4z"></path>
			{#if silent}
				<path d="M16 9.5l5 5M21 9.5l-5 5"></path>
			{:else}
				<path d="M15.5 9a4 4 0 0 1 0 6"></path>
				<path d="M18 6.5a7.5 7.5 0 0 1 0 11"></path>
			{/if}
		</svg>
	</button>
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

	.mute {
		display: grid;
		place-items: center;
		width: 48px;
		height: 48px;
		padding: 0;
		border: 0;
		border-radius: var(--radius-sm);
		background: var(--raised);
		color: var(--text);
		box-shadow: 0 4px 0 var(--shadow);
		cursor: pointer;
		transition: transform 0.06s, box-shadow 0.06s;
	}

	.mute:active {
		transform: translateY(4px);
		box-shadow: 0 0 0 var(--shadow);
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
