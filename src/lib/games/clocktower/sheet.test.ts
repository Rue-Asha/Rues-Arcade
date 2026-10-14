import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import { characters } from './characters.ts';
import RoleCard from './RoleCard.svelte';

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
