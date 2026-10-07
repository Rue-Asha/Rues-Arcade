## ADDED Requirements

### Requirement: Play header
During play (`/spiele/<slug>/spielen`) the header SHALL show the game's name, its round status (see "Round status in
the play header") and, once the session is loaded, "Spiel beenden" as the red `danger` Button with that full label. It
SHALL offer no Demo control; the demo is reached from the start screen's Demo card only. "Spiel beenden" SHALL open the
arcade Modal "Spiel beenden?" whose "Beenden" is a `danger` Button and whose "Weiterspielen" closes it and keeps the
game; confirming SHALL clear the session and return to the start screen. A stale or discarded session SHALL show its
notice with no Demo control and no round status. The demo route's header SHALL show the same round status under the
label "Demo", without "Spiel beenden".

#### Scenario: Play header has no Demo
- **WHEN** a running game of each of the six games is opened at `/spielen` at 390px and at 1280px
- **THEN** the page holds no button or link named "Demo", and the header holds "Spiel beenden" with that full label and the `--imposter` background
- **proof:** e2e

#### Scenario: Ending asks with a red Beenden
- **WHEN** "Spiel beenden" is tapped, the Modal is dismissed with "Weiterspielen", then "Spiel beenden" is tapped again and "Beenden" confirmed
- **THEN** the Modal "Spiel beenden?" shows "Beenden" with the `--imposter` background, after "Weiterspielen" the same phase is shown, and after "Beenden" the start screen is shown and reopening the game restores no session
- **proof:** e2e

#### Scenario: Discarded session shows no Demo and no status
- **WHEN** `/spielen` is opened with a stored session of an older version
- **THEN** the discard notice is shown, and the page holds no "Demo" control, no round status and no progress line
- **proof:** e2e

### Requirement: Round status in the play header
Each game SHALL supply `status(state)`: the parts of its round status and a progress fraction, or no progress. The play
and demo headers SHALL render the parts joined by " · " in Sora (never Press Start 2P) and, when progress is given, a
thin line in the game colour filled to that fraction; no Screen SHALL render its own round label. The formats SHALL be:
Imposter "Runde n" without progress; Wavelength Versus "Runde r / R · <Team>", Koop "Runde r / R · Zug t / T"; Codes
"Runde r / R · <Aufdecken | Spiel | Rundenergebnis>"; What Rhymes with Duck "Ziel T Punkte" without progress; Most
Likely To "Runde r / R · Team k / n"; Family Feud "Runde r / R · <Duell | Tafel | Stehlen | Ergebnis>" and in sudden
death "Stichfrage · <step>". At game over a game with rounds SHALL read "Runde R / R". Progress SHALL be r / R, and 1
at game over and in sudden death. On a 390px phone the header SHALL wrap without horizontal scroll.

#### Scenario: Round status per game
- **WHEN** `status` is computed for each game in a mid-game state, at game over, for Wavelength in Versus and Koop, and for Feud in sudden death
- **THEN** each returns the parts and progress of the formats above, Imposter and Duck with no progress
- **proof:** unit

#### Scenario: Last round fills the progress line
- **WHEN** `status` is computed in the last round of Wavelength, Codes, Most Likely To and Family Feud, and at their game over
- **THEN** the progress is 1 in each case
- **proof:** unit ("Scenario: Round status per game")

#### Scenario: Status and progress in the header
- **WHEN** a Most Likely To session in round 2 of 5 with the first of two teams on turn is opened at `/spielen`
- **THEN** the header reads "Runde 2 / 5 · Team 1 / 2" in Sora, a progress line in `--most-likely` is filled to 40%, and no element inside the stage reads "Runde 2 / 5"
- **proof:** e2e

#### Scenario: Status without a total has no progress line
- **WHEN** an Imposter session in round 2 is opened at `/spielen` and in the demo
- **THEN** each header reads "Runde 2" and shows no progress line
- **proof:** e2e

#### Scenario: Header wraps on a phone
- **WHEN** a Wavelength Versus session whose team is named "Die unglaublich langen Teamnamen" is opened at 390px
- **THEN** the header shows name, status and "Spiel beenden" without horizontal scroll and every header control is at least 44px
- **proof:** e2e
