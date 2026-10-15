<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '#lib/ui/Button.svelte';
	import Modal from '#lib/ui/Modal.svelte';
	import { byId } from './characters.ts';
	import { who } from './label.ts';
	import type { ClocktowerAction, ClocktowerState, Question } from './types.ts';

	interface Props {
		state: ClocktowerState;
		dispatch: (action: ClocktowerAction) => void;
		question?: Question | null;
		peek?: Snippet;
	}

	let { state: s, dispatch, question = null, peek }: Props = $props();

	const asks: Record<Question['kind'], string> = {
		'scarlet-woman': 'Wurde die Scarlet Woman zum Dämon?',
		saint: 'Wirkte seine Fähigkeit?',
		mayor: 'Mayor-Sieg?'
	};
	let declaring = $state(false);

	function declare(winner: 'good' | 'evil') {
		declaring = false;
		dispatch({ type: 'declare', winner });
	}
</script>

{#if question}
	<section class="panel stack ask" aria-labelledby="ask">
		<span class="label">Nur für dich</span>
		<h2 id="ask">{asks[question.kind]}</h2>
		<p class="muted">{byId[question.kind].name} · {who(s.seats, question.seat)}</p>
	</section>
{:else}
	<section class="panel stack ask" aria-labelledby="phase">
		<h2 id="phase">Alle schlafen ein</h2>
		<p class="muted">Alle schließen die Augen.</p>
	</section>
{/if}

<div class="row decide">
	<Button variant="ghost" size="sm" onclick={() => (declaring = true)}>Spiel ist entschieden</Button>
</div>

{@render peek?.()}

{#if question}
	<div class="row answer">
		<Button variant="primary" onclick={() => dispatch({ type: 'answer', yes: true })}>Ja</Button>
		<Button variant="secondary" onclick={() => dispatch({ type: 'answer', yes: false })}>Nein</Button>
	</div>
{:else}
	<div class="row answer">
		<Button variant="primary" onclick={() => dispatch({ type: 'next' })}>Weiter</Button>
	</div>
{/if}

<Modal open={declaring} title="Spiel ist entschieden" onclose={() => (declaring = false)}>
	<p class="muted">Wer hat gewonnen? Das Spiel endet sofort.</p>
	<div class="row">
		<Button variant="secondary" onclick={() => declare('good')}>Gut</Button>
		<Button variant="danger" onclick={() => declare('evil')}>Böse</Button>
	</div>
</Modal>

<style>
	.ask {
		padding: 20px;
		align-items: center;
		text-align: center;
	}

	.ask h2,
	.ask p {
		margin: 0;
		max-width: 36ch;
		text-wrap: balance;
	}

	.decide,
	.answer {
		justify-content: center;
	}
</style>
