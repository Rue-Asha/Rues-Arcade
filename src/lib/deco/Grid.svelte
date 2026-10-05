<svelte:options namespace="svg" />

<script lang="ts">
	interface Props {
		width: number;
		height: number;
		opacity?: number;
	}

	let { width, height, opacity = 0.3 }: Props = $props();

	const id = $props.id();
</script>

<defs>
	<pattern id="grid-{id}" width="40" height="40" patternUnits="userSpaceOnUse">
		<rect x="5" y="5" width="30" height="30" rx="7" style="fill:none;stroke:var(--line);stroke-opacity:{opacity}" />
	</pattern>
</defs>
<rect {width} {height} style="fill:url(#grid-{id})" />
