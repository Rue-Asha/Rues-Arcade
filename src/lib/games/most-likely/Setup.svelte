<script lang="ts">
	import type { SetupProps } from '#lib/games/registry.ts';
	import Button from '#lib/ui/Button.svelte';
	import {
		DEFAULT_ROUNDS,
		MIN_TEAMS,
		MIN_TEAM_SIZE,
		ROUND_OPTIONS,
		dealTeams,
		maxTeams,
		type MostLikelyConfig
	} from './engine.ts';

	let { players, onstart }: SetupProps = $props();

	const most = $derived(maxTeams(players.length));
	const list = (names: string[]) => new Intl.ListFormat('de').format(names);

	let rounds = $state<MostLikelyConfig['rounds']>(DEFAULT_ROUNDS);
	// team index per player id; changing the team count deals everyone out again
	let seat = $state<Record<string, number>>({});
	let count = $state(0);

	function deal(n: number, order = players) {
		count = n;
		seat = Object.fromEntries(dealTeams(order, n).flatMap((team, t) => team.map((p) => [p.id, t])));
	}

	$effect.pre(() => {
		if (count === 0) deal(MIN_TEAMS);
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
	const small = $derived(teams.flatMap((team, t) => (team.length < MIN_TEAM_SIZE ? [`Team ${t + 1}`] : [])));
	const sizes = $derived(teams.map((t) => t.length));
	const uneven = $derived(Math.max(...sizes) - Math.min(...sizes) > 1);

	function start() {
		onstart({ teams: teams.map((t) => t.map((p) => p.id)), rounds } satisfies MostLikelyConfig);
	}
</script>

<div class="stack">
	<section class="panel stack" aria-labelledby="teams">
		<div class="head">
			<h2 id="teams">Teams</h2>
			<div class="count" role="group" aria-label="Anzahl Teams">
				<button type="button" class="step" aria-label="Weniger Teams" disabled={count <= MIN_TEAMS} onclick={() => deal(count - 1)}>−</button>
				<span class="n" aria-live="polite">{count}</span>
				<button type="button" class="step" aria-label="Mehr Teams" disabled={count >= most} onclick={() => deal(count + 1)}>+</button>
			</div>
		</div>
		<p class="muted">Tippe auf einen Namen, um ihn ins nächste Team zu schieben. Pro Team mind. {MIN_TEAM_SIZE} Spieler.</p>
		<div class="teams rise">
			{#each teams as team, t (t)}
				{@const off = team.length < MIN_TEAM_SIZE}
				<div class="team" class:off role="group" aria-label="Team {t + 1}">
					<div class="team-head">
						<span class="label">Team {t + 1}</span>
						<span class="size">{team.length} Spieler</span>
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
		{#if uneven}
			<p class="muted" data-testid="uneven">Die Teams sind unterschiedlich groß. Ein größeres Team kann mehr Punkte holen.</p>
		{/if}
	</section>

	<section class="panel stack" aria-labelledby="rounds">
		<div class="head">
			<h2 id="rounds">Runden</h2>
			<p class="muted">Eine Runde: jedes Team ist einmal dran.</p>
		</div>
		<div class="seg" role="group" aria-labelledby="rounds">
			{#each ROUND_OPTIONS as r (r)}
				<button type="button" class="opt" aria-pressed={rounds === r} onclick={() => (rounds = r)}>{r}</button>
			{/each}
		</div>
	</section>

	{#if small.length > 0}
		<p class="hint" role="alert">{list(small)} {small.length > 1 ? 'brauchen' : 'braucht'} mind. {MIN_TEAM_SIZE} Spieler.</p>
	{/if}
	<div class="row">
		<Button variant="primary" disabled={small.length > 0} onclick={start}>Los geht's</Button>
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

	.step:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.n {
		min-width: 28px;
		font-weight: 800;
		font-size: 20px;
		font-variant-numeric: tabular-nums;
		text-align: center;
		color: var(--most-likely);
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
		background: var(--most-likely-tint);
		box-shadow:
			inset 0 3px 0 var(--most-likely),
			0 4px 0 var(--most-likely-ledge);
	}

	.team .label {
		color: var(--most-likely);
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
		font-size: 16px;
		min-width: 56px;
	}

	.opt[aria-pressed='true'] {
		background: var(--most-likely);
		border-color: var(--most-likely);
		color: var(--ink);
		box-shadow: 0 4px 0 var(--most-likely-ledge);
	}

	.hint {
		color: var(--imposter);
		font-weight: 600;
	}
</style>
