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
	import RoleCard from './RoleCard.svelte';

	interface Props {
		card: Card;
		onclose: () => void;
	}

	let { card, onclose }: Props = $props();

	// top layer, so the card covers the viewport whatever the screen's transforms do
	function modal(node: HTMLDialogElement) {
		node.showModal();
		return {
			destroy() {
				if (node.open) node.close();
			}
		};
	}

	function cancel(e: Event) {
		e.preventDefault();
		onclose();
	}

	function key(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onclose();
		}
	}
</script>

<dialog data-testid="show-card" aria-label="Karte, tippen zum Schließen" use:modal oncancel={cancel} onclick={onclose} onkeydown={key}>
	{#if card.kind === 'character'}
		<div class="role"><RoleCard character={card.character} /></div>
	{:else if card.kind === 'demon'}
		<p class="word">Das ist der Dämon</p>
	{:else if card.kind === 'minions'}
		<p class="word">Deine Minions</p>
	{:else if card.kind === 'bluffs'}
		<p class="lead">Diese Charaktere sind nicht im Spiel</p>
		<ul>
			{#each card.bluffs as id (id)}
				<li><CharacterIcon {id} size={64} /><span class="name">{byId[id].name}</span></li>
			{/each}
		</ul>
	{:else if card.kind === 'youare'}
		<p class="lead">Du bist</p>
		<p class="word"><CharacterIcon id={card.character} size={96} /><span>{byId[card.character].name}</span></p>
	{:else if card.kind === 'number'}
		<p class="digit">{card.n}</p>
	{:else}
		<p class="word">{card.kind === 'yes' ? 'Ja' : 'Nein'}</p>
	{/if}
</dialog>

<style>
	dialog {
		position: fixed;
		inset: 0;
		width: 100%;
		height: 100%;
		max-width: none;
		max-height: none;
		margin: 0;
		padding: 24px;
		border: 0;
		background: var(--ground);
		color: var(--text);
		cursor: pointer;
		overflow: auto;
	}

	dialog[open] {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 24px;
		text-align: center;
	}

	dialog:focus {
		outline: none;
	}

	p {
		margin: 0;
	}

	.role {
		width: min(100%, 420px);
	}

	.lead {
		font-size: 22px;
		color: var(--text-soft);
	}

	.word {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		font: 400 clamp(36px, 11vw, 72px) / 1.1 var(--font-display);
		overflow-wrap: anywhere;
	}

	.digit {
		font: 400 min(60vw, 60vh, 320px) / 1 var(--font-num);
	}

	ul {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 24px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		min-width: 96px;
	}

	.name {
		font: 400 24px/1.2 var(--font-display);
	}
</style>
