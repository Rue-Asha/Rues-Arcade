<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Art from '#lib/deco/Art.svelte';
	import { games, loadGameSession } from '#lib/games/registry.ts';
	import { clearSession, saveSession } from '#lib/session.ts';
	import Button from '#lib/ui/Button.svelte';
	import Modal from '#lib/ui/Modal.svelte';
	import PlayHeader from '#lib/ui/PlayHeader.svelte';
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
		const session = loadGameSession(entry);
		if (session === null) goto(base, { replace: true });
		else if ('discarded' in session) discarded = true;
		else game = session.state;
	});

	function dispatch(action: { type: string }) {
		const prev = game;
		game = def.reduce(game, action);
		saveSession(def.slug, def.stateVersion, game);
		entry.onchange?.(prev, game);
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

<div class="stack scene" style="--c: var(--{def.colour})">
	<Art slug={def.slug} place="play" />
	<PlayHeader
		name={def.name}
		label="Läuft"
		status={game === null ? null : entry.status(game)}
		onend={game === null ? undefined : () => (ending = true)}
	/>

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
		<Button variant="danger" onclick={end}>Beenden</Button>
		<Button variant="ghost" onclick={() => (ending = false)}>Weiterspielen</Button>
	</div>
</Modal>

<style>
	/* fills the viewport below the app header (80–96px + page padding), so the backdrop isn't cut at the content's end */
	.scene {
		position: relative;
		isolation: isolate;
		min-height: calc(100svh - 152px);
	}

	/* the backdrop is absolutely positioned and would paint over in-flow content */
	.scene > :global(:not([data-deco])) {
		position: relative;
		z-index: 1;
	}

	.notice {
		padding: 20px;
	}
</style>
