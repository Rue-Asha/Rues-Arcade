<script lang="ts">
	import type { Snippet } from 'svelte';
	import { play } from '#lib/sound.ts';

	interface Props {
		variant: 'primary' | 'secondary' | 'ghost';
		size?: 'md' | 'sm';
		action?: string;
		disabled?: boolean;
		onclick?: () => void;
		children: Snippet;
	}

	let { variant, size = 'md', action, disabled = false, onclick, children }: Props = $props();

	function press() {
		play('press');
		onclick?.();
	}
</script>

<button type="button" class="btn {variant} {size}" {disabled} data-action={action} onclick={press}>
	{@render children()}
</button>

<style>
	.btn {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		min-width: 48px;
		min-height: 54px;
		padding: 0 24px;
		border: 0;
		border-radius: var(--radius);
		font: 700 17px/1.1 var(--font-ui);
		white-space: nowrap;
		cursor: pointer;
		user-select: none;
		-webkit-user-select: none;
		touch-action: manipulation;
		transition:
			transform 0.07s ease-out,
			box-shadow 0.07s ease-out,
			background-color 0.07s ease-out;
	}

	.sm {
		min-height: 46px;
		padding: 0 18px;
		font-size: 15px;
	}

	.primary {
		background: var(--primary);
		color: var(--on-primary);
		box-shadow: 0 var(--ledge) 0 var(--primary-ledge);
	}

	.secondary {
		background: var(--raised);
		color: var(--text);
		border: 1px solid var(--line);
		box-shadow: 0 var(--ledge) 0 var(--shadow);
	}

	.ghost {
		background: transparent;
		color: var(--text);
		text-decoration: underline;
		text-decoration-color: var(--line);
		text-underline-offset: 4px;
	}

	.btn:active:not(:disabled) {
		transform: translateY(var(--ledge));
		box-shadow: 0 0 0 transparent;
	}

	.primary:active:not(:disabled) {
		background: var(--primary-press);
	}

	.ghost:active:not(:disabled) {
		transform: translateY(2px);
	}

	@media (hover: hover) {
		.primary:hover:not(:disabled) {
			background: var(--primary-press);
		}
		.secondary:hover:not(:disabled),
		.ghost:hover:not(:disabled) {
			background: var(--line);
		}
	}

	.btn:disabled {
		cursor: not-allowed;
		opacity: 0.45;
	}
</style>
