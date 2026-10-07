<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { board } from '#lib/content/survey.ts';
	import type { Survey } from '#lib/content/types.ts';
	import type { Player } from '#lib/engine/types.ts';
	import { savedId } from '#lib/players.ts';
	import { roster } from '#lib/roster.svelte.ts';
	import Button from '#lib/ui/Button.svelte';
	import type { FeudConfig, FeudTeam } from './engine.ts';
	import { clampPage, drawTiebreak, fill, pageCount, rows, sortRows, type Played, type Sort } from './prep.ts';

	interface Props {
		teams: FeudTeam[];
		players: Player[];
		rounds: number;
		surveys: Survey[];
		onstart(config: unknown): void;
		onback(): void;
	}

	let { teams, players, rounds, surveys, onstart, onback }: Props = $props();

	const saved = $derived(players.flatMap((p) => savedId(p.id) ?? []));

	let played = $state<Played[]>([]);
	let sort = $state<Sort>('known');
	let slots = $state<(number | null)[]>(untrack(() => Array.from({ length: rounds }, () => null)));
	let open = $state<number[]>([]);
	let page = $state(0);
	const wide = new MediaQuery('(min-width: 1024px)');
	let notice = $state('');

	onMount(async () => {
		const res = await fetch('/api/feud/played');
		if (res.ok) played = await res.json();
	});

	const table = $derived(rows(surveys, played, saved));
	const list = $derived(sortRows(table, sort));
	const size = $derived(wide.current ? 12 : 6);
	const pages = $derived(pageCount(list.length, size));
	const current = $derived(clampPage(page, list.length, size));
	const shown = $derived(list.slice(current * size, (current + 1) * size));
	const byId = $derived(new Map(surveys.map((s) => [s.id, s])));
	const full = $derived(slots.every((s) => s !== null));
	const names = $derived(new Map(roster.saved.map((p) => [p.id, p.name])));

	const listOf = (id: number) => played.find((p) => p.surveyId === id)?.playerIds ?? [];

	function sortBy(by: Sort) {
		sort = by;
		page = 0;
	}

	const toggle = (id: number) => (open = open.includes(id) ? open.filter((o) => o !== id) : [...open, id]);

	function pick(id: number) {
		const at = slots.indexOf(null);
		if (at < 0) {
			notice = `Schon ${rounds} ${rounds === 1 ? 'Umfrage' : 'Umfragen'} gewählt.`;
			return;
		}
		notice = '';
		slots[at] = id;
	}

	function unpick(at: number) {
		notice = '';
		slots[at] = null;
	}

	function autofill() {
		notice = '';
		slots = fill(table, slots);
	}

	function setList(surveyId: number, ids: number[]) {
		played = [...played.filter((p) => p.surveyId !== surveyId), { surveyId, playerIds: ids }];
	}

	async function add(surveyId: number, playerId: number) {
		const res = await fetch('/api/feud/played', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ surveyId, playerIds: [playerId] })
		});
		if (res.ok) setList(surveyId, [...new Set([...listOf(surveyId), playerId])]);
	}

	async function drop(surveyId: number, playerId: number) {
		const res = await fetch(`/api/feud/played/${surveyId}/${playerId}`, { method: 'DELETE' });
		if (res.ok) setList(surveyId, listOf(surveyId).filter((id) => id !== playerId));
	}

	function start() {
		const picked = slots.filter((s): s is number => s !== null);
		onstart({
			teams: [teams[0], teams[1]],
			surveys: picked.map((id) => structuredClone($state.snapshot(byId.get(id)!))),
			tiebreak: structuredClone($state.snapshot(drawTiebreak(table, picked))),
			saved
		} satisfies FeudConfig);
	}
</script>

<div class="stack">
	<section class="panel stack" aria-labelledby="prep-title">
		<h2 id="prep-title"><span>{teams[0].name}</span> gegen <span>{teams[1].name}</span></h2>
		<p class="muted">Wähle {rounds} {rounds === 1 ? 'Umfrage' : 'Umfragen'} für die Runden.</p>
		<ol class="slots" aria-label="Gewählte Umfragen">
			{#each slots as id, i (i)}
				{@const survey = id === null ? undefined : byId.get(id)}
				<li class="card slot" class:empty={!survey} data-slot={i}>
					<div class="top">
						<span class="num">{i + 1}</span>
						{#if survey}
							<button type="button" class="small" onclick={() => unpick(i)}>Entfernen</button>
						{:else}
							<span class="muted">Noch frei</span>
						{/if}
					</div>
					{#if survey}
						<p class="q">{survey.question}</p>
						{@render answers(survey)}
					{/if}
				</li>
			{/each}
		</ol>
		{#if notice}
			<p class="hint" role="status">{notice}</p>
		{/if}
		<div class="row">
			<Button variant="secondary" size="sm" disabled={full} onclick={autofill}>Zufällig auffüllen</Button>
		</div>
	</section>

	<section class="panel stack" aria-labelledby="surveys">
		<div class="head">
			<h2 id="surveys">Umfragen</h2>
			<div class="seg" role="group" aria-label="Sortieren nach">
				<button type="button" class="opt" aria-pressed={sort === 'known'} onclick={() => sortBy('known')}>Bekannt</button>
				<button type="button" class="opt" aria-pressed={sort === 'played'} onclick={() => sortBy('played')}>Gespielt</button>
			</div>
		</div>
		<ul class="list" aria-label="Alle Umfragen">
			{#each shown as { survey, k, played: x } (survey.id)}
				{@const chosen = slots.includes(survey.id)}
				{@const on = listOf(survey.id)}
				{@const expanded = open.includes(survey.id)}
				<li class="card item" class:chosen data-survey={survey.id}>
					<p class="q">{survey.question}</p>
					{@render answers(survey)}
					<div class="badges">
						<span class="badge">{k} von {saved.length} kennen sie</span>
						{#if x === 0}
							<span class="badge new">neu</span>
						{:else}
							<span class="badge">gespielt mit {x}</span>
						{/if}
						{#if k === saved.length}
							<span class="badge all">alle kennen sie</span>
						{/if}
					</div>
					<div class="actions">
						<button type="button" class="small" aria-expanded={expanded} onclick={() => toggle(survey.id)}>Gespielt mit</button>
						<button type="button" class="small pick" disabled={chosen} onclick={() => pick(survey.id)}>
							{chosen ? 'Gewählt' : 'Wählen'}
						</button>
					</div>
					{#if expanded}
						<div class="stack" role="group" aria-label="Spielerliste">
							{#if on.length === 0}
								<p class="muted">Noch niemand.</p>
							{/if}
							<ul class="who">
								{#each on as id (id)}
									<li>
										<span>{names.get(id) ?? 'Unbekannt'}</span>
										<button type="button" class="small" onclick={() => drop(survey.id, id)}>
											Entfernen<span class="sr"> {names.get(id)}</span>
										</button>
									</li>
								{/each}
							</ul>
							<div class="chips">
								{#each roster.saved.filter((p) => !on.includes(p.id)) as p (p.id)}
									<button type="button" class="small" onclick={() => add(survey.id, p.id)}>
										+ {p.name}
									</button>
								{/each}
							</div>
						</div>
					{/if}
				</li>
			{/each}
		</ul>
		{#if pages > 1}
			<nav class="pager" aria-label="Seiten">
				<Button variant="secondary" size="sm" disabled={current === 0} onclick={() => (page = current - 1)}>Zurück</Button>
				<span class="muted">Seite {current + 1} von {pages}</span>
				<Button variant="secondary" size="sm" disabled={current === pages - 1} onclick={() => (page = current + 1)}>Weiter</Button>
			</nav>
		{/if}
	</section>

	<div class="row">
		<Button variant="ghost" onclick={onback}>Zurück</Button>
		<Button variant="primary" disabled={!full} onclick={start}>Start</Button>
	</div>
</div>

{#snippet answers(survey: Survey)}
	<ol class="answers" aria-label="Antworten">
		{#each board(survey) as a, i (i)}
			<li><span>{a.text}</span><b>{a.points}</b></li>
		{/each}
	</ol>
{/snippet}

<style>
	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 8px 16px;
	}

	ol,
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.slots,
	.list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
		gap: 12px;
		align-items: start;
	}

	.card {
		display: grid;
		gap: 10px;
		min-width: 0;
		padding: 12px 14px;
		border-radius: var(--radius);
	}

	.slot {
		background: var(--feud-tint);
		box-shadow: 0 4px 0 var(--feud-ledge);
	}

	.slot.empty {
		background: var(--surface);
		box-shadow: 0 4px 0 var(--shadow);
	}

	.top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.num {
		display: grid;
		place-items: center;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: var(--feud);
		color: var(--ink);
		font-weight: 800;
	}

	.item {
		background: var(--raised);
		box-shadow: 0 4px 0 var(--shadow);
	}

	.item.chosen {
		box-shadow:
			inset 0 3px 0 var(--feud),
			0 4px 0 var(--feud-ledge);
	}

	.q {
		margin: 0;
		font-weight: 700;
		overflow-wrap: anywhere;
	}

	.answers {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 150px), 1fr));
		column-gap: 16px;
		font-size: 14px;
	}

	.answers li {
		display: flex;
		justify-content: space-between;
		gap: 8px;
		padding: 3px 0;
		border-bottom: 1px solid var(--line);
		min-width: 0;
	}

	.answers span {
		overflow-wrap: break-word;
		hyphens: auto;
	}

	.answers b {
		color: var(--feud);
	}

	.badges,
	.actions,
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.badge {
		padding: 4px 10px;
		border-radius: 999px;
		background: var(--surface);
		font-size: 14px;
		font-weight: 600;
	}

	.badge.new {
		color: var(--feud);
	}

	.badge.all {
		color: var(--imposter-text);
	}

	.small,
	.opt {
		min-height: 44px;
		padding: 0 14px;
		border: 1px solid var(--line);
		border-radius: var(--radius-sm);
		background: var(--raised);
		box-shadow: 0 3px 0 var(--shadow);
		font-weight: 700;
		cursor: pointer;
		touch-action: manipulation;
	}

	.item .small {
		background: var(--surface);
	}

	.small[aria-expanded='true'] {
		border-color: var(--feud);
	}

	.small:disabled {
		opacity: 0.55;
		cursor: default;
	}

	.seg {
		display: flex;
		gap: 8px;
	}

	.opt[aria-pressed='true'] {
		background: var(--feud);
		border-color: var(--feud);
		color: var(--ink);
		box-shadow: 0 3px 0 var(--feud-ledge);
	}

	.who li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		padding: 6px 0;
		border-bottom: 1px solid var(--line);
	}

	.pager {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16px;
	}

	.hint {
		color: var(--imposter);
		font-weight: 600;
	}

	.sr {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}
</style>
