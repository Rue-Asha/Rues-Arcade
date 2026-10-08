<script lang="ts">
	import Button from './Button.svelte';
	import { clampPage, pageCount } from './pager.ts';

	interface Props {
		page: number;
		total: number;
		size: number;
	}

	let { page = $bindable(), total, size }: Props = $props();

	const pages = $derived(pageCount(total, size));
	const current = $derived(clampPage(page, total, size));

	$effect(() => {
		if (page !== current) page = current;
	});
</script>

{#if pages > 1}
	<nav class="pager" aria-label="Seiten">
		<Button variant="secondary" size="sm" disabled={current === 0} onclick={() => (page = current - 1)}>Zurück</Button>
		<span class="muted">Seite {current + 1} von {pages}</span>
		<Button variant="secondary" size="sm" disabled={current === pages - 1} onclick={() => (page = current + 1)}>Weiter</Button>
	</nav>
{/if}

<style>
	.pager {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16px;
	}
</style>
