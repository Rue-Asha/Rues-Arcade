import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import { characters } from './characters.ts';
import RoleCard from './RoleCard.svelte';
import Sheet from './Sheet.svelte';

function html(text: string): string {
	return text.replaceAll('&#39;', "'").replaceAll('&amp;', '&').replaceAll('&quot;', '"');
}

describe('clocktower role card', () => {
	it('shows icon, name, team, explanation and ability for every character', () => {
		const team = { townsfolk: 'Dorfbewohner', outsider: 'Außenseiter', minion: 'Scherge', demon: 'Dämon' };
		for (const c of characters) {
			const { body } = render(RoleCard, { props: { character: c.id } });
			const out = html(body);
			expect(out, c.id).toContain('data-testid="role-card"');
			expect(out, c.id).toContain(c.name);
			expect(out, c.id).toContain(team[c.team]);
			expect(out, c.id).toContain(c.de);
			expect(out, c.id).toContain(c.ability);
			expect(out, c.id).toContain(`d="${c.icon}"`);
			expect(out, c.id).toContain('aria-hidden="true"');
		}
	});
});

describe('clocktower sheet', () => {
	it('Scenario: Sheet lists all characters', () => {
		const out = html(render(Sheet, { props: {} }).body);
		expect(out).toContain('data-testid="sheet"');
		for (const c of characters) {
			expect(out, c.id).toContain(c.name);
			expect(out, c.id).toContain(c.de);
			expect(out, c.id).toContain(c.ability);
		}
		for (const team of ['Dorfbewohner', 'Außenseiter', 'Schergen', 'Dämon']) expect(out, team).toContain(team);
		expect(out).toContain('So gewinnt ihr');
		expect(out).toContain('Das Gute gewinnt, wenn der Dämon stirbt.');
		expect(out).toContain('Das Böse gewinnt, wenn nur noch zwei Spieler leben.');
		expect(out).toContain('game-icons.net');
		expect(out).toContain('CC BY 3.0');
		expect(out.replace(/\s+/g, ' ')).toContain('The Pandemonium Institute');
	});

	it('has the pages Gut and Böse with the good and the evil characters on them', () => {
		const out = html(render(Sheet, { props: {} }).body);
		const page = (name: string) => {
			const from = out.indexOf(`data-page-name="${name}"`);
			expect(from, name).toBeGreaterThan(-1);
			const rest = out.slice(from + 1);
			const next = rest.indexOf('data-page-name=');
			return next === -1 ? rest : rest.slice(0, next);
		};
		const good = page('Gut');
		const evil = page('Böse');
		for (const c of characters) {
			const side = c.team === 'townsfolk' || c.team === 'outsider' ? good : evil;
			const other = side === good ? evil : good;
			expect(side, c.id).toContain(c.ability);
			expect(other, c.id).not.toContain(c.ability);
		}
	});
});
