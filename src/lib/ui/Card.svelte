<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ContentType } from '#lib/content/types.ts';

	interface Props {
		tone?: ContentType | 'neutral';
		children: Snippet;
	}

	let { tone = 'neutral', children }: Props = $props();

	const colour: Record<ContentType, string> = {
		imposter_pairs: 'imposter',
		wavelength_spectra: 'wavelength',
		codes_words: 'codes',
		duck_words: 'duck',
		most_likely_prompts: 'most-likely'
	};
	const c = $derived(tone === 'neutral' ? null : colour[tone]);
</script>

<div
	class="card"
	class:toned={c}
	style={c ? `--c: var(--${c}); --tint: var(--${c}-tint); --edge: var(--${c}-ledge)` : undefined}
>
	{@render children()}
</div>

<style>
	.card {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 20px;
		border-radius: var(--radius-lg);
		background: var(--surface);
		box-shadow: 0 var(--ledge) 0 var(--shadow);
	}

	.toned {
		background: var(--tint);
		box-shadow:
			inset 0 3px 0 var(--c),
			0 var(--ledge) 0 var(--edge);
	}
</style>
