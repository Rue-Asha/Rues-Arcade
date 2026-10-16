# Mobbin references for Gate 2 revisions S39-S49

All references are Mobbin iOS screens (app name verified in each result). Constraints applied to every recommendation: palette stays, contrast >= 4.5:1, decoration is inline SVG/CSS only, phone 390x844 first, desktop 1280x800. Observed current state: the day screen is flat parchment with a header card eating ~230px, a sparse seat ring with no connection, a small "8:00" timer at the right of the title row, and "Weiter"/"Tag beenden" in flow below the circle.

## S39 Atmosphere (night stars/moon, day sun)
References:
- Stardust, night-sky screen with a glowing moon and sparse stars, text on solid dark card: https://mobbin.com/screens/71ca5abb-fca1-48b4-aae8-aed8a9061c1f
- Hatch Sleep, star-dust dark navy gradient behind controls: https://mobbin.com/screens/a59a0aa5-5e53-4d1e-99c2-9f84fad7641c
- Lumy, dark panel with moon/sun glyph rows (night vs sun info on one surface): https://mobbin.com/screens/d8d8229e-1df7-4342-b2f5-397f7afee83a
- Deepstash, pale background with a soft yellow radial glow plus a line-art sun and clouds: https://mobbin.com/screens/45c5ca3b-fe65-4d3b-b6b2-7f808a5ef8b1
Pattern: stars are tiny, low-density dots concentrated in the top third and fading out; the moon is one large soft-glow disc at the edge. Day = a blurred radial warm glow plus one simple line sun, not a full illustration.
Recommendation: night = an absolutely positioned inline SVG layer (about 30-40 dots at 1-2px, two sizes, opacity 0.3-0.7, top 45% with a mask fade, optional slow twinkle disabled under reduced motion) plus a crescent moon in a corner with a `radial-gradient` halo, `pointer-events: none`, `z-index` below content. Day = `radial-gradient` warm glow top-right (sun at about 12% opacity of the accent) plus a line sun with short rays, slightly brighter parchment stops. Keep text on the existing solid card surfaces so contrast is measured against flat colour; keep decoration in the empty margins, not behind text.

## S40 Vote sweep and count-up
References:
- Commons, poll with percent bars filling left to right: https://mobbin.com/screens/e02907d9-cea5-4b7d-b625-eb99e88f2796
- Clubhouse, live poll bars with the vote count in the footer ("2 votes"): https://mobbin.com/screens/e1a4b640-360a-477d-9c34-85359e60de87
Pattern: the count sits next to the visual and is tabular, not a separate card. Nothing on Mobbin matches a clock-hand sweep, so the user's reference HTML is the better source.
Recommendation: put the vote number in a big tabular-nums digit next to the dial (`font-variant-numeric: tabular-nums`, fixed width so it does not jitter), tick it up as the hand passes each seat (CSS counter or rAF, ending on the final number), and have each passed node switch ring colour and gain a small tick badge (colour plus shape, not colour alone). Reduced motion: render the end state with no transition.

## S41 Setup: every seat's character at a glance
References:
- Oura, circle of avatars linked by a thin ring with a stat chip beside each node: https://mobbin.com/screens/497f88dd-5eca-42f4-930b-2004c5b4701d
- Runbuds, avatars with a numeric badge at the bottom-right of each, laid out around a track: https://mobbin.com/screens/e32cfb4a-d82d-4773-8efb-d34f6f33344d
- Spotify Kids, profile tiles where the avatar is the identity and the name sits below: https://mobbin.com/screens/1189eac6-37cb-41e6-934d-664b20e5fd8f
Pattern: the node is the avatar/icon itself, with name below (or a badge at the corner) so no tap is needed.
Recommendation: fill each seat node with the character icon in its team colour (inline SVG symbol per character) and keep the seat number and name as a label under or in a corner badge. At 15 seats on phone, nodes need at least about 40px with the name as a 11-12px label under the node; if it will not fit, put the name on the outside of the ring and the icon inside. Add an `aria-label` of "Seat 3, Name, Character, Team" since colour alone must not carry the team (pair it with a shape: good = round, evil = pointed ring notch or a small glyph).

## S42 Centred info boxes
References:
- Freeform, centred-padding tip card with an icon on the left and a close button: https://mobbin.com/screens/3d3433d1-7f87-4dbd-b342-72636752954b
- (Not Boring) Weather, centred title with a leader-dotted key-value strip: https://mobbin.com/screens/69c1f76a-cd1b-44f7-a57a-dc917f948445
- Lumy, centred hero value above left-aligned rows, so each zone has its own alignment: https://mobbin.com/screens/491f5781-df9b-46ea-86ec-fb258a83d369
Pattern: a short statement is centred; a multi-row list stays left-aligned with value right. Centring is for 1-3 lines.
Recommendation: `text-align: center` on the info box, a max-width of about 36ch with `text-wrap: balance`, and `margin-inline: auto`. Keep any list inside the box (rows with a label and a value) left-aligned, otherwise the ragged edge on both sides hurts scanning.

## S43 Circle ornament and connected seats
References:
- Oura (as above): thin ring joining the nodes, each node has its own outline colour: https://mobbin.com/screens/497f88dd-5eca-42f4-930b-2004c5b4701d
- Runbuds, concentric track lines behind the nodes give depth: https://mobbin.com/screens/e32cfb4a-d82d-4773-8efb-d34f6f33344d
- Stardust, thin constellation line-art as the decorative language on a dark surface: https://mobbin.com/screens/71ca5abb-fca1-48b4-aae8-aed8a9061c1f
Pattern: one thin ring through all node centres, a second fainter ring or tick marks outside, centre left calm or holding the key info.
Recommendation: one inline SVG ring through the seat centres (stroke at 1.5px, 40-60% accent, dashed or solid), a second hairline ring at +10px, and 12 tick marks like a clock face (gothic fit, and it ties to the Clocktower name). A faint centre rosette or clock hub behind the centre text. Dead seats keep the dashed outline and the ring segment next to them goes dashed too, so the state reads on the ring. Seats sit on top (`z-index`) of the ring so lines never cross text.

## S44 Primary CTA at the end of the content
References:
- Zip, CTA directly after the form, with whitespace below it (in-flow): https://mobbin.com/screens/97fbf44c-76bd-45b1-88e5-ea826f9f2424
- Alan, "Continue" in flow after the last field: https://mobbin.com/screens/e1a0f7bf-2e64-4436-9508-66ec9cd02d70
- Wise, sticky CTA that visibly cuts off the field behind it (the anti-pattern the user dislikes): https://mobbin.com/screens/46e8ed72-713c-4817-bdf9-93472d113331
- Cleo AI, sticky CTA over a long text with a scroll fade: https://mobbin.com/screens/410f1fd4-1fb6-4da1-8954-705df06f2313
Pattern: in-flow CTAs sit 24-32px below the last block; sticky ones are used for forms where the CTA must stay reachable, and they clip content.
Recommendation: make "Weiter" the last child of the scrolling column with `margin-top: 24px`, padded with `padding-bottom: env(safe-area-inset-bottom)` plus about 24px, and no `position: sticky`. To keep circle + info visible in one piece: shrink the header card on the play page (it is ~230px; collapse "Spiel beenden" to a small header action) and size the circle with `min(100%, calc(100svh - header - cta))` so on 390x844 the circle, status line and button fit without scrolling for 5-9 seats, and scroll only for 10-15.

## S45 Compact "show to player" bar
References:
- Obsidian, floating pill with 5 icon buttons: https://mobbin.com/screens/0d1e69ff-4a8c-4e95-b61c-54b77f0ac661
- Apple Notes, left pill of three icon actions plus a separate round primary: https://mobbin.com/screens/57adcd9e-fe96-4ddc-b44e-bf40367fc14f
- Freeform, bottom pill of 4 tools with the tooltip anchored above it: https://mobbin.com/screens/3d3433d1-7f87-4dbd-b342-72636752954b
- Clubhouse, bottom row of icon+label chips plus one large round action: https://mobbin.com/screens/e1a4b640-360a-477d-9c34-85359e60de87
Pattern: a single rounded segmented pill, icon-first, short label only for the selected or all, with one visually distinct round primary beside it.
Recommendation: replace the button stack with one segmented pill (single `role="group"` with `aria-label`), 3-4 segments, each min 44px high, icon plus a 12px label under or beside it (labels stay, since "Du bist ..." type actions need to be readable by a guest). Place it at the bottom of the circle area, in flow below the circle and above "Weiter", not floating over seats. On desktop keep the same pill centred under the circle.

## S46 Prominent day timer
References:
- Waking Up, a huge condensed numeral in a thin progress ring: https://mobbin.com/screens/20bbf97b-7e91-4432-934d-664b20e5fd8f
- Oura, "Time remaining" label above a ring around the numerals: https://mobbin.com/screens/08366dca-8bef-401f-a5d2-2514448fdf7d
- Tiimo, large serif digits below a coloured ring: https://mobbin.com/screens/55bc07f2-2d42-45ae-af79-ba2dea8801dc
- Forest, ring with a marker dot at the progress position: https://mobbin.com/screens/07a76af6-5927-4657-bca2-9fb1feb152f9
Pattern: the number is the hero (2-3x body size, tabular), a progress ring around or beside it, a small label ("Zeit"), and the state change (last 60s, time up) swaps colour and adds a pulse.
Recommendation: a centred timer block: 48-56px tabular numerals in the display font, a SVG ring (r about 44) with a dasharray countdown behind or around it, label "Diskussion" above. Last 60 s: switch to the existing red token and pulse the ring once per second (disabled under reduced motion; add text "Zeit um" at zero, which already exists). Placed directly under the day heading, above the circle, not in the right corner of a title row.

## S47 Decorated ghost-vote token
References:
- yope, avatar with a small round status badge (check) at its corner: https://mobbin.com/screens/b8e0f240-a969-41bb-af3a-4bb5d9d80499
- Runbuds, numeric chip overlapping the avatar: https://mobbin.com/screens/e32cfb4a-d82d-4773-8efb-d34f6f33344d
- Me+, medal-style round badges for tiers: https://mobbin.com/screens/e6eee4ed-645f-45d7-a050-66af8c6d7c4a
Pattern: a circular badge overlapping the node corner, with a ring or rim and an icon inside, 18-22px.
Recommendation: render the token as an SVG coin: outer rim ring plus an inner ring (a seal/wax look), the state glyph in the centre, and a tiny notch pattern around the edge. Keep the visible text "X ●" (vote still available) or "X ○" (used), larger than today (about 12-13px), light-on-dark or dark-on-light to meet 4.5:1, and keep the accessible label unchanged. Used = hollow centre, available = filled, so the state also reads by shape.

## S48 Small legend box
References:
- Lumy, rows of icon + label + value inside a bordered card: https://mobbin.com/screens/491f5781-df9b-46ea-86ec-fb258a83d369
- Stardust, small bordered info card with a caption line and a value: https://mobbin.com/screens/71ca5abb-fca1-48b4-aae8-aed8a9061c1f
- Freeform, tooltip card with an icon, a title and a short line: https://mobbin.com/screens/3d3433d1-7f87-4dbd-b342-72636752954b
Pattern: a legend is a bordered card with a solid surface, a caption title, and icon-led rows at 13-14px.
Recommendation: a bordered box (1px token border, solid surface, radius matching cards, padding 8-12px) at the bottom left, max-width about 160px on phone, a 12px small-caps title ("Legende"), and rows icon + 13px text, at least 4.5:1 on the box surface. The box has its own solid background so the S39 sky never sits behind the text. Collapse behind a toggle on phone if it overlaps the S45 bar.

## S49 End screen grouped by team
References:
- Riot Mobile, match details with "My Team" header and a row per player with an avatar, role and stats: https://mobbin.com/screens/b4116f8d-3f99-42c1-a796-619c5652c061
- Apple News, two-team score header split by colour (diagonal split) over a table: https://mobbin.com/screens/8e94abb0-4fcc-46e0-b00d-b09952fb826f
- Fixtured, final-score header with team badges and a standings table: https://mobbin.com/screens/8f469fc5-4a5e-4ff6-9d4e-7358d05e854f
- Abode, ranked list rows with an avatar and the result at the right: https://mobbin.com/screens/9a0ae1c3-bd13-4f51-a8a2-56c56b061455
Pattern: the winner is announced in a hero band, then one section per team with a coloured header and a row per player (icon, name, outcome).
Recommendation: a hero line for the winner ("Das Gute siegt" / "Das Böse siegt"), then two sections "Gut" and "Böse" (team colour header with a shape glyph so it is not colour-only), each a list of rows: character icon in the team colour, player name, character name, and alive/dead (a small skull or heart glyph with a text label for screen readers). On phone stack the two sections (winner first); on desktop place them side by side in two columns.

## friction
none
