# Mobbin research, round 2 (2026-10-15)

Caveat: Mobbin holds static screens and has no circular-seat game layouts, so these are component-level references. Motion (ripple, sweep, death) cannot be seen in stills; those recommendations are design judgement informed by the stills. All app names checked against the results.

## 1. Tap/press feedback on avatar or token nodes
- Spotify Kids, character picker: https://mobbin.com/screens/2c2c26c0-dc73-4f2e-a04e-b23475ca0a88 . Selected avatar gets a thin gold ring while the others stay dim-ringed; take the single ring plus size contrast.
- Abode, avatar picker: https://mobbin.com/screens/8d29ba84-f1b7-45cd-9503-9b10f009be6e . Selected token gets a blue outline ring on a tinted disc; take outline-on-selected with a soft tint.
- Apple Games, avatar variants: https://mobbin.com/screens/8f619a49-d53d-4afa-ba1d-26d976314eb2 . Selected disc is full-colour while siblings are desaturated.
- Desktop: YouTube Music artist picker: https://mobbin.com/screens/7980d281-e5c2-46ab-be41-70fda9af4fb6 . Circular avatars, selection is a dark overlay with a checkmark.

Recommendation: on pointerdown scale the node to ~0.93 and add a short gold glow; on release spring to 1.06 then 1, with a one-shot expanding ring (ripple) from the node centre. Add `navigator.vibrate(10)` where supported. Selected state is a persistent ring in the theme accent, not just a flash.

## 2. Multi-select of people, message in the centre
- Badoo, Select people: https://mobbin.com/screens/01044a2f-15f2-4e9b-90db-45db91d87697 . Round avatars with a small checkmark badge beside the name.
- Bond, people picker: https://mobbin.com/screens/c596f60f-9338-4755-8c20-dbefeb872802 . Check badge pinned to the avatar corner.
- Bluesky Social, Choose People: https://mobbin.com/screens/117d8dd6-3288-454a-aaf1-b6e019992b69 . Bottom sheet summarising the selection ("Jojo pug, Pug Lovers and 5 others"), a stack of mini avatars plus a count.
- Desktop: Cosmos, multi-select with counter: https://mobbin.com/screens/b66161d0-bdc6-4956-8621-d1e45ca12554 . Persistent "Choose 3 / 6" bar. Deezer: https://mobbin.com/screens/85de70a0-ad19-4e78-a69b-02c79df952cc . Round avatars, purple ring on selected.

Recommendation: tap toggles a mark on any node (no mode switch); marked nodes get a ring plus a small checkmark badge, and a "select all / clear" pair sits near the centre. The communication text renders inside the circle's inner area (the circle interior is a card slot), so marked nodes stay visible around it. Show a "N marked" summary line in the card, like the Bluesky sheet.

## 3. Small circular status badges and availability rings
- Clubhouse, speaker grid: https://mobbin.com/screens/991fb0c8-deb2-4e7c-8c0b-96a1bcd681a8 . Round corner badges (plus, muted mic) on squircle avatars; the muted badge is grey, the active one is coloured. Best match for the ghost-vote badge greying out.
- Discord, profile: https://mobbin.com/screens/9b3b571f-f8a5-4fad-a650-9d7c58c217b3 . Round status dot docked on the avatar edge with a cutout border.
- Hulu, profile avatar with notification dot: https://mobbin.com/screens/d222e3f7-0f5b-4cb0-a70a-49774477e6d7 . Tiny red dot at the top right.
- Jomo, scoreboard: https://mobbin.com/screens/7a616de2-4608-496a-84b6-7aecd8ff3d9c . Avatars with a coloured outer ring that distinguishes states per day; take the ring-as-state idea.

Recommendation: all badges are the same size (~40% of node diameter), circular, with a 2px ring in the node-background colour to cut them off the avatar. Block = blood-red disc with an axe/guillotine glyph; ghost vote = pale-blue disc with a hand/ballot glyph, greyed and desaturated when spent. Nominated/has-nominated rings (turquoise/orange) sit outside the node as thin, partial-opacity rings that fade out on use; keep them clear of the badge positions.

## 4. Timer in the top-right corner
- Yubo, game: https://mobbin.com/screens/0df53845-1879-4027-8e20-60ecef3f669c . Counter pill top right, timer inside the card.
- Duolingo chess, clock pills: https://mobbin.com/screens/d2ba4033-cd01-4450-bde7-ca00a032aaf7 . Compact rounded clock pills in the top bar.
- Azar, live battle: https://mobbin.com/screens/3cfcb3aa-bff6-49e5-b98d-8a888945ed8d . Small tabular timer under the progress bar, high contrast on black.
- Desktop: Fireflies, meeting: https://mobbin.com/screens/7112c8e1-673b-4fc2-bd1d-7b040e523de0 . Muted mm:ss in the top right of a live view. Unity: https://mobbin.com/screens/35dd0f9d-8d0e-44a2-908f-49164cfacfa6 . In-game timer pill.

Recommendation: keep the current clock size and visual, anchor it top right with safe-area insets, tabular numerals, and a pill background only if it collides with content. On phone, make sure it does not overlap the header actions.

## 5. Live vote tally, sweeping hand, sector highlight
No close analogue on Mobbin (nothing radial). Closest:
- Azar battle, split progress bar with a marker: https://mobbin.com/screens/3cfcb3aa-bff6-49e5-b98d-8a888945ed8d . A marker on a bar, the tally split by colour.
- Clubhouse poll: https://mobbin.com/screens/e1a4b640-360a-477d-9c34-85359e60de87 . Live tally with a vote count under it.
- Yubo, would-you-rather: https://mobbin.com/screens/bf25e0d1-7ac3-4747-aca0-e7cab1b850fb . Big percent plus the vote count per option.
- Desktop: Brave Browser polls: https://mobbin.com/screens/103d2a0d-e9d7-4387-9d33-dd1a39bb126b . Slim bars with "(n) %".

Recommendation: implement as Rue specced, with a constant angular speed hand; the sector for seat i is `[i, i+1) * 360/n`, drawn as a conic or SVG wedge in ~15% blood red, and the dividers are computed from n. A vote counts only while the hand is inside the sector and the cast action fires. Keep a running count (e.g. "7 / 11") in the centre, like the Yubo big-number tally.

## 6. Elimination / death / execution micro-animations
- Duolingo chess, checkmate: https://mobbin.com/screens/35387e70-bf95-4832-b4c8-b1ccd018797f . The captured king piece crumbles to debris and a red banner slides in; take the piece-specific effect, not a full-screen takeover.
- Duolingo chess, capture marker: https://mobbin.com/screens/d2ba4033-cd01-4450-bde7-ca00a032aaf7 . Concentric red ring around the target with "-3" floating up.
- Kit, defeated enemy: https://mobbin.com/screens/37c65974-05c3-445b-bf9c-d30bf7f9c8ce . The defeated character with X eyes in a corner of the card.

Recommendation: execution is ~1s: node gets a red ring pulse, avatar desaturates and drops 4px, with a small blood-drop or crack overlay, ending in the dead style (grey avatar, shroud icon). Night death at the dawn reveal reuses the same animation, slower (~1.4s) and with a fade from the night tint. Respect `prefers-reduced-motion` (fade only).

## 7. Highlighted status card (who is on the block, with votes)
- Runbuds, "It's a dead heat!": https://mobbin.com/screens/66e1a5fd-e65b-4cbc-99c2-36613627f74d . Dark red card with a round avatar ring and a big bold name plus the figure; the closest vibe match (blood-red, bold type).
- Premier League, Man of the Match: https://mobbin.com/screens/52b1e05b-f79d-45cf-a5b7-a8f071788f39 . Hero card with a large name, tabs, and a figure.
- Jomo, squad ranking: https://mobbin.com/screens/7a616de2-4608-496a-84b6-7aecd8ff3d9c . Leader row with a medal and a big blue figure.

Recommendation: a parchment card with a thin gold frame, a blood-red header strip carrying the block badge glyph (same as the node badge), avatar ring, the player name in display type, and the vote count as the largest number ("7 votes"), plus "needs N" in muted text. Tie state reads "No execution" in the same card family.

## Friction
Mobbin has no radial or seat-circle references, and results for pattern 5 and 6 are loosely related; the avatar-picker results dominate pattern 1.
