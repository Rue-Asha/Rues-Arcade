## MODIFIED Requirements

### Requirement: Arcade-Abend tokens
The app SHALL style every screen outside Blood on the Clocktower's routes (`/spiele/clocktower` and everything below it)
from one set of CSS tokens taken from the A1 · Arcade-Abend artboard
(`design/look-A1-P2-arcade-abend.dc.html`): ground #111234, primary #6bd672, Imposter #eb616d,
leader-gold #f4c34a, Wavelength #38ccc8, Sora for UI, Press Start 2P for the logo letter and scores only. Each
further game SHALL get its own colour token with `-ledge` and `-tint` companions: Codes (violet, about #9d8cff),
Duck (orange, about #ff9f43), Most Likely To (pink, about #f27bc4) and Blood on the Clocktower (`clocktower`, blood
red distinct from `--imposter`, about #e0645a, used for its Home tile and badge).
The UI SHALL be German. Every screen outside Blood on the Clocktower's routes SHALL be dark only; Blood on the
Clocktower's own theme (requirement "Look of Blood on the Clocktower") is the only place with a light (parchment)
variant. WCAG's inactive-control contrast exemption applies to disabled buttons and form controls only, not to locked
tiles or other greyed-out content.

#### Scenario: Text contrast meets 4.5:1
- **WHEN** every text/background token pair used by the components is evaluated
- **THEN** each pair has a contrast ratio of at least 4.5:1
- **proof:** e2e

#### Scenario: Look approved on screenshots
- **WHEN** Rue reviews the e2e screenshots of Home, Spieler, a game start screen, a reveal and a scoreboard at 390px and 1280px
- **THEN** Rue approves the look as Arcade-Abend
- **proof:** manual (visual judgement at Gate 2)

#### Scenario: Clocktower colour meets contrast
- **WHEN** the token contrast pairs are evaluated with `clocktower` and `clocktower-tint`
- **THEN** ink on `clocktower`, `clocktower` on surface, and every text token on `clocktower-tint` reach at least 4.5:1
- **proof:** unit

#### Scenario: Other games keep the Arcade-Abend look
- **WHEN** Home, Spieler and the Imposter start, lobby and play screens are opened after visiting a Blood on the Clocktower screen
- **THEN** `<html>` carries no `data-theme`, the body background is #111234 and body text renders in Sora
- **proof:** e2e

## ADDED Requirements

### Requirement: Look of Blood on the Clocktower
Every Blood on the Clocktower route (start, lobby, explanation deck, play) SHALL use a dark old-world theme taken from
Rue's presentation, applied as tokens on `<html data-theme="clocktower" data-variant="night|day">`: the night variant
(ground about #100e14, text about #ece4d4, gold about oklch(0.78 0.11 75), blood red about oklch(0.62 0.16 25), good
blue about oklch(0.62 0.12 245)) and the day variant on parchment (about #e8dfcb with ink about #1c1714). The theme SHALL
redefine the shared tokens (`--ground`, `--surface`, `--raised`, `--text`, `--muted`, `--gold`, `--font-ui`,
`--font-data`, …) so shared components follow it, and add its own (`--good`, `--evil`, `--font-display`). Titles SHALL
use IM Fell English SC, body text Alegreya Sans, numerals IM Fell English, all self-hosted as latin woff2 files with
their OFL licence texts in `static/fonts/`; Press Start 2P SHALL NOT be used on any Blood on the Clocktower screen.
The start, lobby, deck, setup, reveal, night and end screens SHALL use the night variant, dawn and day screens the day
variant, and the change between them SHALL be animated (view transition or a finite opacity animation), instant under
reduced motion. Textures SHALL be CSS layers over a solid background colour. The attribute SHALL be rendered by the
server so a reload shows no other theme first. All look rules SHALL hold in both variants: text contrast at least
4.5:1, touch targets at least 44px, no horizontal scroll at 390px, no request to another origin, ambient loops only on
transform/opacity and none under reduced motion. The Home tile SHALL carry its own inline-SVG badge and tile art, and
the start banner its own art (motif `clocktower`, a clock face), under the decoration rules; the lobby uses the shared
crew art and play the rings backdrop or the theme's own night sky.

#### Scenario: Clocktower tokens meet contrast in both variants
- **WHEN** every text/background pair of the Clocktower night and day token sets in `tokens.ts` is evaluated
- **THEN** each pair reaches at least 4.5:1, and `app.css` defines the same values under `[data-theme='clocktower']` and `[data-theme='clocktower'][data-variant='day']`
- **proof:** unit

#### Scenario: Theme only on Clocktower routes
- **WHEN** `/spiele/clocktower`, its lobby, its `erklaerung` route and its play route are opened, and then Home and `/spiele/imposter`
- **THEN** the four Clocktower routes have `data-theme="clocktower"` on `<html>` with headings in IM Fell English SC and body text in Alegreya Sans, and Home and Imposter have no `data-theme`
- **proof:** e2e

#### Scenario: No theme flash on reload
- **WHEN** the raw HTML of `/spiele/clocktower` is fetched from the server and the page is reloaded
- **THEN** the served `<html>` tag already carries `data-theme="clocktower"` and `data-variant="night"`, and the first painted body background is the night ground
- **proof:** e2e

#### Scenario: Clocktower fonts are self-hosted
- **WHEN** the Clocktower start screen is loaded
- **THEN** every font request goes to the app's own origin under `/fonts/`, IM Fell English SC and Alegreya Sans are loaded, each font file has an OFL text next to it, and no text renders in Press Start 2P
- **proof:** e2e

#### Scenario: Clocktower look rules on every screen
- **WHEN** the look walk renders every Blood on the Clocktower screen (start, lobby states, deck slides, setup board, reveal, night screens, dawn, day, vote clock, confirm, end) at 390×844 and 1280×800
- **THEN** text contrast is at least 4.5:1 in both variants, touch targets are at least 44px, no screen scrolls horizontally at 390px, no text renders in Press Start 2P and every request goes to the app's own origin
- **proof:** e2e ("Scenario: Text contrast meets 4.5:1", "Scenario: Touch targets are at least 44px", "Scenario: No horizontal scroll on phone", "Scenario: Press Start 2P stays limited to logo and scores", "Scenario: Decoration loads no external assets")

#### Scenario: Day and night variants switch with an animation
- **WHEN** the last night screen of night 1 is left for dawn with motion allowed, and again with `prefers-reduced-motion: reduce`
- **THEN** `data-variant` changes from "night" to "day" and the body background becomes parchment, with motion a view transition or finite opacity animation runs, and under reduced motion none runs
- **proof:** e2e

#### Scenario: Clocktower ambient motion off under reduced motion
- **WHEN** `prefers-reduced-motion: reduce` is set and the Clocktower start screen and lobby are opened
- **THEN** no infinite animation is running
- **proof:** e2e

#### Scenario: Clocktower gets its own motif
- **WHEN** the motif is looked up for `clocktower` at tile, start, lobby and play
- **THEN** tile and start return `clocktower`, lobby returns `crew` and play returns `rings`
- **proof:** unit

#### Scenario: Clocktower tile and start art
- **WHEN** Home and the Clocktower start screen are opened
- **THEN** the Clocktower tile shows an SVG badge that differs from the fallback and every other game's badge, and the tile and start banner each hold `data-motif="clocktower"` art with at least one drawn shape, aria-hidden and without pointer events
- **proof:** e2e

#### Scenario: Clocktower look approved on screenshots
- **WHEN** Rue reviews the look-walk screenshots of every Blood on the Clocktower screen at 390px and 1280px
- **THEN** Rue approves the theme as taken from her presentation, the parchment day screens and the use of desktop width
- **proof:** manual (visual judgement at Gate 2, on the verifier's screenshots)

### Requirement: Clocktower transitions
Navigating from Home into a Blood on the Clocktower route and back out SHALL run a view transition that morphs colour
and background instead of a hard cut, and navigation between Blood on the Clocktower routes (start, lobby, deck, play)
SHALL be animated the same way. Where the browser has no View Transitions API the navigation SHALL happen plainly
without an error; under reduced motion no transition SHALL run. The browser's back button SHALL work as usual.

#### Scenario: Home to Clocktower runs a view transition
- **WHEN** the Clocktower tile on Home is clicked, then "Los geht's" is tapped, then the brand link back to Home is followed, with motion allowed
- **THEN** `document.startViewTransition` is called for each of the three navigations, the theme attribute changes inside the transition, and the target page is shown
- **proof:** e2e

#### Scenario: Navigation without View Transitions
- **WHEN** `document.startViewTransition` does not exist and Home → Clocktower start → lobby is navigated
- **THEN** each page is shown, the theme attribute is set, and no page error is logged
- **proof:** e2e

#### Scenario: Reduced motion skips the view transition
- **WHEN** `prefers-reduced-motion: reduce` is set and Home → Clocktower start is navigated
- **THEN** `document.startViewTransition` is not called and the start screen is shown with the theme
- **proof:** e2e

#### Scenario: Back button leaves Clocktower
- **WHEN** Home → Clocktower start is navigated and the browser goes back
- **THEN** Home is shown without `data-theme`
- **proof:** e2e

#### Scenario: Transitions feel smooth
- **WHEN** Rue navigates Home → Clocktower → lobby → deck → back on a phone and a desktop browser
- **THEN** Rue finds the morph smooth and not in the way
- **proof:** manual (motion feel is a visual judgement, at Gate 2)
