<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { games } from '#lib/games/registry.ts';
	import { clearSession, loadSession, saveSession } from '#lib/session.ts';
	import Button from '#lib/ui/Button.svelte';
	import Modal from '#lib/ui/Modal.svelte';
	import Stage from '#lib/ui/Stage.svelte';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();

	const entry = $derived(games.find((g) => g.def.slug === params.slug)!);
	const def = $derived(entry.def);
	const base = $derived(`/spiele/${def.slug}`);

	// raw: the reducer returns a fresh object per action, a deep proxy would only wrap it
	let game = $state.raw<unknown>(null);
	let discarded = $state(false);
	let ending = $state(false);

	onMount(() => {
		const session = loadSession(def.slug, def.stateVersion);
		if (session === null) goto(base, { replace: true });
		else if ('discarded' in session) discarded = true;
		else game = session.state;
	});

	function dispatch(action: { type: string }) {
		game = def.reduce(game, action);
		saveSession(def.slug, def.stateVersion, game);
	}

	function end() {
		clearSession(def.slug);
		ending = false;
		goto(base);
	}
</script>

<svelte:head>
	<title>{def.name} · Rue's Arcade</title>
</svelte:head>

<div class="stack" style="--c: var(--{def.colour})">
	<header class="bar">
		<div class="who">
			<span class="label">Läuft</span>
			<h1>{def.name}</h1>
		</div>
		<div class="row">
			<Button variant="secondary" size="sm" onclick={() => goto(`${base}/demo?from=${base}/spielen`)}>Demo</Button>
			{#if game !== null}
				<Button variant="secondary" size="sm" onclick={() => (ending = true)}>Spiel beenden</Button>
			{/if}
		</div>
	</header>

	{#if discarded}
		<div class="panel stack notice">
			<p role="alert">
				Der gespeicherte Spielstand passte nicht mehr zu dieser Version und wurde verworfen.
			</p>
			<div class="row">
				<Button variant="primary" onclick={() => goto(base)}>Zum Spiel</Button>
			</div>
		</div>
	{:else if game !== null}
		<Stage key={def.phase(game)}>
			<entry.Screen state={game} {dispatch} />
		</Stage>
	{/if}
</div>

<Modal open={ending} title="Spiel beenden?" onclose={() => (ending = false)}>
	<p class="muted">Der Spielstand wird gelöscht. Ihr startet danach eine neue Runde.</p>
	<div class="row">
		<Button variant="primary" onclick={end}>Beenden</Button>
		<Button variant="ghost" onclick={() => (ending = false)}>Weiterspielen</Button>
	</div>
</Modal>

<style>
	.bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 12px 16px;
		padding: 12px 16px;
		border-radius: var(--radius-xl);
		background: var(--surface);
		box-shadow:
			inset 0 3px 0 var(--c),
			0 var(--ledge) 0 var(--shadow);
	}

	.who {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.who .label {
		color: var(--c);
	}

	.who h1 {
		font-size: 22px;
		letter-spacing: -0.02em;
	}

	.notice {
		padding: 20px;
	}
</style>
