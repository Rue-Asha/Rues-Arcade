import { required } from './setup.ts';
import type { CharacterId, Team, Trigger } from './types.ts';
import { sweepMs, threshold, voteOrder } from './vote.ts';

export type Kind = 'hero' | 'versus' | 'counts' | 'steps' | 'cards' | 'chapter' | 'vote' | 'roles' | 'sheet';
export type Mood = 'night' | 'deep' | 'day' | 'blood';
export type Tone = 'good' | 'evil' | 'plain';

export interface Card {
	label?: string;
	title: string;
	text: string;
	win?: string;
	tone?: Tone;
}

export interface Step {
	n: string;
	title: string;
	text?: string;
}

export interface Slide {
	id: string;
	kind: Kind;
	mood: Mood;
	eyebrow?: string;
	title: string;
	lead?: string;
	note?: string;
	cards?: Card[];
	steps?: Step[];
	roles?: CharacterId[];
	counts?: { team: Team; n: number; label: string }[];
	baron?: string;
	dots?: Team[];
	vote?: { alive: number; needed: number; caption: string };
}

export const triggerLabel: Record<Trigger, string> = {
	first: 'Erste Nacht',
	each: 'Jede Nacht',
	'each*': 'Jede Nacht*',
	death: 'Bei Tod',
	day: 'Tagsüber',
	passive: 'Immer',
	setup: 'Aufbau'
};

const teamNames: Record<Team, string> = { townsfolk: 'Townsfolk', outsider: 'Outsider', minion: 'Minions', demon: 'Dämon' };

function townSlide(count: number): Slide {
	const plain = required(count, false);
	const baron = required(count, true);
	const teams: Team[] = ['townsfolk', 'outsider', 'minion', 'demon'];
	return {
		id: 'town',
		kind: 'counts',
		mood: 'night',
		eyebrow: 'I · Die Grundlagen',
		title: `Die Stadt bei ${count} Spielern`,
		counts: teams.map((team) => ({ team, n: plain[team], label: teamNames[team] })),
		dots: teams.flatMap((team) => Array.from<Team>({ length: plain[team] }).fill(team)),
		baron: `Mit dem Baron: ${baron.townsfolk} Townsfolk und ${baron.outsider} Outsider`,
		note: count <= 6 ? 'keine Minion/Dämon-Info' : undefined
	};
}

const SEAT_MS = 750;

// The vote animation as data, timed like the game's sweep (vote.ts sweepAt) at the deck's own seat time: the hand
// starts on the boundary after the nominee (seat 0, start in seat units) and turns one full turn through n sectors,
// the nominee last; the voters are spread over seats 1..n-1 and each turns red when the hand enters its sector.
export function voteTimeline(n: number) {
	const needed = threshold(n);
	const voters = Array.from({ length: needed }, (_, j) => 1 + Math.floor((j * (n - 1)) / needed));
	const order = voteOrder(0, n);
	return {
		seats: n,
		nominee: 0 as const,
		voters,
		at: voters.map((v) => order.indexOf(v) * SEAT_MS),
		handMs: sweepMs(n, SEAT_MS),
		holdMs: 3000,
		start: 0.5
	};
}

function voteSlide(count: number): Slide {
	const needed = threshold(count);
	return {
		id: 'voting',
		kind: 'vote',
		mood: 'day',
		eyebrow: 'III · Der Tag',
		title: 'Abstimmung',
		lead: 'Die erzählende Person führt ihre Hand im Uhrzeigersinn über den Kreis. Wer die Hand sieht, wenn sie ihn erreicht, stimmt ab.',
		cards: [
			{
				label: 'Auf den Block kommt',
				title: 'Mindestens die Hälfte der Lebenden',
				text: 'und mehr Stimmen als alle anderen heute. Bei Gleichstand ist niemand auf dem Block.'
			},
			{
				label: 'Reihenfolge',
				title: 'Die nominierte Person stimmt zuletzt',
				text: 'Lebende dürfen über jede Nominierung abstimmen, so oft sie wollen.'
			}
		],
		vote: { alive: count, needed, caption: `${count} leben, ${needed} Stimmen nötig` }
	};
}

export function slides(count: number): Slide[] {
	return [
		{
			id: 'title',
			kind: 'hero',
			mood: 'night',
			eyebrow: 'Spielabend · Trouble Brewing',
			title: 'Blood on the Clocktower',
			lead: `Ein Spiel über Lügen, Logik und Mord, für ${count} Spieler`
		},
		{
			id: 'teams',
			kind: 'versus',
			mood: 'night',
			eyebrow: 'I · Die Grundlagen',
			title: 'Zwei Teams',
			cards: [
				{
					label: 'Townsfolk und Outsider',
					title: 'Gut',
					text: 'Niemand weiß, wer wer ist.',
					win: 'Gewinnt, wenn der Dämon stirbt.',
					tone: 'good'
				},
				{
					label: 'Dämon und Minions',
					title: 'Böse',
					text: 'Kennen einander und lügen.',
					win: 'Gewinnt, wenn nur noch zwei Spieler leben.',
					tone: 'evil'
				}
			]
		},
		townSlide(count),
		{
			id: 'flow',
			kind: 'steps',
			mood: 'night',
			eyebrow: 'I · Die Grundlagen',
			title: 'Ablauf eines Spiels',
			steps: [
				{ n: 'Start', title: 'Aufbau', text: 'Jede Person zieht einen geheimen Charakter.' },
				{ n: 'Einmal', title: 'Erste Nacht', text: 'Die Bösen lernen sich kennen, die Guten bekommen erste Hinweise.' },
				{ n: 'Wiederholt', title: 'Tag', text: 'Reden, nominieren, hinrichten.' },
				{ n: 'Wiederholt', title: 'Nacht', text: 'Der Dämon tötet.' },
				{ n: 'Ende', title: 'Sieg', text: 'Ein Team gewinnt.' }
			],
			note: 'bis der Dämon stirbt oder nur noch zwei Spieler leben'
		},
		{
			id: 'setup',
			kind: 'steps',
			mood: 'night',
			eyebrow: 'I · Die Grundlagen',
			title: 'Aufbau',
			steps: [
				{ n: '1', title: 'Charakter ziehen', text: 'Jede Person zieht einen Charakter aus dem Beutel.' },
				{ n: '2', title: 'Heimlich ansehen', text: 'Niemand sonst darf ihn sehen.' },
				{ n: '3', title: 'Verdeckt zurückgeben', text: 'In der App: Rolle zeigen, merken, verbergen und weitergeben.' },
				{ n: '4', title: 'Fähigkeit lesen', text: 'Auf der Karte oder auf dem Charakterblatt.' }
			]
		},
		{
			id: 'night-chapter',
			kind: 'chapter',
			mood: 'deep',
			eyebrow: 'Kapitel II',
			title: 'Die Nacht',
			lead: 'Augen zu. Einige von euch wachen auf.'
		},
		{
			id: 'night-works',
			kind: 'cards',
			mood: 'deep',
			eyebrow: 'II · Die Nacht',
			title: 'So läuft die Nacht',
			cards: [
				{ label: 'Dämmerung', title: 'Alle Augen schließen sich', text: 'Und bleiben zu, außer man wird geweckt.' },
				{ label: 'Wecken', title: 'Zweimal antippen', text: 'Die erzählende Person weckt die Spieler einzeln.' },
				{ label: 'Handeln', title: 'Schweigend', text: 'Zeigen, um zu wählen; Hinweise kommen per Geste.' },
				{ label: 'Morgen', title: 'Augen auf', text: 'Alle wachen auf, der Tag beginnt.' }
			]
		},
		{
			id: 'first-night',
			kind: 'cards',
			mood: 'deep',
			eyebrow: 'II · Die Nacht',
			title: 'Die erste Nacht',
			cards: [
				{
					label: 'Böse',
					title: 'Das Team trifft sich',
					text: 'Die Minions sehen den Dämon, der Dämon sieht die Minions und erfährt drei gute Charaktere, die nicht im Spiel sind: sichere Bluffs.',
					tone: 'evil'
				},
				{
					label: 'Gut',
					title: 'Erste Hinweise',
					text: 'Washerwoman, Librarian, Investigator, Chef und andere erfahren ihren ersten Hinweis.',
					tone: 'good'
				},
				{ label: 'Alle', title: 'Niemand stirbt', text: 'Der Imp tötet erst ab der zweiten Nacht.' }
			]
		},
		{
			id: 'day-chapter',
			kind: 'chapter',
			mood: 'day',
			eyebrow: 'Kapitel III',
			title: 'Der Tag',
			lead: 'Reden, beschuldigen und entscheiden, wer hängt.'
		},
		{
			id: 'discussion',
			kind: 'cards',
			mood: 'day',
			eyebrow: 'III · Der Tag',
			title: 'Diskussion',
			lead: 'Beim Morgengrauen verkündet die erzählende Person, wer gestorben ist, nie wie und nie welcher Charakter.',
			cards: [
				{ label: 'Reden', title: 'Teilt, was ihr wisst', text: 'Den eigenen Charakter zu nennen ist erlaubt.' },
				{ label: 'Flüstern', title: 'Privat sprechen', text: 'Zieht Leute beiseite für vertrauliche Gespräche.' },
				{ label: 'Lügen', title: 'Die Bösen tarnen sich', text: 'Jede Person darf bluffen.', tone: 'evil' }
			],
			note: 'Nach 5 bis 10 Minuten ruft die erzählende Person zur Nominierung auf.'
		},
		{
			id: 'nominations',
			kind: 'steps',
			mood: 'day',
			eyebrow: 'III · Der Tag',
			title: 'Nominierungen',
			lead: '„Ich nominiere Bob.“',
			steps: [
				{ n: '1', title: 'Nur Lebende dürfen nominieren' },
				{ n: '2', title: 'Höchstens einmal pro Tag nominieren' },
				{ n: '3', title: 'Höchstens einmal pro Tag nominiert werden' },
				{ n: '4', title: 'Die beschuldigte Person darf sich verteidigen', text: 'Danach wird abgestimmt.' },
				{ n: '5', title: 'Lebende stimmen über jede Nominierung ab', text: 'So oft sie wollen.' }
			]
		},
		voteSlide(count),
		{
			id: 'execution',
			kind: 'cards',
			mood: 'day',
			eyebrow: 'III · Der Tag',
			title: 'Hinrichtung und Tod',
			lead: 'Höchstens eine Hinrichtung pro Tag, danach fällt die Nacht.',
			cards: [
				{ label: 'Die Toten verlieren', title: 'Ihre Fähigkeit', text: 'Und das Recht zu nominieren.', tone: 'evil' },
				{ label: 'Die Toten behalten', title: 'Ihre Stimme', text: 'Sie reden frei und haben eine letzte Stimme.', tone: 'good' },
				{
					label: 'Immer',
					title: 'Charaktere bleiben geheim',
					text: 'Auch im Tod, und die Toten gewinnen weiter mit ihrem Team.'
				}
			]
		},
		{
			id: 'win',
			kind: 'versus',
			mood: 'day',
			eyebrow: 'III · So gewinnt ihr',
			title: 'So gewinnt ihr',
			cards: [
				{
					title: 'Das Gute gewinnt',
					text: 'Wenn der Dämon stirbt. Würden beide Teams gleichzeitig gewinnen, gewinnt das Gute.',
					tone: 'good'
				},
				{
					title: 'Das Böse gewinnt',
					text: 'Wenn nur noch zwei Spieler leben. Vorsicht: Die Scarlet Woman kann zum neuen Dämon werden.',
					tone: 'evil'
				}
			]
		},
		{
			id: 'chars-chapter',
			kind: 'chapter',
			mood: 'blood',
			eyebrow: 'Kapitel IV',
			title: 'Die Charaktere',
			lead: `22 mögliche Charaktere. Nur ${count} sind im Spiel.`
		},
		{
			id: 'roles-info',
			kind: 'roles',
			mood: 'night',
			eyebrow: 'IV · Townsfolk · Gut',
			title: 'Townsfolk: Information',
			roles: ['washerwoman', 'librarian', 'investigator', 'chef', 'empath', 'fortune-teller', 'undertaker', 'ravenkeeper'],
			note: '* nicht in der ersten Nacht'
		},
		{
			id: 'roles-power',
			kind: 'roles',
			mood: 'night',
			eyebrow: 'IV · Townsfolk · Gut',
			title: 'Townsfolk: Schutz und Macht',
			roles: ['monk', 'soldier', 'slayer', 'virgin', 'mayor'],
			note: '* nicht in der ersten Nacht'
		},
		{
			id: 'roles-outsiders',
			kind: 'roles',
			mood: 'night',
			eyebrow: 'IV · Outsider · Gut, aber schwierig',
			title: 'Outsider',
			roles: ['butler', 'drunk', 'recluse', 'saint']
		},
		{
			id: 'roles-minions',
			kind: 'roles',
			mood: 'night',
			eyebrow: 'IV · Minions · Böse',
			title: 'Minions',
			roles: ['poisoner', 'spy', 'scarlet-woman', 'baron']
		},
		{
			id: 'roles-demon',
			kind: 'roles',
			mood: 'blood',
			eyebrow: 'IV · Der Dämon · Böse',
			title: 'Der Dämon',
			roles: ['imp'],
			lead: 'Wenn der Imp sich selbst tötet, wird ein Minion der neue Imp: der Starpass. Das Gute muss ihn finden und hinrichten.'
		},
		{
			id: 'unreliable',
			kind: 'cards',
			mood: 'night',
			eyebrow: 'IV · Die Charaktere',
			title: 'Unzuverlässige Information',
			cards: [
				{
					label: 'Drunk oder vergiftet?',
					title: 'Die Fähigkeit wirkt nicht',
					text: 'Du wirst es nicht erfahren, und die erzählende Person darf dir falsche Informationen geben.'
				},
				{
					label: 'Falsch erscheinen',
					title: 'Recluse und Spy',
					text: 'Der Recluse kann als böse gelten, der Spy als gut. Fähigkeiten lassen sich täuschen.'
				}
			],
			note: 'Prüft jede Information gegen.'
		},
		{
			id: 'golden',
			kind: 'cards',
			mood: 'day',
			eyebrow: 'Bevor es losgeht',
			title: 'Goldene Regeln',
			cards: [
				{ title: 'Sagt, was ihr wollt', text: 'Bluffen ist erlaubt, für beide Teams.' },
				{ title: 'Haltet den Charakter geheim', text: 'Er existiert nur in eurem Kopf.' },
				{ title: 'Tod ist nicht das Ende', text: 'Redet weiter und spart die letzte Stimme auf.' },
				{ title: 'Fragt die erzählende Person', text: 'Jede Frage, jederzeit, auch privat.' }
			]
		},
		{ id: 'sheet', kind: 'sheet', mood: 'night', title: 'Charakterblatt' }
	];
}
