## ADDED Requirements

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
