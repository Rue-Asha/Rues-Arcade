<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onDestroy } from 'svelte';
	import { setDemo } from '#lib/demo/context.ts';
	import { next, start, view, type DemoRun } from '#lib/demo/runner.ts';
	import { games, type GameEntry } from '#lib/games/registry.ts';
	import CoachTip from '#lib/ui/CoachTip.svelte';
	import Stage from '#lib/ui/Stage.svelte';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();

	const entry = $derived(games.find((g) => g.def.slug === params.slug));
	const base = $derived(entry ? `/spiele/${entry.def.slug}` : '/');
	const from = $derived.by(() => {
		const to = page.url.searchParams.get('from');
		return to?.startsWith('/') && !to.startsWith('//') ? to : base;
	});

	// raw: the reducer returns a fresh object per action, a deep proxy would only wrap it
	let demo = $state.raw<{ entry: GameEntry; run: DemoRun } | null>(null);
	const tip = $derived(demo && view(demo.entry.demo, demo.run));

	// reads the state itself, not `tip`: a derived dies with this page, and the next page's buttons must see null
	setDemo(() => demo && view(demo.entry.demo, demo.run));
	onDestroy(() => (demo = null));

	// nothing is persisted, so arriving by reload or a direct visit lands on the start screen
	afterNavigate(({ type }) => {
		if (!entry || type === 'enter') goto(base, { replace: true });
		else demo = { entry, run: start(entry.def, entry.demo) };
	});

	function dispatch(action: { type: string }) {
		if (demo) demo = { entry: demo.entry, run: next(demo.entry.def, demo.entry.demo, demo.run, action) };
	}
</script>

<svelte:head>
	<title>Demo · {entry?.def.name ?? ''} · Rue's Arcade</title>
</svelte:head>

{#if demo && tip}
	{@const { def, Screen } = demo.entry}
	<div class="stack" style="--c: var(--{def.colour})">
		<header class="bar">
			<div class="who">
				<span class="label">Demo</span>
				<h1>{def.name}</h1>
			</div>
		</header>

		<Stage key={def.phase(demo.run.state)}>
			<Screen state={demo.run.state} {dispatch} />
		</Stage>
	</div>

	<CoachTip step={tip.step} total={tip.total} text={tip.tip} onexit={() => goto(from)} />
{/if}

<style>
	.bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 12px 16px;
		padding: 12px 16px;
		border-radius: var(--radius-xl);
		background: var(--surface);
		box-shadow:
			inset 0 3px 0 var(--c),
			0 var(--ledge) 0 var(--shadow);
	}

	.who {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.who .label {
		color: var(--c);
	}

	.who h1 {
		font-size: 22px;
		letter-spacing: -0.02em;
	}
</style>
