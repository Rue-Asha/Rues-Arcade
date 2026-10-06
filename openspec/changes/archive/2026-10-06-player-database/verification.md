verified-at: 34a2689

## Layer 1: proof:full (green)
```
  Slow test file: [phone] › e2e/look.test.ts (5.8m)
  Slow test file: [desktop] › e2e/look.test.ts (5.7m)
  Consider running tests from slow files in parallel. See: https://playwright.dev/docs/test-parallel
  2 skipped
  264 passed (6.6m)
```

## Layer 2: spec coverage

| Scenario | proof | Evidence |
|---|---|---|
| Add, rename, delete and list saved players | unit | `src/lib/server/players.test.ts` "Scenario: Add, rename, delete and list saved players" ✓ |
| Empty or whitespace saved name rejected | unit | `src/lib/server/players.test.ts` "Scenario: Empty or whitespace saved name rejected" ✓ |
| Request without a usable name rejected | e2e | `e2e/players-api.test.ts` "Scenario: Request without a usable name rejected" ✓ |
| Overlong saved name rejected | unit | `src/lib/server/players.test.ts` "Scenario: Overlong saved name rejected" ✓ |
| Duplicate saved name rejected | unit | `src/lib/server/players.test.ts` "Scenario: Duplicate saved name rejected" ✓ |
| Unknown saved player id | unit | `src/lib/server/players.test.ts` "Scenario: Unknown saved player id" ✓ |
| Players API round trip on the server | e2e | `e2e/players-api.test.ts` "Scenario: Players API round trip on the server" ✓ |
| Deleting a player cascades to referencing rows | unit | `src/lib/server/db.test.ts` "Scenario: Deleting a player cascades to referencing rows" ✓ |
| Players table arrives once on an existing database | unit | `src/lib/server/db.test.ts` "Scenario: Players table arrives once on an existing database" ✓ |
| Save, rename and delete in the Spieler page | e2e | `e2e/players.test.ts` "Scenario: Save, rename and delete in the Spieler page" ✓ |
| Deleting a saved player asks for confirmation | e2e | `e2e/players.test.ts` "Scenario: Deleting a saved player asks for confirmation" ✓ |
| Duplicate saved name shows the server message | e2e | `e2e/players.test.ts` "Scenario: Duplicate saved name shows the server message" ✓ |
| No saved players shows an empty state | e2e | `e2e/players.test.ts` "Scenario: No saved players shows an empty state" ✓ |
| Server unreachable keeps guests working | e2e | `e2e/players.test.ts` "Scenario: Server unreachable keeps guests working" ✓ |
| Roster survives reload | e2e | `e2e/roster.test.ts` "Scenario: Roster survives reload" ✓ |
| Rename and remove a player | unit | `src/lib/roster.test.ts` "Scenario: Rename and remove a player" ✓ |
| Empty or whitespace name rejected | unit | `src/lib/roster.test.ts` "Scenario: Empty or whitespace name rejected" ✓ |
| Duplicate name rejected | unit | `src/lib/roster.test.ts` "Scenario: Duplicate name rejected" ✓ |
| First run shows empty roster prompt | e2e | `e2e/roster.test.ts` "Scenario: First run shows empty roster prompt" ✓ |
| Storage unavailable works for the session | unit | `src/lib/roster.test.ts` "Scenario: Storage unavailable works for the session" ✓ |
| Removing a saved player's entry keeps the saved player | unit | `src/lib/roster.test.ts` "Scenario: Removing a saved player's entry keeps the saved player" ✓ |
| Tapping a saved player adds it to the roster | e2e | `e2e/players.test.ts` "Scenario: Tapping a saved player adds it to the roster" ✓ |
| Typed name matching a saved player adds the saved player | unit | `src/lib/roster.test.ts` "Scenario: Typed name matching a saved player adds the saved player" ✓ |
| Saved player already in the roster is not added twice | unit | `src/lib/roster.test.ts` "Scenario: Saved player already in the roster is not added twice" ✓ |
| Guest named like a roster entry rejected | unit | `src/lib/roster.test.ts` "Scenario: Guest named like a roster entry rejected" ✓ |
| Saving a guest links it in place | unit | `src/lib/roster.test.ts` "Scenario: Saving a guest links it in place" ✓ |
| Saving a guest whose name is already saved links to it | unit | `src/lib/roster.test.ts` "Scenario: Saving a guest whose name is already saved links to it" ✓ |
| Speichern on a guest row | e2e | `e2e/players.test.ts` "Scenario: Speichern on a guest row" ✓ |
| Renaming a saved player renames its roster entry | unit | `src/lib/roster.test.ts` "Scenario: Renaming a saved player renames its roster entry" ✓ |
| Deleting a saved player removes its roster entry | e2e | `e2e/players.test.ts` "Scenario: Deleting a saved player removes its roster entry" ✓ |
| Deleting a saved player mid-game keeps the session snapshot | unit | `src/lib/roster.test.ts` "Scenario: Deleting a saved player mid-game keeps the session snapshot" ✓ |
| Matching guests become linked on load | unit | `src/lib/roster.test.ts` "Scenario: Matching guests become linked on load" ✓ |
| Two entries matching one saved player | unit | `src/lib/roster.test.ts` "Scenario: Two entries matching one saved player" ✓ |
| Linked entry whose saved player is gone becomes a guest | unit | `src/lib/roster.test.ts` "Scenario: Linked entry whose saved player is gone becomes a guest" ✓ |
| Server unreachable leaves the roster unchanged | unit | `src/lib/roster.test.ts` "Scenario: Server unreachable leaves the roster unchanged" ✓ |
| Old roster shows linked after the update | e2e | `e2e/players.test.ts` "Scenario: Old roster shows linked after the update" ✓ |
| Saved player id is the same on every device | unit | `src/lib/roster.test.ts` "Scenario: Saved player id is the same on every device" ✓ |
| Old session resumes after the update | e2e | `e2e/players.test.ts` "Scenario: Old session resumes after the update" ✓ |
| Demo leaves saved players untouched | e2e | `e2e/players.test.ts` "Scenario: Demo leaves saved players untouched" ✓ |

## Manual checklist
none

## Diffstat
```
 e2e/helpers.ts                                     |  26 ++
 e2e/look.test.ts                                   |   2 +
 e2e/players-api.test.ts                            |  47 +++
 e2e/players.test.ts                                | 265 ++++++++++++++
 e2e/roster.test.ts                                 |  18 +-
 migrations/0004_players.sql                        |   5 +
 openspec/changes/player-database/.openspec.yaml    |   2 +
 openspec/changes/player-database/design.md         | 158 +++++++++
 openspec/changes/player-database/flow.yaml         |  10 +
 openspec/changes/player-database/proposal.md       |  59 ++++
 openspec/changes/player-database/scope.md          |  65 ++++
 .../shots/desktop-look-lobby-pick.png              | Bin 0 -> 104804 bytes
 .../player-database/shots/desktop-look-spieler.png | Bin 0 -> 70118 bytes
 .../player-database/shots/desktop-spieler-gast.png | Bin 0 -> 60220 bytes
 .../shots/desktop-spieler-gespeichert-leer.png     | Bin 0 -> 59974 bytes
 .../shots/desktop-spieler-gespeichert.png          | Bin 0 -> 57081 bytes
 .../player-database/shots/desktop-spieler-leer.png | Bin 0 -> 59974 bytes
 .../player-database/shots/desktop-spieler.png      | Bin 0 -> 60339 bytes
 .../shots/phone-look-lobby-pick.png                | Bin 0 -> 60655 bytes
 .../player-database/shots/phone-look-spieler.png   | Bin 0 -> 71844 bytes
 .../player-database/shots/phone-spieler-gast.png   | Bin 0 -> 53441 bytes
 .../shots/phone-spieler-gespeichert-leer.png       | Bin 0 -> 51588 bytes
 .../shots/phone-spieler-gespeichert.png            | Bin 0 -> 51254 bytes
 .../player-database/shots/phone-spieler-leer.png   | Bin 0 -> 51588 bytes
 .../player-database/shots/phone-spieler.png        | Bin 0 -> 57736 bytes
 .../changes/player-database/specs/players/spec.md  |  88 +++++
 .../changes/player-database/specs/roster/spec.md   | 158 +++++++++
 openspec/changes/player-database/tasks.md          |  32 ++
 openspec/changes/player-database/verification.md   | 119 +++++++
 src/lib/players.ts                                 |  52 +++
 src/lib/roster.svelte.ts                           | 138 +++++++-
 src/lib/roster.test.ts                             | 384 +++++++++++++++++++++
 src/lib/server/db.test.ts                          |  51 +++
 src/lib/server/db.ts                               |   5 +-
 src/lib/server/players.test.ts                     | 111 ++++++
 src/lib/server/players.ts                          |  45 +++
 src/routes/+layout.svelte                          |   6 +-
 src/routes/api/players/+server.ts                  |  13 +
 src/routes/api/players/[id]/+server.ts             |  23 ++
 src/routes/spiele/[slug]/lobby/+page.svelte        |   3 +-
 src/routes/spieler/+page.svelte                    | 212 +++++++++++-
 41 files changed, 2078 insertions(+), 19 deletions(-)
```

## Screenshots
openspec/changes/player-database/shots/desktop-look-lobby-pick.png
openspec/changes/player-database/shots/desktop-look-spieler.png
openspec/changes/player-database/shots/desktop-spieler-gast.png
openspec/changes/player-database/shots/desktop-spieler-gespeichert-leer.png
openspec/changes/player-database/shots/desktop-spieler-gespeichert.png
openspec/changes/player-database/shots/desktop-spieler-leer.png
openspec/changes/player-database/shots/desktop-spieler.png
openspec/changes/player-database/shots/phone-look-lobby-pick.png
openspec/changes/player-database/shots/phone-look-spieler.png
openspec/changes/player-database/shots/phone-spieler-gast.png
openspec/changes/player-database/shots/phone-spieler-gespeichert-leer.png
openspec/changes/player-database/shots/phone-spieler-gespeichert.png
openspec/changes/player-database/shots/phone-spieler-leer.png
openspec/changes/player-database/shots/phone-spieler.png

## Review

Round 1 (fd02eb8) → fixer 3cd1525, 8163db1, b9df4e4:
- promote() could link two roster entries to one saved player → refuses with „Alex“ ist schon dabei. Fixed.
- Migration lacked AUTOINCREMENT, a deleted player's id could be reused; orphaned linked entries stayed stuck → AUTOINCREMENT, sync demotes an orphan to a guest. Fixed.
- renameSaved / sync name refresh could clash with a guest name → checked. Fixed.
- API 500 on non-JSON or null body → 400 with message. Fixed.
- Cascade test used raw SQL; two duplicate-message tests too loose → through the store, exact wording. Fixed.

Round 2 (b9df4e4) → fixer c77ef3e, ad6e365, 34a2689:
- Flaky shared-DB list compare in players-api e2e → own row only. Fixed.
- Double tap on Löschen sent two DELETEs → guarded, e2e added. Fixed.
- renameSaved refused for saved players outside the roster → refuses only when linked. Fixed.

Round 3 (34a2689), left open at the round limit, all low:
- sync keeps a stale name when a rename from another device would clash with another roster entry (spec says "refresh names"; no scenario for the clash).
- API accepts a non-string `name` (`{"name":["Alex"]}` saves "Alex", an object saves "[object Object]").
- Double tap on Speichern / Anlegen sends two POSTs; second gets 409 and shows „Wanda“ ist schon gespeichert. though the entry ends linked.
- (reviewer: no weakened tests, no weak scenario tests)
