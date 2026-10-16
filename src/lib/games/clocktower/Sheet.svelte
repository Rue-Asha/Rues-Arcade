<script lang="ts">
	import { characters } from './characters.ts';
	import CharacterIcon from './CharacterIcon.svelte';
	import type { Team } from './types.ts';

	const teams: { team: Team; title: string }[] = [
		{ team: 'townsfolk', title: 'Dorfbewohner' },
		{ team: 'outsider', title: 'Außenseiter' },
		{ team: 'minion', title: 'Schergen' },
		{ team: 'demon', title: 'Dämon' }
	];

	const pages = [
		{ name: 'Gut', teams: ['townsfolk', 'outsider'] },
		{ name: 'Böse', teams: ['minion', 'demon'] }
	] as const;

	let page = $state(0);
	let from: { x: number; y: number } | null = null;

	function down(e: PointerEvent) {
		from = { x: e.clientX, y: e.clientY };
	}

	function up(e: PointerEvent) {
		if (from === null) return;
		const dx = e.clientX - from.x;
		const dy = e.clientY - from.y;
		from = null;
		if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
		page = dx < 0 ? 1 : 0;
	}
</script>

<div class="sheet" data-testid="sheet" data-page={page}>
	<div class="tabs" role="group" aria-label="Seite des Charakterblatts">
		{#each pages as p, i (p.name)}
			<button type="button" class="tab" aria-pressed={page === i} onclick={() => (page = i)}>{p.name}</button>
		{/each}
	</div>
	<div class="pages" role="group" aria-label="Charakterblatt" onpointerdown={down} onpointerup={up} onpointercancel={() => (from = null)}>
		{#each pages as p, i (p.name)}
			<section class="page" data-page-name={p.name} data-current={page === i ? '' : undefined}>
				{#each teams.filter((t) => (p.teams as readonly string[]).includes(t.team)) as t (t.team)}
					<section class="team {t.team}" aria-labelledby="team-{t.team}">
						<h3 id="team-{t.team}">{t.title}</h3>
						<ul>
							{#each characters.filter((c) => c.team === t.team) as c (c.id)}
								<li>
									<CharacterIcon id={c.id} size={26} />
									<p>
										<b class="name">{c.name}</b>
										<span class="de">{c.de}</span>
										<span class="ability">{c.ability}</span>
									</p>
								</li>
							{/each}
						</ul>
					</section>
				{/each}
			</section>
		{/each}
	</div>
	<footer>
		<section class="win" aria-labelledby="win">
			<h3 id="win">So gewinnt ihr</h3>
			<p>Das Gute gewinnt, wenn der Dämon stirbt.</p>
			<p>Das Böse gewinnt, wenn nur noch zwei Spieler leben.</p>
		</section>
		<p class="credit">
			Icons von game-icons.net (Lorc, Delapouite und weitere), CC BY 3.0. Fähigkeitstexte aus Blood on the Clocktower, The
			Pandemonium Institute.
		</p>
	</footer>
</div>

<style>
	.sheet {
		container-type: inline-size;
		display: flex;
		flex-direction: column;
		gap: 6px;
		width: 100%;
		height: 100%;
		min-height: 0;
		font-size: 14px;
		line-height: 1.25;
	}

	.tabs {
		display: flex;
		gap: 8px;
	}

	.tab {
		flex: 1;
		min-height: 44px;
		border: 2px solid var(--line);
		border-radius: var(--radius-sm);
		background: var(--raised);
		color: var(--text);
		font: inherit;
		font-size: 14px;
		font-weight: 700;
		cursor: pointer;
	}

	.tab[aria-pressed='true'] {
		border-color: var(--clocktower);
		background: var(--clocktower-tint);
	}

	.tab:focus-visible {
		outline: 3px solid var(--gold);
		outline-offset: 2px;
	}

	.pages {
		flex: 1;
		min-height: 0;
		touch-action: pan-y;
	}

	.page {
		display: none;
		flex-direction: column;
		gap: 10px;
		height: 100%;
		overflow-x: hidden;
		overflow-y: auto;
		overscroll-behavior: contain;
	}

	.page[data-current] {
		display: flex;
	}

	.team {
		flex: none;
	}

	h3 {
		margin: 0 0 3px;
		font-family: var(--font-display, var(--font-ui));
		font-size: 16px;
		letter-spacing: 0.04em;
	}

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
		column-count: 1;
		column-gap: 8px;
	}

	li {
		display: flex;
		gap: 8px;
		margin-bottom: 10px;
		break-inside: avoid;
	}

	li p {
		margin: 0;
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.name {
		font-size: 14px;
	}

	.ability {
		font-style: italic;
		color: var(--muted);
	}

	footer {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.sheet[data-page='0'] footer {
		display: none;
	}

	.win {
		padding: 6px 8px;
		border: 2px solid var(--line);
		border-radius: var(--radius-sm);
		background: var(--surface);
	}

	.win h3 {
		margin: 0;
	}

	.win p,
	.credit {
		margin: 0;
	}

	.credit {
		color: var(--muted);
		font-size: 14px;
	}

	@container (min-width: 900px) {
		.pages,
		footer {
			font-size: 12px;
			line-height: 1.1;
		}

		.page {
			overflow: visible;
		}

		.tabs {
			display: none;
		}

		.pages {
			display: grid;
			grid-template-columns: repeat(4, minmax(0, 1fr));
			grid-template-rows: auto auto;
			column-gap: 20px;
			row-gap: 10px;
			align-content: start;
		}

		.page,
		.page[data-current] {
			display: contents;
		}

		.townsfolk {
			grid-column: 1 / 3;
			grid-row: 1 / 3;
		}

		.outsider {
			grid-column: 3;
			grid-row: 1;
		}

		.minion {
			grid-column: 4;
			grid-row: 1;
		}

		.demon {
			grid-column: 3 / 5;
			grid-row: 2;
		}

		.townsfolk ul {
			column-count: 2;
		}

		.outsider ul,
		.minion ul {
			column-count: 1;
		}

		.demon ul {
			column-count: 1;
		}

		h3 {
			font-size: 16px;
		}

		li {
			gap: 8px;
			margin-bottom: 8px;
		}

		.name,
		.de,
		.ability {
			display: block;
		}

		.name {
			font-size: 13.5px;
		}

		.sheet[data-page='0'] footer,
		footer {
			display: flex;
			flex-direction: row;
			align-items: flex-start;
			gap: 20px;
		}

		.win {
			flex: none;
		}

		.credit {
			font-size: 12px;
		}
	}
</style>
