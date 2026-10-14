<script module lang="ts">
	// Stage mounts a new Deal for every screen, so only this flag tells a card the player just opened from one that
	// a reload brought back.
	let opened = false;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import type { ScreenProps } from '#lib/games/registry.ts';
	import { play } from '#lib/sound.ts';
	import Button from '#lib/ui/Button.svelte';
	import RoleCard from './RoleCard.svelte';
	import type { ClocktowerAction, ClocktowerState } from './types.ts';

	let { state: game, dispatch }: ScreenProps = $props();

	const s = $derived(game as ClocktowerState);
	const send = (action: ClocktowerAction) => dispatch(action);

	const at = $derived(s.phase.kind === 'reveal' ? s.phase.seat : 0);
	const shown = $derived(s.phase.kind === 'reveal' && s.phase.shown);
	const seat = $derived(s.seats[at]);
	// the Drunk is shown the Townsfolk they believe to be
	const role = $derived(seat.believed ?? seat.character!);

	onMount(() => {
		if (shown && !opened) send({ type: 'back' });
		opened = false;
	});

	function open() {
		opened = true;
		play('chime');
		send({ type: 'show' });
	}
</script>

<section class="panel stack deal" aria-labelledby="who">
	{#if shown}
		<p class="label">{seat.player.name} · Platz {at + 1}</p>
		<h2 id="who" class="sr">Deine Rolle</h2>
		<div class="flip">
			<RoleCard character={role} />
		</div>
		<div class="row">
			<Button variant="primary" onclick={() => send({ type: 'hide' })}>Verbergen & weitergeben</Button>
		</div>
	{:else}
		<p class="label">Platz {at + 1}</p>
		<h2 id="who" class="name">{seat.player.name}</h2>
		<p class="muted">Nur diese Person schaut auf das Gerät.</p>
		<div class="row">
			<Button variant="primary" onclick={open}>Rolle zeigen</Button>
		</div>
	{/if}
</section>

<style>
	.deal {
		padding: 20px;
		align-items: center;
		text-align: center;
	}

	.deal p,
	.deal h2 {
		max-width: 36ch;
		text-wrap: balance;
	}

	.deal .row {
		justify-content: center;
	}

	.name {
		font-size: 36px;
		overflow-wrap: anywhere;
	}

	.label {
		margin: 0;
		color: var(--gold);
		font-weight: 700;
		letter-spacing: 0.12em;
	}

	.sr {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}

	.flip {
		animation: flip 0.55s var(--ease-out) 1 both;
	}

	@keyframes flip {
		from {
			opacity: 0;
			transform: perspective(900px) rotateY(-70deg) scale(0.92);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.flip {
			animation: none;
		}
	}
</style>
