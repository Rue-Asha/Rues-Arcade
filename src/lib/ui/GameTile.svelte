<script lang="ts">
	import type { GameEntry } from '#lib/games/registry.ts';

	interface Props {
		entry?: GameEntry;
		locked?: string;
	}

	let { entry, locked }: Props = $props();
</script>

<div>{entry?.def.name ?? locked}</div>
