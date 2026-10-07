<script lang="ts">
	import { tick } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { board } from '#lib/content/survey.ts';
	import { MAX_ANSWERS, MIN_ANSWERS, type ImportReport, type Survey } from '#lib/content/types.ts';
	import type { GameDef } from '#lib/engine/types.ts';
	import Button from '#lib/ui/Button.svelte';
	import Modal from '#lib/ui/Modal.svelte';

	interface Props {
		def: GameDef<any, any, any>;
		surveys: Survey[];
	}

	interface Draft {
		question: string;
		rows: { text: string; points: number | null }[];
	}

	let { def, surveys }: Props = $props();

	const api = '/api/content/feud_surveys';
	const base = $derived(`/spiele/${def.slug}`);

	const blank = (): Draft => ({
		question: '',
		rows: Array.from({ length: MIN_ANSWERS }, () => ({ text: '', points: null }))
	});

	let draft = $state<Draft>(blank());
	let message = $state('');

	let editing = $state<number | null>(null);
	let editDraft = $state<Draft>(blank());
	let editMessage = $state('');

	let deleting = $state<Survey | null>(null);

	let bulk = $state('');
	let bulkLines = $state<string[]>([]);
	let report = $state<ImportReport | null>(null);

	function body(d: Draft) {
		return {
			question: d.question,
			answers: d.rows
		};
	}

	async function send(url: string, method: string, payload?: unknown): Promise<string> {
		const res = await fetch(url, {
			method,
			headers: { 'content-type': 'application/json' },
			body: payload === undefined ? undefined : JSON.stringify(payload)
		});
		if (res.ok) return '';
		return (await res.json().catch(() => null))?.message ?? 'Das hat nicht geklappt.';
	}

	async function add(e?: Event) {
		e?.preventDefault();
		message = await send(api, 'POST', body(draft));
		if (message) return;
		draft = blank();
		await invalidateAll();
		document.getElementById('new-question')?.focus();
	}

	async function edit(survey: Survey) {
		editing = survey.id;
		editDraft = {
			question: survey.question,
			rows: survey.answers.map((a) => ({ ...a }))
		};
		editMessage = '';
		await tick();
		document.getElementById(`edit-${survey.id}-question`)?.focus();
	}

	async function save(e: SubmitEvent) {
		e.preventDefault();
		if (editing === null) return;
		editMessage = await send(`${api}/${editing}`, 'PUT', body(editDraft));
		if (editMessage) return;
		editing = null;
		await invalidateAll();
	}

	async function remove() {
		if (!deleting) return;
		const id = deleting.id;
		deleting = null;
		await send(`${api}/${id}`, 'DELETE');
		await invalidateAll();
	}

	async function importBulk() {
		const res = await fetch(`${api}/import`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ text: bulk })
		});
		if (!res.ok) return;
		report = await res.json();
		bulkLines = bulk.split(/\r?\n/);
		bulk = '';
		await invalidateAll();
	}

	// The add form has several inputs and no native submit button, so Enter wouldn't submit it implicitly.
	function enter(e: KeyboardEvent) {
		if (e.key === 'Enter') add(e);
	}

	function cancel(e: KeyboardEvent) {
		if (e.key === 'Escape') editing = null;
	}
</script>

{#snippet fields(d: Draft, id: string, error: string, onkeydown: (e: KeyboardEvent) => void)}
	<label class="field">
		<span class="label">Frage</span>
		<input id="{id}-question" bind:value={d.question} {onkeydown} autocomplete="off" aria-describedby={error ? `${id}-error` : undefined} />
	</label>
	{#each d.rows as row, i}
		<div class="answer">
			<label class="field">
				<span class="label">Antwort {i + 1}</span>
				<input bind:value={row.text} {onkeydown} autocomplete="off" />
			</label>
			<label class="field">
				<span class="label">Punkte {i + 1}</span>
				<input bind:value={row.points} {onkeydown} type="number" inputmode="numeric" min="1" step="1" />
			</label>
			<button
				class="icon"
				type="button"
				aria-label="Antwort {i + 1} entfernen"
				disabled={d.rows.length <= MIN_ANSWERS}
				onclick={() => d.rows.splice(i, 1)}
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg>
			</button>
		</div>
	{/each}
	<Button variant="ghost" disabled={d.rows.length >= MAX_ANSWERS} onclick={() => d.rows.push({ text: '', points: null })}>
		Antwort hinzufügen
	</Button>
	{#if error}
		<p id="{id}-error" class="error" role="alert">{error}</p>
	{/if}
{/snippet}

<div class="stack rise" style="--c: var(--{def.colour})">
	<header class="hero">
		<a class="back" href={base}>
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"></path></svg>
			{def.name}
		</a>
		<h1>Inhalte</h1>
		<p class="muted">Pro Umfrage eine Frage mit {MIN_ANSWERS} bis {MAX_ANSWERS} Antworten und Punkten, zusammen höchstens 100.</p>
	</header>

	<div class="layout">
		<div class="side stack">
			<form class="panel stack add" aria-label="Neue Umfrage" onsubmit={add}>
				{@render fields(draft, 'new', message, enter)}
				<Button variant="primary" onclick={() => add()}>Hinzufügen</Button>
			</form>

			<section class="panel stack bulk">
				<label class="label" for="bulk">Mehrere auf einmal</label>
				<p class="muted small">Eine Zeile pro Umfrage, Antworten getrennt mit „|“, Punkte nach dem letzten „:“.</p>
				<textarea id="bulk" bind:value={bulk} rows="5" placeholder="Nenne ein Obst | Apfel : 40 | Birne : 30 | Kiwi : 20" spellcheck="false"></textarea>
				<Button variant="secondary" disabled={!bulk.trim()} onclick={importBulk}>Importieren</Button>
				<div role="status">
					{#if report}
						<div class="report">
							<p class="counts">
								<span class="good">{report.imported} importiert</span>
								<span>{report.duplicates} doppelt</span>
								<span>{report.skipped} leer</span>
							</p>
							{#if report.errors.length}
								<ul class="errors">
									{#each report.errors as err (err.line)}
										<li>
											<span class="where">Zeile {err.line}</span>
											<span class="text">{bulkLines[err.line - 1]}</span>
											<span class="why">{err.message}</span>
										</li>
									{/each}
								</ul>
							{/if}
						</div>
					{/if}
				</div>
			</section>
		</div>

		<section class="list" aria-labelledby="entries">
			<div class="head">
				<h2 id="entries">Umfragen</h2>
				<span class="count">{surveys.length}</span>
			</div>

			{#if surveys.length}
				<ul class="rows" aria-labelledby="entries">
					{#each surveys as survey (survey.id)}
						<li class="card">
							{#if editing === survey.id}
								<form class="edit stack" aria-label="{survey.question} bearbeiten" onsubmit={save}>
									{@render fields(editDraft, `edit-${survey.id}`, editMessage, cancel)}
									<span class="tools">
										<button class="icon ok" type="submit" aria-label="Speichern">
											<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
										</button>
										<button class="icon" type="button" aria-label="Abbrechen" onclick={() => (editing = null)}>
											<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg>
										</button>
									</span>
								</form>
							{:else}
								<div class="top">
									<span class="question">{survey.question}</span>
									<span class="tools">
										<button class="icon" type="button" aria-label="{survey.question} bearbeiten" onclick={() => edit(survey)}>
											<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"></path><path d="M13.5 6.5l4 4"></path></svg>
										</button>
										<button class="icon danger" type="button" aria-label="{survey.question} löschen" onclick={() => (deleting = survey)}>
											<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13"></path></svg>
										</button>
									</span>
								</div>
								<ol class="board" aria-label="Antworten">
									{#each board(survey) as answer}
										<li><span class="text">{answer.text}</span> <span class="points">{answer.points}</span></li>
									{/each}
								</ol>
							{/if}
						</li>
					{/each}
				</ul>
			{:else}
				<div class="empty panel">
					<p class="empty-title">Noch keine Umfragen</p>
					<p class="muted">Leg die erste an oder füg mehrere Zeilen auf einmal ein.</p>
				</div>
			{/if}
		</section>
	</div>
</div>

<Modal open={deleting !== null} title="Umfrage löschen?" onclose={() => (deleting = null)}>
	{#if deleting}
		<p class="doomed">{deleting.question}</p>
		<p class="muted">Das lässt sich nicht rückgängig machen.</p>
	{/if}
	<div class="row">
		<Button variant="primary" onclick={remove}>Löschen</Button>
		<Button variant="ghost" onclick={() => (deleting = null)}>Abbrechen</Button>
	</div>
</Modal>

<style>
	.hero {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 10px;
		padding-block: 8px 4px;
	}

	.hero .muted {
		font-size: 17px;
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

	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--gap);
	}

	.add,
	.bulk {
		padding: 20px;
		gap: 12px;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-width: 0;
	}

	.field input {
		min-height: 54px;
		font-size: 17px;
	}

	.answer {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 84px 44px;
		align-items: end;
		gap: 8px;
	}

	.answer .icon {
		margin-bottom: 3px;
	}

	.icon:disabled {
		opacity: 0.4;
		cursor: default;
	}

	textarea {
		min-height: 132px;
		resize: vertical;
		font: 500 16px/1.5 var(--font-ui);
	}

	.small {
		font-size: 14px;
	}

	.error {
		color: var(--imposter);
		font-weight: 600;
	}

	.report {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 14px;
		border-radius: var(--radius-sm);
		background: var(--raised);
		animation: rise 0.32s var(--ease-out) both;
	}

	.counts {
		display: flex;
		flex-wrap: wrap;
		gap: 6px 16px;
		color: var(--muted);
		font-weight: 600;
	}

	.counts .good {
		color: var(--primary);
	}

	.errors {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.errors li {
		display: flex;
		flex-direction: column;
		padding-left: 12px;
		border-left: 3px solid var(--imposter);
	}

	.where {
		color: var(--imposter);
		font-weight: 700;
		font-size: 14px;
	}

	.errors .text {
		overflow-wrap: anywhere;
	}

	.why {
		color: var(--muted);
		font-size: 14px;
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.head {
		display: flex;
		align-items: baseline;
		gap: 14px;
	}

	.count {
		font-weight: 800;
		font-size: 20px;
		font-variant-numeric: tabular-nums;
		color: var(--gold);
	}

	.rows {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.card {
		display: flex;
		flex-direction: column;
		gap: 10px;
		min-width: 0;
		padding: 12px 8px 14px 16px;
		border-radius: var(--radius);
		background: var(--surface);
		box-shadow:
			inset 3px 0 0 var(--c),
			0 4px 0 var(--shadow);
	}

	.top {
		display: flex;
		align-items: flex-start;
		gap: 12px;
	}

	.question {
		flex: 1;
		min-width: 0;
		padding-top: 10px;
		font-weight: 700;
		overflow-wrap: anywhere;
	}

	.board {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin: 0;
		padding: 0 8px 0 0;
		list-style: none;
		counter-reset: rank;
	}

	.board li {
		display: flex;
		align-items: baseline;
		gap: 10px;
		counter-increment: rank;
	}

	.board li::before {
		content: counter(rank);
		flex: none;
		width: 1.2em;
		color: var(--muted);
		font-variant-numeric: tabular-nums;
	}

	.board .text {
		flex: 1;
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.points {
		font-weight: 800;
		font-variant-numeric: tabular-nums;
		color: var(--gold);
	}

	.doomed {
		padding: 12px 14px;
		border-radius: var(--radius-sm);
		background: var(--raised);
		font-weight: 700;
		overflow-wrap: anywhere;
	}

	.row {
		display: flex;
		gap: 12px;
	}

	.tools {
		display: flex;
		gap: 6px;
		flex: none;
	}

	.edit {
		min-width: 0;
		padding-right: 8px;
		gap: 10px;
	}

	.edit .tools {
		justify-content: flex-end;
	}

	.icon {
		display: grid;
		place-items: center;
		flex: none;
		width: 44px;
		height: 48px;
		padding: 0;
		border: 0;
		border-radius: var(--radius-sm);
		background: var(--raised);
		color: var(--text);
		cursor: pointer;
		box-shadow: 0 3px 0 var(--shadow);
		transition:
			transform 0.06s,
			box-shadow 0.06s;
	}

	.icon:active {
		transform: translateY(3px);
		box-shadow: 0 0 0 var(--shadow);
	}

	.ok {
		background: var(--primary);
		color: var(--on-primary);
	}

	.danger {
		color: var(--imposter);
	}

	.empty {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 24px;
		border: 2px dashed var(--line);
		background: transparent;
		box-shadow: none;
	}

	.empty-title {
		font-weight: 700;
		font-size: 20px;
	}

	@media (min-width: 1024px) {
		.layout {
			grid-template-columns: minmax(0, 1fr) 380px;
			align-items: start;
		}

		.side {
			grid-column: 2;
			grid-row: 1;
			position: sticky;
			top: 24px;
			/* taller than the viewport, a sticky side hides the import button until the end of a long list */
			max-height: calc(100dvh - 48px);
			overflow-y: auto;
		}

		.list {
			grid-column: 1;
			grid-row: 1;
		}

		.rows {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(min(100%, 360px), 1fr));
		}
	}
</style>
