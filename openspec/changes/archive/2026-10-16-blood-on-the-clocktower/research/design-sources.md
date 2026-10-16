# Design sources: Blood on the Clocktower (explore)

Sources: `~/Documents/Daddelei/Blood on the Clocktower - Game Night.html` (deck), `~/Documents/Daddelei/Character Sheet.pdf` (sheet).
Screenshots: `/tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/botc-slides/`. Extracted source (template, icons, fonts): `.../scratchpad/botc-src/`.

## 1. Presentation tech

- Single self-contained file, 903 KB, produced by a "bundler" (Claude design tooling). The real page is a gzip/base64 manifest of 50 assets plus a JSON template, unpacked at load by JS. Without JS the page shows nothing.
- Framework: a "DC" (design component) runtime: `<x-dc>` template with `{{ }}` bindings, React 18 production (MIT) rendering decorative bits (stars, clock, moon, sun, vote ring), plus a generated `<deck-stage>` web component (`deck-stage.js`, 136 KB incl. rail/print/notes code).
- Slides: 26 `<section>` elements with all styling inline; shared CSS vars `--t-hero:168px --t-title:84px --t-sub:46px --t-body:34px --t-small:28px --t-label:24px --pad-top:96px --pad-x:120px --pad-bottom:88px --gap:40px`.
- Canvas: fixed 1920x1080, scaled by `transform: scale()` to fit the viewport and letterboxed (black). Hence on a 390x844 phone each slide renders about 390x219 px, text about 0.2x (unreadable, see `p-*.png`). Thumbnail rail on the left at >640 px (visible in all `d-*.png`); hidden at <=640 px.
- Navigation: arrow keys, PgUp/PgDn, Space, Home/End, number keys, R resets; touch: tap left/right half = prev/next (verified: tap at 85% width advances); bottom-centre overlay (`< n / 26 > Reset R`) fades after 1.8 s. No swipe. Slides stay mounted, hidden via `visibility:hidden; opacity:0`; there is no slide transition (hard cut). Print CSS gives one page per slide. Speaker notes exist per slide (`data-speaker-notes`), useful as copy source.
- Entrance animations: none. Only infinite decorative loops (stars, clock hands, moon drift, sun breathe, ember breathe, vote ring), not gated on the active slide, so they all run constantly (deck-stage's own guidance says to avoid that).
- Embedded assets (decoded sizes):
  - Fonts: 24 woff2 subsets, 460 KB total. Alegreya Sans 400/500/700 (7 unicode-range subsets each), IM Fell English (regular + italic) and IM Fell English SC (3 files of about 57-60 KB, latin only).
  - Icons: 22 inline-able SVGs (`<img src>`), 265 B - 3.8 KB each, about 36 KB total, 512x512 viewBox, single `<path>`, fill baked in (see 3).
  - JS: dc-runtime 69 KB, deck-stage 136 KB, react 11 KB, react-dom 132 KB. No raster images, no base64 PNG/JPG at all.
  - Everything else is CSS/HTML (silhouette town on slide 12 is plain divs with `clip-path`).
- Licence hints: fonts are Google Fonts (Alegreya Sans, IM Fell English / SC: SIL OFL 1.1; file is subset woff2 from fonts.googleapis, no licence text embedded). React MIT header present. The icon paths look like game-icons.net (512 viewBox, single path; CC BY 3.0 by Lorc/Delapouite etc.), not verifiable from the file (no attribution comment). Character names, "Blood on the Clocktower" and "Trouble Brewing" are Pandemonium Institute IP.

## 2. Slide-by-slide outline (26 slides, file order)

Shared head: eyebrow label (24px, 0.22em tracking, uppercase, gold) + h2 in IM Fell English SC 84px. Chapters: I Basics, II Night, III Day, IV Characters.

1. Title. Radial `#1f1a26 -> #100e14` bg, 70 stars, big clock (620px) right. "Game Night · Trouble Brewing", "Blood on the Clocktower" (168px), 120x2 red rule, italic "A game of lies, logic and murder for 13 players". Clock hands spin (see 3).
2. Ravenswood Bluff. Story text (72px IM Fell): storyteller found dead, impaled on the clocktower hand; Demon kills by night, wears a human face by day. Drifting crescent moon + stars.
3. Two Teams. Two cards: Good (blue; Townsfolk & Outsiders, don't know who anyone is; wins when the Demon dies) vs Evil (red; Demon & Minions, know each other and lie; wins when evil outnumbers good).
4. **Tonight's Town (role-count slide).** Four huge numerals (220px IM Fell English) in a 4-col grid: **9 Townsfolk** (blue, "Good, with helpful abilities"), **0 Outsiders** (pale blue-white "Good, with a hindrance"), **3 Minions** (light red "Evil helpers"), **1 Demon** (strong red, "The Imp"). Below a hairline: a row of 13 dots (9 blue, 3 red, 1 darker red with ring = Demon) and the note "If the Baron is in play: 7 Townsfolk & 2 Outsiders". Fully static, hardcoded for 13 players, single composition (counts in 4 text nodes + dot row = trivially data-driven). Note the Character Sheet PDF says 12 players / 7-2-2-1, the deck says 13 / 9-0-3-1: not consistent, count must come from the app's table.
5. The Storyteller. Left title + italic line; right three rows with roman numerals i/ii/iii (gold, IM Fell): runs the night, keeps the Grimoire, referees the day.
6. How a Game Flows. 5 boxes with arrows: Setup -> First Night (once, near-black) -> Day (parchment-filled box, "repeat") fused with Night (dark) -> Victory (red outline); italic footnote "until the Demon dies - or evil outnumbers good".
7. Setup. Four numbered steps (120px gold numerals, gold 2px top rule): draw token, look in secret, hand back face-down, read ability on the character sheet.
8. Chapter II The Night. Dark radial `#1c1826 -> #08070b`, 90 stars, moon, hero title, "Eyes closed. Some of you will wake."
9. How the Night Works. 4 columns Dusk / Wake (two taps) / Act (in silence) / Dawn (gold label), stars.
10. Night Signals. 8 rows (gesture left, meaning right in gold IM Fell): two taps = wake up, hand over eyes = sleep, nod/shake = yes/no, thumbs = good/evil, fingers = number, "O" = zero, pointing = that player, showing token = that character.
11. The First Night. 3 cards: Evil (meets; Demon learns 3 bluffs), Good (starting info), Everyone (no one dies; Imp starts night 2).
12. Chapter III The Day. Light gradient `#f3ecdc -> #eadcbc -> #e3c99a`, CSS-div skyline silhouette in `#2a221d` with lit windows (gold, 85% opacity) and clocktower with clock face, sun (300px, `oklch(.82 .13 70)`, breathing glow). The only slide with a "picture".
13. Discussion. Parchment `#e8dfcb`. Black banner (at dawn the Storyteller announces who died, never how/which), three columns Talk / Whisper / Lie (red), 5-10 min note.
14. Nominations. 5 numbered rules (red roman-ish numerals), italic "I nominate Bob."
15. **Voting (clock/hand slide).** See below.
16. Execution & Death. Giant red "1" (execution per day, at most), 2 dark tiles "The dead lose: ability / right to nominate", 2 outlined tiles "The dead keep: voice / one last vote", wide tile "Always: characters stay secret in death, dead still win with their team".
17. How to Win. Split 50/50: parchment left "Good wins when the Demon dies" (blue), dark right "Evil wins when more evil than good remain" (red). Footnotes: tie goes to good; Scarlet Woman.
18. Chapter IV The Characters. Radial `#2a1216 -> #100e14` (red-tinged), stars, large clock, "22 possible characters. Only 13 are in play."
19. Townsfolk: Information. 4x2 card grid (blue tint), each: gold-tracked trigger label (First night / Each night / Each night* / On death), 76px circular icon badge top-right, name 44px, ability 28px `#cfc4ae`. Washerwoman, Librarian, Investigator, Chef, Empath, Fortune Teller, Undertaker, Ravenkeeper. Footnote "* not on the first night".
20. Townsfolk: Protection & Power. 3+2 cards: Monk, Soldier, Slayer, Virgin, Mayor.
21. Outsiders. 4 cards (pale-blue tint): Butler, Drunk, Recluse, Saint.
22. Minions. 4 cards (red tint): Poisoner, Spy, Scarlet Woman, Baron.
23. The Demon. Imp at 300px IM Fell SC in red with a red-glow ember (760px radial, breathes) and round icon; rows: each night* chooses a player; star pass; good's goal "Find it. Execute it."
24. Unreliable Information. Two columns: Drunk or poisoned? / Misregistering; italic gold "Cross-check everything."
25. Golden Rules. Parchment, 4 rules (say anything, keep your token secret, death is not the end, ask the Storyteller).
26. Eyes Closed. Radial dark, stars, small clock, "Eyes Closed", "The first night begins."

Character slides 19-22 are the deck's role list; ability texts differ slightly (shorter) from the sheet; see section 4 for the printed sheet wording.

### Voting slide (15) in detail
- Layout: grid `1fr 620px`, gap 80; left copy, right a 560x560 ring plus caption "13 alive -> 7 votes needed" (italic IM Fell).
- Ring: 13 seats on a circle R=220 (centre 280,280), seat i at angle i*27.692 deg clockwise from 12 o'clock (`x=C+R sin a, y=C-R cos a`). Seat = 68px circle, 2px `#1c1714` border, transparent. Seat 0 = Nominee at top: 3px red border `oklch(.48 .15 25)`, "!" inside (24px bold red), label "NOMINEE" above (24px, 0.14em, uppercase, red). A faint dashed ring (1px, `rgba(28,23,20,.25)`) connects seats.
- Hand: 4px wide red bar (`oklch(.48 .15 25 / .8)`, rounded), length R-46=174px, from centre-ish to rim, `transform-origin: 50% 100%` at the centre. Keyframe `sweep`: `0% rotate(27.69deg)` (points at seat 1) -> `75% rotate(360deg)` (back at the nominee) -> hold to 100%, then hard reset. Whole loop 12 s, `linear` (no easing), infinite. So the sweep takes 9 s (about 0.75 s per seat), then 3 s hold.
- Votes: preset voter seats [1,3,4,6,8,9,11]. Each voter seat has its own `@keyframes vs{i}`: transparent until the hand reaches it (`f = (i-1)*27.69/(360-27.69)*75 %`), then within 1.5% (180 ms) fills `oklch(.5 .16 25)` and scales 1.12, stays until 97%, then resets at 100%. Fill is a hard step, no easing.
- Counter: 160px parchment disc in the centre holding 8 stacked numerals 0..7 (IM Fell, 110px, ink; the 7 is red). Each is shown via opacity step keyframes aligned to the seats' fill times, so it counts up with the hand; at 7 (>= 13/2 rounded up) it turns red.
- All CSS keyframes are generated in JS and rely on static, hardcoded 13 seats/7 voters. In the app it must be driven by the real player count and an actual vote state, not baked keyframes.

## 3. Design tokens

Colours (hex given where the source uses hex; OKLCH where it does):
- Night bg `#100e14` (main), `#08070b` (deep night slides 8-11), `#0c0a0e` (Demon), `#06050a` (dark chips), `#0b0a0e` (html/body), radial centres `#1f1a26`, `#1c1826`, red-tinged `#2a1216`.
- Parchment/day `#e8dfcb` (slides 13-17, 25), gradient `#f3ecdc -> #eadcbc -> #e3c99a` (day title), `#efe6d3` (minor), ink on parchment `#1c1714`, secondary ink `#4a4038`, silhouette `#2a221d`.
- Text on night: `#ece4d4` (primary), `#cfc4ae` (card body), `#b9ad97` (muted). Hairlines `rgba(236,228,212,.15)`; box outlines `rgba(236,228,212,.25)`.
- Gold `oklch(0.78 0.11 75)` (eyebrows, numerals, clock ticks, links; sun/window `oklch(.82 .13 70)`).
- Blood red `oklch(0.62 0.16 25)` (borders, dots), light red `oklch(.72 .14 25)` (evil text), strong `oklch(.58 .2 25)`/`.66 .18 25` (Imp), ink-red on parchment `oklch(.48 .15 25)`, vote fill `oklch(.5 .16 25)`.
- Good blue `oklch(0.62 0.12 245)` family: text `.76 .11 245`, dots `.66 .13 245`, card tint alpha .06, border alpha .35, badge alpha .12/.6. Outsider pale blue `oklch(.82 .06 220)` with the same alpha ladder.
- Card pattern: `border:1px solid <team>/0.35; background:<team>/0.06; border-radius:8px; padding:30px`.
- Icon fills baked in SVG: Townsfolk `#8fb4e0`, Outsiders `#b5d0e4`, evil `#e0827a`.
- Sheet (print) palette: paper `#faf6ee`, ink `#1c1714`, body `#3b332c`, muted `#4a4038`, good blue `#2f5f93`, outsider teal `#27677a`, evil red `#a12f2f`.

Fonts:
- Display: IM Fell English SC (400) for titles/names; IM Fell English regular + italic for body-display, numerals (old-style figures give the "9 0 3 1" character), quotes. Google Fonts via woff2 (subsets embedded, latin).
- UI/body: Alegreya Sans 400/500/700 for labels (uppercase, 0.14-0.28em tracking), body.
- Scale on 1080p canvas: 168 / 84 / 46 / 34 / 28 / 24 px (hero/title/sub/body/small/label).
- All three families are OFL and already on Google Fonts; sheet PDF embeds the same (IM Fell English SC, Italic, Alegreya Sans Regular/Bold).

Texture/ornaments:
- No noise, paper texture or filters. Atmosphere = radial gradients, twinkling stars (seeded LCG, 1.5-4 px dots, 3-7 s twinkle, random negative delays, positioned in the top 70%), glow shadows. Borders are hairlines + 8px radius; ornament is minimal (120x2 red rule under the title, gold 2px top rules, diamond bullet 22px rotated 45deg, 40px dots).
- Shadow/glow: clock `0 0 80px gold/.12` + inset `0 0 60px gold/.08`; moon `drop-shadow(0 0 40px rgba(236,228,212,.35))`; sun halo radial `gold/.55 -> transparent 65%`; ember radial `oklch(.5 .2 25/.55) -> .16/.15 45% -> transparent 70%`.
- Moon: 240px circle with `box-shadow: 46px 22px 0 0 #ece4d4` on a transparent disc (crescent trick), drifts.
- Clock (reused on slides 1, 18, 26): ring 2px gold/.6, inner ring 1px gold/.25, 12 gold ticks (4px wide, 7%/4% of size long at quarter/other hours), hands: ivory 8px (360 s per turn), ivory 4px (30 s), red 2px second hand (5 s), red 20px hub.
- Icon style: filled single-colour glyphs (game-icons look), 46px in a 76px circle with 1.5px team-tinted border and 12% team fill. 22 glyphs: 21 characters + Imp (round badge 190px/124px glyph).

Motion keyframes worth reusing: `twinkle` (opacity .15 <-> .9, ease-in-out), `breathe` (opacity .55->1 + scale 1->1.06, 4-6 s), `drift` (translateY 0 -> -14px, 8 s), `spin` (linear), `sweep` (vote hand). Everything is slow, ambient, looping; no entrance/transition motion.

## 4. Character sheet (PDF)

- One page, US letter (612x792 pt), made by printing HTML in Zen Browser (cairo). The sheet itself is a parchment block 497.25 x 643.5 pt at x=64 (aspect 0.773 : 1, about 3:4 portrait, 1.294 high:wide); the rest of the page is white. Fonts embedded, icons are vector paths in the PDF (no raster images at all).
- Header: title "Blood on the Clocktower" (IM Fell English SC, large), italic subtitle "Trouble Brewing · Character Sheet"; right-aligned bold "12 players" and "7 Townsfolk · 2 Outsiders · 2 Minions · 1 Demon"; 2 px ink rule below.
- Sections (2 columns, each role = small icon + name in small-caps IM Fell + 1-2 line ability in Alegreya Sans): Townsfolk (full width, 2 columns, 14 slots, 7 per... order left/right alternates), Outsiders (left half) and Minions (right half) side by side, Demon (left) and How to Win (right). Section heads: team colour small-caps with a 1px team-colour rule and a right-aligned tracked tag GOOD / EVIL. Footnote italic "* not on the first night" at the end of Townsfolk. The Imp row is clipped almost at the bottom edge (the sheet seems to be exactly full).
- Printed ability texts (verbatim):
  - Townsfolk: Washerwoman "Starts knowing that 1 of 2 players is a particular Townsfolk."; Librarian "Starts knowing that 1 of 2 players is a particular Outsider — or that none are in play."; Investigator "Starts knowing that 1 of 2 players is a particular Minion."; Chef "Starts knowing how many pairs of evil players sit next to each other."; Empath "Each night, learns how many of their 2 living neighbours are evil."; Fortune Teller "Each night, picks 2 players and learns if either is the Demon. One good player falsely reads as the Demon."; Undertaker "Each night*, learns which character was executed today."; Monk "Each night*, picks another player: they are safe from the Demon tonight."; Ravenkeeper "If killed at night, wakes to pick a player and learns their character."; Virgin "The 1st time she is nominated: if the nominator is a Townsfolk, they are executed immediately."; Slayer "Once per game, by day, publicly picks a player: if they are the Demon, they die."; Soldier "Cannot be killed by the Demon."; Mayor "If 3 players live and no one is executed, good wins. If attacked at night, another player might die instead."
  - Outsiders: Butler "Each night, picks a master. Tomorrow, may only vote if the master votes too."; Drunk "Believes they are a Townsfolk, but has no ability — their info may be false."; Recluse "Might register as evil — even as a Minion or Demon — even when dead."; Saint "If executed, the good team loses."
  - Minions: Poisoner "Each night, poisons a player for that night and the next day: their ability fails."; Spy "Each night, sees the Grimoire. Might register as good — even as Townsfolk or Outsider."; Scarlet Woman "If the Demon dies while 5 or more players are alive, she becomes the Demon."; Baron "Two extra Outsiders are in play, replacing two Townsfolk."
  - Demon: Imp "Each night*, picks a player: they die. If the Imp picks itself, a Minion becomes the new Imp."
  - How to Win: "Good wins when the Demon dies." / "Evil wins when evil players outnumber good ones."
- Mismatches with the deck: sheet says "12 players" (deck: 13); sheet wording of Chef/Virgin/Mayor etc. differs from the deck cards (sheet = the canonical, longer text); the sheet drops Ravenkeeper's / Undertaker's trigger labels and adds "How to Win".
- Icons on the sheet: same 22 glyph family as the deck, recoloured to team colours, about 16 px at 110 dpi (about 10-11 pt).
- What would break on screens:
  - Phone 390x844 (portrait): the sheet's 0.773 ratio fits portrait well but 2-column text of ~7-pt type would be about 4 px at a 390px width: unreadable; two columns must collapse to one, or use a scrolling list. A 1:1 scaled sheet (about 497 pt wide, text about 8 pt) only works at roughly 600+ px wide.
  - Desktop 1280x800 (landscape): a portrait sheet fitted by height (800 px) is only about 620 px wide with ~11 px text, so most of the screen is empty and the text is small; "fitted to screen proportions" means re-flowing, e.g. 4 columns in landscape (Townsfolk | Townsfolk | Outsiders+Minions | Demon+Win), or fixed-size sheet scrolled.
  - The sheet has no extra room (the Imp row touches the bottom): any longer text or a larger font overflows; the paper is light while the deck is dark, so an in-app sheet should get a dark variant or stay as a deliberate "parchment" slide (the deck already switches to parchment `#e8dfcb` for Day slides).
  - Counts in the sheet header and body would need to follow the chosen player count (the printed sheet shows only the 12-player split; characters in play differ per game).

## 5. Reusable vs not

Take over 1:1:
- Colour tokens, type scale ratios, label style (uppercase, wide tracking), card/hairline/8px-radius patterns.
- Fonts (OFL, same families, ship woff2 self-hosted; subset to latin, 3 families about 160 KB for the weights actually used, since the deck embeds 460 KB for unused weights/subsets).
- Keyframes `twinkle`, `breathe`, `drift`, `spin`; star generator (LCG seeded dots); CSS clock (ticks + 3 hands); moon crescent (box-shadow trick); glows. All pure CSS/DOM, no dependencies.
- Vote ring geometry (R=220, seat 68px, step 360/N) is a good base: replace baked keyframes with N-based computed geometry and real state.
- Copy: slide text and speaker notes (but check against the Trouble Brewing rules text of the sheet).

Redraw / do not take over:
- The scale-to-fit 1920x1080 canvas and the thumbnail rail: unreadable on a phone; rebuild slides as responsive layouts (cards/grids with clamp() type, one column at 390 px). Only the tap-left/right navigation idea carries over; add swipe and dots.
- Role-count slide: make it data-driven from the app's player-count table (with the Baron variant), not the 13-player constants.
- Icons: 22 recoloured single-path SVGs, easy to reuse 1:1 technically, but provenance is not stated (likely game-icons.net, CC BY 3.0): confirm source and add attribution, or replace. The silhouette town (div + clip-path) is rough and should be redrawn as one SVG if used.
- Parchment sheet: redraw as a responsive component; the PDF itself is print-only.
- Character art/names: Pandemonium Institute trademarks, this is a fan project: keep notice.

## 6. Screenshot index

Directory `scratchpad/botc-slides/`: `d-NN.png` = 1280x800, `p-NN.png` = 390x844 (touch), NN = slide number below. Contact sheets: `sheet-d-1.png` (d 1-12), `sheet-d-2.png` (d 13-26), `sheet-p-1.png`, `sheet-p-2.png` (phone), `sheet-pdf-1.png` (Character Sheet at 110 dpi).
01 Title, 02 Ravenswood Bluff, 03 Two Teams, 04 Tonight's Town (role counts), 05 Storyteller, 06 Game Flow, 07 Setup, 08 The Night, 09 How the Night Works, 10 Night Signals, 11 First Night, 12 The Day, 13 Discussion, 14 Nominations, 15 Voting (captured at loop end, all seven votes filled), 16 Execution & Death, 17 How to Win, 18 The Characters, 19 Townsfolk Information, 20 Townsfolk Protection & Power, 21 Outsiders, 22 Minions, 23 The Demon, 24 Unreliable Information, 25 Golden Rules, 26 Eyes Closed.
Note: the phone shots are letterboxed slides (black bars); the contact sheet `sheet-p-2.png` was generated but only reviewed for p-01..13 (the p-14..26 screenshots show the same layout scaled).

## Open points

- Whether the deck is meant to keep its one-way "hard cut" style (no transitions) is not stated.
- Icon provenance/licence cannot be verified from the files.
- Whether the sheet should show 12 or 13 players, or an adaptive count, is a product decision (the two sources disagree).
