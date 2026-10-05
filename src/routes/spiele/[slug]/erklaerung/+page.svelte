<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { games } from '#lib/games/registry.ts';
	import Button from '#lib/ui/Button.svelte';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();

	const def = $derived(games.find((g) => g.def.slug === params.slug)?.def);
	const base = $derived(def ? `/spiele/${def.slug}` : '/');
	// Looked up at runtime so a committed file plus a rebuild is enough, no route or registry change.
	const src = $derived(`/explain/${params.slug}/index.html`);

	let found = $state<boolean | null>(null);

	onMount(async () => {
		if (!def) return void (found = false);
		const res = await fetch(src, { method: 'HEAD' }).catch(() => null);
		found = res?.ok ?? false;
	});

	function close() {
		goto(base);
	}

	function key(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}
</script>

<svelte:window onkeydown={key} />

<svelte:head>
	<title>Erklärung · {def?.name ?? 'Spiel'} · Rue's Arcade</title>
</svelte:head>

{#if found}
	<div class="viewer">
		<iframe {src} title="Erklärung zu {def?.name}" sandbox="allow-scripts"></iframe>
		<button class="close" type="button" aria-label="Erklärung schließen" onclick={close}>
			<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg>
		</button>
	</div>
{:else if found === false}
	<div class="stack rise" style="--c: var(--{def?.colour ?? 'gold'})">
		<header class="hero">
			<a class="back" href={base}>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"></path></svg>
				{def?.name ?? 'Start'}
			</a>
			<h1>Erklärung</h1>
		</header>
		<div class="empty panel">
			<span class="badge" aria-hidden="true">?</span>
			<p class="empty-title">Für dieses Spiel gibt es noch keine Erklärung.</p>
			{#if def}
				<p class="muted">Die Demo spielt eine Runde mit dir durch, Schritt für Schritt.</p>
			{/if}
			<div class="row">
				{#if def}
					<Button variant="primary" onclick={() => goto(`${base}/demo?from=${base}`)}>Demo starten</Button>
				{/if}
				<Button variant="secondary" onclick={close}>Zurück</Button>
			</div>
		</div>
	</div>
{/if}

<style>
	.viewer {
		position: fixed;
		inset: 0;
		z-index: 20;
		background: var(--ground);
		animation: rise 0.32s var(--ease-out) both;
	}

	iframe {
		display: block;
		width: 100%;
		height: 100%;
		border: 0;
	}

	.close {
		position: absolute;
		top: max(12px, env(safe-area-inset-top));
		right: max(12px, env(safe-area-inset-right));
		display: grid;
		place-items: center;
		width: 48px;
		height: 48px;
		padding: 0;
		border: 1px solid var(--line);
		border-radius: var(--radius-sm);
		background: var(--raised);
		color: var(--text);
		box-shadow: 0 4px 0 var(--shadow);
		cursor: pointer;
	}

	.close:active {
		transform: translateY(4px);
		box-shadow: none;
	}

	.hero {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 10px;
		padding-block: 8px 4px;
	}

	.back {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		min-height: 44px;
		color: var(--c);
		font-weight: 700;
		text-decoration: none;
	}

	.empty {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 10px;
		padding: 24px;
		border: 2px dashed var(--line);
		background: transparent;
		box-shadow: none;
	}

	.badge {
		display: grid;
		place-items: center;
		width: 48px;
		height: 48px;
		border-radius: var(--radius);
		background: var(--raised);
		color: var(--c);
		font-weight: 800;
		font-size: 22px;
	}

	.empty-title {
		font-weight: 700;
		font-size: 20px;
	}

	.empty .row {
		margin-top: 6px;
	}
</style>
