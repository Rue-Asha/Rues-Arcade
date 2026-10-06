<script lang="ts">
	import type { Survey } from '#lib/content/types.ts';
	import type { GameDef } from '#lib/engine/types.ts';

	interface Props {
		def: GameDef<any, any, any>;
		surveys: Survey[];
	}

	let { def, surveys }: Props = $props();
</script>

<div class="stack rise" style="--c: var(--{def.colour})">
	<h1>Inhalte</h1>
	<ul>
		{#each surveys as survey (survey.id)}
			<li>{survey.question}</li>
		{/each}
	</ul>
</div>
