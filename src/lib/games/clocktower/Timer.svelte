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

<div class="block" class:done class:late={!done && deadline - now <= 60_000}>
	<svg class="dial" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false">
		<circle cx="12" cy="13" r="8"></circle>
		<path d="M12 9v4l2.5 2M9.5 2.5h5"></path>
	</svg>
	<p class="timer" role="timer" data-testid="timer" data-over={done ? '' : undefined}>{reading(deadline, now)}</p>
</div>

<style>
	.block {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 14px;
		align-self: center;
		min-width: 12ch;
		padding: 6px 22px;
		border: 2px solid var(--line);
		border-radius: var(--radius-xl);
		background: var(--surface);
		box-shadow: 0 var(--ledge) 0 var(--shadow);
		color: var(--text);
	}

	.timer {
		margin: 0;
		font: 400 52px/1.1 var(--font-num);
		font-variant-numeric: tabular-nums;
		text-align: center;
	}

	.late {
		border-color: var(--evil);
		animation: pulse 1s ease-in-out infinite;
	}

	.done {
		border-color: var(--evil);
		color: var(--evil);
	}

	@keyframes pulse {
		50% {
			box-shadow: 0 var(--ledge) 0 var(--shadow), 0 0 0 4px color-mix(in srgb, var(--evil) 45%, transparent);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.late {
			animation: none;
		}
	}
</style>
