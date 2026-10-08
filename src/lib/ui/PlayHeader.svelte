<script lang="ts">
	import type { Status } from '#lib/games/registry.ts';
	import Button from '#lib/ui/Button.svelte';

	interface Props {
		name: string;
		label: string;
		status: Status | null;
		onend?: () => void;
	}

	let { name, label, status, onend }: Props = $props();
</script>

<header class="bar">
	<div class="who">
		<div class="meta">
			<span class="label">{label}</span>
			{#if status}
				<p class="status" data-testid="status">
					{#each status.parts as part, i}{#if i}{' · '}{/if}<span>{part}</span>{/each}
				</p>
			{/if}
		</div>
		<h1>{name}</h1>
	</div>
	{#if onend}
		<Button variant="danger" size="sm" onclick={onend}>Spiel beenden</Button>
	{/if}
	{#if status && status.progress !== null}
		<div class="progress" data-testid="progress" style="--p: {status.progress}" aria-hidden="true"></div>
	{/if}
</header>

<style>
	.bar {
		position: relative;
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
		min-width: 0;
	}

	.who .label {
		color: var(--c);
	}

	.who h1 {
		font-size: 22px;
		letter-spacing: -0.02em;
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 2px 12px;
	}

	.status {
		font: 600 14px/1.4 var(--font-ui);
		color: var(--text-soft);
		overflow-wrap: anywhere;
	}

	/* over the bar's bottom padding, so the status costs the header no extra height */
	.progress {
		position: absolute;
		left: 16px;
		right: 16px;
		bottom: 5px;
		height: 3px;
		border-radius: 2px;
		background: var(--raised);
		overflow: hidden;
	}

	.progress::after {
		content: '';
		display: block;
		width: calc(var(--p) * 100%);
		height: 100%;
		background: var(--c);
	}
</style>
