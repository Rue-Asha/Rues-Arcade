## ADDED Requirements

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
