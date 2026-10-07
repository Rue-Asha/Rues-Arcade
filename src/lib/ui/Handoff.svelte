<script lang="ts">
	import { band, pop } from '#lib/motion.ts';

	interface Props {
		heading: string;
		label?: string;
		note?: string;
		colour?: string;
	}

	let { heading, label, note, colour }: Props = $props();
</script>

<section class="handoff" data-testid="handoff" aria-label="Übergabe">
	<div class="band" style="--band: {colour ? `var(--${colour})` : 'var(--c, var(--gold))'}" in:band|global>
		{#if label}<p class="label">{label}</p>{/if}
		<h2 in:pop|global>{heading}</h2>
	</div>
	{#if note}<p class="note">{note}</p>{/if}
</section>

<style>
	.handoff {
		display: flex;
		flex-direction: column;
		gap: 12px;
		min-width: 0;
	}

	.band {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 24px 16px;
		border-radius: var(--radius-lg);
		background: var(--band);
		color: var(--ink);
		text-align: center;
	}

	.label {
		color: inherit;
	}

	h2 {
		max-width: 100%;
		font-weight: 800;
		font-size: clamp(32px, 9vw, 64px);
		line-height: 1;
		letter-spacing: -0.03em;
		overflow-wrap: anywhere;
	}

	.note {
		font-weight: 600;
		font-size: 17px;
		text-align: center;
	}
</style>
