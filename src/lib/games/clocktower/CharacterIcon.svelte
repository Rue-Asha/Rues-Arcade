<script lang="ts">
	import { byId } from './characters.ts';
	import type { CharacterId } from './types.ts';

	interface Props {
		id: CharacterId;
		size?: number;
	}

	let { id, size = 40 }: Props = $props();

	const c = $derived(byId[id]);
</script>

<svg class="icon {c.team}" viewBox="0 0 512 512" width={size} height={size} aria-hidden="true" focusable="false">
	<path d={c.icon} fill="currentColor" />
</svg>

<style>
	.icon {
		flex: none;
		color: var(--good, var(--primary));
	}

	.outsider {
		color: var(--outsider, var(--gold));
	}

	.minion {
		color: var(--evil, var(--clocktower));
	}

	.demon {
		color: var(--demon, var(--clocktower));
	}
</style>
