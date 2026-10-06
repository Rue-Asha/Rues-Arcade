import type { Survey } from '#lib/content/types.ts';
import type { DemoScript } from '#lib/engine/types.ts';
import type { FeudAction, FeudConfig } from './engine.ts';

const survey = (id: number, question: string, answers: [string, number][]): Survey => ({
	id,
	question,
	answers: answers.map(([text, points]) => ({ text, points }))
});

const surveys = [
	survey(1, 'Nenne etwas, das man in einem Kühlschrank findet', [
		['Milch', 35],
		['Eier', 25],
		['Butter', 20],
		['Käse', 12],
		['Gemüse', 8]
	]),
	survey(2, 'Nenne ein Tier, das man im Zoo sieht', [
		['Löwe', 32],
		['Elefant', 24],
		['Affe', 18],
		['Giraffe', 14],
		['Zebra', 12]
	]),
	survey(3, 'Nenne etwas, das man an den Strand mitnimmt', [
		['Handtuch', 40],
		['Sonnencreme', 28],
		['Sonnenbrille', 16],
		['Eimer', 10],
		['Buch', 6]
	]),
	survey(4, 'Nenne ein beliebtes Hobby', [
		['Lesen', 34],
		['Kochen', 26],
		['Wandern', 22],
		['Malen', 18]
	])
];

export const demo: DemoScript<FeudAction, FeudConfig> = {
	players: ['Alex', 'Bo', 'Cleo', 'Dani'],
	config: {
		teams: [
			{ name: 'Team A', players: ['Alex', 'Bo'] },
			{ name: 'Team B', players: ['Cleo', 'Dani'] }
		],
		surveys: [surveys[0], surveys[1], surveys[2]],
		tiebreak: surveys[3],
		saved: []
	},
	content: surveys.map((s) => ({ id: s.id, a: s.question, b: '' })),
	seed: 1,
	// Team B banks 100 (cleared board) + 88 (steal), Team A 94 x 2 in the last round: 188 each, so sudden death decides
	steps: [
		// round 1, Team A opens: both first answers miss, the next pair answers, Team B plays and clears the board
		{
			action: { type: 'answer', tile: null },
			tip: 'Runde 1: Jede Runde beginnt mit einem Duell. Alex nennt eine Antwort, die nicht auf der Tafel steht, und tippt auf Nicht auf der Tafel.'
		},
		{
			action: { type: 'answer', tile: null },
			tip: 'Auch Cleo liegt daneben. Wenn beide Antworten fehlen, treten die nächsten zwei Spieler an, damit das Duell überhaupt einen Gewinner bekommt.'
		},
		{
			action: { type: 'answer', tile: 2 },
			tip: 'Jetzt antworten Bo und Dani. Bo nennt Butter, sie steht auf Platz 3. Je weiter oben eine Antwort steht, desto besser.'
		},
		{
			action: { type: 'answer', tile: 1 },
			tip: 'Dani nennt Eier, Platz 2 und damit höher als Bo. Bei zwei Treffern gewinnt die höhere Antwort das Duell für Team B.'
		},
		{
			action: { type: 'play' },
			tip: 'Der Duellgewinner entscheidet, wer die Tafel spielt. Team B spielt selbst, weil noch drei Antworten offen sind.'
		},
		{
			action: { type: 'reveal', tile: 0 },
			tip: 'Team B nennt Milch. Eine Antwort von der Tafel kommt in den Topf. Wurde die falsche angetippt, nimmt Rückgängig den letzten Schritt zurück.'
		},
		{
			action: { type: 'reveal', tile: 3 },
			tip: 'Team B nennt Käse. Solange es Treffer gibt, bleibt Team B dran und der Topf wächst.'
		},
		{
			action: { type: 'reveal', tile: 4 },
			tip: 'Gemüse ist die letzte verdeckte Antwort. Ist die Tafel ohne Fehler leer, sichert Team B den ganzen Topf, und niemand darf stehlen.'
		},
		{
			action: { type: 'next' },
			tip: 'Der Topf geht an Team B. Mit der nächsten Runde beginnt das andere Team das Duell, damit der Vorteil wechselt.'
		},
		// round 2, Team B opens: number one at once, Team B passes, Team A strikes out, Team B steals successfully
		{
			action: { type: 'answer', tile: 0 },
			tip: 'Runde 2: Cleo nennt gleich Löwe, die Nummer 1. Dann ist das Duell sofort entschieden, Alex muss nicht mehr antworten.'
		},
		{
			action: { type: 'pass' },
			tip: 'Team B passt. Das lohnt sich, wenn die übrigen Antworten schwer zu erraten wirken. Nun spielt Team A die Tafel.'
		},
		{
			action: { type: 'reveal', tile: 1 },
			tip: 'Team A nennt Elefant und bekommt die Punkte in den Topf.'
		},
		{
			action: { type: 'reveal', tile: 2 },
			tip: 'Team A nennt Affe. Der Topf liegt bei 74 Punkten, zwei Antworten sind noch verdeckt.'
		},
		{
			action: { type: 'strike' },
			tip: 'Eine Antwort, die nicht auf der Tafel steht, ist ein Fehler. Drei Fehler beenden den Zug des Teams.'
		},
		{
			action: { type: 'strike' },
			tip: 'Zweiter Fehler. Ein Fehler mehr, und die Gegner dürfen den Topf stehlen.'
		},
		{
			action: { type: 'strike' },
			tip: 'Dritter Fehler. Jetzt darf Team B eine verdeckte Antwort stehlen, weil Team A seine Chance verspielt hat.'
		},
		{
			action: { type: 'steal', tile: 3 },
			tip: 'Team B nennt Giraffe und trifft. Ein Treffer holt den ganzen Topf von Team A.'
		},
		{
			action: { type: 'next' },
			tip: 'Team B hat jetzt 188 Punkte, Team A noch keinen. Die letzte Runde bringt die Entscheidung.'
		},
		// round 3 (last, double), Team A opens: first answer misses, Team B passes, Team A strikes out, the steal misses
		{
			action: { type: 'answer', tile: null },
			tip: 'Runde 3 ist die letzte, ihre Punkte zählen doppelt. Bo liegt daneben, deshalb kann Dani das Duell mit jedem Treffer gewinnen.'
		},
		{
			action: { type: 'answer', tile: 1 },
			tip: 'Dani nennt Sonnencreme. Weil Bo nichts auf der Tafel hatte, gewinnt Team B das Duell.'
		},
		{
			action: { type: 'pass' },
			tip: 'Team B passt, und Team A spielt die Tafel. Mit doppelten Punkten kann Team A hier noch aufholen.'
		},
		{
			action: { type: 'reveal', tile: 0 },
			tip: 'Team A nennt Handtuch. Der Topf zeigt jetzt den einfachen Wert, erst beim Sichern wird verdoppelt.'
		},
		{
			action: { type: 'reveal', tile: 2 },
			tip: 'Team A nennt Sonnenbrille.'
		},
		{
			action: { type: 'reveal', tile: 3 },
			tip: 'Team A nennt Eimer. Eine Antwort ist noch verdeckt.'
		},
		{
			action: { type: 'strike' },
			tip: 'Erster Fehler für Team A.'
		},
		{
			action: { type: 'strike' },
			tip: 'Zweiter Fehler.'
		},
		{
			action: { type: 'strike' },
			tip: 'Dritter Fehler. Team B darf stehlen, bekommt aber nur bei einem Treffer den Topf.'
		},
		{
			action: { type: 'steal', tile: null },
			tip: 'Team B liegt daneben. Dann behält Team A den Topf, und die 94 Punkte zählen doppelt, also 188.'
		},
		{
			action: { type: 'next' },
			tip: 'Beide Teams haben 188 Punkte. Bei Gleichstand entscheidet eine Stichfrage, damit es einen Gewinner gibt.'
		},
		// sudden death on the tiebreak survey: one face-off decides
		{
			action: { type: 'answer', tile: 2 },
			tip: 'Stichfrage: Nur das Duell zählt. Cleo nennt Wandern, Platz 3.'
		},
		{
			action: { type: 'answer', tile: 0 },
			tip: 'Alex nennt Lesen, Platz 1 und damit höher. Team A gewinnt das Duell und damit das Spiel.'
		},
		{
			action: { type: 'next' },
			tip: 'Zum Ergebnis: Team A gewinnt, weil es die Stichfrage entschieden hat. Eine Revanche gibt es bei Family Feud nicht.'
		}
	]
};
