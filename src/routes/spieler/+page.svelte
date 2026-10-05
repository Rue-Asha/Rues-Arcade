<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { Player } from '#lib/engine/types.ts';
	import { roster } from '#lib/roster.svelte.ts';
	import Button from '#lib/ui/Button.svelte';

	let ready = $state(false);
	onMount(() => (ready = true));

	const players = $derived(ready ? roster.players : []);

	let name = $state('');
	let message = $state('');
	let editing = $state<string | null>(null);
	let draft = $state('');
	let editMessage = $state('');

	const from = $derived(page.url.searchParams.get('from'));
	const back = $derived(from?.startsWith('/') && !from.startsWith('//') ? from : '/');

	function add(e?: SubmitEvent) {
		e?.preventDefault();
		const result = roster.add(name);
		message = result.ok ? '' : result.message;
		if (result.ok) name = '';
	}

	async function edit(p: Player) {
		editing = p.id;
		draft = p.name;
		editMessage = '';
		await tick();
		document.getElementById(`edit-${p.id}`)?.focus();
	}

	function save(e: SubmitEvent) {
		e.preventDefault();
		if (!editing) return;
		const result = roster.rename(editing, draft);
		editMessage = result.ok ? '' : result.message;
		if (result.ok) editing = null;
	}

	function cancel(e: KeyboardEvent) {
		if (e.key === 'Escape') editing = null;
	}
</script>

<svelte:head>
	<title>Spieler · Rue's Arcade</title>
</svelte:head>

<div class="stack rise">
	<header class="hero">
		<h1>Spieler</h1>
		<p class="muted">Ein Kader für alle Spiele, gespeichert auf diesem Gerät.</p>
	</header>

	<div class="layout">
		<form class="panel stack add" onsubmit={add}>
			<label class="label" for="name">Name</label>
			<div class="field">
				<input
					id="name"
					bind:value={name}
					autocomplete="off"
					enterkeyhint="done"
					placeholder="z. B. Alex"
					aria-describedby={message ? 'name-error' : undefined}
				/>
				<Button variant="primary" onclick={() => add()}>Hinzufügen</Button>
			</div>
			{#if message}
				<p id="name-error" class="error" role="alert">{message}</p>
			{/if}
			{#if players.length}
				<Button variant="secondary" onclick={() => goto(back)}>Fertig</Button>
			{/if}
		</form>

		<section class="list" aria-labelledby="crew">
			<div class="head">
				<h2 id="crew">Dabei</h2>
				<span class="count">{players.length}</span>
			</div>

			{#if players.length}
				<ol class="rows">
					{#each players as p, i (p.id)}
						<li class="row">
							<span class="rank">{i + 1}</span>
							{#if editing === p.id}
								<form class="rename" onsubmit={save}>
									<input
										id="edit-{p.id}"
										bind:value={draft}
										onkeydown={cancel}
										autocomplete="off"
										aria-label="Neuer Name für {p.name}"
									/>
									<button class="icon ok" type="submit" aria-label="Speichern">
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
									</button>
									<button class="icon" type="button" aria-label="Abbrechen" onclick={() => (editing = null)}>
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg>
									</button>
								</form>
								{#if editMessage}
									<p class="error wide" role="alert">{editMessage}</p>
								{/if}
							{:else}
								<span class="name">{p.name}</span>
								<span class="tools">
									<button class="icon" type="button" aria-label="{p.name} nach oben" disabled={i === 0} onclick={() => roster.move(p.id, i - 1)}>
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 15l6-6 6 6"></path></svg>
									</button>
									<button class="icon" type="button" aria-label="{p.name} nach unten" disabled={i === players.length - 1} onclick={() => roster.move(p.id, i + 1)}>
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"></path></svg>
									</button>
									<button class="icon" type="button" aria-label="{p.name} umbenennen" onclick={() => edit(p)}>
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"></path><path d="M13.5 6.5l4 4"></path></svg>
									</button>
									<button class="icon danger" type="button" aria-label="{p.name} entfernen" onclick={() => roster.remove(p.id)}>
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13"></path></svg>
									</button>
								</span>
							{/if}
						</li>
					{/each}
				</ol>
			{:else}
				<div class="empty panel">
					<p class="empty-title">Noch keine Spieler</p>
					<p class="muted">Gib den ersten Namen ein. Alle Spiele nutzen diesen Kader.</p>
				</div>
			{/if}
		</section>
	</div>
</div>

<style>
	.hero {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding-block: 8px 4px;
	}

	.hero .muted {
		font-size: 17px;
	}

	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--gap);
	}

	.add {
		padding: 20px;
		gap: 12px;
	}

	.field {
		display: flex;
		gap: 10px;
	}

	.field input {
		flex: 1;
		min-width: 0;
		min-height: 54px;
		font-size: 17px;
	}

	.error {
		color: var(--imposter);
		font-weight: 600;
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
		flex-wrap: wrap;
		align-items: center;
		gap: 12px;
		min-height: 64px;
		padding: 8px 8px 8px 16px;
		border-radius: var(--radius);
		background: var(--surface);
		box-shadow: 0 4px 0 var(--shadow);
	}

	.rank {
		min-width: 22px;
		color: var(--muted);
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.name {
		flex: 1;
		min-width: 0;
		font-weight: 700;
		font-size: 18px;
		overflow-wrap: anywhere;
	}

	.tools,
	.rename {
		display: flex;
		gap: 6px;
	}

	.rename {
		flex: 1;
		min-width: 0;
	}

	.rename input {
		flex: 1;
		min-width: 0;
	}

	.wide {
		flex-basis: 100%;
		padding-left: 34px;
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

	.icon:active:not(:disabled) {
		transform: translateY(3px);
		box-shadow: 0 0 0 var(--shadow);
	}

	.icon:disabled {
		opacity: 0.35;
		cursor: default;
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

		.add {
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
