# sound Specification

## Purpose
TBD - created by archiving change party-games-rebuild. Update Purpose after archive.
## Requirements
### Requirement: Synth sound effects
The app SHALL play original WebAudio-synthesised effects (press, reveal, correct, wrong, win) in every game,
with a mute toggle remembered on the device.

#### Scenario: Mute is remembered
- **WHEN** the player mutes sound and reloads the page
- **THEN** sound is still muted and no effect plays
- **proof:** unit

#### Scenario: No sound before first interaction
- **WHEN** an effect is requested before the user has interacted with the page
- **THEN** no AudioContext is created and nothing plays
- **proof:** unit

#### Scenario: WebAudio unavailable stays silent
- **WHEN** the browser has no `AudioContext`
- **THEN** effect requests do nothing and no error is thrown
- **proof:** unit

#### Scenario: Effects sound right
- **WHEN** Rue plays a round of each game with sound on
- **THEN** press, reveal, correct, wrong and win are audible and distinct
- **proof:** manual (audio judgement on a real device at Gate 2)

### Requirement: Clocktower sounds
Blood on the Clocktower SHALL have its own original WebAudio-synthesised effects through the existing synth and mute
flag: `bell` (dusk and dawn), `tick` (each seat the vote hand reaches), `chime` (a role card is revealed in Setup 2)
and `gong` (the end teaser appears). They SHALL obey the same rules as every effect: silent while muted, no
AudioContext before the first user interaction, silent without WebAudio.

#### Scenario: Clocktower effects obey mute and first interaction
- **WHEN** `bell`, `tick`, `chime` and `gong` are requested before any interaction, then while muted, then unmuted after an interaction
- **THEN** nothing is created or played before the interaction or while muted, and after unmuting each effect schedules at least one oscillator on the shared context
- **proof:** unit

#### Scenario: Clocktower effects without WebAudio
- **WHEN** the browser has no `AudioContext` and each Clocktower effect is requested
- **THEN** nothing plays and no error is thrown
- **proof:** unit

#### Scenario: Clocktower sounds at the right moments
- **WHEN** Rue plays a game with sound on through a reveal, a dusk, a dawn, a vote and the end
- **THEN** the chime sounds on each role reveal, the bell at dusk and dawn, a soft tick per seat during the sweep and the gong on the end teaser, each distinct and fitting the theme
- **proof:** manual (audio judgement on a real device at Gate 2)

