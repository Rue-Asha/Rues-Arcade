<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { ContentItem } from '#lib/content/types.ts';
	import { loadCount } from '#lib/count.ts';
	import Banner from '#lib/deco/Banner.svelte';
	import { games } from '#lib/games/registry.ts';
	import { roster } from '#lib/roster.svelte.ts';
	import { saveSession } from '#lib/session.ts';
	import Button from '#lib/ui/Button.svelte';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();

	const entry = $derived(games.find((g) => g.def.slug === params.slug));

	let ready = $state(false);
	let picking = $state(false);
	let picked = $state<string[]>([]);
	let failure = $state('');
	// count-first games: exactly this many play, read on every visit so a count changed on the start screen applies
	let n = $state(0);

	onMount(async () => {
		await roster.ready();
		if (entry?.countFirst) {
			const { def } = entry;
			n = loadCount(def.slug, { min: def.minPlayers, max: def.maxPlayers }, roster.players.length);
			picked = roster.players.slice(0, n).map((p) => p.id);
			picking = roster.players.length > n;
		} else {
			picked = roster.players.map((p) => p.id);
			picking = entry !== undefined && picked.length > entry.def.maxPlayers;
		}
		ready = true;
	});

	const players = $derived(ready ? roster.players : []);
	const chosen = $derived(players.filter((p) => picked.includes(p.id)));
	const guests = $derived(entry?.savedOnly ? chosen.filter((p) => roster.isGuest(p)) : []);
	const most = $derived(entry?.countFirst ? n : (entry?.def.maxPlayers ?? 0));
	const full = $derived(entry?.countFirst === true && chosen.length >= n);

	function toggle(id: string) {
		picked = picked.includes(id) ? picked.filter((p) => p !== id) : [...picked, id];
	}

	async function start(config: unknown) {
		if (!entry) return;
		const { def } = entry;
		failure = '';
		let content: ContentItem[] = [];
		if (def.contentType !== 'none') {
			const res = await fetch(`/api/content/${def.contentType}`);
			content = res.ok ? await res.json() : [];
		}
		if (content.length < def.minContent) {
			failure = `Für ${def.name} gibt es noch keine Inhalte.`;
			return;
		}
		const state = def.init({
			players: chosen,
			config,
			content,
			seed: Math.floor(Math.random() * 2 ** 32)
		});
		saveSession(def.slug, def.stateVersion, state);
		await goto(`/spiele/${def.slug}/spielen`);
	}
</script>

<svelte:head>
	<title>Lobby · {entry?.def.name ?? 'Spiel'} · Rue's Arcade</title>
</svelte:head>

{#if !entry}
	<div class="stack">
		<h1>Spiel nicht gefunden</h1>
		<a href="/">Zur Startseite</a>
	</div>
{:else if ready}
	{@const def = entry.def}
	<div class="stack rise" style="--c: var(--{def.colour})">
		<header>
			<Banner slug={def.slug} place="lobby" colour={def.colour}>
				<p class="label">Lobby</p>
				<h1>{def.name}</h1>
				<p class="muted">{chosen.length} Spieler</p>
			</Banner>
		</header>

		{#if entry.countFirst && players.length < n}
			<div class="panel stack gap">
				<p>Für {n} Spieler fehlen noch {n - players.length} im Kader.</p>
				<a class="more" href="/spieler?from=/spiele/{def.slug}/lobby">Spieler hinzufügen</a>
			</div>
		{:else if players.length < def.minPlayers}
			<div class="panel stack gap">
				<p>
					Für {def.name} braucht ihr mind. {def.minPlayers} Spieler, im Kader
					{players.length === 1 ? 'ist' : 'sind'} {players.length}.
				</p>
				<a class="more" href="/spieler?from=/spiele/{def.slug}/lobby">Spieler hinzufügen</a>
			</div>
		{:else if picking}
			{@const within = entry.countFirst ? chosen.length === n : chosen.length >= def.minPlayers && chosen.length <= def.maxPlayers}
			<section class="stack" aria-labelledby="who">
				<div class="pick-head">
					<h2 id="who">Wer spielt mit?</h2>
					<p class="muted" class:over={!within}>
						{#if entry.countFirst}
							{chosen.length} von {n} gewählt
						{:else}
							{chosen.length} gewählt · mind. {def.minPlayers}, höchstens {def.maxPlayers}
						{/if}
					</p>
				</div>
				<ul class="slots">
					{#each players as p (p.id)}
						<li>
							<label class="slot" class:on={picked.includes(p.id)}>
								<input
									type="checkbox"
									checked={picked.includes(p.id)}
									disabled={full && !picked.includes(p.id)}
									onchange={() => toggle(p.id)}
								/>
								<span class="box" aria-hidden="true">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
								</span>
								<span>{p.name}</span>
							</label>
						</li>
					{/each}
				</ul>
				<div class="row">
					<Button variant="primary" disabled={!within} onclick={() => (picking = false)}>Weiter</Button>
				</div>
			</section>
		{:else if guests.length}
			<div class="panel stack gap">
				<p>{def.name} braucht gespeicherte Spieler.</p>
				<p class="muted">Nicht gespeichert: {guests.map((p) => p.name).join(', ')}.</p>
				<a class="more" href="/spieler?from=/spiele/{def.slug}/lobby">Spieler speichern</a>
				{#if players.length > most}
					<div class="row">
						<Button variant="ghost" size="sm" onclick={() => (picking = true)}>Andere Spieler wählen</Button>
					</div>
				{/if}
			</div>
		{:else}
			<section class="stack" aria-label="Einstellungen">
				{#if failure}
					<p class="failure" role="alert">
						{failure} <a href="/spiele/{def.slug}/inhalte">Inhalte hinzufügen</a>
					</p>
				{/if}
				<entry.Setup players={chosen} onstart={start} />
				{#if players.length > most}
					<div class="row">
						<Button variant="ghost" size="sm" onclick={() => (picking = true)}>Andere Spieler wählen</Button>
					</div>
				{/if}
			</section>
		{/if}
	</div>
{/if}

<style>
	header .label {
		color: var(--c);
	}

	header .muted {
		font-weight: 500;
	}

	.gap {
		padding: 20px;
	}

	.more,
	.failure a {
		display: inline-block;
		min-height: 44px;
		padding-block: 10px;
		color: var(--gold);
		font-weight: 600;
	}

	.pick-head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 8px 16px;
	}

	.over {
		color: var(--imposter);
		font-weight: 600;
	}

	.slots {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 160px), 1fr));
		gap: 10px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.slot {
		position: relative;
		display: flex;
		align-items: center;
		gap: 12px;
		min-height: 56px;
		padding: 0 14px;
		border-radius: var(--radius);
		background: var(--surface);
		border: 2px solid transparent;
		box-shadow: 0 4px 0 var(--shadow);
		font-weight: 700;
		cursor: pointer;
		overflow-wrap: anywhere;
		transition:
			border-color 0.1s,
			background-color 0.1s;
	}

	.slot:has(input:disabled),
	.slot:has(input:disabled) input {
		cursor: not-allowed;
	}

	.slot:has(input:disabled) {
		color: var(--muted);
	}

	.slot.on {
		border-color: var(--primary);
		background: var(--raised);
	}

	/* the native box stretches over the whole slot so the touch target is the slot */
	.slot input {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		margin: 0;
		opacity: 0;
		cursor: pointer;
	}

	.box {
		display: grid;
		place-items: center;
		flex: none;
		width: 26px;
		height: 26px;
		border-radius: 8px;
		border: 2px solid var(--line);
		color: transparent;
	}

	.on .box {
		border-color: var(--primary);
		background: var(--primary);
		color: var(--on-primary);
	}

	.slot:has(:focus-visible) {
		outline: 3px solid var(--gold);
		outline-offset: 3px;
	}

	.failure {
		padding: 12px 14px;
		border-radius: var(--radius-sm);
		background: var(--surface);
		color: var(--text);
		font-weight: 600;
	}
</style>
