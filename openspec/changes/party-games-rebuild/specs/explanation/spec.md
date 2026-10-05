## ADDED Requirements

### Requirement: Explanation viewer
"Erklärung" on each game's start screen SHALL open `static/explain/<slug>/index.html` fullscreen in an iframe
sandboxed with scripts allowed and no same-origin. Its close button SHALL always close it, including after
interaction inside the slides; Esc SHALL close it while focus is in the app. Adding the file and rebuilding
SHALL be enough to show it. `static/explain/README.md` SHALL document the format (self-contained HTML, assets
next to `index.html`).

#### Scenario: No explanation shows empty state
- **WHEN** Erklärung is opened for a game without `static/explain/<slug>/index.html`
- **THEN** "Für dieses Spiel gibt es noch keine Erklärung." is shown
- **proof:** e2e

#### Scenario: Committed explanation is shown sandboxed
- **WHEN** a fixture explanation with an image asset is served at `/explain/<slug>/` (Playwright route from `e2e/fixtures/explain/`) and Erklärung is opened
- **THEN** a fullscreen iframe with `sandbox="allow-scripts"` shows its content and the image loads
- **proof:** e2e

#### Scenario: Close by button or Esc
- **WHEN** the viewer is open and Esc is pressed while focus is in the app, or the close button is clicked
- **THEN** the viewer closes and the start screen is shown
- **AND** the close button still closes it after a click inside the slides
- **proof:** e2e
