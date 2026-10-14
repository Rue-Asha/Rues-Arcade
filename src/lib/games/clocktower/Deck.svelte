<script lang="ts">
	import type { ExplanationProps } from '#lib/games/registry.ts';
	import Button from '#lib/ui/Button.svelte';

	let { count, onclose }: ExplanationProps = $props();
</script>

<section class="panel stack gap" aria-labelledby="deck">
	<h1 id="deck">Erklärung</h1>
	<p class="muted">Für {count} Spieler</p>
	<div class="row">
		<Button variant="primary" onclick={onclose}>Schließen</Button>
	</div>
</section>

<style>
	.gap {
		padding: 20px;
	}
</style>
