<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '#lib/ui/Button.svelte';
	import Modal from '#lib/ui/Modal.svelte';
	import { byId } from './characters.ts';
	import CharacterIcon from './CharacterIcon.svelte';
	import Circle from './Circle.svelte';
	import { heirs } from './engine.ts';
	import { info } from './info.ts';
	import { who, whoAll } from './label.ts';
	import RoleCard from './RoleCard.svelte';
	import ShowBar from './ShowBar.svelte';
	import type { ClocktowerAction, ClocktowerState, NightScreen } from './types.ts';

	interface Props {
		state: ClocktowerState;
		dispatch: (action: ClocktowerAction) => void;
		at: Extract<NightScreen, { step: number }>;
		peek?: Snippet;
	}

	let { state: s, dispatch, at, peek }: Props = $props();

	let choosing = $state(false);

	const step = $derived(s.night!.steps[at.step]);
	const target = $derived(s.night!.target);
	const starpass = $derived(s.night!.starpass);
	const candidates = $derived(heirs(s));
	const role = $derived(step.as ? byId[step.as] : null);
	const woken = $derived(whoAll(s.seats, step.seats));
	const drunk = $derived(s.seats[step.seats[0]].character === 'drunk' && role !== null);

	// the evil info steps are no character, so they bring their own words
	const group = {
		'minion-info': {
			name: 'Minion info',
			hint: 'Zeige „Das ist der Dämon“ und zeige auf den Dämon. Die Schergen erkennen einander.',
			de: 'Die Schergen erfahren, wer der Dämon ist und wer die anderen Schergen sind.'
		},
		'demon-info': {
			name: 'Demon info',
			hint: 'Zeige „Deine Minions“ und zeige auf alle Schergen, dann zeige die drei Bluffs.',
			de: 'Der Dämon erfährt seine Schergen und erhält drei Bluffs, die er gegenüber den Guten behaupten darf.'
		}
	} as const;
	const intro = $derived(step.kind === 'minion-info' || step.kind === 'demon-info' ? group[step.kind] : null);
	const hint = $derived(intro?.hint ?? (step.kind === 'new-imp' ? 'Zeige „Du bist“ und den Imp. Ab jetzt ist diese Person der Dämon.' : byId[step.kind as keyof typeof byId].hint));

	const minions = $derived(s.seats.flatMap((x, i) => (x.character && byId[x.character].team === 'minion' ? [i] : [])));

	// [label, lines]: true values, the storyteller decides what to show
	const facts = $derived.by((): { title: string; lines: string[]; caveat: boolean } | null => {
		if (step.kind === 'minion-info') return { title: 'Info', lines: s.demon === null ? [] : [`Dämon: ${who(s.seats, s.demon)}`], caveat: false };
		if (step.kind === 'demon-info') return { title: 'Info', lines: [`Schergen: ${minions.length ? whoAll(s.seats, minions) : 'keine'}`], caveat: false };
		const i = info(s, step);
		const seats = (list: number[]) => [...list].sort((a, b) => a - b).map((x) => who(s.seats, x));
		switch (i.kind) {
			case 'pair':
				return { title: 'Vorschlag', lines: [`${byId[i.character].name}: ${seats(i.seats).join(' oder ')}`], caveat: true };
			case 'zero':
				return { title: 'Vorschlag', lines: ['0 Outsider'], caveat: true };
			case 'number':
				return { title: 'Vorschlag', lines: [`Zahl: ${i.n}`], caveat: true };
			case 'demon': {
				const [demon, herring] = i.seats;
				return {
					title: 'Vorschlag',
					lines: [`Dämon: ${who(s.seats, demon)}`, ...(herring === undefined ? [] : [`Red Herring: ${who(s.seats, herring)}`])],
					caveat: true
				};
			}
			case 'character':
				return { title: 'Vorschlag', lines: [`Hingerichtet: ${byId[i.character].name}`], caveat: true };
			case 'none':
				return null;
		}
	});

	function pass(seat: number | null) {
		choosing = false;
		dispatch({ type: 'starpass', seat });
	}
</script>

{#snippet nav()}
	<div class="nav">
		<Button variant="primary" onclick={() => dispatch({ type: 'next' })}>Weiter</Button>
		<div class="row">
			<Button variant="ghost" size="sm" onclick={() => dispatch({ type: 'back' })}>Zurück</Button>
			<Button variant="ghost" size="sm" onclick={() => dispatch({ type: 'skip' })}>Überspringen</Button>
		</div>
	</div>
{/snippet}

{#if at.screen === 'wake'}
	<section class="panel stack wake" aria-labelledby="phase">
		<span class="label">Nur für dich</span>
		<h2 id="phase">Wecke {woken}</h2>
		<p class="role">
			{#if role}<CharacterIcon id={role.id} size={28} />{/if}
			<strong>{step.kind === 'new-imp' ? 'Du bist: Imp' : (role?.name ?? intro?.name)}</strong>
			{#if step.note}<span class="muted">· {step.note}</span>{/if}
		</p>
		<p class="hint">{hint}</p>
		{#if drunk}<p class="drunk">Diese Person ist der Drunk.</p>{/if}
		{#if facts && facts.lines.length}
			<div class="facts">
				<span class="label">{facts.title}</span>
				{#each facts.lines as line}<p>{line}</p>{/each}
				{#if facts.caveat}<p class="muted caveat">Gift, Drunk, Spy und Recluse können das ändern.</p>{/if}
			</div>
		{/if}
		{@render nav()}
	</section>
{:else if at.screen === 'card'}
	<section class="stack card" aria-labelledby="phase">
		<h2 id="phase" class="sr">Rolle</h2>
		{#if role}
			<RoleCard character={role.id} />
		{:else if intro}
			<div class="panel stack info" data-testid="info-card">
				<h2>{intro.name}</h2>
				<p>{intro.de}</p>
			</div>
		{/if}
		{@render nav()}
	</section>
{:else if at.screen === 'circle'}
	<section class="stack circle" aria-labelledby="phase">
		<h2 id="phase" class="sr">Grimoire</h2>
		<ShowBar state={s} {dispatch} {step} />
		{#if step.kind === 'imp'}
			<div class="panel stack imp">
				<span class="label">Ziel notieren</span>
				<p>{starpass === null ? (target === null ? 'Tippe auf den Platz des Ziels.' : `Ziel: ${who(s.seats, target)}`) : `Der Imp wählt sich selbst: ${who(s.seats, starpass)} wird der neue Imp.`}</p>
				<Button variant="secondary" size="sm" disabled={starpass !== null} onclick={() => (choosing = true)}>Imp wählt sich selbst</Button>
			</div>
			<div class="fit">
				<Circle
					seats={s.seats}
					marked={target === null ? [] : [target]}
					label={(i) => (i === target && starpass === null ? 'Ziel' : null)}
					disabled={(i) => (starpass !== null ? 'Der Imp hat sich selbst gewählt' : s.seats[i].alive ? null : 'bereits tot')}
					onseat={(i) => dispatch({ type: 'target', seat: i === target ? null : i })}
				/>
			</div>
		{:else}
			<div class="fit"><Circle seats={s.seats} marked={step.seats} /></div>
		{/if}
		{@render peek?.()}
		{@render nav()}
	</section>
{:else}
	<section class="panel stack wake" aria-labelledby="phase">
		<h2 id="phase">Schlaf wieder ein</h2>
		<p class="muted">Die Person schließt die Augen.</p>
		{@render nav()}
	</section>
{/if}

<Modal open={choosing} title="Imp wählt sich selbst" onclose={() => (choosing = false)}>
	{#if candidates.length}
		<p class="muted">Wer wird der neue Imp?{#if s.seats[candidates[0]].character === 'scarlet-woman'} Die Scarlet Woman muss übernehmen.{/if}</p>
		<div class="row">
			{#each candidates as i (i)}
				<Button variant="secondary" onclick={() => pass(i)}>{who(s.seats, i)}</Button>
			{/each}
		</div>
	{:else}
		<p class="muted">Kein Minion lebt. Der Imp stirbt.</p>
		<div class="row">
			<Button variant="danger" onclick={() => pass(null)}>Der Imp stirbt</Button>
		</div>
	{/if}
</Modal>

<style>
	.wake,
	.info {
		padding: 20px;
		gap: 12px;
	}

	.wake h2,
	.info h2,
	.wake p,
	.info p {
		margin: 0;
	}

	.role {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}

	.drunk {
		color: var(--gold);
		font-weight: 700;
	}

	.imp {
		padding: 12px;
		gap: 8px;
		align-items: flex-start;
	}

	.imp p {
		margin: 0;
	}

	.facts {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 12px;
		border-radius: var(--radius);
		background: var(--raised);
	}

	.facts p {
		overflow-wrap: anywhere;
	}

	.caveat {
		font-size: 15px;
	}

	.nav {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.nav .row {
		justify-content: space-between;
	}

	.card,
	.circle {
		gap: 16px;
	}

	/* Circle measures its own width, so capping the width caps the height */
	.fit {
		width: min(100%, calc(100svh - 120px));
		margin-inline: auto;
	}

	.sr {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}
</style>
