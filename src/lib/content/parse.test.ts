import { describe, expect, it } from 'vitest';
import { parseBulk, singleError } from './parse.ts';
import { MAX_TEXT } from './types.ts';

describe('parseBulk', () => {
	it('splits each line at the pipe and trims both sides', () => {
		expect(parseBulk('Hund | Katze\r\n  Sonne|Mond  ')).toEqual({
			rows: [
				{ a: 'Hund', b: 'Katze' },
				{ a: 'Sonne', b: 'Mond' }
			],
			skipped: 0,
			errors: []
		});
	});

	it('skips empty and whitespace-only lines', () => {
		const r = parseBulk('\nA | B\n   \n');
		expect(r.rows).toEqual([{ a: 'A', b: 'B' }]);
		expect(r.skipped).toBe(3);
	});

	it('reports a line without a pipe by its line number', () => {
		const r = parseBulk('A | B\n\nkaputt\nC | D');
		expect(r.rows).toHaveLength(2);
		expect(r.errors).toEqual([{ line: 3, message: expect.stringContaining('|') }]);
	});

	it('reports lines with an empty side or more than one pipe', () => {
		const r = parseBulk(' | B\nA |\nA | B | C');
		expect(r.rows).toEqual([]);
		expect(r.errors.map((e) => e.line)).toEqual([1, 2, 3]);
	});

	it('keeps name placeholders unchanged', () => {
		expect(parseBulk('Was mag {NAME}? | Was mag {NAME2}?').rows).toEqual([
			{ a: 'Was mag {NAME}?', b: 'Was mag {NAME2}?' }
		]);
	});

	it('Scenario: Overlong text rejected (bulk line)', () => {
		const r = parseBulk(`${'x'.repeat(MAX_TEXT + 1)} | B\n${'y'.repeat(MAX_TEXT)} | B`);
		expect(r.rows).toEqual([{ a: 'y'.repeat(MAX_TEXT), b: 'B' }]);
		expect(r.errors).toEqual([{ line: 1, message: expect.stringContaining(String(MAX_TEXT)) }]);
	});

	it('single mode keeps each trimmed line whole, pipes included', () => {
		const r = parseBulk(`  Anker \n\nA | B\n${'x'.repeat(MAX_TEXT + 1)}`, true);
		expect(r.rows).toEqual([
			{ a: 'Anker', b: '' },
			{ a: 'A | B', b: '' }
		]);
		expect(r.skipped).toBe(1);
		expect(r.errors).toEqual([{ line: 4, message: expect.stringContaining(String(MAX_TEXT)) }]);
	});

	it('singleError refuses empty and overlong text', () => {
		expect(singleError('')).not.toBeNull();
		expect(singleError('x'.repeat(MAX_TEXT + 1))).toContain(String(MAX_TEXT));
		expect(singleError('x'.repeat(MAX_TEXT))).toBeNull();
	});
});
