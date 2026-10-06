<script lang="ts">
	import { onMount } from 'svelte';
	import type { Survey } from '#lib/content/types.ts';
	import type { SetupProps } from '#lib/games/registry.ts';
	import Button from '#lib/ui/Button.svelte';
	import Prep from './Prep.svelte';

	let { players, onstart }: SetupProps = $props();

	const MIN_TEAM = 2;
	const DEFAULTS = ['Team A', 'Team B'];
	const ROUND_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

	let surveys = $state<Survey[]>([]);
	let loaded = $state(false);
	let step = $state<'teams' | 'prep'>('teams');
	let rounds = $state(3);
	let names = $state(['Team A', 'Team B']);
	// team index per player id
	let seat = $state<Record<string, number>>({});

	onMount(async () => {
		const res = await fetch('/api/content/feud_surveys');
		if (res.ok) surveys = await res.json();
		loaded = true;
	});

	function deal(order = players) {
		seat = Object.fromEntries(order.map((p, i) => [p.id, i % 2]));
	}

	$effect.pre(() => {
		if (Object.keys(seat).length === 0) deal();
	});

	function shuffle() {
		const order = [...players];
		for (let i = order.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[order[i], order[j]] = [order[j], order[i]];
		}
		deal(order);
	}

	const sides = $derived([0, 1].map((t) => players.filter((p) => seat[p.id] === t)));
	const final = $derived(names.map((n, i) => n.trim() || DEFAULTS[i]));
	const small = $derived(sides.some((t) => t.length < MIN_TEAM));
	const same = $derived(final[0].toLocaleLowerCase('de') === final[1].toLocaleLowerCase('de'));
	const needed = $derived(rounds + 1);
	const short = $derived(loaded && surveys.length < needed);
	const blocked = $derived(small || same || short || !loaded);
</script>

{#if step === 'teams'}
	<div class="stack">
		<section class="panel stack" aria-labelledby="teams">
			<h2 id="teams">Teams</h2>
			<p class="muted">Tippe auf einen Namen, um ihn ins andere Team zu schieben.</p>
			<div class="teams rise">
				{#each sides as side, t (t)}
					<div class="team" class:off={side.length < MIN_TEAM} role="group" aria-label="Team {t + 1}">
						<input
							class="name"
							aria-label="Name von Team {t + 1}"
							placeholder={DEFAULTS[t]}
							maxlength="30"
							bind:value={names[t]}
						/>
						<span class="size">{side.length} Spieler</span>
						<div class="chips">
							{#each side as p (p.id)}
								<button type="button" class="chip" title="Zu Team {2 - t}" onclick={() => (seat[p.id] = 1 - t)}>{p.name}</button>
							{/each}
						</div>
					</div>
				{/each}
			</div>
			<div class="row">
				<Button variant="secondary" size="sm" onclick={shuffle}>Mischen</Button>
			</div>
		</section>

		<section class="panel stack" aria-labelledby="rounds">
			<div class="head">
				<h2 id="rounds">Runden</h2>
				<p class="muted">Die letzte Runde zählt doppelt.</p>
			</div>
			<div class="seg" role="group" aria-labelledby="rounds">
				{#each ROUND_OPTIONS as r (r)}
					<button type="button" class="opt" aria-pressed={rounds === r} onclick={() => (rounds = r)}>{r}</button>
				{/each}
			</div>
		</section>

		{#if small}
			<p class="hint" role="alert">Jedes Team braucht mind. {MIN_TEAM} Spieler.</p>
		{/if}
		{#if same}
			<p class="hint" role="alert">Die Teams brauchen verschiedene Namen.</p>
		{/if}
		{#if short}
			<p class="hint" role="alert">
				Für {rounds}
				{rounds === 1 ? 'Runde' : 'Runden'} braucht ihr mind. {needed} Umfragen, es gibt {surveys.length}.
				<a href="/spiele/family-feud/inhalte">Umfragen anlegen</a>
			</p>
		{/if}
		<div class="row">
			<Button variant="primary" disabled={blocked} onclick={() => (step = 'prep')}>Weiter</Button>
		</div>
	</div>
{:else}
	<Prep
		teams={[
			{ name: final[0], players: sides[0].map((p) => p.id) },
			{ name: final[1], players: sides[1].map((p) => p.id) }
		]}
		players={players}
		{rounds}
		{surveys}
		{onstart}
		onback={() => (step = 'teams')}
	/>
{/if}

<style>
	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 8px 16px;
	}

	.opt,
	.chip {
		border: 1px solid var(--line);
		background: var(--raised);
		box-shadow: 0 4px 0 var(--shadow);
		font-weight: 700;
		cursor: pointer;
		user-select: none;
		touch-action: manipulation;
		transition:
			transform 0.07s ease-out,
			box-shadow 0.07s ease-out;
	}

	.opt {
		display: grid;
		place-items: center;
		min-width: 48px;
		min-height: 48px;
		border-radius: var(--radius);
		font-size: 16px;
	}

	.opt:active,
	.chip:active {
		transform: translateY(4px);
		box-shadow: 0 0 0 transparent;
	}

	.opt[aria-pressed='true'] {
		background: var(--feud);
		border-color: var(--feud);
		color: var(--ink);
		box-shadow: 0 4px 0 var(--feud-ledge);
	}

	.teams {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr));
		gap: 12px;
	}

	.team {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 14px;
		border-radius: var(--radius-lg);
		background: var(--feud-tint);
		box-shadow:
			inset 0 3px 0 var(--feud),
			0 4px 0 var(--feud-ledge);
	}

	.team.off {
		box-shadow:
			inset 0 3px 0 var(--imposter),
			0 4px 0 var(--imposter-ledge);
	}

	.team.off .size {
		color: var(--imposter-text);
		font-weight: 700;
	}

	.name {
		font-weight: 700;
	}

	.size {
		color: var(--muted);
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		min-height: 48px;
	}

	.chip {
		min-height: 44px;
		padding: 0 14px;
		border-radius: var(--radius-sm);
		overflow-wrap: anywhere;
	}

	.hint {
		color: var(--imposter);
		font-weight: 600;
	}

	.hint a {
		display: inline-block;
		min-height: 44px;
		padding-block: 10px;
		color: var(--gold);
	}
</style>
