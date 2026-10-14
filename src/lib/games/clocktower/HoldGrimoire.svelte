<script lang="ts">
	import HoldToView from '#lib/ui/HoldToView.svelte';
	import { byId } from './characters.ts';
	import Circle from './Circle.svelte';
	import type { ClocktowerState } from './types.ts';

	interface Props {
		state: ClocktowerState;
	}

	let { state: s }: Props = $props();

	function label(i: number): string | null {
		const { character, believed } = s.seats[i];
		const parts = [character === 'drunk' && believed ? `Drunk (glaubt: ${byId[believed].name})` : character ? byId[character].name : null];
		if (i === s.demon) parts.push('Dämon');
		if (i === s.redHerring) parts.push('Red Herring');
		return parts.filter(Boolean).join(' · ') || null;
	}
</script>

<HoldToView corner label="Grimoire" onrelease={() => {}}>
	<div class="grimoire" data-grimoire>
		<Circle seats={s.seats} {label} />
	</div>
</HoldToView>

<style>
	/* the floating card pads its content; the circle needs the width back to keep its seats tappable-sized */
	.grimoire {
		width: calc(100% + 28px);
		margin-inline: -14px;
	}

	.grimoire :global(.tag) {
		width: max-content;
		max-width: 84px;
		white-space: normal;
		text-align: center;
		line-height: 1.1;
	}
</style>
