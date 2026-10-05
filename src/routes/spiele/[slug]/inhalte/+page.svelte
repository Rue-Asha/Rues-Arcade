<script lang="ts">
	import { tick } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { isSingle, type ContentItem, type ContentType, type ImportReport } from '#lib/content/types.ts';
	import { games } from '#lib/games/registry.ts';
	import Button from '#lib/ui/Button.svelte';
	import Modal from '#lib/ui/Modal.svelte';
	import type { PageProps } from './$types';

	let { data, params }: PageProps = $props();

	const sides: Record<ContentType, { a: string; b?: string; hint: string; intro: string }> = {
		imposter_pairs: {
			a: 'Crew-Frage',
			b: 'Imposter-Frage',
			hint: 'Lieblingsessen? | Lieblingsgetränk?',
			intro: 'Pro Eintrag eine Frage für die Crew und eine leicht andere für den Imposter.'
		},
		wavelength_spectra: {
			a: 'Links',
			b: 'Rechts',
			hint: 'Kalt | Heiß',
			intro: 'Pro Eintrag ein Spektrum zwischen zwei Begriffen.'
		},
		codes_words: {
			a: 'Wort',
			hint: 'Leuchtturm',
			intro: 'Pro Eintrag ein geheimes Wort, das die Teams erraten.'
		},
		duck_words: {
			a: 'Wort',
			hint: 'Haus',
			intro: 'Pro Eintrag ein Wort, auf das sich gut reimen lässt.'
		},
		most_likely_prompts: {
			a: 'Spruch',
			hint: 'Wer würde am ehesten auswandern?',
			intro: 'Pro Eintrag ein Spruch, der mit „Wer würde am ehesten“ beginnt.'
		}
	};

	const def = $derived(games.find((g) => g.def.slug === params.slug)!.def);
	const base = $derived(`/spiele/${def.slug}`);
	const side = $derived(sides[def.contentType]);
	const single = $derived(isSingle(def.contentType));
	const api = $derived(`/api/content/${def.contentType}`);
	const items = $derived(data.items);

	let a = $state('');
	let b = $state('');
	let message = $state('');

	let editing = $state<number | null>(null);
	let draftA = $state('');
	let draftB = $state('');
	let editMessage = $state('');

	let deleting = $state<ContentItem | null>(null);

	let bulk = $state('');
	let bulkLines = $state<string[]>([]);
	let report = $state<ImportReport | null>(null);

	const name = (item: { a: string; b: string }) => (single ? item.a : `${item.a} | ${item.b}`);

	async function send(url: string, method: string, body?: unknown): Promise<string> {
		const res = await fetch(url, {
			method,
			headers: { 'content-type': 'application/json' },
			body: body === undefined ? undefined : JSON.stringify(body)
		});
		if (res.ok) return '';
		return (await res.json().catch(() => null))?.message ?? 'Das hat nicht geklappt.';
	}

	async function add(e?: Event) {
		e?.preventDefault();
		message = await send(api, 'POST', { a, b });
		if (message) return;
		a = b = '';
		await invalidateAll();
		document.getElementById('new-a')?.focus();
	}

	async function edit(item: ContentItem) {
		editing = item.id;
		draftA = item.a;
		draftB = item.b;
		editMessage = '';
		await tick();
		document.getElementById(`edit-${item.id}-a`)?.focus();
	}

	async function save(e: SubmitEvent) {
		e.preventDefault();
		if (editing === null) return;
		editMessage = await send(`${api}/${editing}`, 'PUT', { a: draftA, b: draftB });
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

	// Two inputs and no native submit button: implicit form submission wouldn't fire on Enter.
	// A single input does submit implicitly, so handling Enter there too would post twice.
	function enter(e: KeyboardEvent) {
		if (e.key === 'Enter' && !single) add(e);
	}

	function cancel(e: KeyboardEvent) {
		if (e.key === 'Escape') editing = null;
	}
</script>

<svelte:head>
	<title>Inhalte · {def.name} · Rue's Arcade</title>
</svelte:head>

<div class="stack rise" style="--c: var(--{def.colour})">
	<header class="hero">
		<a class="back" href={base}>
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"></path></svg>
			{def.name}
		</a>
		<h1>Inhalte</h1>
		<p class="muted">{side.intro}</p>
	</header>

	<div class="layout">
		<div class="side stack">
			<form class="panel stack add" aria-label="Neuer Eintrag" onsubmit={add}>
				<div class="fields">
					<label class="field">
						<span class="label">{side.a}</span>
						<input id="new-a" bind:value={a} onkeydown={enter} autocomplete="off" aria-describedby={message ? 'new-error' : undefined} />
					</label>
					{#if !single}
						<label class="field">
							<span class="label">{side.b}</span>
							<input bind:value={b} onkeydown={enter} autocomplete="off" enterkeyhint="done" aria-describedby={message ? 'new-error' : undefined} />
						</label>
					{/if}
				</div>
				{#if message}
					<p id="new-error" class="error" role="alert">{message}</p>
				{/if}
				<Button variant="primary" onclick={() => add()}>Hinzufügen</Button>
			</form>

			<section class="panel stack bulk">
				<label class="label" for="bulk">Mehrere auf einmal</label>
				<p class="muted small">{single ? 'Eine Zeile pro Eintrag.' : 'Eine Zeile pro Eintrag, Seiten getrennt mit „|“.'}</p>
				<textarea id="bulk" bind:value={bulk} rows="5" placeholder={side.hint} spellcheck="false"></textarea>
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
				<h2 id="entries">Einträge</h2>
				<span class="count">{items.length}</span>
			</div>

			{#if items.length}
				<ul class="rows" aria-labelledby="entries">
					{#each items as item (item.id)}
						<li class="row">
							{#if editing === item.id}
								<form class="edit" aria-label="{name(item)} bearbeiten" onsubmit={save}>
									<label class="field">
										<span class="label">{side.a}</span>
										<input id="edit-{item.id}-a" bind:value={draftA} onkeydown={cancel} autocomplete="off" />
									</label>
									{#if !single}
										<label class="field">
											<span class="label">{side.b}</span>
											<input bind:value={draftB} onkeydown={cancel} autocomplete="off" />
										</label>
									{/if}
									{#if editMessage}
										<p class="error" role="alert">{editMessage}</p>
									{/if}
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
								<span class="text">
									<span class="a">{item.a}</span>
									{#if !single}<span class="b">{item.b}</span>{/if}
								</span>
								<span class="tools">
									<button class="icon" type="button" aria-label="{name(item)} bearbeiten" onclick={() => edit(item)}>
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"></path><path d="M13.5 6.5l4 4"></path></svg>
									</button>
									<button class="icon danger" type="button" aria-label="{name(item)} löschen" onclick={() => (deleting = item)}>
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13"></path></svg>
									</button>
								</span>
							{/if}
						</li>
					{/each}
				</ul>
			{:else}
				<div class="empty panel">
					<p class="empty-title">Noch keine Einträge</p>
					<p class="muted">Leg den ersten an oder füg mehrere Zeilen auf einmal ein.</p>
				</div>
			{/if}
		</section>
	</div>
</div>

<Modal open={deleting !== null} title="Eintrag löschen?" onclose={() => (deleting = null)}>
	{#if deleting}
		<p class="doomed">
			<span class="a">{deleting.a}</span>
			{#if !single}<span class="b">{deleting.b}</span>{/if}
		</p>
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

	.fields {
		display: flex;
		flex-direction: column;
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

	.row {
		display: flex;
		align-items: center;
		gap: 12px;
		min-height: 64px;
		padding: 10px 8px 10px 16px;
		border-radius: var(--radius);
		background: var(--surface);
		box-shadow:
			inset 3px 0 0 var(--c),
			0 4px 0 var(--shadow);
	}

	.text {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
		gap: 2px;
	}

	.a,
	.b {
		overflow-wrap: anywhere;
	}

	.a {
		font-weight: 700;
	}

	.b {
		color: var(--muted);
	}

	.doomed {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 12px 14px;
		border-radius: var(--radius-sm);
		background: var(--raised);
	}

	.tools {
		display: flex;
		gap: 6px;
		flex: none;
	}

	.edit {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
		gap: 10px;
		padding-block: 4px;
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
