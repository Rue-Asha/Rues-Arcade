## ADDED Requirements

### Requirement: Pure reducer with seeded RNG
Each game SHALL be implemented as a pure reducer `(state, action) → state`; all randomness SHALL come from a
seeded RNG whose state is part of the game state.

#### Scenario: Same seed and actions give the same state
- **WHEN** a game is initialised twice with the same players, config, content and seed and given the same actions
- **THEN** both resulting states are deeply equal
- **proof:** unit

#### Scenario: Reducer does not mutate its input
- **WHEN** an action is applied to a frozen state
- **THEN** a new state is returned and no error is thrown
- **proof:** unit

### Requirement: Session save and resume
A running session SHALL be saved on the device after every action and restored on reload; "Spiel beenden"
SHALL clear it.

#### Scenario: Reload mid-game resumes the same phase
- **WHEN** a game is in progress and the page is reloaded
- **THEN** the same phase with the same players and content is shown
- **proof:** e2e

#### Scenario: Spiel beenden clears the session
- **WHEN** the user chooses "Spiel beenden" and reopens the game
- **THEN** the start screen is shown and no session is restored
- **proof:** e2e

#### Scenario: Old or corrupt saved state discarded
- **WHEN** the stored session has an older version, is not valid JSON, or lacks the shape of the game's state
- **THEN** it is discarded, a notice is shown, and the app does not crash
- **proof:** e2e

#### Scenario: Two tabs last write wins
- **WHEN** two tabs write the same game's session
- **THEN** the stored session is the one written last
- **proof:** unit

#### Scenario: Roster edit mid-game keeps the session snapshot
- **WHEN** a player is removed from the roster while a session is running
- **THEN** the running session still contains its original players
- **proof:** unit
