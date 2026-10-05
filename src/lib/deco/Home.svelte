<script lang="ts">
	import Arcs from './Arcs.svelte';
	import Gauge from './Gauge.svelte';
	import Grid from './Grid.svelte';
	import Lock from './Lock.svelte';
	import Mask from './Mask.svelte';
	import Spark from './Spark.svelte';
</script>

<svg viewBox="0 0 560 240" preserveAspectRatio="xMaxYMid slice">
	<Grid width={560} height={240} opacity={0.35} />
	<Arcs cx={380} cy={236} radii={[176, 196]} opacity={0.35} />
	<Gauge cx={380} cy={236} r={150} face="var(--wavelength-tint)" />
	<g class="card" transform="rotate(-6 128 128)">
		<rect x="62" y="48" width="132" height="156" rx="18" style="fill:var(--imposter-tint)" />
		<rect x="62" y="48" width="132" height="4" rx="2" style="fill:var(--imposter)" />
		<Mask x={80} y={72} scale={4} stroke="var(--imposter)" fill="none" />
	</g>
	<Lock x={222} y={26} />
	<Lock x={492} y={24} />
	<Lock x={214} y={168} />
	<Spark x={258} y={118} scale={0.9} fill="var(--gold)" />
	<Spark x={520} y={120} scale={0.6} fill="var(--primary)" />
	<circle cx="34" cy="214" r="5" style="fill:var(--gold)" />
	<circle cx="52" cy="214" r="5" style="fill:var(--line)" />
	<circle cx="70" cy="214" r="5" style="fill:var(--line)" />
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
