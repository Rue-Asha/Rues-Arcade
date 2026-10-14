<script lang="ts">
	import { onMount } from 'svelte';
	import { over, reading } from './timer.ts';

	let { deadline }: { deadline: number } = $props();

	let now = $state(Date.now());

	onMount(() => {
		const id = setInterval(() => (now = Date.now()), 250);
		return () => clearInterval(id);
	});

	const done = $derived(over(deadline, now));
</script>

<p class="timer" class:done role="timer" data-testid="timer" data-over={done ? '' : undefined}>{reading(deadline, now)}</p>

<style>
	.timer {
		margin: 0;
		font: 400 30px/1 var(--font-num);
		font-variant-numeric: tabular-nums;
		color: var(--text);
	}

	.done {
		color: var(--evil);
	}
</style>
