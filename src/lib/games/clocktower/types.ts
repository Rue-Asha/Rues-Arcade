import type { Rng } from '#lib/engine/rng.ts';
import type { Player } from '#lib/engine/types.ts';

// Seat indices are 0-based; seat number = index + 1.

export type Team = 'townsfolk' | 'outsider' | 'minion' | 'demon';
export type Alignment = 'good' | 'evil';
export type CharacterId =
	| 'washerwoman' | 'librarian' | 'investigator' | 'chef' | 'empath' | 'fortune-teller' | 'undertaker'
	| 'monk' | 'ravenkeeper' | 'virgin' | 'slayer' | 'soldier' | 'mayor'
	| 'butler' | 'drunk' | 'recluse' | 'saint'
	| 'poisoner' | 'spy' | 'scarlet-woman' | 'baron'
	| 'imp';
export type Trigger = 'first' | 'each' | 'each*' | 'death' | 'day' | 'passive' | 'setup';
// ability: TPI text verbatim · de: German explanation (cards, sheet) · hint: German "how to run" for the wake screen
// · icon: SVG path d, viewBox 0 0 512 512
export interface Character { id: CharacterId; name: string; team: Team; ability: string; de: string; hint: string; trigger: Trigger; icon: string }
export type TeamCounts = Record<Team, number>;

// believed: the Drunk's Townsfolk, else null · ghostVote: true until spent (only meaningful when dead)
export interface Seat { player: Player; character: CharacterId | null; believed: CharacterId | null; alive: boolean; ghostVote: boolean }

export type NightStepKind = 'minion-info' | 'demon-info' | 'new-imp' | CharacterId;
// as: the role the woken seat is woken as (believed role for the Drunk, 'imp' for new-imp, null for info steps)
export interface NightStep { kind: NightStepKind; seats: number[]; as: CharacterId | null; note: string | null }

export type Question = { kind: 'scarlet-woman' | 'saint' | 'mayor'; seat: number };
export type NightScreen =
	| { screen: 'dusk' }
	| { screen: 'question'; question: Question }
	| { screen: 'wake' | 'card' | 'circle' | 'sleep'; step: number }
	| { screen: 'deaths' };
export interface NightState { number: number; steps: NightStep[]; screens: NightScreen[]; at: number; target: number | null; starpass: number | null; deaths: number[] }

export interface Nomination { nominator: number; nominee: number; voters: number[]; votes: number | null; result: 'block' | 'tie' | 'none' | null }
// pending: nominee tapped, nominator not yet chosen · killed: the seat today's execution killed (null: nobody, or already dead) · deaths: dawn's deaths (night) shown at dawn
export interface DayState { number: number; deadline: number | null; pending: number | null; nominations: Nomination[]; high: number; block: number | null; executed: number | null; killed: number | null; closed: boolean; deaths: number[] }

export type Phase =
	| { kind: 'setup' }
	| { kind: 'reveal'; seat: number; shown: boolean }
	| { kind: 'night' }
	| { kind: 'dawn'; screen: 'wake' | 'deaths' | 'timer' }
	| { kind: 'day'; screen: 'grimoire' | 'nominator' | 'clock' | 'sweep' | 'confirm' | 'result' | 'execution' }
	| { kind: 'over'; revealed: boolean };

// the new Demon's seat gets character 'imp'; was = its character before (for the end reveal)
export interface DemonEvent { night: number; from: number; to: number; was: CharacterId; kind: 'starpass' | 'scarlet-woman' }
export interface ClocktowerState {
	rng: Rng;
	seats: Seat[];
	locked: boolean;
	redHerring: number | null;
	// current Demon seat
	demon: number | null;
	// 3 after lock
	bluffs: CharacterId[];
	history: DemonEvent[];
	phase: Phase;
	// current or last night
	night: NightState | null;
	// current or last day
	today: DayState | null;
	// executed on the day before tonight (Undertaker)
	lastExecution: number | null;
	// asked at the next dusk
	questions: Question[];
	winner: Alignment | null;
}
// An action that is not valid in the current state returns the state unchanged (same object).
export type ClocktowerAction =
	| { type: 'swap'; a: number; b: number } | { type: 'move'; from: number; to: number }
	| { type: 'assign'; seat: number; character: CharacterId | null }
	// "Zufällig", "Alles neu"
	| { type: 'fill' } | { type: 'reroll' }
	// null = random
	| { type: 'believe'; character: CharacterId | null }
	// null = random
	| { type: 'herring'; seat: number | null }
	| { type: 'lock' }
	| { type: 'show' } | { type: 'hide' }
	| { type: 'next' } | { type: 'back' } | { type: 'skip' }
	| { type: 'answer'; yes: boolean } | { type: 'declare'; winner: Alignment }
	| { type: 'target'; seat: number | null } | { type: 'starpass'; seat: number | null } | { type: 'bluffs' }
	| { type: 'deaths'; seats: number[] }
	| { type: 'timer'; minutes: number | null; now: number }
	| { type: 'nominee'; seat: number } | { type: 'nominate'; nominator: number } | { type: 'cancel' }
	| { type: 'vote' } | { type: 'mark'; seat: number; on: boolean } | { type: 'swept' }
	| { type: 'count'; votes: number } | { type: 'confirm' }
	| { type: 'execute'; seat: number } | { type: 'died'; seat: number }
	| { type: 'revive'; seat: number } | { type: 'ghost'; seat: number; on: boolean }
	| { type: 'endDay' }
	| { type: 'reveal' };
export type Info =
	// Washerwoman/Librarian/Investigator
	| { kind: 'pair'; seats: [number, number]; character: CharacterId }
	// Librarian: 0 Outsider
	| { kind: 'zero' }
	// Chef, Empath
	| { kind: 'number'; n: number }
	// Fortune Teller: Demon + red herring
	| { kind: 'demon'; seats: number[] }
	// Undertaker
	| { kind: 'character'; character: CharacterId }
	| { kind: 'none' };
