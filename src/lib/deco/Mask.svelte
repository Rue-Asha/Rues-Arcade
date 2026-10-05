<svelte:options namespace="svg" />

<script lang="ts">
	interface Props {
		x: number;
		y: number;
		scale: number;
		stroke: string;
		fill: string;
		odd?: boolean;
	}

	let { x, y, scale, stroke, fill, odd = false }: Props = $props();
</script>

<g class="mask" class:odd>
	<g
		transform="translate({x} {y}) scale({scale})"
		style="fill:none;stroke:{stroke};stroke-width:{2.2 / scale};stroke-linecap:round;stroke-linejoin:round"
	>
		<path d="M4 11c0-4.4 3.6-8 8-8s8 3.6 8 8v4c0 3.3-3.6 6-8 6s-8-2.7-8-6z" style="fill:{fill}" />
		<path d="M7.5 12.5c1-.9 2.5-.9 3.5 0" />
		<path d="M13 12.5c1-.9 2.5-.9 3.5 0" />
		<path d="M10 17h4" />
	</g>
</g>

<style>
	.odd {
		transform-box: fill-box;
	}
</style>
