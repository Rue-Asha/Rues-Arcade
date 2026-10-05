<svelte:options namespace="svg" />

<script lang="ts">
	interface Props {
		x: number;
		y: number;
	}

	let { x, y }: Props = $props();
</script>

<g class="lock" transform="translate({x} {y})">
	<rect width="46" height="46" rx="10" style="fill:var(--surface);stroke:var(--line);stroke-width:2;stroke-dasharray:5 5" />
	<g transform="translate(14 14) scale(.75)" style="fill:none;stroke:var(--off);stroke-width:2.4;stroke-linecap:round">
		<rect x="5" y="11" width="14" height="9" rx="2" />
		<path d="M8 11V8a4 4 0 0 1 8 0v3" />
	</g>
</g>
