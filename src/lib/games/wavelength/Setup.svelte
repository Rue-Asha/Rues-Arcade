<script lang="ts">
	import type { SetupProps } from '#lib/games/registry.ts';
	import Button from '#lib/ui/Button.svelte';
	import {
		DEFAULT_ROUNDS,
		MAX_TEAMS,
		MAX_TEAM_SIZE,
		MIN_TEAMS,
		MIN_TEAM_SIZE,
		MIN_VERSUS_PLAYERS,
		ROUND_OPTIONS,
		type WavelengthConfig,
		type WavelengthMode
	} from './engine.ts';

	let { players, onstart }: SetupProps = $props();

	const fewest = $derived(Math.max(MIN_TEAMS, Math.ceil(players.length / MAX_TEAM_SIZE)));
	const most = $derived(Math.min(MAX_TEAMS, Math.floor(players.length / MIN_TEAM_SIZE)));

	const versusOk = $derived(players.length >= MIN_VERSUS_PLAYERS);
	// the lobby remounts Setup whenever the chosen players change, so the default is read once
	// svelte-ignore state_referenced_locally
	let mode = $state<WavelengthMode>(players.length >= MIN_VERSUS_PLAYERS ? 'versus' : 'koop');
	let rounds = $state(DEFAULT_ROUNDS);
	// team index per player id; changing the team count deals everyone out again
	let seat = $state<Record<string, number>>({});
	let count = $state(0);

	function deal(n: number, order = players) {
		count = n;
		seat = Object.fromEntries(order.map((p, i) => [p.id, i % n]));
	}

	$effect.pre(() => {
		if (count === 0 && versusOk) deal(fewest);
	});

	function shuffle() {
		const order = [...players];
		for (let i = order.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[order[i], order[j]] = [order[j], order[i]];
		}
		deal(count, order);
	}

	function move(id: string) {
		seat[id] = (seat[id] + 1) % count;
	}

	const teams = $derived(Array.from({ length: count }, (_, t) => players.filter((p) => seat[p.id] === t)));
	const valid = $derived(
		mode === 'koop' || teams.every((t) => t.length >= MIN_TEAM_SIZE && t.length <= MAX_TEAM_SIZE)
	);

	function start() {
		const config: WavelengthConfig =
			mode === 'koop'
				? { mode, teams: [players.map((p) => p.id)], rounds }
				: { teams: teams.map((t) => t.map((p) => p.id)), rounds };
		onstart(config);
	}
</script>

<div class="stack">
	<section class="panel stack" aria-labelledby="mode">
		<h2 id="mode">Spielmodus</h2>
		<div class="seg" role="group" aria-labelledby="mode">
			<button type="button" class="opt wide" aria-pressed={mode === 'koop'} onclick={() => (mode = 'koop')}>Koop</button>
			<button type="button" class="opt wide" aria-pressed={mode === 'versus'} disabled={!versusOk} onclick={() => (mode = 'versus')}>Versus</button>
		</div>
		{#if !versusOk}
			<p class="muted">Versus braucht mind. {MIN_VERSUS_PLAYERS} Spieler.</p>
		{/if}
	</section>

	{#if mode === 'koop'}
		<section class="panel stack" aria-labelledby="order">
			<h2 id="order">Reihenfolge</h2>
			<p class="muted">Jede Person gibt pro Runde einmal den Hinweis, in dieser Reihenfolge.</p>
			<ol class="order rise" aria-labelledby="order">
				{#each players as p, i (p.id)}
					<li><span class="pos">{i + 1}</span>{p.name}</li>
				{/each}
			</ol>
		</section>
	{:else}
		<section class="panel stack" aria-labelledby="teams">
			<div class="head">
				<h2 id="teams">Teams</h2>
				<div class="count" role="group" aria-label="Anzahl Teams">
					<button type="button" class="step" aria-label="Weniger Teams" disabled={count <= fewest} onclick={() => deal(count - 1)}>−</button>
					<span class="n" aria-live="polite">{count}</span>
					<button type="button" class="step" aria-label="Mehr Teams" disabled={count >= most} onclick={() => deal(count + 1)}>+</button>
				</div>
			</div>
			<p class="muted">Tippe auf einen Namen, um ihn ins nächste Team zu schieben. Pro Team {MIN_TEAM_SIZE}–{MAX_TEAM_SIZE} Spieler.</p>
			<div class="teams rise">
				{#each teams as team, t (t)}
					{@const off = team.length < MIN_TEAM_SIZE || team.length > MAX_TEAM_SIZE}
					<div class="team" class:off role="group" aria-label="Team {t + 1}">
						<div class="team-head">
							<span class="label">Team {t + 1}</span>
							<span class="size">{team.length} / {MAX_TEAM_SIZE}</span>
						</div>
						<div class="chips">
							{#each team as p (p.id)}
								<button type="button" class="chip" title="Zu Team {((t + 1) % count) + 1}" onclick={() => move(p.id)}>{p.name}</button>
							{/each}
						</div>
					</div>
				{/each}
			</div>
			<div class="row">
				<Button variant="secondary" size="sm" onclick={shuffle}>Mischen</Button>
			</div>
		</section>
	{/if}

	<section class="panel stack" aria-labelledby="rounds">
		<div class="head">
			<h2 id="rounds">Runden</h2>
			<p class="muted">
				{mode === 'koop' ? 'Eine Runde: jede Person gibt einmal den Hinweis.' : 'Eine Runde: jedes Team ist einmal dran.'}
			</p>
		</div>
		<div class="seg" role="group" aria-labelledby="rounds">
			{#each ROUND_OPTIONS as r (r)}
				<button type="button" class="opt" aria-pressed={rounds === r} onclick={() => (rounds = r)}>{r}</button>
			{/each}
		</div>
	</section>

	{#if !valid}
		<p class="hint" role="alert">Jedes Team braucht {MIN_TEAM_SIZE}–{MAX_TEAM_SIZE} Spieler.</p>
	{/if}
	<div class="row">
		<Button variant="primary" disabled={!valid} onclick={start}>Los geht's</Button>
	</div>
</div>

<style>
	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 8px 16px;
	}

	.count {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.step,
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

	.step,
	.opt {
		display: grid;
		place-items: center;
		min-width: 48px;
		min-height: 48px;
		border-radius: var(--radius);
		font-size: 20px;
	}

	.step:active:not(:disabled),
	.opt:active:not(:disabled),
	.chip:active {
		transform: translateY(4px);
		box-shadow: 0 0 0 transparent;
	}

	.step:disabled,
	.opt:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.n {
		min-width: 28px;
		font-weight: 800;
		font-size: 20px;
		font-variant-numeric: tabular-nums;
		text-align: center;
		color: var(--wavelength);
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
		background: var(--wavelength-tint);
		box-shadow:
			inset 0 3px 0 var(--wavelength),
			0 4px 0 var(--wavelength-ledge);
	}

	.team .label {
		color: var(--wavelength);
	}

	.size {
		color: var(--muted);
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

	.team-head {
		display: flex;
		justify-content: space-between;
		gap: 8px;
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

	.seg {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.opt {
		font-size: 14px;
	}

	.opt.wide {
		padding: 0 22px;
		font-size: 16px;
	}

	.order {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.order li {
		display: flex;
		align-items: center;
		gap: 10px;
		min-height: 44px;
		padding: 0 14px 0 6px;
		border-radius: var(--radius-sm);
		background: var(--wavelength-tint);
		font-weight: 700;
		overflow-wrap: anywhere;
	}

	.pos {
		display: grid;
		place-items: center;
		min-width: 32px;
		min-height: 32px;
		border-radius: var(--radius-sm);
		background: var(--wavelength);
		color: var(--ink);
		font-variant-numeric: tabular-nums;
	}

	.opt[aria-pressed='true'] {
		background: var(--wavelength);
		border-color: var(--wavelength);
		color: var(--ink);
		box-shadow: 0 4px 0 var(--wavelength-ledge);
	}

	.hint {
		color: var(--imposter);
		font-weight: 600;
	}
</style>
