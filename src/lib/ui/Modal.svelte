<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		title: string;
		onclose: () => void;
		children: Snippet;
	}

	let { open, title, onclose, children }: Props = $props();

	let dialog: HTMLDialogElement;
	const id = $props.id();

	$effect(() => {
		if (open && !dialog.open) dialog.showModal();
		else if (!open && dialog.open) dialog.close();
	});

	function cancel(e: Event) {
		e.preventDefault();
		onclose();
	}

	function backdrop(e: MouseEvent) {
		if (e.target === dialog) onclose();
	}
</script>

<dialog bind:this={dialog} aria-labelledby="{id}-title" oncancel={cancel} onclick={backdrop}>
	{#if open}
		<div class="box">
			<header>
				<h2 id="{id}-title">{title}</h2>
				<button class="close" type="button" aria-label="Schließen" onclick={onclose}>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg>
				</button>
			</header>
			{@render children()}
		</div>
	{/if}
</dialog>

<style>
	dialog {
		width: min(100% - 2 * var(--gutter), 560px);
		max-height: calc(100dvh - 2 * var(--gutter));
		padding: 0;
		border: 0;
		background: transparent;
		color: var(--text);
		overflow: visible;
	}

	dialog::backdrop {
		background: rgb(5 4 31 / 0.72);
	}

	.box {
		display: flex;
		flex-direction: column;
		gap: 16px;
		max-height: calc(100dvh - 2 * var(--gutter) - var(--ledge));
		overflow-y: auto;
		padding: 20px;
		border-radius: var(--radius-xl);
		background: var(--surface);
		border: 1px solid var(--line);
		box-shadow: 0 var(--ledge) 0 var(--shadow);
		animation: rise 0.32s var(--ease-out) both;
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.close {
		display: grid;
		place-items: center;
		flex: none;
		width: 44px;
		height: 44px;
		padding: 0;
		border: 0;
		border-radius: var(--radius-sm);
		background: var(--raised);
		color: var(--text);
		box-shadow: 0 4px 0 var(--shadow);
		cursor: pointer;
	}

	.close:active {
		transform: translateY(4px);
		box-shadow: none;
	}
</style>
