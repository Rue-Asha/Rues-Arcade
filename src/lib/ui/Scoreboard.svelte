<script lang="ts">
	import { countUp } from '#lib/motion.ts';

	interface Props {
		rows: { name: string; score: number; lead?: boolean }[];
	}

	let { rows }: Props = $props();
</script>

<section class="board" aria-label="Punktestand">
	<h2 class="label">Punktestand</h2>
	<ol class="rows rise">
		{#each rows as row, i (row.name)}
			<li class="row" class:lead={row.lead}>
				<span class="rank data">{i + 1}</span>
				<span class="who">
					{row.name}
					{#if row.lead}
						<span class="crown" aria-label="Führt">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 18h16l-1.2-10-4.3 3.5L12 5l-2.5 6.5L5.2 8z"></path></svg>
						</span>
					{/if}
				</span>
				<span class="pts data" use:countUp={row.score}></span>
			</li>
		{/each}
	</ol>
</section>

<style>
	.board {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 16px;
		border-radius: var(--radius-xl);
		background: var(--surface);
		box-shadow: 0 var(--ledge) 0 var(--shadow);
	}

	.rows {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.row {
		display: flex;
		align-items: center;
		gap: 12px;
		min-height: 46px;
		padding: 0 14px;
		border-radius: var(--radius-sm);
		background: var(--raised);
	}

	.rank {
		width: 20px;
		font-size: 12px;
	}

	.who {
		display: flex;
		flex: 1;
		align-items: center;
		gap: 8px;
		min-width: 0;
		font-weight: 700;
		font-size: 17px;
		overflow-wrap: anywhere;
	}

	.pts {
		min-width: 64px;
		font-size: 13px;
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.lead {
		background: var(--primary);
		color: var(--on-primary);
	}

	.crown {
		display: grid;
		place-items: center;
		flex: none;
		width: 26px;
		height: 26px;
		border-radius: 7px;
		background: var(--on-primary);
		color: var(--primary);
		animation: bob 1.6s ease-in-out infinite;
	}

	@keyframes bob {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-2px);
		}
	}
</style>
