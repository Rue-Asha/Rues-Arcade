<script lang="ts">
	let { name, votes }: { name: string; votes: number } = $props();
</script>

<section class="card" data-testid="block-card">
	<header>
		<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true" focusable="false">
			<g transform="rotate(45 12 12)">
				<rect x="11" y="3" width="2.4" height="19" rx="1.2" />
				<path d="M13 3.5H9.5C6 3.5 3.5 5.5 3 8.2C3.5 11 6 13 9.5 13H13Z" />
			</g>
		</svg>
		<h3>Auf dem Block</h3>
	</header>
	<div class="body">
		<p class="who">{name}</p>
		<p class="votes">{votes} Stimmen</p>
	</div>
</section>

<style>
	.card {
		box-sizing: border-box;
		align-self: center;
		width: min(100%, 36ch);
		overflow: hidden;
		border: 2px solid var(--gold);
		border-radius: var(--radius-lg);
		background: var(--surface);
		box-shadow: 0 var(--ledge) 0 var(--gold-ledge);
		color: var(--text);
	}

	header {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 6px 12px;
		background: var(--clocktower);
		color: var(--ink);
	}

	h3 {
		margin: 0;
		color: inherit;
		font: 700 16px/1.4 var(--font-ui);
		letter-spacing: 0.04em;
	}

	.body {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 16px;
		padding: 6px 16px 8px;
	}

	p {
		margin: 0;
		color: inherit;
	}

	.who {
		min-width: 0;
		overflow: hidden;
		font: 400 24px/1.2 var(--font-display);
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.votes {
		flex: none;
		font: 400 34px/1.1 var(--font-num);
		font-variant-numeric: tabular-nums;
	}
</style>
