<script lang="ts">
	import { byId } from './characters.ts';
	import CharacterIcon from './CharacterIcon.svelte';
	import { tickAngles, wedge } from './circle.ts';
	import { triggerLabel, voteTimeline, type Slide } from './deck.ts';
	import Sheet from './Sheet.svelte';

	let { slide }: { slide: Slide } = $props();

	const alive = $derived(slide.vote?.alive ?? 0);
	const tl = $derived(voteTimeline(Math.max(alive, 2)));

	// seats of the vote ring on a circle, the nominee at the top, clockwise
	const seat = (i: number, n: number) => {
		const a = (i / n) * 2 * Math.PI;
		return { x: 50 + 40 * Math.sin(a), y: 50 - 40 * Math.cos(a) };
	};

	// The static markup is the end state (the hand in the nominee's sector, the nominee's sector lit); with motion
	// allowed the loop below replays the sweep over it. The hand only rotates; opacity steps switch a voter's red
	// fill, the lit sector and the centre numeral in step with it.
	const STEP = 0.004;
	const END = 0.97;
	const BOX = 200;
	const polar = (r: number, deg: number) => {
		const a = (deg * Math.PI) / 180;
		return `${Math.round((BOX / 2 + r * Math.sin(a)) * 100) / 100} ${Math.round((BOX / 2 - r * Math.cos(a)) * 100) / 100}`;
	};
	const ticks = (n: number) =>
		tickAngles(n)
			.map((deg) => `M${polar(60, deg)}L${polar(68, deg)}`)
			.join('');
	// the hand stops a hair short of the boundary, inside the nominee's sector
	const LAST = 0.02;
	const turn = (seats: number) => ((seats + 0.5 - LAST) * 360) / seats;
	const steps = (from: number, to: number): Keyframe[] => [
		from > 0 ? { opacity: 0, offset: 0 } : { opacity: 1, offset: 0 },
		...(from > 0 ? [{ opacity: 0, offset: from }, { opacity: 1, offset: from + STEP }] : []),
		{ opacity: 1, offset: to },
		{ opacity: 0, offset: to + STEP },
		{ opacity: 0, offset: 1 }
	];

	function sweep(disc: HTMLElement, alive: number) {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const t = voteTimeline(alive);
		const total = t.handMs + t.holdMs;
		const per = t.handMs / alive;
		const at = t.at.map((ms) => ms / total);
		const timing = { duration: total, iterations: Infinity, easing: 'linear' };
		const run = [
			disc.querySelector<HTMLElement>('[data-hand]')!.animate(
				[
					{ transform: `rotate(${(t.start * 360) / alive}deg)`, offset: 0 },
					{ transform: `rotate(${turn(alive)}deg)`, offset: (t.handMs - LAST * per) / total },
					{ transform: `rotate(${turn(alive)}deg)`, offset: 1 }
				],
				timing
			)
		];
		disc.querySelectorAll<HTMLElement>('[data-sector]').forEach((el) => {
			const seat = Number(el.dataset.sector) - 1;
			const from = (((seat + alive - 1) % alive) * per) / total;
			const to = seat === 0 ? 1 : (from * total + per) / total;
			const frames: Keyframe[] =
				seat === 0
					? [{ opacity: 0, offset: 0 }, { opacity: 0, offset: from }, { opacity: 1, offset: from + STEP }, { opacity: 1, offset: 1 }]
					: steps(seat === 1 ? 0 : from, to);
			run.push(el.animate(frames, timing));
		});
		disc.querySelectorAll<HTMLElement>('[data-voter]').forEach((el, j) => {
			run.push(
				el.animate(
					steps(at[j], END).map((k) => (k.opacity === 1 ? { ...k, transform: 'scale(1)' } : { ...k, transform: 'scale(0.6)' })),
					timing
				)
			);
		});
		disc.querySelectorAll<HTMLElement>('[data-n]').forEach((el, j) => {
			run.push(el.animate(steps(at[j], j + 1 < at.length ? at[j + 1] : END), timing));
		});
		return { destroy: () => run.forEach((a) => a.cancel()) };
	}
</script>

<div
	class="slide k-{slide.kind} {slide.mood}"
	data-slide={slide.id}
	data-theme={slide.mood === 'day' ? 'clocktower' : undefined}
	data-variant={slide.mood === 'day' ? 'day' : undefined}
>
	{#if slide.kind === 'sheet'}
		<h2 class="sr-only">{slide.title}</h2>
		<div class="box" data-no-nav>
			<Sheet />
		</div>
	{:else}
		<div class="inner">
			<header>
				{#if slide.eyebrow}<p class="label">{slide.eyebrow}</p>{/if}
				<h2>{slide.title}</h2>
				{#if slide.kind === 'hero' || slide.kind === 'chapter'}<span class="rule" aria-hidden="true"></span>{/if}
				{#if slide.lead}<p class="lead">{slide.lead}</p>{/if}
			</header>

			{#if slide.kind === 'counts'}
				<ul class="counts">
					{#each slide.counts ?? [] as c (c.team)}
						<li class={c.team}>
							<span class="num" data-testid="count-{c.team}">{c.n}</span>
							<span class="name">{c.label}</span>
						</li>
					{/each}
				</ul>
				<ul class="dots" aria-hidden="true">
					{#each slide.dots ?? [] as team, i (i)}
						<li class={team}></li>
					{/each}
				</ul>
				<p class="baron">{slide.baron}</p>
				{#if slide.note}<p class="note callout">{slide.note}</p>{/if}
			{:else if slide.kind === 'vote'}
				<div class="votewrap">
					<div class="side">
						{#each slide.cards ?? [] as c (c.title)}
							<article class="card">
								{#if c.label}<p class="label">{c.label}</p>{/if}
								<h3>{c.title}</h3>
								<p>{c.text}</p>
							</article>
						{/each}
					</div>
					<figure class="ring">
						<div class="disc" role="img" aria-label={slide.vote?.caption} use:sweep={alive}>
							<svg class="plane" viewBox="0 0 {BOX} {BOX}" aria-hidden="true">
								{#each Array.from({ length: alive }) as _, i (i)}
									<path class="sector" data-sector={i + 1} class:lit={i === 0} d={wedge(i, alive, BOX)} />
								{/each}
								<path class="ticks" data-ticks={alive} d={ticks(alive)} />
							</svg>
							<span class="hand" data-hand style="transform: rotate({turn(alive)}deg)" aria-hidden="true"></span>
							{#each Array.from({ length: alive }) as _, i (i)}
								{@const p = seat(i, alive)}
								<span class="seat" class:nominee={i === 0} style="left:{p.x}%;top:{p.y}%">
									{#if i === 0}
										<b>!</b>
									{:else if tl.voters.includes(i)}
										<span class="fill" data-voter>
											<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
										</span>
									{/if}
								</span>
							{/each}
							<span class="count" aria-hidden="true">
								{#each tl.voters as _, j (j)}
									<span data-n class:last={j === tl.voters.length - 1}>{j + 1}</span>
								{/each}
							</span>
						</div>
						<figcaption>{slide.vote?.caption}</figcaption>
					</figure>
				</div>
			{:else if slide.kind === 'steps'}
				<ol class="steps">
					{#each slide.steps ?? [] as s (s.n + s.title)}
						<li class:word={s.n.length > 2}>
							<span class="n">{s.n}</span>
							<div>
								<h3>{s.title}</h3>
								{#if s.text}<p>{s.text}</p>{/if}
							</div>
						</li>
					{/each}
				</ol>
			{:else if slide.kind === 'rows'}
				<ul class="rows">
					{#each slide.rows ?? [] as [a, b] (a)}
						<li><span>{a}</span><b>{b}</b></li>
					{/each}
				</ul>
			{:else if slide.kind === 'roles'}
				<ul class="roles">
					{#each slide.roles ?? [] as id (id)}
						{@const c = byId[id]}
						<li class={c.team}>
							<CharacterIcon {id} size={44} />
							<div>
								<p class="label">{triggerLabel[c.trigger]}</p>
								<h3>{c.name}</h3>
								<p>{c.de}</p>
							</div>
						</li>
					{/each}
				</ul>
			{:else if slide.cards}
				<div class="cards" class:two={slide.cards.length === 2}>
					{#each slide.cards as c (c.title)}
						<article class="card {c.tone ?? 'plain'}">
							{#if c.label}<p class="label">{c.label}</p>{/if}
							<h3>{c.title}</h3>
							<p>{c.text}</p>
							{#if c.win}<p class="win">{c.win}</p>{/if}
						</article>
					{/each}
				</div>
			{/if}

			{#if slide.kind !== 'counts' && slide.note}<p class="note">{slide.note}</p>{/if}
		</div>
	{/if}
</div>

<style>
	.slide {
		min-height: 0;
		overflow-x: hidden;
		overflow-y: auto;
		overscroll-behavior: contain;
		border-radius: inherit;
		background-color: var(--ground);
		color: var(--text);
		font-size: 18px;
		line-height: 1.4;
	}

	.night {
		background-image: radial-gradient(ellipse 90% 70% at 70% 30%, var(--sky), transparent 75%);
	}

	.deep {
		background-color: #08070b;
		background-image: radial-gradient(ellipse 90% 70% at 75% 30%, #1c1826, transparent 75%);
	}

	.blood {
		background-color: #120a0d;
		background-image: radial-gradient(ellipse 90% 70% at 75% 40%, #2a1216, transparent 75%);
	}

	.day {
		background-image: linear-gradient(180deg, #f3ecdc 0%, #e8dfcb 70%, #e3c99a 100%);
	}

	.inner {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 20px;
		min-height: 100%;
		padding: 20px 16px 28px;
	}

	header {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	h2,
	h3,
	p {
		margin: 0;
	}

	h2 {
		font-size: clamp(32px, 7vw, 56px);
		line-height: 1.05;
		overflow-wrap: anywhere;
	}

	.k-hero h2 {
		font-size: clamp(40px, 10vw, 88px);
	}

	h3 {
		font-size: 22px;
		line-height: 1.15;
	}

	.label {
		font-size: 16px;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--gold);
	}

	.lead {
		max-width: 46ch;
		font-size: 20px;
		color: var(--text-soft);
	}

	.k-hero .inner,
	.k-chapter .inner,
	.k-story .inner {
		justify-content: center;
	}

	.k-chapter h2,
	.k-hero h2 {
		letter-spacing: 0.02em;
	}

	.k-chapter .lead {
		font-style: italic;
		font-family: var(--font-data);
		font-size: clamp(22px, 4vw, 32px);
	}

	.k-story .lead {
		max-width: 28ch;
		font-family: var(--font-data);
		font-size: clamp(24px, 4.4vw, 38px);
		line-height: 1.3;
	}

	.rule {
		width: 96px;
		height: 3px;
		background: var(--clocktower);
	}

	.note {
		font-style: italic;
		color: var(--muted);
	}

	.callout {
		align-self: flex-start;
		padding: 6px 12px;
		border: 2px solid var(--evil);
		border-radius: var(--radius-sm);
		font-style: normal;
		font-weight: 700;
		color: var(--text);
	}

	.cards,
	.roles,
	.steps,
	.rows,
	.counts {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
		gap: 12px;
	}

	.card,
	.roles li {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 14px 16px;
		border: 2px solid var(--line);
		border-radius: var(--radius);
		background: var(--surface);
	}

	.card.good,
	.roles .townsfolk {
		border-color: var(--good);
		background: var(--good-tint);
	}

	.roles .outsider {
		border-color: var(--outsider);
		background: var(--good-tint);
	}

	.card.evil,
	.roles .minion {
		border-color: var(--evil);
		background: var(--evil-tint);
	}

	.roles .demon {
		border-color: var(--demon);
		background: var(--evil-tint);
	}

	.card.good .label {
		color: var(--good);
	}

	.card.evil .label {
		color: var(--evil);
	}

	.k-versus .cards {
		gap: 16px;
	}

	.k-versus .card {
		padding: 20px;
	}

	.k-versus h3 {
		font-family: var(--font-display);
		font-size: clamp(30px, 6vw, 48px);
	}

	.win {
		font-weight: 700;
	}

	.roles {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
		gap: 10px;
	}

	.roles li {
		flex-direction: row;
		align-items: flex-start;
		gap: 12px;
	}

	.roles div {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.steps {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
		gap: 14px 24px;
	}

	.steps li {
		display: flex;
		gap: 14px;
		align-items: flex-start;
		padding-top: 10px;
		border-top: 2px solid var(--gold);
	}

	.steps .n {
		min-width: 1.4ch;
		font-family: var(--font-num);
		font-size: 36px;
		line-height: 1;
		color: var(--gold);
	}

	.steps .word {
		flex-direction: column;
		gap: 6px;
	}

	.steps .word .n {
		font: 700 16px/1 var(--font-ui);
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.steps div {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
	}

	.steps h3 {
		font-size: 20px;
	}

	.rows {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr));
		gap: 4px 32px;
	}

	.rows li {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 4px 16px;
		padding: 8px 0;
		border-bottom: 1px solid var(--line);
	}

	.rows b {
		font-family: var(--font-data);
		font-size: 22px;
		font-weight: 400;
		color: var(--gold);
	}

	.counts {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px 16px;
	}

	.counts li {
		display: flex;
		flex-direction: column;
	}

	.num {
		font-family: var(--font-num);
		font-size: clamp(64px, 14vw, 128px);
		line-height: 1;
	}

	.name {
		font-weight: 700;
		letter-spacing: 0.04em;
	}

	.counts .townsfolk {
		color: var(--good);
	}

	.counts .outsider {
		color: var(--outsider);
	}

	.counts .minion {
		color: var(--evil);
	}

	.counts .demon {
		color: var(--demon);
	}

	.dots {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin: 0;
		padding: 12px 0 0;
		list-style: none;
		border-top: 1px solid var(--line);
	}

	.dots li {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: var(--good);
	}

	.dots .outsider {
		background: var(--outsider);
	}

	.dots .minion {
		background: var(--evil);
	}

	.dots .demon {
		background: var(--demon);
		box-shadow: 0 0 0 3px var(--ground), 0 0 0 5px var(--demon);
		margin-inline: 4px;
	}

	.baron {
		font-weight: 700;
	}

	.votewrap {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 20px;
		align-items: center;
	}

	.side {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.ring {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		margin: 0;
	}

	.disc {
		position: relative;
		width: min(100%, 300px);
		aspect-ratio: 1;
		border: 1px dashed var(--line);
		border-radius: 50%;
	}

	.seat {
		position: absolute;
		display: grid;
		place-items: center;
		width: 10%;
		aspect-ratio: 1;
		transform: translate(-50%, -50%);
		border: 2px solid var(--text);
		border-radius: 50%;
	}

	.seat.nominee {
		width: 14%;
		border-color: var(--clocktower);
		border-width: 3px;
		color: var(--clocktower);
		font-size: 22px;
	}

	.fill {
		position: absolute;
		inset: -2px;
		display: grid;
		place-items: center;
		border-radius: 50%;
		background: var(--clocktower);
	}

	.fill svg {
		width: 62%;
		fill: none;
		stroke: #1c1714;
		stroke-width: 3.5;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.plane {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.sector {
		fill: var(--clocktower);
		fill-opacity: 0.15;
		opacity: 0;
	}

	.sector.lit {
		opacity: 1;
	}

	.ticks {
		fill: none;
		stroke: var(--text);
		stroke-opacity: 0.5;
		stroke-width: 1.5;
		stroke-linecap: round;
	}

	.hand {
		position: absolute;
		left: 50%;
		bottom: 50%;
		width: 4px;
		height: 30%;
		margin-left: -2px;
		border-radius: 2px;
		background: var(--clocktower);
		transform-origin: 50% 100%;
	}

	.count {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		font-family: var(--font-num);
		font-size: 72px;
		font-variant-numeric: tabular-nums;
	}

	.count > span {
		grid-area: 1 / 1;
		opacity: 0;
	}

	.count > .last {
		opacity: 1;
		color: var(--clocktower);
	}

	figcaption {
		font-family: var(--font-data);
		font-style: italic;
		font-size: 22px;
		text-align: center;
	}

	.box {
		height: 100%;
		padding: 8px 10px;
	}

	.slide.k-sheet {
		overflow: hidden;
	}

	@media (min-width: 768px) {
		.inner {
			gap: 28px;
			padding: 32px 40px 36px;
		}

		.counts {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}

		.votewrap {
			grid-template-columns: minmax(0, 1fr) 340px;
			gap: 40px;
		}

		.disc {
			width: 340px;
		}

		.box {
			padding: 12px 24px;
		}
	}
</style>
