<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import Modal from '#lib/ui/Modal.svelte';
	import type { ClocktowerAction, ClocktowerState } from './types.ts';

	interface Props {
		state: ClocktowerState;
		seat: number | null;
		dispatch: (action: ClocktowerAction) => void;
		onclose: () => void;
	}

	let { state: s, seat, dispatch, onclose }: Props = $props();

	const screen = $derived(s.phase.kind === 'day' ? s.phase.screen : null);
	const who = $derived(seat === null ? null : s.seats[seat]);
	const nominated = $derived(seat !== null && s.today!.nominations.some((n) => n.nominee === seat));

	function nominate() {
		dispatch({ type: 'nominee', seat: seat! });
		onclose();
	}
</script>

<Modal open={seat !== null} title={seat === null ? '' : `Platz ${seat + 1} · ${who!.player.name}`} {onclose}>
	<div class="stack actions">
		{#if screen === 'grimoire'}
			<Button variant="primary" disabled={nominated} onclick={nominate}>Nominieren</Button>
			{#if nominated}<p class="muted why">heute schon nominiert</p>{/if}
		{/if}
	</div>
</Modal>

<style>
	.actions {
		--gap: 12px;
		align-items: stretch;
	}

	.why {
		margin: 0;
	}
</style>
