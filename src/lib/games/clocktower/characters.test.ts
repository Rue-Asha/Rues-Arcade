import { describe, expect, it } from 'vitest';
import { alignment, byId, characters } from './characters.ts';
import type { CharacterId } from './types.ts';

// research/rules.md §2, verbatim from TPI roles.json
const abilities: Record<CharacterId, string> = {
	washerwoman: 'You start knowing that 1 of 2 players is a particular Townsfolk.',
	librarian: 'You start knowing that 1 of 2 players is a particular Outsider. (Or that zero are in play.)',
	investigator: 'You start knowing that 1 of 2 players is a particular Minion.',
	chef: 'You start knowing how many pairs of evil players there are.',
	empath: 'Each night, you learn how many of your 2 alive neighbors are evil.',
	'fortune-teller': 'Each night, choose 2 players: you learn if either is a Demon. There is a good player that registers as a Demon to you.',
	undertaker: 'Each night*, you learn which character died by execution today.',
	monk: 'Each night*, choose a player (not yourself): they are safe from the Demon tonight.',
	ravenkeeper: 'If you die at night, you are woken to choose a player: you learn their character.',
	virgin: 'The 1st time you are nominated, if the nominator is a Townsfolk, they are executed immediately.',
	slayer: 'Once per game, during the day, publicly choose a player: if they are the Demon, they die.',
	soldier: 'You are safe from the Demon.',
	mayor: 'If only 3 players live & no execution occurs, your team wins. If you die at night, another player might die instead.',
	butler: 'Each night, choose a player (not yourself): tomorrow, you may only vote if they are voting too.',
	drunk: 'You do not know you are the Drunk. You think you are a Townsfolk character, but you are not.',
	recluse: 'You might register as evil & as a Minion or Demon, even if dead.',
	saint: 'If you die by execution, your team loses.',
	poisoner: 'Each night, choose a player: they are poisoned tonight and tomorrow day.',
	spy: 'Each night, you see the Grimoire. You might register as good & as a Townsfolk or Outsider, even if dead.',
	'scarlet-woman': "If there are 5 or more players alive & the Demon dies, you become the Demon. (Travellers don't count.)",
	baron: 'There are extra Outsiders in play. [+2 Outsiders]',
	imp: 'Each night*, choose a player: they die. If you kill yourself this way, a Minion becomes the Imp.'
};

describe('clocktower characters', () => {
	it('Scenario: Twenty-two characters by team', () => {
		expect(characters).toHaveLength(22);
		expect(new Set(characters.map((c) => c.id)).size).toBe(22);
		const team = (t: string) => characters.filter((c) => c.team === t).length;
		expect([team('townsfolk'), team('outsider'), team('minion'), team('demon')]).toEqual([13, 4, 4, 1]);
		for (const c of characters) {
			expect(c.name.trim(), c.id).not.toBe('');
			expect(c.ability, c.id).toBe(abilities[c.id]);
			expect(c.de.trim(), c.id).not.toBe('');
			expect(c.de, c.id).not.toContain('!');
			expect(c.hint.trim(), c.id).not.toBe('');
			expect(c.hint, c.id).not.toContain('!');
			expect(['first', 'each', 'each*', 'death', 'day', 'passive', 'setup'], c.id).toContain(c.trigger);
			expect(c.icon, c.id).toMatch(/^[Mm][0-9MmLlHhVvCcSsQqTtAaZz.,\s-]+$/);
			expect(byId[c.id]).toBe(c);
		}
		expect(new Set(characters.map((c) => c.icon)).size).toBe(22);
	});

	it('alignment follows the team', () => {
		expect(alignment('saint')).toBe('good');
		expect(alignment('recluse')).toBe('good');
		expect(alignment('chef')).toBe('good');
		expect(alignment('spy')).toBe('evil');
		expect(alignment('imp')).toBe('evil');
	});

	it('trigger labels follow the night sheet', () => {
		expect(byId.washerwoman.trigger).toBe('first');
		expect(byId.empath.trigger).toBe('each');
		expect(byId.undertaker.trigger).toBe('each*');
		expect(byId.imp.trigger).toBe('each*');
		expect(byId.ravenkeeper.trigger).toBe('death');
		expect(byId.slayer.trigger).toBe('day');
		expect(byId.baron.trigger).toBe('setup');
	});
});
