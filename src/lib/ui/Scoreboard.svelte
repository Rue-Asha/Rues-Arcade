<script lang="ts">
	interface Props {
		rows: { name: string; score: number; lead?: boolean }[];
	}

	let { rows }: Props = $props();
</script>

<ol>
	{#each rows as row (row.name)}
		<li>{row.name} {row.score}</li>
	{/each}
</ol>
