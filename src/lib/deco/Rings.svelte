<script lang="ts">
	import { semi } from '#lib/deco/motifs.ts';

	interface Props {
		tone?: string;
	}

	let { tone = 'var(--c, var(--muted))' }: Props = $props();
</script>

<svg class="top" viewBox="0 0 320 200" style="color:{tone}">
	<path d={semi(300, 230, 120)} />
	<circle class="turn" cx="300" cy="230" r="150" />
	<path d={semi(300, 230, 180)} />
	<circle class="turn slow" cx="300" cy="230" r="210" />
</svg>
<svg class="bottom" viewBox="0 0 300 200" style="color:{tone}">
	<path d={semi(-20, 230, 110)} />
	<circle class="turn slow" cx="-20" cy="230" r="140" />
	<path d={semi(-20, 230, 170)} />
</svg>

<style>
	svg {
		position: absolute;
		display: block;
		height: auto;
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		opacity: 0.3;
	}

	.top {
		top: 0;
		right: 0;
		width: min(70%, 520px);
	}

	.bottom {
		bottom: 0;
		left: 0;
		width: min(55%, 400px);
	}

	.turn {
		stroke-dasharray: 2 8;
		stroke-linecap: round;
		transform-box: view-box;
	}

	.top .turn {
		transform-origin: 300px 230px;
	}

	.bottom .turn {
		transform-origin: -20px 230px;
	}

	@media (prefers-reduced-motion: no-preference) {
		.turn {
			animation: turn 90s linear infinite;
		}

		.slow {
			animation-duration: 140s;
			animation-direction: reverse;
		}

		@keyframes turn {
			to {
				transform: rotate(360deg);
			}
		}
	}
</style>
