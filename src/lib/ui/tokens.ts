export const tokens = {
	ground: '#111234',
	'ground-dot': '#17183f',
	surface: '#1a1c44',
	raised: '#232651',
	line: '#353967',
	shadow: '#05041f',
	text: '#f2f3fa',
	'text-soft': '#e3e5f1',
	muted: '#b9bcd1',
	off: '#5d617d',
	ink: '#111234',
	primary: '#6bd672',
	'primary-press': '#60cb67',
	'primary-ledge': '#26722e',
	'on-primary': '#071808',
	gold: '#f4c34a',
	'gold-ledge': '#7d5e02',
	'gold-tint': '#2e2b45',
	reveal: '#e8ba49',
	'on-reveal': '#171103',
	imposter: '#eb616d',
	'imposter-ledge': '#650d1d',
	'imposter-tint': '#2d2248',
	wavelength: '#38ccc8',
	'wavelength-ledge': '#065c5a',
	'wavelength-tint': '#1d2c50'
} as const;

export type Token = keyof typeof tokens;

const grounds: Token[] = ['ground', 'surface', 'raised', 'gold-tint', 'imposter-tint', 'wavelength-tint'];

export const textPairs: [Token, Token][] = [
	...grounds.flatMap((bg): [Token, Token][] => [
		['text', bg],
		['text-soft', bg],
		['muted', bg],
		['gold', bg]
	]),
	['on-primary', 'primary'],
	['on-primary', 'primary-press'],
	['ink', 'gold'],
	['ink', 'imposter'],
	['ink', 'wavelength'],
	['on-reveal', 'reveal'],
	['primary', 'on-primary'],
	['primary', 'surface'],
	['imposter', 'surface'],
	['wavelength', 'surface']
];

function luminance(hex: string): number {
	const [r, g, b] = [1, 3, 5].map((i) => {
		const c = parseInt(hex.slice(i, i + 2), 16) / 255;
		return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
}
