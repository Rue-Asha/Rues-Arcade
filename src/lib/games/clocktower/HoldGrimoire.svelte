<script lang="ts">
	import HoldToView from '#lib/ui/HoldToView.svelte';
	import { byId } from './characters.ts';
	import Circle from './Circle.svelte';
	import { who } from './label.ts';
	import type { ClocktowerState } from './types.ts';

	interface Props {
		state: ClocktowerState;
	}

	let { state: s }: Props = $props();

	const drunk = $derived(s.seats.findIndex((x) => x.character === 'drunk' && x.believed));
	const notes = $derived.by(() => {
		const out: [string, number][] = [];
		if (drunk >= 0) out.push([`Drunk (glaubt: ${byId[s.seats[drunk].believed!].name})`, drunk]);
		if (s.redHerring !== null) out.push(['Red Herring', s.redHerring]);
		if (s.demon !== null) out.push(['Dämon', s.demon]);
		return out;
	});
</script>

<HoldToView corner label="Grimoire" onrelease={() => {}}>
	<div class="grimoire" data-grimoire>
		<Circle seats={s.seats} token={(i) => s.seats[i].character} />
		{#if notes.length}
			<ul class="notes">
				{#each notes as [name, seat] (name)}
					<li><span class="key">{name}</span> <span>{who(s.seats, seat)}</span></li>
				{/each}
			</ul>
		{/if}
	</div>
</HoldToView>

<style>
	/* the floating card pads its content; the circle needs the width back to keep its seats tappable-sized */
	.grimoire {
		width: calc(100% + 28px);
		margin-inline: -14px;
	}

	.notes {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin: 8px 14px 0;
		padding: 0;
		list-style: none;
		text-align: center;
		font-size: 15px;
	}

	.key {
		font-weight: 700;
		color: var(--gold);
	}
</style>
