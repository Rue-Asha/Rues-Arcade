<script lang="ts">
	import { characters } from './characters.ts';
	import CharacterIcon from './CharacterIcon.svelte';
	import { counts, required } from './setup.ts';
	import type { CharacterId, Seat, Team } from './types.ts';

	interface Props {
		seats: Seat[];
		picked: number | null;
		pending: CharacterId | null;
		onpick: (id: CharacterId) => void;
	}

	let { seats, picked, pending, onpick }: Props = $props();

	const teams: { team: Team; title: string }[] = [
		{ team: 'townsfolk', title: 'Townsfolk' },
		{ team: 'outsider', title: 'Outsider' },
		{ team: 'minion', title: 'Minions' },
		{ team: 'demon', title: 'Dämon' }
	];

	const have = $derived(counts(seats));
	const need = $derived(
		required(
			seats.length,
			seats.some((s) => s.character === 'baron')
		)
	);
	const seatOf = (id: CharacterId) => seats.findIndex((s) => s.character === id);
</script>

<div class="teams">
	{#each teams as t (t.team)}
		{@const over = have[t.team] > need[t.team]}
		<section class="team {t.team}" data-team={t.team} aria-labelledby="board-{t.team}">
			<h3 id="board-{t.team}">
				{t.title}
				<span class="count" class:over data-testid="count-{t.team}">{have[t.team]} / {need[t.team]}</span>
				{#if over}<span class="over-text">zu viele</span>{/if}
			</h3>
			<ul>
				{#each characters.filter((c) => c.team === t.team) as c (c.id)}
					{@const at = seatOf(c.id)}
					<li>
						<button
							type="button"
							class="char"
							class:pending={pending === c.id}
							data-character={c.id}
							disabled={at >= 0 && at !== picked}
							aria-pressed={pending === c.id || (at >= 0 && at === picked)}
							onclick={() => onpick(c.id)}
						>
							<CharacterIcon id={c.id} size={26} />
							<span class="name">{c.name}</span>
							{#if at >= 0}<span class="at">Platz {at + 1}</span>{/if}
						</button>
					</li>
				{/each}
			</ul>
		</section>
	{/each}
</div>

<style>
	.teams {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 16px;
	}

	h3 {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 4px 10px;
		margin-bottom: 6px;
		font-size: 20px;
	}

	.count {
		font-family: var(--font-num);
		font-size: 18px;
		color: var(--muted);
	}

	.count.over,
	.over-text {
		color: var(--evil);
	}

	.over-text {
		font-family: var(--font-ui);
		font-size: 16px;
		font-weight: 700;
	}

	ul {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.char {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		min-height: 48px;
		padding: 4px 10px;
		border: 2px solid var(--line);
		border-radius: var(--radius-sm);
		background: var(--raised);
		color: var(--text);
		font: inherit;
		font-size: 16px;
		font-weight: 600;
		line-height: 1.1;
		text-align: left;
		cursor: pointer;
		touch-action: manipulation;
	}

	.name {
		min-width: 0;
		flex: 1;
		overflow-wrap: anywhere;
	}

	.at {
		flex: none;
		font-size: 14px;
		font-weight: 700;
		color: var(--muted);
	}

	.char[aria-pressed='true'] {
		border-color: var(--clocktower);
		background: var(--clocktower-tint);
	}

	.char:disabled {
		cursor: not-allowed;
		opacity: 0.7;
	}

	.char:focus-visible {
		outline: 3px solid var(--gold);
		outline-offset: 2px;
	}
</style>
