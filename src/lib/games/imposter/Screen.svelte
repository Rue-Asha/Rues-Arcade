<script lang="ts">
	import { getDemo } from '#lib/demo/context.ts';
	import type { ScreenProps } from '#lib/games/registry.ts';
	import { play } from '#lib/sound.ts';
	import Button from '#lib/ui/Button.svelte';
	import GameFrame from '#lib/ui/GameFrame.svelte';
	import Handoff from '#lib/ui/Handoff.svelte';
	import HoldToView from '#lib/ui/HoldToView.svelte';
	import Modal from '#lib/ui/Modal.svelte';
	import Reveal from '#lib/ui/Reveal.svelte';
	import type { PairPlayed } from '#lib/content/types.ts';
	import type { ImposterAction, ImposterState } from './engine.ts';
	import { history, knownBy } from './played.svelte.ts';

	let { state: game, dispatch }: ScreenProps = $props();

	const s = $derived(game as ImposterState);
	const current = $derived(s.players[s.revealIndex]);
	const revealing = $derived(s.phase === 'handover' || s.phase === 'view');

	let skipping = $state(false);
	let played = $state<PairPlayed[] | null>(null);

	// the fetch is a side effect, so it runs here and not in a derived
	$effect(() => {
		if (getDemo() === null) played = history(s.rng.state);
	});

	const known = $derived(played === null || getDemo() !== null ? null : knownBy(s.players, played, s.pairId));
	const asking = $derived(known !== null && (revealing || (s.phase === 'crew' && !s.shown)));

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

<div aria-live="polite">
	<GameFrame>
		{#snippet hero()}
			{#if s.phase === 'handover'}
				<Handoff
					heading="Gib das Handy an {current.name}"
					label="Spieler {s.revealIndex + 1} / {s.players.length}"
					note="Nur {current.name} schaut hin, alle anderen wenden den Blick ab."
				/>
			{:else if s.phase === 'view'}
				<div class="stack tight">
					<p class="label">{current.name}, deine Frage</p>
					<HoldToView action="seen" label="Gedrückt halten" onrelease={() => act('seen')}>
						<p class="question" data-testid="question">
							{s.revealIndex === s.imposterIndex ? s.imposter : s.crew}
						</p>
					</HoldToView>
				</div>
			{:else if s.phase === 'crew'}
				<Reveal shown={s.shown}>
					{#snippet covered()}
						<p class="label">Alle haben ihre Frage gesehen</p>
						<h2 class="big">Beantwortet sie reihum laut</h2>
					{/snippet}
					<p class="label in-reveal">Die Crew-Frage war …</p>
					<p class="question">{s.crew}</p>
				</Reveal>
			{:else}
				<Reveal shown={s.shown}>
					{#snippet covered()}
						<p class="label">Auflösung</p>
						<h2 class="big">Wer war der Imposter?</h2>
					{/snippet}
					<p class="label in-reveal">Der Imposter war …</p>
					<p class="reveal-word" data-testid="unmasked">{s.players[s.imposterIndex].name}</p>
					<p class="secret">Die andere Frage: {s.imposter}</p>
				</Reveal>
			{/if}
		{/snippet}

		{#if s.phase === 'view'}
			<p class="muted">Merk dir die Frage. Beim Loslassen ist die nächste Person dran.</p>
		{:else if s.phase === 'crew'}
			<p class="muted">
				{s.shown
					? 'Wessen Antwort passte nicht dazu? Diskutiert, dann kommt die Auflösung.'
					: 'Danach deckt ihr gemeinsam die Frage der Crew auf.'}
			</p>
		{:else if s.phase === 'unmask' && !s.shown}
			<p class="muted">Zeigt alle gleichzeitig auf euren Verdacht, dann deckt auf.</p>
		{/if}

		{#snippet actions()}
			{#if s.phase === 'handover'}
				<Button variant="primary" action="handover" onclick={() => act('handover')}>
					<span class="name">{current.name} ist bereit</span>
				</Button>
			{:else if s.phase === 'crew'}
				{#if !s.shown}
					<Button variant="primary" action="reveal" onclick={reveal}>Crew-Frage aufdecken</Button>
				{:else}
					<Button variant="primary" action="unmask" onclick={() => act('unmask')}>
						Weiter zum Imposter
					</Button>
				{/if}
			{:else if s.phase === 'unmask'}
				{#if !s.shown}
					<Button variant="primary" action="reveal" onclick={reveal}>Imposter aufdecken</Button>
				{:else}
					<Button variant="primary" action="nextRound" onclick={() => act('nextRound')}>Nächste Runde</Button>
				{/if}
			{/if}
			{#if revealing}
				<Button variant="ghost" action="skip" onclick={askSkip}>Überspringen</Button>
			{/if}
		{/snippet}

		{#snippet rail()}
			<div class="stack">
			{#if asking && known}
				<div class="corner">
					<HoldToView label="Wer kennt die Frage?" corner onrelease={() => {}}>
						<div data-testid="known" class="known">
							{#if known.length}
								<ul aria-label="Kennen die Frage">
									{#each known as name (name)}
										<li>{name}</li>
									{/each}
								</ul>
							{:else}
								<p>Noch niemand aus dieser Runde.</p>
							{/if}
						</div>
					</HoldToView>
				</div>
			{/if}
			<div class="panel stack tight">
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
			</div>
			</div>
		{/snippet}
	</GameFrame>
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
		color: var(--imposter-text);
	}

	.name {
		white-space: normal;
		overflow-wrap: anywhere;
		padding: 14px 0;
	}

	.in-reveal {
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

	.corner {
		display: flex;
		justify-content: flex-end;
	}

	.known ul {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin: 0;
		padding: 0;
		list-style: none;
		font-weight: 700;
		overflow-wrap: anywhere;
	}

	.known p {
		margin: 0;
		font-weight: 700;
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
