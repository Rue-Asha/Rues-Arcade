<script lang="ts">
	import { getDemo } from '#lib/demo/context.ts';
	import type { ScreenProps } from '#lib/games/registry.ts';
	import { pulse } from '#lib/motion.ts';
	import { play } from '#lib/sound.ts';
	import Button from '#lib/ui/Button.svelte';
	import Card from '#lib/ui/Card.svelte';
	import HoldToView from '#lib/ui/HoldToView.svelte';
	import Modal from '#lib/ui/Modal.svelte';
	import type { ImposterAction, ImposterState } from './engine.ts';

	let { state: game, dispatch }: ScreenProps = $props();

	const s = $derived(game as ImposterState);
	const current = $derived(s.players[s.revealIndex]);
	const revealing = $derived(s.phase === 'handover' || s.phase === 'view');

	let skipping = $state(false);

	function act(type: ImposterAction['type']) {
		dispatch({ type });
	}

	function reveal() {
		play('reveal');
		act('reveal');
	}

	function skip() {
		skipping = false;
		act('skip');
	}

	// the Modal's button carries the same action, so a demo would have two expected controls
	function askSkip() {
		if (getDemo() !== null) skip();
		else skipping = true;
	}
</script>

<div class="split">
	<section class="stack" aria-live="polite">
		{#if s.phase === 'handover'}
			<Card tone="imposter_pairs">
				<p class="label">Spieler {s.revealIndex + 1} / {s.players.length}</p>
				<h2 class="big">Gib das Handy an {current.name}</h2>
				<p class="muted">Nur {current.name} schaut hin, alle anderen wenden den Blick ab.</p>
				<div class="row">
					<Button variant="primary" action="handover" onclick={() => act('handover')}>
						{current.name} ist bereit
					</Button>
				</div>
			</Card>
		{:else if s.phase === 'view'}
			<div class="stack tight">
				<p class="label">{current.name}, deine Frage</p>
				<HoldToView action="seen" label="Gedrückt halten" onrelease={() => act('seen')}>
					<p class="question" data-testid="question">
						{s.revealIndex === s.imposterIndex ? s.imposter : s.crew}
					</p>
				</HoldToView>
				<p class="muted">Merk dir die Frage. Beim Loslassen ist die nächste Person dran.</p>
			</div>
		{:else if s.phase === 'crew'}
			<Card tone="imposter_pairs">
				{#if !s.shown}
					<p class="label">Alle haben ihre Frage gesehen</p>
					<h2 class="big">Beantwortet sie reihum laut</h2>
					<p class="muted">Danach deckt ihr gemeinsam die Frage der Crew auf.</p>
					<div class="row">
						<Button variant="primary" action="reveal" onclick={reveal}>Crew-Frage aufdecken</Button>
					</div>
				{:else}
					<p class="label">Die Crew-Frage war …</p>
					<p class="question" use:pulse>{s.crew}</p>
					<p class="muted">Wessen Antwort passte nicht dazu? Diskutiert, dann kommt die Auflösung.</p>
					<div class="row">
						<Button variant="primary" action="unmask" onclick={() => act('unmask')}>
							Weiter zum Imposter
						</Button>
					</div>
				{/if}
			</Card>
		{:else if !s.shown}
			<Card tone="imposter_pairs">
				<p class="label">Auflösung</p>
				<h2 class="big">Wer war der Imposter?</h2>
				<p class="muted">Zeigt alle gleichzeitig auf euren Verdacht, dann deckt auf.</p>
				<div class="row">
					<Button variant="primary" action="reveal" onclick={reveal}>Imposter aufdecken</Button>
				</div>
			</Card>
		{:else}
			<div class="reveal" use:pulse>
				<p class="label">Der Imposter war …</p>
				<p class="reveal-word" data-testid="unmasked">{s.players[s.imposterIndex].name}</p>
				<p class="secret">Die andere Frage: {s.imposter}</p>
			</div>
			<div class="row">
				<Button variant="primary" action="nextRound" onclick={() => act('nextRound')}>Nächste Runde</Button>
			</div>
		{/if}
	</section>

	<aside class="panel stack tight">
		<div class="head">
			{#if revealing}
				<Button variant="ghost" size="sm" action="skip" onclick={askSkip}>Überspringen</Button>
			{/if}
		</div>
		<ol class="order" aria-label="Reihenfolge">
			{#each s.players as p, i (p.id)}
				{@const done = !revealing || i < s.revealIndex}
				<li class:done class:now={revealing && i === s.revealIndex}>
					<span class="dot" aria-hidden="true">
						{#if done}
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
						{:else}
							{i + 1}
						{/if}
					</span>
					<span>{p.name}</span>
				</li>
			{/each}
		</ol>
	</aside>
</div>

<Modal open={skipping} title="Frage überspringen?" onclose={() => (skipping = false)}>
	<p class="muted">
		Die Frage wird verworfen und durch eine neue ersetzt. Die Reihe beginnt wieder bei
		{s.players[0].name}.
	</p>
	<div class="row">
		<Button variant="primary" action="skip" onclick={skip}>Überspringen</Button>
		<Button variant="ghost" onclick={() => (skipping = false)}>Abbrechen</Button>
	</div>
</Modal>

<style>
	.label {
		color: var(--imposter);
	}

	.reveal .label {
		color: inherit;
	}

	.tight {
		gap: 12px;
	}

	.big {
		font-size: clamp(26px, 5vw, 34px);
		overflow-wrap: anywhere;
	}

	.question {
		font-weight: 800;
		font-size: clamp(22px, 4.6vw, 30px);
		line-height: 1.2;
		letter-spacing: -0.01em;
		overflow-wrap: anywhere;
	}

	.reveal-word {
		color: var(--ink);
	}

	.secret {
		max-width: 36ch;
		font-weight: 600;
	}

	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		min-height: 46px;
	}

	.order {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.order li {
		display: flex;
		align-items: center;
		gap: 12px;
		min-height: 44px;
		padding: 0 12px;
		border-radius: var(--radius-sm);
		background: var(--raised);
		color: var(--muted);
		font-weight: 600;
		overflow-wrap: anywhere;
	}

	.order .now {
		color: var(--text);
		box-shadow: inset 3px 0 0 var(--imposter);
	}

	.dot {
		display: grid;
		place-items: center;
		flex: none;
		width: 26px;
		height: 26px;
		border-radius: 8px;
		border: 2px solid var(--line);
		font-size: 13px;
		font-weight: 700;
	}

	.done .dot {
		border-color: var(--primary);
		background: var(--primary);
		color: var(--on-primary);
	}

	.now .dot {
		border-color: var(--imposter);
		color: var(--imposter-text);
	}
</style>
