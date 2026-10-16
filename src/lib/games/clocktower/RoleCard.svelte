<script lang="ts">
	import { byId } from './characters.ts';
	import CharacterIcon from './CharacterIcon.svelte';
	import type { CharacterId, Team } from './types.ts';

	interface Props {
		character: CharacterId;
	}

	let { character }: Props = $props();

	const teams: Record<Team, string> = {
		townsfolk: 'Dorfbewohner',
		outsider: 'Außenseiter',
		minion: 'Scherge',
		demon: 'Dämon'
	};

	const c = $derived(byId[character]);
</script>

<article class="card {c.team}" data-testid="role-card">
	<CharacterIcon id={character} size={96} />
	<h2>{c.name}</h2>
	<p class="team">{teams[c.team]}</p>
	<p class="de">{c.de}</p>
	<p class="ability">{c.ability}</p>
</article>

<style>
	.card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 20px;
		border: 2px solid var(--good, var(--primary));
		border-radius: var(--radius-lg);
		background: var(--surface);
		text-align: center;
	}

	.outsider {
		border-color: var(--outsider, var(--gold));
	}

	.minion {
		border-color: var(--evil, var(--clocktower));
	}

	.demon {
		border-color: var(--demon, var(--clocktower));
	}

	h2 {
		margin: 0;
		font-family: var(--font-display, var(--font-ui));
	}

	p {
		margin: 0;
		overflow-wrap: anywhere;
	}

	.team {
		font-weight: 700;
		color: var(--muted);
	}

	.ability {
		font-style: italic;
		color: var(--text-soft);
	}
</style>
