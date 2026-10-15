<script module lang="ts">
	import type { CharacterId } from './types.ts';

	export type Card =
		| { kind: 'character'; character: CharacterId }
		| { kind: 'demon' }
		| { kind: 'minions' }
		| { kind: 'bluffs'; bluffs: CharacterId[] }
		| { kind: 'youare'; character: CharacterId }
		| { kind: 'number'; n: number }
		| { kind: 'yes' }
		| { kind: 'no' };
</script>

<script lang="ts">
	import { byId } from './characters.ts';
	import CharacterIcon from './CharacterIcon.svelte';

	interface Props {
		card: Card;
		onclose: () => void;
	}

	let { card, onclose }: Props = $props();

	function key(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose();
	}
</script>

<svelte:window onkeydown={key} />

<button type="button" class="disc" data-testid="show-card" aria-label="Karte, tippen zum Schließen" onclick={onclose}>
	{#if card.kind === 'character'}
		<CharacterIcon id={card.character} size={40} />
		<span class="name">{byId[card.character].name}</span>
	{:else if card.kind === 'demon'}
		<span class="phrase">Das ist der Dämon</span>
	{:else if card.kind === 'minions'}
		<span class="phrase">Deine Minions</span>
	{:else if card.kind === 'bluffs'}
		{#each card.bluffs as id (id)}
			<span class="row"><CharacterIcon {id} size={24} /><span class="bluff">{byId[id].name}</span></span>
		{/each}
	{:else if card.kind === 'youare'}
		<span class="lead">Du bist</span>
		<CharacterIcon id={card.character} size={40} />
		<span class="name">{byId[card.character].name}</span>
	{:else if card.kind === 'number'}
		<span class="digit">{card.n}</span>
	{:else}
		<span class="yesno">{card.kind === 'yes' ? 'Ja' : 'Nein'}</span>
	{/if}
</button>

<style>
	.disc {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
		width: 100%;
		height: 100%;
		padding: 0;
		border: 1px solid var(--line);
		border-radius: 50%;
		background: var(--raised);
		color: var(--text);
		cursor: pointer;
		touch-action: manipulation;
	}

	.name,
	.phrase {
		font: 400 20px/1.2 var(--font-display);
	}

	.phrase {
		max-width: 8em;
		text-wrap: balance;
	}

	.lead {
		font: 600 16px/1.2 var(--font-ui);
		color: var(--text-soft);
	}

	.row {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.bluff {
		font: 400 16px/1.25 var(--font-display);
	}

	.digit {
		font: 400 96px/1 var(--font-num);
	}

	.yesno {
		font: 400 40px/1.1 var(--font-display);
	}
</style>
