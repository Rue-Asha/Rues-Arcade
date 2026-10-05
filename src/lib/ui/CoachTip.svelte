<script lang="ts">
	import Button from '#lib/ui/Button.svelte';

	interface Props {
		step: number;
		total: number;
		text: string;
		onexit: () => void;
	}

	let { step, total, text, onexit }: Props = $props();

	$effect(() => {
		document.documentElement.classList.add('coached');
		return () => document.documentElement.classList.remove('coached');
	});
</script>

<aside class="tip" aria-label="Demo">
	<div class="bar" aria-hidden="true"><span style="transform: scaleX({total ? step / total : 0})"></span></div>
	<div class="body">
		<p class="label">Demo · Schritt {step} von {total}</p>
		<p class="text" aria-live="polite">{text}</p>
	</div>
	<Button variant="secondary" size="sm" onclick={onexit}>Demo beenden</Button>
</aside>

<style>
	:global(html.coached body) {
		padding-bottom: 180px;
	}

	.tip {
		position: fixed;
		z-index: 20;
		left: var(--gutter);
		right: var(--gutter);
		bottom: calc(var(--gutter) + env(safe-area-inset-bottom));
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px 16px;
		padding: 16px 16px 22px;
		border-radius: var(--radius-xl);
		background: var(--surface);
		border: 1px solid var(--line);
		box-shadow:
			inset 0 3px 0 var(--gold),
			0 var(--ledge) 0 var(--shadow);
		animation: rise 0.4s var(--ease-out) both;
	}

	.bar {
		position: absolute;
		left: 16px;
		right: 16px;
		bottom: 8px;
		height: 3px;
		border-radius: 2px;
		background: var(--raised);
		overflow: hidden;
	}

	.bar span {
		display: block;
		height: 100%;
		background: var(--gold);
		transform-origin: left;
		transition: transform 0.4s var(--ease-out);
	}

	.body {
		display: flex;
		flex: 1 1 220px;
		flex-direction: column;
		gap: 4px;
	}

	.text {
		font-size: 16px;
		font-weight: 500;
		color: var(--text-soft);
	}

	@media (min-width: 1024px) {
		.tip {
			left: auto;
			right: max(var(--gutter), (100vw - var(--content)) / 2);
			width: 440px;
		}

		:global(html.coached body) {
			padding-bottom: 200px;
		}
	}
</style>
