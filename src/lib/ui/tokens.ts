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
	'imposter-text': '#ed6c78',
	'imposter-ledge': '#650d1d',
	'imposter-tint': '#2d2248',
	wavelength: '#38ccc8',
	'wavelength-ledge': '#065c5a',
	'wavelength-tint': '#1d2c50',
	codes: '#9d8cff',
	'codes-ledge': '#423b6b',
	'codes-tint': '#22214c',
	duck: '#ff9f43',
	'duck-ledge': '#6b431c',
	'duck-tint': '#2e2336',
	'most-likely': '#f27bc4',
	'most-likely-ledge': '#663452',
	'most-likely-tint': '#2c1f45',
	feud: '#5b9dff',
	'feud-ledge': '#1d4a8f',
	'feud-tint': '#1d2a55',
	clocktower: '#e0645a',
	'clocktower-ledge': '#6b1f19',
	'clocktower-tint': '#261c3a'
} as const;

export const motion = {
	'ease-in': 'cubic-bezier(0.5, 0, 0.75, 0)',
	'ease-pop': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
	'ease-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
	'dur-out': 180,
	'dur-in': 420,
	'dur-hero': 560
} as const;

export type Token = keyof typeof tokens;

const grounds: Token[] = [
	'ground',
	'surface',
	'raised',
	'gold-tint',
	'imposter-tint',
	'wavelength-tint',
	'codes-tint',
	'duck-tint',
	'most-likely-tint',
	'feud-tint',
	'clocktower-tint'
];

export const textPairs: [Token, Token][] = [
	...grounds.flatMap((bg): [Token, Token][] => [
		['text', bg],
		['text-soft', bg],
		['muted', bg],
		['gold', bg],
		['imposter-text', bg]
	]),
	['on-primary', 'primary'],
	['on-primary', 'primary-press'],
	['ink', 'gold'],
	['ink', 'imposter'],
	['ink', 'wavelength'],
	['ink', 'codes'],
	['ink', 'duck'],
	['ink', 'most-likely'],
	['ink', 'feud'],
	['ink', 'clocktower'],
	['on-reveal', 'reveal'],
	['primary', 'on-primary'],
	['primary', 'surface'],
	['imposter', 'surface'],
	['wavelength', 'surface'],
	['codes', 'surface'],
	['duck', 'surface'],
	['most-likely', 'surface'],
	['feud', 'surface'],
	['clocktower', 'surface']
];

export const clocktowerNight = {
	ground: '#100e14',
	'ground-dot': '#100e14',
	surface: '#1a1721',
	raised: '#26222d',
	line: '#3d3744',
	shadow: '#070509',
	text: '#ece4d4',
	'text-soft': '#cfc4ae',
	muted: '#b9ad97',
	off: '#6e6659',
	ink: '#100e14',
	primary: '#e1ad63',
	'primary-press': '#d19f58',
	'primary-ledge': '#7a5a22',
	'on-primary': '#17100a',
	gold: '#e1ad63',
	'gold-ledge': '#7a5a22',
	'gold-tint': '#2b2318',
	reveal: '#e1ad63',
	'on-reveal': '#17100a',
	imposter: '#d55753',
	'imposter-text': '#f07f77',
	'imposter-ledge': '#6b1f1d',
	'imposter-tint': '#2a1618',
	clocktower: '#e0645a',
	'clocktower-ledge': '#6b1f19',
	'clocktower-tint': '#261c3a',
	good: '#519fdd',
	'good-tint': '#14202c',
	outsider: '#99cedf',
	evil: '#e66e68',
	'evil-tint': '#2a1618',
	demon: '#f05653'
} as const;

// on parchment the fills are dark, so ink (text on a fill) turns light
export const clocktowerDay: Record<keyof typeof clocktowerNight, string> = {
	ground: '#e8dfcb',
	'ground-dot': '#e8dfcb',
	surface: '#efe6d3',
	raised: '#f5eedf',
	line: '#c4b697',
	shadow: '#a99b7b',
	text: '#1c1714',
	'text-soft': '#3b332c',
	muted: '#4a4038',
	off: '#8a7d69',
	ink: '#f6f0e2',
	primary: '#724d0b',
	'primary-press': '#664409',
	'primary-ledge': '#3d2705',
	'on-primary': '#f6f0e2',
	gold: '#724d0b',
	'gold-ledge': '#3d2705',
	'gold-tint': '#ddd0b0',
	reveal: '#724d0b',
	'on-reveal': '#f6f0e2',
	imposter: '#a12f2f',
	'imposter-text': '#8f2828',
	'imposter-ledge': '#561515',
	'imposter-tint': '#e4cdc0',
	clocktower: '#a12f2f',
	'clocktower-ledge': '#561515',
	'clocktower-tint': '#e6d4c6',
	good: '#2a5888',
	'good-tint': '#d3d9dd',
	outsider: '#1f5c70',
	evil: '#a12f2f',
	'evil-tint': '#e6cfc2',
	demon: '#8a1f22'
};

export type ClocktowerToken = keyof typeof clocktowerNight;

const clocktowerGrounds: ClocktowerToken[] = [
	'ground',
	'surface',
	'raised',
	'gold-tint',
	'clocktower-tint',
	'good-tint',
	'evil-tint'
];

// the same pairs hold for both variants
export const clocktowerPairs: [ClocktowerToken, ClocktowerToken][] = [
	...clocktowerGrounds.flatMap((bg): [ClocktowerToken, ClocktowerToken][] => [
		['text', bg],
		['text-soft', bg],
		['muted', bg],
		['gold', bg],
		['imposter-text', bg]
	]),
	...(['ground', 'surface', 'raised'] as const).flatMap((bg): [ClocktowerToken, ClocktowerToken][] => [
		['good', bg],
		['outsider', bg],
		['evil', bg],
		['demon', bg]
	]),
	['good', 'good-tint'],
	['outsider', 'good-tint'],
	['evil', 'evil-tint'],
	['demon', 'evil-tint'],
	['on-primary', 'primary'],
	['on-primary', 'primary-press'],
	['ink', 'gold'],
	['ink', 'imposter'],
	['ink', 'clocktower'],
	['on-reveal', 'reveal'],
	['primary', 'on-primary'],
	['clocktower', 'surface']
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
