<script lang="ts">
	import type { Place } from '#lib/deco/motifs.ts';

	interface Props {
		place: Place;
	}

	let { place }: Props = $props();

	let seed = 11;
	const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
	const f = (n: number, d = 1) => Number(n.toFixed(d));

	// x in percent, y in px from the top of the page (some above it, in the app header's empty band): the stars stay in
	// the top of a page of any height, thickest at its edge, and fade with y
	const stars = Array.from({ length: 40 }, (_, i) => {
		const y = Math.round(-84 + 590 * rnd() ** 1.5);
		return {
			x: f(rnd() * 100),
			y,
			r: i % 4 === 0 ? 1.7 : 1.1,
			o: f(0.55 * (1 - Math.max(y, 0) / 650) + 0.15 * rnd(), 2),
			twinkle: i % 3 === 0,
			delay: -f(rnd() * 6)
		};
	});
	const motes = Array.from({ length: 7 }, () => ({
		x: f(4 + rnd() * 92),
		y: Math.round(30 + rnd() * 380),
		r: f(1.6 + rnd() * 1.4),
		delay: -f(rnd() * 9)
	}));
	const rays = Array.from({ length: 12 }, (_, i) => i * 30);
</script>

<div class="sky" class:page={place === 'play'} class:lobby={place === 'lobby'}>
	<svg class="stars night" width="100%" height="100%">
		{#each stars as s, i (i)}
			<circle
				data-star
				class:twinkle={s.twinkle}
				cx="{s.x}%"
				cy={s.y}
				r={s.r}
				style="--o:{s.o};animation-delay:{s.delay}s"
			/>
		{/each}
	</svg>
	<svg class="motes day" width="100%" height="100%">
		{#each motes as m, i (i)}
			<circle class="mote" cx="{m.x}%" cy={m.y} r={m.r} style="animation-delay:{m.delay}s" />
		{/each}
	</svg>
	<div class="orb night" data-moon>
		<i class="halo"></i>
		<svg viewBox="0 0 96 96">
			<path class="disc" d="M58 22A28 28 0 1 0 58 74A22 22 0 1 1 58 22Z" />
		</svg>
	</div>
	<div class="orb day" data-sun>
		<i class="halo"></i>
		<svg viewBox="0 0 96 96">
			<g class="rays">
				{#each rays as deg (deg)}
					<path d="M48 8V18" transform="rotate({deg} 48 48)" />
				{/each}
			</g>
			<circle class="core" cx="48" cy="48" r="16" />
		</svg>
	</div>
</div>

<style>
	.sky {
		position: absolute;
		inset: 0;
	}

	.stars,
	.motes {
		position: absolute;
		inset: 0;
		display: block;
	}

	.stars {
		overflow: visible;
	}

	.stars circle {
		fill: var(--text-soft);
		opacity: var(--o);
	}

	/* the lobby banner draws its art at 40% and fades it out, so the sky is drawn stronger there */
	.lobby .stars circle {
		opacity: min(1, calc(var(--o) * 2.6));
		r: 1.8px;
	}

	.lobby .disc {
		fill: var(--text);
	}

	.lobby .night .halo {
		background: radial-gradient(circle, color-mix(in srgb, var(--text) 45%, transparent), transparent 62%);
	}

	.mote {
		fill: var(--sun);
		opacity: 0.45;
	}

	.orb {
		position: absolute;
		top: 12px;
		right: 12px;
		width: 72px;
		height: 72px;
	}

	/* on a play screen the header card covers the page's top corner, so the orb sits in the empty middle of the app
	   header above it (Art lets the sky overflow); the app header's height is fixed per breakpoint */
	.page .orb {
		top: -72px;
		right: 60px;
		width: 48px;
		height: 48px;
	}

	@media (min-width: 768px) {
		.page .orb {
			top: -84px;
			right: 72px;
			width: 56px;
			height: 56px;
		}
	}

	.orb svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.halo {
		position: absolute;
		inset: -60%;
		border-radius: 50%;
	}

	.night .halo {
		background: radial-gradient(circle, color-mix(in srgb, var(--text-soft) 26%, transparent), transparent 62%);
	}

	.day .halo {
		background: radial-gradient(circle, color-mix(in srgb, var(--sun) 42%, transparent), transparent 62%);
	}

	.disc {
		fill: var(--text-soft);
	}

	.core {
		fill: var(--sun);
	}

	.rays {
		transform-box: view-box;
		transform-origin: 48px 48px;
	}

	.rays path {
		fill: none;
		stroke: var(--sun);
		stroke-width: 4;
		stroke-linecap: round;
	}

	.night,
	.day {
		transition:
			opacity 600ms ease,
			visibility 0s;
	}

	:global(html[data-variant='day']) .night,
	:global(html:not([data-variant='day'])) .day {
		opacity: 0;
		visibility: hidden;
		transition:
			opacity 600ms ease,
			visibility 0s 600ms;
	}

	@media (prefers-reduced-motion: no-preference) {
		.twinkle {
			animation: twinkle 5s ease-in-out infinite;
		}

		.mote {
			animation: drift 9s ease-in-out infinite;
		}

		.halo {
			animation: breathe 8s ease-in-out infinite;
		}

		.rays {
			animation: spin 120s linear infinite;
		}

		@keyframes twinkle {
			50% {
				opacity: 0.12;
			}
		}

		@keyframes drift {
			50% {
				transform: translateY(-10px);
				opacity: 0.2;
			}
		}

		@keyframes breathe {
			50% {
				transform: scale(1.1);
				opacity: 0.75;
			}
		}

		@keyframes spin {
			to {
				transform: rotate(360deg);
			}
		}
	}
</style>
