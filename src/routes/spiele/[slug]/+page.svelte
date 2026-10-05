<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { games, loadGameSession, playerRange } from '#lib/games/registry.ts';
	import { roster } from '#lib/roster.svelte.ts';
	import Button from '#lib/ui/Button.svelte';
	import type { PageProps } from './$types';

	let { data, params }: PageProps = $props();

	const rules: Record<string, string[]> = {
		imposter: [
			'Reihum hält jede Person das Handy gedrückt und liest heimlich ihre Frage.',
			'Alle bekommen dieselbe Frage, bis auf eine Person: Sie ist der Imposter und hat eine leicht andere.',
			'Danach sieht die Runde die Crew-Frage, vergleicht die Antworten und entlarvt den Imposter.'
		],
		wavelength: [
			'Teams aus 2–3 Personen spielen gegeneinander, ein Spektrum zwischen zwei Begriffen pro Zug.',
			'Die Hellseherin oder der Hellseher sieht verdeckt, wo das Ziel liegt, und gibt einen Hinweis.',
			'Das Team stellt die Scheibe ein: je näher am Ziel, desto mehr Punkte (4, 3 oder 2).'
		]
	};

	const entry = $derived(games.find((g) => g.def.slug === params.slug)!);
	const def = $derived(entry.def);
	const base = $derived(`/spiele/${def.slug}`);

	let ready = $state(false);
	let saved = $state(false);
	let discarded = $state(false);

	onMount(() => {
		const session = loadGameSession(entry);
		saved = session !== null && 'state' in session;
		discarded = session !== null && 'discarded' in session;
		ready = true;
	});

	const count = $derived(ready ? roster.players.length : 0);
	const fewPlayers = $derived(count < def.minPlayers);
	const noContent = $derived(data.count < def.minContent);
</script>

<svelte:head>
	<title>{def.name} · Rue's Arcade</title>
</svelte:head>

<div class="layout rise" style="--c: var(--{def.colour}); --tint: var(--{def.colour}-tint); --edge: var(--{def.colour}-ledge)">
	<section class="intro" aria-labelledby="game">
		<div class="title">
			<span class="badge" aria-hidden="true">{def.name.slice(0, 1)}</span>
			<div>
				<h1 id="game">{def.name}</h1>
				<p class="muted">{playerRange(def)}</p>
			</div>
		</div>
		<h2 class="label">So geht's</h2>
		<ol class="rules">
			{#each rules[def.slug] ?? [] as rule, i (i)}
				<li>{rule}</li>
			{/each}
		</ol>
		<div class="row">
			<Button variant="secondary" size="sm" onclick={() => goto(`${base}/demo?from=${base}`)}>Demo</Button>
			<Button variant="secondary" size="sm" onclick={() => goto(`${base}/erklaerung`)}>Erklärung</Button>
			<Button variant="secondary" size="sm" onclick={() => goto(`${base}/inhalte`)}>Inhalte</Button>
		</div>
	</section>

	<aside class="panel stack play">
		{#if discarded}
			<p class="notice" role="alert">
				Der gespeicherte Spielstand passte nicht mehr zu dieser Version und wurde verworfen.
			</p>
		{/if}
		{#if saved}
			<Button variant="primary" onclick={() => goto(`${base}/spielen`)}>Weiterspielen</Button>
		{/if}
		<Button
			variant={saved ? 'secondary' : 'primary'}
			disabled={fewPlayers || noContent}
			onclick={() => goto(`${base}/lobby`)}
		>
			Spiel starten
		</Button>

		<ul class="checks">
			<li class:bad={fewPlayers}>
				<span class="num">{count}</span>
				<span>
					{#if fewPlayers}
						Zu wenige Spieler: mind. {def.minPlayers} Spieler
					{:else}
						Spieler im Kader
					{/if}
					<a href="/spieler?from={base}">Spieler verwalten</a>
				</span>
			</li>
			<li class:bad={noContent}>
				<span class="num">{data.count}</span>
				<span>
					{#if noContent}
						Für {def.name} gibt es noch keine Inhalte.
						<a href="{base}/inhalte">Inhalte hinzufügen</a>
					{:else}
						Einträge im Inhaltspool
					{/if}
				</span>
			</li>
		</ul>
	</aside>
</div>

<style>
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--gap);
		padding-top: 8px;
	}

	.intro {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 20px;
		border-radius: var(--radius-xl);
		background: var(--tint);
		box-shadow:
			inset 0 3px 0 var(--c),
			0 var(--ledge) 0 var(--edge);
	}

	.title {
		display: flex;
		align-items: center;
		gap: 18px;
	}

	.title p {
		margin-top: 6px;
		font-weight: 500;
	}

	.badge {
		display: grid;
		place-items: center;
		flex: none;
		width: 64px;
		height: 64px;
		border-radius: var(--radius);
		background: var(--c);
		color: var(--ink);
		font-weight: 800;
		font-size: 30px;
	}

	.rules {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin: 0;
		padding: 0;
		list-style: none;
		counter-reset: rule;
	}

	.rules li {
		display: flex;
		gap: 14px;
		color: var(--text-soft);
		font-size: 17px;
		counter-increment: rule;
	}

	.rules li::before {
		content: counter(rule);
		display: grid;
		place-items: center;
		flex: none;
		width: 28px;
		height: 28px;
		border-radius: 8px;
		background: var(--raised);
		color: var(--c);
		font-weight: 800;
		font-size: 14px;
	}

	.play {
		padding: 20px;
	}

	.notice {
		padding: 12px 14px;
		border-radius: var(--radius-sm);
		background: var(--gold-tint);
		color: var(--gold);
		font-weight: 600;
	}

	.checks {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin: 4px 0 0;
		padding: 0;
		list-style: none;
	}

	.checks li {
		display: flex;
		align-items: baseline;
		gap: 14px;
		color: var(--muted);
	}

	.num {
		min-width: 32px;
		color: var(--primary);
		font-weight: 800;
		font-variant-numeric: tabular-nums;
	}

	.checks .bad {
		color: var(--text);
		font-weight: 600;
	}

	.checks .bad .num {
		color: var(--imposter);
	}

	.checks li > span:last-child {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.checks a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		color: var(--gold);
		font-weight: 600;
		white-space: nowrap;
	}

	@media (min-width: 1024px) {
		.layout {
			grid-template-columns: minmax(0, 1fr) 380px;
			align-items: start;
		}

		.intro {
			padding: 32px;
		}

		.play {
			position: sticky;
			top: 24px;
		}
	}
</style>
