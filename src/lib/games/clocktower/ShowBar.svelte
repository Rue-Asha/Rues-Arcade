<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import { byId, characters } from './characters.ts';
	import { info } from './info.ts';
	import ShowCard, { type Card } from './ShowCard.svelte';
	import type { CharacterId, ClocktowerAction, ClocktowerState, NightStep } from './types.ts';

	interface Props {
		state: ClocktowerState;
		dispatch: (action: ClocktowerAction) => void;
		step: NightStep;
	}

	let { state: s, dispatch, step }: Props = $props();

	type Item = 'character' | 'demon' | 'minions' | 'bluffs' | 'youare' | 'number' | 'yes' | 'no';

	const items: [Item, string][] = [
		['character', 'Charakter'],
		['demon', 'Das ist der Dämon'],
		['minions', 'Deine Minions'],
		['bluffs', 'Bluffs'],
		['youare', 'Du bist'],
		['number', 'Zahl'],
		['yes', 'Ja'],
		['no', 'Nein']
	];

	// what the role needs: the item and its value, from the true info (the storyteller can change both)
	const plan = $derived.by((): { item: Item | null; character: string; youare: string; number: string } => {
		const none = { item: null, character: '', youare: '', number: '' };
		const i = info(s, step);
		switch (step.kind) {
			case 'washerwoman':
			case 'investigator':
				return i.kind === 'pair' ? { ...none, item: 'character', character: i.character } : { ...none, item: 'character' };
			case 'librarian':
				return i.kind === 'pair' ? { ...none, item: 'character', character: i.character } : { ...none, item: 'number', number: '0' };
			case 'chef':
			case 'empath':
				return { ...none, item: 'number', number: i.kind === 'number' ? String(i.n) : '' };
			case 'fortune-teller':
				return { ...none, item: 'yes' };
			case 'undertaker':
				return { ...none, item: 'character', character: i.kind === 'character' ? i.character : '' };
			case 'ravenkeeper':
				return { ...none, item: 'character' };
			case 'minion-info':
				return { ...none, item: 'demon' };
			case 'demon-info':
				return { ...none, item: 'minions' };
			case 'new-imp':
				return { ...none, item: 'youare', youare: 'imp' };
		}
		return none;
	});

	let picked = $state<Item | null>(null);
	let chosen = $state({ character: null as string | null, youare: null as string | null, number: null as string | null });
	let card = $state<Card | null>(null);
	let seen = $state(false);

	const item = $derived(picked ?? plan.item);
	const character = $derived(chosen.character ?? plan.character);
	const youare = $derived(chosen.youare ?? plan.youare);
	const number = $derived(chosen.number ?? plan.number);
	const value = $derived(item === 'character' ? character : item === 'youare' ? youare : item === 'number' ? number : 'ok');

	function show() {
		switch (item) {
			case 'character':
			case 'youare':
				card = { kind: item, character: value as CharacterId };
				break;
			case 'number':
				card = { kind: 'number', n: Number(number) };
				break;
			case 'bluffs':
				card = { kind: 'bluffs', bluffs: s.bluffs };
				seen = true;
				break;
			case 'demon':
			case 'minions':
			case 'yes':
			case 'no':
				card = { kind: item };
				break;
		}
	}

	function close() {
		// the Demon sees their Minions, then the bluffs
		if (card?.kind === 'minions') picked = 'bluffs';
		card = null;
	}
</script>

<div class="bar" data-testid="show-bar" role="group" aria-label="Zeigen">
	<div class="chips">
		{#each items as [id, name] (id)}
			<button type="button" class="chip" aria-pressed={item === id} onclick={() => (picked = id)}>{name}</button>
		{/each}
	</div>
	<div class="act">
		{#if item === 'character' || item === 'youare'}
			<select
				aria-label={item === 'character' ? 'Charakter' : 'Du bist'}
				value={value}
				onchange={(e) => (chosen[item] = e.currentTarget.value)}
			>
				{#if value === ''}<option value="">Wählen</option>{/if}
				{#each characters as c (c.id)}<option value={c.id}>{c.name}</option>{/each}
			</select>
		{:else if item === 'number'}
			<select aria-label="Zahl" value={number} onchange={(e) => (chosen.number = e.currentTarget.value)}>
				{#if number === ''}<option value="">Wählen</option>{/if}
				{#each Array.from({ length: 10 }, (_, n) => String(n)) as n (n)}<option value={n}>{n}</option>{/each}
			</select>
		{:else if item === 'bluffs'}
			<p class="bluffs" data-testid="bluffs">{s.bluffs.map((id) => byId[id].name).join(' · ')}</p>
			<Button variant="secondary" size="sm" disabled={seen} onclick={() => dispatch({ type: 'bluffs' })}>Neu würfeln</Button>
		{/if}
		<Button variant="secondary" size="sm" disabled={item === null || value === ''} onclick={show}>Zeigen</Button>
	</div>
</div>

{#if card}<ShowCard {card} onclose={close} />{/if}

<style>
	.bar {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.chips,
	.act {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
	}

	.chip {
		min-width: 44px;
		min-height: 44px;
		padding: 0 12px;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: var(--raised);
		color: var(--text);
		font: 600 15px/1.1 var(--font-ui);
		cursor: pointer;
		touch-action: manipulation;
	}

	.chip[aria-pressed='true'] {
		border-color: var(--gold);
		background: var(--gold-tint);
		box-shadow: inset 0 0 0 1px var(--gold);
	}

	select {
		min-height: 46px;
		max-width: 100%;
		padding: 0 12px;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: var(--raised);
		color: var(--text);
		font: 600 15px/1.1 var(--font-ui);
	}

	.bluffs {
		flex: 1 1 100%;
		margin: 0;
		color: var(--text-soft);
		overflow-wrap: anywhere;
	}
</style>
