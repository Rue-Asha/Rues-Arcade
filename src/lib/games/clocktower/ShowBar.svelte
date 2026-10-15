<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import { characters } from './characters.ts';
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

	const items: [Item, string, string][] = [
		['character', 'Charakter', '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'],
		['demon', 'Das ist der Dämon', '<path d="M5 3c1 4 3 5 7 5s6-1 7-5v9a7 7 0 0 1-14 0z"/><path d="M9 13h.01M15 13h.01"/>'],
		['minions', 'Deine Minions', '<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2 20a6 6 0 0 1 12 0M15 15a5 5 0 0 1 7 5"/>'],
		['bluffs', 'Bluffs', '<rect x="3" y="6" width="11" height="15" rx="2"/><path d="M17 4l4 1-3 14"/>'],
		['youare', 'Du bist', '<path d="M12 3v13M6 11l6 6 6-6M5 21h14"/>'],
		['number', 'Zahl', '<path d="M9 4L7 20M17 4l-2 16M4 9h17M3 15h17"/>'],
		['yes', 'Ja', '<path d="M4 12l5 5L20 6"/>'],
		['no', 'Nein', '<path d="M5 5l14 14M19 5L5 19"/>']
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
			case 'scarlet-woman':
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
	<div class="pill">
		{#each items as [id, name, icon] (id)}
			<button type="button" class="seg" aria-pressed={item === id} title={name} onclick={() => (picked = id)}>
				<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{@html icon}</svg>
				<span class="sr">{name}</span>
			</button>
		{/each}
	</div>
	<div class="act">
		<span class="now">{items.find(([id]) => id === item)?.[1] ?? 'Zeigen'}</span>
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
			<Button variant="secondary" size="sm" disabled={seen} onclick={() => dispatch({ type: 'bluffs' })}>Neu würfeln</Button>
		{/if}
		<Button variant="secondary" size="sm" disabled={item === null || value === ''} onclick={show}>Zeigen</Button>
	</div>
</div>

{#if card}<ShowCard {card} onclose={close} />{/if}

<style>
	.bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	.pill {
		display: flex;
		overflow: hidden;
		border: 1px solid var(--line);
		border-radius: 999px;
		background: var(--raised);
	}

	.seg {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		padding: 0;
		border: 0;
		border-radius: 999px;
		background: transparent;
		color: var(--text);
		cursor: pointer;
		touch-action: manipulation;
	}

	.seg[aria-pressed='true'] {
		background: var(--gold-tint);
		color: var(--gold);
		box-shadow: inset 0 0 0 1.5px var(--gold);
	}

	.act {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 0;
	}

	.now {
		font: 700 13px/1.15 var(--font-ui);
		color: var(--text-soft);
		text-align: center;
		max-width: 9ch;
	}

	select {
		min-height: 44px;
		min-width: 0;
		max-width: 100%;
		padding: 0 12px;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: var(--raised);
		color: var(--text);
		font: 600 15px/1.1 var(--font-ui);
	}

	.sr {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}
</style>
