<script lang="ts">
	import Art from '#lib/deco/Art.svelte';
	import { playerRange, type GameEntry } from '#lib/games/registry.ts';

	interface Props {
		entry?: GameEntry;
		locked?: string;
	}

	let { entry, locked }: Props = $props();

	const def = $derived(entry?.def);
</script>

{#if def}
	<a
		class="tile"
		href="/spiele/{def.slug}"
		style="--c: var(--{def.colour}); --tint: var(--{def.colour}-tint); --edge: var(--{def.colour}-ledge)"
	>
		<span class="art">
			<Art slug={def.slug} place="tile" />
		</span>
		<span class="body">
			<span class="badge">
				<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					{#if def.slug === 'imposter'}
						<path d="M4 11c0-4.4 3.6-8 8-8s8 3.6 8 8v4c0 3.3-3.6 6-8 6s-8-2.7-8-6z"></path>
						<path d="M7.5 12.5c1-.9 2.5-.9 3.5 0"></path>
						<path d="M13 12.5c1-.9 2.5-.9 3.5 0"></path>
						<path d="M10 17h4"></path>
					{:else if def.slug === 'wavelength'}
						<path d="M3 18a9 9 0 0 1 18 0"></path>
						<path d="M12 18l4.5-6.5"></path>
						<circle cx="12" cy="18" r="1.6"></circle>
						<path d="M6.5 13.5l1 .8"></path>
						<path d="M12 9v1.3"></path>
					{:else}
						<rect x="3" y="7" width="18" height="11" rx="3"></rect>
						<path d="M8 11v3M6.5 12.5h3"></path>
						<circle cx="16" cy="12.5" r="1"></circle>
					{/if}
				</svg>
			</span>
			<span class="text">
				<span class="name">{def.name}</span>
				<span class="pitch">{entry?.pitch}</span>
				<span class="meta">{playerRange(def)}</span>
			</span>
			<span class="go" aria-hidden="true">
				<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"></path></svg>
			</span>
		</span>
	</a>
{:else}
	<div class="tile locked" aria-disabled="true">
		<Art place="tile" />
		<span class="badge">
			<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<rect x="5" y="11" width="14" height="9" rx="2"></rect>
				<path d="M8 11V8a4 4 0 0 1 8 0v3"></path>
			</svg>
		</span>
		<span class="text">
			<span class="name">{locked}</span>
			<span class="meta">Bald verfügbar</span>
		</span>
	</div>
{/if}

<style>
	.tile {
		position: relative;
		display: flex;
		align-items: center;
		gap: 18px;
		min-height: 100px;
		padding: 0 20px;
		border-radius: var(--radius-lg);
		background: var(--tint);
		color: var(--text);
		text-decoration: none;
		box-shadow:
			inset 0 3px 0 var(--c),
			0 var(--ledge) 0 var(--edge);
		transition:
			transform 0.08s ease-out,
			box-shadow 0.08s ease-out;
	}

	a.tile {
		flex-direction: column;
		align-items: stretch;
		gap: 0;
		padding: 0;
		overflow: hidden;
	}

	/* the art covers the inset top edge, so the edge moves onto it */
	.art {
		position: relative;
		display: block;
		height: 150px;
		border-top: 3px solid var(--c);
		background: rgb(5 4 31 / 0.18);
	}

	.body {
		display: flex;
		flex: 1;
		align-items: center;
		gap: 18px;
		padding: 18px 20px 20px;
	}

	a.tile:active {
		transform: translateY(var(--ledge));
		box-shadow:
			inset 0 3px 0 var(--c),
			0 0 0 var(--edge);
	}

	@media (hover: hover) {
		a.tile:hover .go {
			background: var(--c);
			color: var(--ink);
		}
	}

	.badge {
		position: relative;
		display: grid;
		place-items: center;
		flex: none;
		width: 60px;
		height: 60px;
		border-radius: var(--radius-sm);
		background: var(--c);
		color: var(--ink);
	}

	.text {
		position: relative;
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 6px;
		min-width: 0;
	}

	.name {
		font-size: 24px;
		font-weight: 700;
		line-height: 1;
		letter-spacing: -0.02em;
		overflow-wrap: anywhere;
	}

	.pitch {
		font-size: 15px;
		line-height: 1.35;
		color: var(--text-soft);
	}

	.meta {
		font-size: 14px;
		font-weight: 500;
		color: var(--muted);
	}

	.go {
		display: grid;
		place-items: center;
		flex: none;
		width: 40px;
		height: 40px;
		border-radius: var(--radius-sm);
		background: var(--raised);
		color: var(--text);
		transition: background-color 0.12s;
	}

	/* keeps the text clear of the dashed corner */
	.locked {
		overflow: hidden;
		padding-right: 56px;
		background: var(--surface);
		box-shadow: 0 var(--ledge) 0 var(--shadow);
		cursor: default;
	}

	.locked .badge {
		background: var(--raised);
		color: var(--muted);
	}

	.locked .name {
		color: var(--muted);
		font-size: 20px;
	}
</style>
