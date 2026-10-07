<script lang="ts">
	import { countUp, pop } from '#lib/motion.ts';

	interface Props {
		verdict: string;
		points: number;
	}

	let { verdict, points }: Props = $props();
</script>

<div class="outcome">
	<h2 data-testid="verdict">{verdict}</h2>
	<p class="chip data" class:miss={points === 0} data-testid="points" in:pop|global><span>+</span><span use:countUp={points}></span></p>
</div>

<style>
	.outcome {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 14px;
		text-align: center;
	}

	h2 {
		font-weight: 800;
		font-size: clamp(26px, 6vw, 40px);
		line-height: 1.1;
		overflow-wrap: anywhere;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		padding: 0 18px;
		border-radius: var(--radius);
		background: var(--gold);
		color: var(--ink);
		box-shadow: 0 4px 0 var(--gold-ledge);
		font-size: 20px;
		font-variant-numeric: tabular-nums;
	}

	.miss {
		background: var(--raised);
		color: var(--muted);
		box-shadow: 0 4px 0 var(--shadow);
	}
</style>
