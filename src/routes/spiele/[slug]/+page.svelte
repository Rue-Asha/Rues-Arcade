<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Banner from '#lib/deco/Banner.svelte';
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
			'Gemeinsam oder in Teams: pro Zug ein Spektrum zwischen zwei Begriffen.',
			'Die Hellseherin oder der Hellseher sieht verdeckt, wo das Ziel liegt, und gibt einen Hinweis.',
			'Das Team stellt die Scheibe ein: je näher am Ziel, desto mehr Punkte (4, 3 oder 2).'
		]
	};

	const nouns: Record<string, [string, string]> = {
		imposter: ['Fragenpaar', 'Fragenpaare'],
		wavelength: ['Spektrum', 'Spektren']
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
	const noun = $derived((nouns[def.slug] ?? ['Eintrag', 'Einträge'])[data.count === 1 ? 0 : 1]);

	const cards = $derived([
		{ id: 'erklaerung', title: 'Erklärung', line: 'Die Regeln Schritt für Schritt', href: `${base}/erklaerung` },
		{ id: 'demo', title: 'Demo', line: 'Eine Runde zum Mittippen', href: `${base}/demo?from=${base}` },
		{ id: 'inhalte', title: 'Inhalte', line: `${data.count} ${noun} ansehen und bearbeiten`, href: `${base}/inhalte` }
	]);
</script>

<svelte:head>
	<title>{def.name} · Rue's Arcade</title>
</svelte:head>

<div class="layout rise" style="--c: var(--{def.colour})">
	<header class="intro">
		<Banner slug={def.slug} place="start" colour={def.colour}>
			<div class="title">
				<span class="badge" aria-hidden="true">{def.name.slice(0, 1)}</span>
				<div>
					<h1>{def.name}</h1>
					<p class="range">{playerRange(def)}</p>
				</div>
			</div>
			<p class="pitch">{entry.pitch}</p>
		</Banner>
	</header>

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
			Los geht's
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

	<section class="panel stack how" aria-labelledby="how">
		<h2 id="how" class="label">So geht's</h2>
		<ol class="rules">
			{#each rules[def.slug] ?? [] as rule, i (i)}
				<li>{rule}</li>
			{/each}
		</ol>
	</section>

	<section class="panel stack more" aria-labelledby="more">
		<h2 id="more" class="label">Mehr zu {def.name}</h2>
		<div class="cards">
			{#each cards as card (card.id)}
				<a class="card" href={card.href} aria-labelledby="{card.id}-title" aria-describedby="{card.id}-line">
					<span class="icon" aria-hidden="true">
						<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
							{#if card.id === 'erklaerung'}
								<path d="M12 6.5C10.5 5 8 4.5 4 4.5v13c4 0 6.5.5 8 2 1.5-1.5 4-2 8-2v-13c-4 0-6.5.5-8 2z"></path>
								<path d="M12 6.5v13"></path>
							{:else if card.id === 'demo'}
								<circle cx="12" cy="12" r="8.5"></circle>
								<path d="M10 8.8v6.4l5.2-3.2z"></path>
							{:else}
								<rect x="4.5" y="4" width="15" height="16" rx="2.5"></rect>
								<path d="M8.5 9h7M8.5 12.5h7M8.5 16h4"></path>
							{/if}
						</svg>
					</span>
					<span class="text">
						<span id="{card.id}-title" class="name">{card.title}</span>
						<span id="{card.id}-line" class="line">{card.line}</span>
					</span>
					<span class="go" aria-hidden="true">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"></path></svg>
					</span>
				</a>
			{/each}
		</div>
	</section>
</div>

<style>
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--gap);
		padding-top: 8px;
	}

	.title {
		display: flex;
		align-items: center;
		gap: 18px;
	}

	.range {
		margin-top: 6px;
		color: var(--muted);
		font-weight: 500;
	}

	.pitch {
		max-width: 46ch;
		color: var(--text-soft);
		font-size: 17px;
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

	.how,
	.more {
		padding: 20px;
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

	.cards {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 12px;
	}

	.card {
		display: flex;
		align-items: center;
		gap: 14px;
		min-height: 72px;
		padding: 12px 14px;
		border-radius: var(--radius);
		background: var(--raised);
		box-shadow: 0 4px 0 var(--shadow);
		text-decoration: none;
		transition:
			transform 0.08s ease-out,
			box-shadow 0.08s ease-out;
	}

	.card:active {
		transform: translateY(4px);
		box-shadow: 0 0 0 var(--shadow);
	}

	.icon {
		display: grid;
		place-items: center;
		flex: none;
		width: 44px;
		height: 44px;
		border-radius: var(--radius-sm);
		background: var(--surface);
		color: var(--c);
	}

	.card .text {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
	}

	.card .name {
		font-weight: 700;
		font-size: 17px;
	}

	.card .line {
		color: var(--muted);
		font-size: 14px;
	}

	.go {
		display: grid;
		flex: none;
		color: var(--muted);
	}

	@media (hover: hover) {
		.card:hover .go {
			color: var(--c);
		}
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

		.intro,
		.more {
			grid-column: 1 / -1;
		}

		.how {
			grid-row: 2;
			grid-column: 1;
			padding: 28px 32px;
		}

		.play {
			grid-row: 2;
			grid-column: 2;
		}

		.more {
			grid-row: 3;
			padding: 24px 32px 28px;
		}

		.cards {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}
</style>
