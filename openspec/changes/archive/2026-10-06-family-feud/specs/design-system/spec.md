## ADDED Requirements

### Requirement: Look of Family Feud
Family Feud SHALL get the full look of the other games: a colour token `feud` (blue, about #5b9dff) with `-ledge`
and `-tint` companions, a tile badge icon drawn as inline SVG, its own art for tile and start banner (motif
`feud`, a board of ledge tiles) under the existing decoration rules (aria-hidden, no pointer events, no external
assets, ambient motion on transform/opacity only and off under reduced motion), and the shared crew art in the
lobby and rings behind play.

#### Scenario: Family Feud colour meets contrast
- **WHEN** the token contrast pairs are evaluated with `feud` and `feud-tint`
- **THEN** ink on `feud`, `feud` on surface, and every text token on `feud-tint` reach at least 4.5:1
- **proof:** unit

#### Scenario: Family Feud gets its own motif
- **WHEN** the motif is looked up for `family-feud` at tile, start, lobby and play
- **THEN** tile and start return `feud`, lobby returns `crew` and play returns `rings`, and `charade` still gets the neutral fallback
- **proof:** unit

#### Scenario: Family Feud tile carries its own badge
- **WHEN** Home is opened
- **THEN** the Family Feud tile shows an SVG badge that differs from the fallback badge and from every other game's badge
- **proof:** e2e

#### Scenario: Family Feud art on tile and start screen
- **WHEN** Home and the Family Feud start screen are opened
- **THEN** the Family Feud tile and start banner each hold `data-motif="feud"` art with at least one drawn shape, in `--feud` colours, aria-hidden and without pointer events
- **proof:** e2e
