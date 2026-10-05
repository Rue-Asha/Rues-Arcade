<svelte:options namespace="svg" />

<script lang="ts">
	interface Props {
		x: number;
		y: number;
		scale: number;
		fill: string;
	}

	let { x, y, scale, fill }: Props = $props();
</script>

<path
	transform="translate({x} {y}) scale({scale})"
	d="M0 -10 L2.6 -2.6 L10 0 L2.6 2.6 L0 10 L-2.6 2.6 L-10 0 L-2.6 -2.6Z"
	style="fill:{fill}"
/>
