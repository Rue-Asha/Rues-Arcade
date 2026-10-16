# Blood on the Clocktower: Trouble Brewing rules research

Research for the `blood-on-the-clocktower` change (explore phase), written 2026-10-14.

## Sources and citation keys

| Key | Source | Notes |
|---|---|---|
| **RB p.N** | `/home/Rue/Documents/Daddelei/BOTC_Main_Rulebook_-_V1.pdf` | N is the **printed** page number. PDF page = N + 2. |
| **W:Page** | `https://wiki.bloodontheclocktower.com/Page` (fetched via the MediaWiki API, 2026-10-14) | Character pages: Summary, How to Run, Examples. |
| **TPI** | Official app data from The Pandemonium Institute: `github.com/ThePandemoniumInstitute/botc-release` → `resources/data/nightsheet.json` and `roles.json` (also served at `release.botc.app/resources`) | Canonical ability text, reminder tokens, night order and night-sheet reminder text. |
| **SG** | `/home/Rue/Documents/Daddelei/Storyteller Guide.pdf` | 3 pages in German, written for 12 players. It is a **home-made summary, not official**. Its deviations are listed in §9. |
| **CS** | `/home/Rue/Documents/Daddelei/Character Sheet.pdf` | Home-made 12-player sheet with **paraphrased** ability text (see §9). |
| **TS** | `github.com/bra1n/townsquare` → `src/game.json` | A community tool, used only for the setup table, cross-checked in §1. |

The rulebook has no character almanac (the TB almanac is a separate booklet), so ability text and per-character rulings come from W and TPI.
RB p.42 (ABILITY): "The definitive text of the ability is printed on the character sheet, and the character almanac is used for guidance."

---

## 1. Player counts and setup

Sources: RB p.4, p.10–11, p.24–25, p.42–44; W:Setup; W:Baron; W:Mayor; W:Scarlet_Woman; TS. The setup table itself is printed on the box's setup sheet and Traveller sheet, which are not in the PDF.

- **Minimum 5 players for TB.** RB p.10: "You'll need five or more players for TROUBLE BREWING, and seven or more players for other editions."
- **The game is for 5 to 20 players.** RB p.4: "for five to twenty players".
- **15 non-Traveller players at most.** RB p.10: "If there are more than fifteen players in this game, then any excess players must volunteer to be Travellers." RB p.25: "For all games larger than fifteen players, Travellers are included in the game and begin at the same time as the other players."
- **The Storyteller is not a player.** RB p.44, PLAYER: "Any person who has an in-play character, not including the Storyteller." W:Mayor adds: "Fabled don't count as players for the Mayor's victory, as the Storyteller isn't a player."

### Setup table (non-Traveller players)

The numbers come from TS. They match W:Baron ("seven players, with five Townsfolk, one Minion, and one Demon"; "fifteen players, with nine Townsfolk, two Outsiders, three Minions, and one Demon") and CS ("12 players: 7 Townsfolk · 2 Outsiders · 2 Minions · 1 Demon").

| Players | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Townsfolk | 3 | 3 | 5 | 5 | 5 | 7 | 7 | 7 | 9 | 9 | 9 |
| Outsiders | 0 | 1 | 0 | 1 | 2 | 0 | 1 | 2 | 0 | 1 | 2 |
| Minions | 1 | 1 | 1 | 1 | 1 | 2 | 2 | 2 | 3 | 3 | 3 |
| Demon | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |

- **Baron:** "+2 Outsiders". It replaces 2 Townsfolk; Outsiders "always replace Townsfolk, not other character types" (W:Baron). TB has 4 Outsiders, so a Baron game has at most the table count + 2 Outsiders.
- RB p.11: "After adding and removing character tokens, the number of character tokens will always equal the number of players." Each character exists once, since there is one token per character.
- **Drunk:** the Drunk is an Outsider and counts in the Outsider number, but its player draws a Townsfolk token (see §2).

### Travellers

Sources: RB p.24–25; W:Travellers; W:Character_Types.

- Travellers are for players who join late or leave early. They "may enter the game at any time". The ST picks their alignment (good about ⅔ of the time); "If you made the Traveller evil, they learn which player is the Demon, but not which players are the Minions" (RB p.24). Their character is publicly declared; their alignment is not.
- The recommended TB Travellers are the Scapegoat, Beggar, Gunslinger, Bureaucrat and Thief (RB p.24).
- Travellers are not added to the setup table. The table counts non-Traveller players only, so travellers come on top of it (RB p.10, p.25).
- **No explicit Traveller cap was found.** The cap is only implied: at most 20 people in total, with everyone past 15 becoming a Traveller. RB p.25 talks about "three, four, or five Travellers", and the box has 15 Traveller tokens and 20 life tokens (RB p.6).
- RB p.24: "Consider adding a Traveller only if seven or more players are alive."
- **Travellers are excluded from** evil's 2-alive win (RB p.25, p.43) and from the Scarlet Woman's "5 or more" count (TPI ability text).
- **Travellers are included in** the Mayor's "3 players live" (W:Mayor: "Travellers count as players for the Mayor's victory, so must be exiled first"). They also count for the vote threshold: it uses "alive players", Travellers are players, and RB p.25 says they "may nominate, may vote".
- **Exile** is the Travellers' version of execution:
  - Any player, alive or dead, may call for one at any time during the day. It does not use up a nomination.
  - It needs support from "at least half of the players … This counts the total number of players in the game, not the number of alive players". Dead players may support it without spending their vote token.
  - Any number of exiles may happen per day. An exile is **not an execution**, and abilities cannot affect exiles (RB p.25; RB p.43, EXILE).

---

## 2. The 22 Trouble Brewing characters

Ability text is verbatim from TPI `roles.json`, and it matches the W summaries. **N1** means the character acts on the first night and **ON** means it acts on other nights, both from TPI `nightsheet.json`. "Each night*" means every night except the first (RB p.42).

| # | Character | Type / team | Ability (exact) | N1 | ON | Setup |
|---|---|---|---|---|---|---|
| 1 | Washerwoman | Townsfolk / good | You start knowing that 1 of 2 players is a particular Townsfolk. | yes | no | – |
| 2 | Librarian | Townsfolk / good | You start knowing that 1 of 2 players is a particular Outsider. (Or that zero are in play.) | yes | no | – |
| 3 | Investigator | Townsfolk / good | You start knowing that 1 of 2 players is a particular Minion. | yes | no | – |
| 4 | Chef | Townsfolk / good | You start knowing how many pairs of evil players there are. | yes | no | – |
| 5 | Empath | Townsfolk / good | Each night, you learn how many of your 2 alive neighbors are evil. | yes | yes | – |
| 6 | Fortune Teller | Townsfolk / good | Each night, choose 2 players: you learn if either is a Demon. There is a good player that registers as a Demon to you. | yes | yes | Red Herring chosen at setup |
| 7 | Undertaker | Townsfolk / good | Each night\*, you learn which character died by execution today. | no | yes (only if there was an execution) | – |
| 8 | Monk | Townsfolk / good | Each night\*, choose a player (not yourself): they are safe from the Demon tonight. | no | yes | – |
| 9 | Ravenkeeper | Townsfolk / good | If you die at night, you are woken to choose a player: you learn their character. | no | yes (only the night they die) | – |
| 10 | Virgin | Townsfolk / good | The 1st time you are nominated, if the nominator is a Townsfolk, they are executed immediately. | no | no (day) | – |
| 11 | Slayer | Townsfolk / good | Once per game, during the day, publicly choose a player: if they are the Demon, they die. | no | no (day) | – |
| 12 | Soldier | Townsfolk / good | You are safe from the Demon. | no | no | – |
| 13 | Mayor | Townsfolk / good | If only 3 players live & no execution occurs, your team wins. If you die at night, another player might die instead. | no | no | – |
| 14 | Butler | Outsider / good | Each night, choose a player (not yourself): tomorrow, you may only vote if they are voting too. | yes | yes | – |
| 15 | Drunk | Outsider / good | You do not know you are the Drunk. You think you are a Townsfolk character, but you are not. | as their Townsfolk | as their Townsfolk | **yes:** gets a Townsfolk token |
| 16 | Recluse | Outsider / good | You might register as evil & as a Minion or Demon, even if dead. | no | no | – |
| 17 | Saint | Outsider / good | If you die by execution, your team loses. | no | no | – |
| 18 | Poisoner | Minion / evil | Each night, choose a player: they are poisoned tonight and tomorrow day. | yes | yes | – |
| 19 | Spy | Minion / evil | Each night, you see the Grimoire. You might register as good & as a Townsfolk or Outsider, even if dead. | yes | yes | – |
| 20 | Scarlet Woman | Minion / evil | If there are 5 or more players alive & the Demon dies, you become the Demon. (Travellers don't count.) | no | yes (only if she became the Demon today) | – |
| 21 | Baron | Minion / evil | There are extra Outsiders in play. [+2 Outsiders] | no | no | **yes:** +2 Outsiders, −2 Townsfolk |
| 22 | Imp | Demon / evil | Each night\*, choose a player: they die. If you kill yourself this way, a Minion becomes the Imp. | no (only Demon info) | yes | – |

### Reminder tokens and how the Storyteller runs each character

Reminder names come from TPI `reminders` / `remindersGlobal` and the W "How to Run" sections. The info tokens are THIS IS THE DEMON, THESE ARE YOUR MINIONS, THESE CHARACTERS ARE NOT IN PLAY and YOU ARE (RB p.12, W:Imp, W:Scarlet_Woman).

| Character | Reminders | How the ST runs it (W:&lt;name&gt; How to Run) |
|---|---|---|
| Washerwoman | TOWNSFOLK, WRONG | N1: mark one Townsfolk and one other player; point to both and show the Townsfolk token. The Spy may register as a Townsfolk. |
| Librarian | OUTSIDER, WRONG | Same as the Washerwoman, but with an Outsider. With no Outsiders, show "0". If one of the players is the Drunk, show the **Drunk** token, not their believed Townsfolk. |
| Investigator | MINION, WRONG | Same as the Washerwoman, but with a Minion. The Recluse may register as a Minion. |
| Chef | – | N1: show fingers for the number of adjacent evil pairs. Three in a row count as 2 pairs. Spy and Recluse registration can differ per pair. |
| Empath | – | Each night: show fingers 0–2 for evil among the nearest **alive** neighbours (dead players are skipped). It acts after the Imp, so the info is "accurate at dawn". |
| Fortune Teller | RED HERRING | Setup: mark any good player (possibly the FT themself) as the Red Herring for the whole game. Each night the FT points at 2 players; nod if either is the Demon, or the Red Herring. A dead Demon still gives a nod. |
| Undertaker | DIED TODAY | Each other night, if someone died by execution today, show their **true** token (the Drunk shows as Drunk; the Spy and Recluse may register). With no execution, don't wake them. |
| Monk | SAFE | Each other night the Monk points at a player who is not themself; mark SAFE and remove it at dawn. If the Demon attacks the SAFE player, nobody dies and there is no re-target. |
| Ravenkeeper | – (TPI lists none) | If they died tonight (including a Mayor bounce), wake them; they point at a player, and you show that player's token. |
| Virgin | NO ABILITY | The first valid nomination of the Virgin always uses up the ability, even if the Virgin is drunk or poisoned. If the nominator is a Townsfolk, they are executed at once and nominations end. |
| Slayer | NO ABILITY | Day, public: if the target is an alive Demon (or a Recluse registering as one), they die; otherwise "Nothing happens". The ability is used up either way, even if the Slayer was poisoned. Mime it for bluffing Slayers too. |
| Soldier | – | A Demon attack on the Soldier: nobody dies. Poisoned or Drunk "Soldiers" do die. |
| Mayor | – | If the Mayor would die at night, the ST may kill another player instead, put DEAD there and declare that death. A bounce onto a dead, Soldier or SAFE player means no death. "At dusk, if exactly three players are alive and no player was executed today, declare that the game ends and good wins." |
| Butler | MASTER | Each night the Butler points at a player who is not themself, and that player is marked MASTER. Voting compliance is the Butler's own responsibility; an illegal Butler vote is still tallied. |
| Drunk | IS THE DRUNK (global) | Setup: put a Townsfolk token in the bag instead of the Drunk, and mark that player IS THE DRUNK. Wake them exactly as that Townsfolk, give them false info if you want, and their "ability" never takes effect. |
| Recluse | – | Each time the Recluse is detected or affected, the ST chooses whether they register as evil and as which Minion or Demon. This can vary within a night. |
| Saint | – | "If the Saint dies by execution, declare that the game ends and evil wins." Dying any other way does nothing. |
| Poisoner | POISONED | Each night: mark the chosen player POISONED and remove it at dusk. The poisoned player has no ability and may get false info. Poison ends immediately if the Poisoner dies or stops being the Poisoner. |
| Spy | – | Each night: show the Grimoire "for as long as the Spy needs". When the Spy is detected or affected by "good" abilities, the ST picks their registration. |
| Scarlet Woman | IS THE DEMON | If the Demon dies with ≥5 players (not Travellers) alive just before, swap the SW token for an Imp token. That night, wake her and show YOU ARE + Imp. |
| Baron | – | Setup only: swap 2 Townsfolk tokens for 2 Outsider tokens (follow the Drunk setup if the Drunk is added). The change stays even if the Baron dies. |
| Imp | DEAD | Each other night the Imp points at any player (alive or dead): they die. On a self-kill, replace an alive Minion's token with an Imp token, then wake them and show YOU ARE + Imp. They do not act that night. |

Setup markers on the physical tokens (RB p.11, p.43 LEAF): an **orange flower** means a setup change (Baron, Drunk); **green leaves on top** give the number of reminder tokens; a **left leaf** means a first-night action; a **right leaf** means other-night actions.

---

## 3. Official night order

Sources: TPI `nightsheet.json` filtered to TB ids, with step text from TPI `firstNightReminder`/`otherNightReminder` and RB p.12–13. Dead or absent characters are skipped. "If a character dies at night before they would wake up, that character won't wake up" (RB p.13); the Ravenkeeper is the exception.

### First night

| # | Step | Condition | What happens |
|---|---|---|---|
| 1 | **Dusk** | always | "All players, eyes closed". Travellers who act at dusk act here (RB p.12). Among the TB Travellers, TPI places the Bureaucrat and Thief between Dusk and Minion info. |
| 2 | **Minion info** | **7+ players** | "Wake all the Minions and show them the Demon. Let the Minions make eye contact so they know who each other are. Then, show each Minion the THIS IS THE DEMON info token and point at the Demon." (RB p.12) |
| 3 | **Demon info** (+ bluffs) | **7+ players** | "Wake the Demon, show them the THESE ARE YOUR MINIONS info token, then point to each Minion. Then, show the Demon the THESE CHARACTERS ARE NOT IN PLAY info token, and show the Demon any three good character tokens that are not in play." "It is usually best to show the two Townsfolk and one Outsider token" (RB p.12). |
| 4 | Poisoner | in play | "The Poisoner chooses a player." → POISONED |
| 5 | Washerwoman | in play | "Show the Townsfolk character token. Point to both the TOWNSFOLK and WRONG players." |
| 6 | Librarian | in play | "Show the Outsider character token. Point to both the OUTSIDER and WRONG players." (or 0) |
| 7 | Investigator | in play | "Show the Minion character token. Point to both the MINION and WRONG players." |
| 8 | Chef | in play | "Give a finger signal." |
| 9 | Empath | in play | "Give a finger signal." |
| 10 | Fortune Teller | in play | "The Fortune Teller chooses 2 players. Nod if either is the Demon (or the RED HERRING)." |
| 11 | Butler | in play | "The Butler chooses a player." → MASTER |
| 12 | Spy | in play | "Show the Grimoire for as long as the Spy needs." |
| 13 | **Dawn** | always | "When you reach dawn, simply wait five to ten seconds. Then, declare that the players can open their eyes." Then announce deaths (RB p.13). |

The Drunk wakes at the slot of the Townsfolk they believe they are (for example, at #9 if they think they are the Empath). With **5–6 players**, steps 2 and 3 are skipped entirely, so there is no Minion/Demon info and **no bluffs** (RB p.12: "If it is the first night and you are playing with seven or more players, do these two steps"; RB p.42 DEMON INFO, p.43 MINION INFO).

### Other nights

| # | Step | Condition | What happens |
|---|---|---|---|
| 1 | **Dusk** | always | Eyes closed. The Poisoner's previous POISONED marker expires at dusk. Bureaucrat and Thief act here if present. |
| 2 | Poisoner | alive | "The Poisoner chooses a player." |
| 3 | Monk | alive | "The Monk chooses a player." → SAFE |
| 4 | Scarlet Woman | only if she **became the Demon today** | "show them the YOU ARE token, then the Demon token." |
| 5 | Imp | alive | "The Imp chooses a player. If the Imp chose themselves: Replace 1 alive Minion token with a spare Imp token. Put the old Imp to sleep. Wake the new Imp. Show the YOU ARE token, then show the Imp token." |
| 6 | Ravenkeeper | only if they died **tonight** | "the Ravenkeeper chooses a player. Show that player's character token." |
| 7 | Empath | alive | "Give a finger signal." |
| 8 | Fortune Teller | alive | choose 2 players, nod or shake |
| 9 | Undertaker | alive and **someone was executed today** | "If a player was executed today, show their character token." |
| 10 | Butler | alive | "The Butler chooses a player." |
| 11 | Spy | alive | "Show the Grimoire for as long as the Spy needs." |
| 12 | **Dawn** | always | Wait 5–10 s, eyes open, "declare immediately which players died at night. Do not say which character killed each player. If no one died during the night, say this, but do not say why" (RB p.13). |

Never woken in TB: Soldier, Mayor, Virgin, Slayer, Recluse, Saint and Baron. The Drunk is woken only through their believed Townsfolk. Dead characters lose their ability and are not woken (RB p.15), except the Ravenkeeper on the night of death.

---

## 4. First night vs other nights

Sources: RB p.12–13, p.42–44; TPI; W:Imp; W:Undertaker; W:Monk.

| Aspect | First night | Other nights |
|---|---|---|
| Night sheet side | FIRST NIGHT | OTHER NIGHTS. "flip the night sheet over … at the end of your first day phase" (RB p.16) |
| Evil team info | Minion info and Demon info (with 3 bluffs) **only at 7+ players** | none, even for a new Imp: "If a player becomes a Minion or Demon character, they do not learn who the other evil players are" (RB p.21) |
| Demon kill | **None.** The Imp is "Each night\*" and does not wake on N1, so no TB character can kill on N1. **An Imp self-kill on night 1 is impossible.** | The Imp kills, and may self-kill to pass Demonhood (a "starpass"). |
| Deaths at dawn | effectively always "nobody died" in pure TB | 0–1 deaths in TB (Imp kill, Mayor bounce). Exceptions with no death: SAFE, Soldier, poisoned Imp, attack on a dead player. |
| Wake only on N1 | Washerwoman, Librarian, Investigator, Chef (the "start knowing" characters) | – |
| Wake only on later nights | – | Monk, Imp, Undertaker (needs an execution), Ravenkeeper (needs a night death), Scarlet Woman (needs a takeover) |
| Wake every night | Poisoner, Empath, Fortune Teller, Butler, Spy (and the Drunk as the matching Townsfolk) | same |
| Talking about characters | "Players may talk about their characters only after the first night." (RB p.43, FIRST NIGHT; also p.29) | – |

A note on mid-game role changes: "If the new ability normally only functions on the first night, it functions tonight" (RB p.21). In TB this only matters for an Imp or SW change; neither of them is a first-night character.

---

## 5. Day rules

Sources: RB p.13–15, p.19–21, p.28–29, p.42–44; W:Rules_Explanation; W:Glossary; W:Virgin; W:Butler.

**Morning:** the ST announces who died overnight; how they died and their characters stay secret. "In CLOCKTOWER, the identity of the dead remains a mystery." (RB p.15)

**Discussion**, then nominations. "Doing so after five to ten minutes of chit-chat is usually about right" (RB p.14).

### Nominations (RB p.14–15, verbatim)

- "Only one player may be nominated at a time. If a nomination has been made but not yet voted on, another nomination cannot be made yet."
- "Only alive players may nominate. Dead players can be nominated, but this is almost never wise to do."
- "Each player may nominate only once per day, and each player may be nominated only once per day."
- RB p.19: "Yes, players can nominate or vote for themselves. … No, dead players cannot nominate, and may only vote to execute if they have a vote token."
- "Any player who is about to die may still nominate if they have not already nominated today." (RB p.15)
- "Give the nominated player a chance to defend themself before you start tallying the votes on them. Ten to thirty seconds is usually about right."
- A dead player's attempt to nominate is void and does **not** use up the Virgin's ability (W:Virgin example).

### Vote order (RB p.15, verbatim)

> "Tally the votes. Stand in the center of the circle, holding the Grimoire in one hand and holding your other hand out straight toward the nominee. Say the name of the player and that voting has started. Then, slowly spin yourself clockwise, counting aloud the number of votes as you go, until you come back to the nominee. … The nominee may vote for themself, if they wish—their vote is counted last. If a player has their hand up when your hand reaches them, that's a vote. If a player has their hand down, that's not a vote."

Glossary (RB p.44): "The votes are tallied clockwise, ending with the nominated player." So the first voter is the seat clockwise of the nominee, and the nominee votes last.

- "Each alive player may vote for as many players as they wish per day."
- "Each dead player may vote for only one nomination throughout the rest of the game." When they vote, "they remove their vote token" (RB p.15).
- Butler: may raise a hand only if the Master's hand is up, or the Master's vote has already been counted. The order of the two votes doesn't matter (W:Butler).

### Threshold and on-the-block (RB p.15, verbatim)

> "The vote succeeds if: The nominated player got more votes than any other nominated player today, and The number of votes equals or exceeds half the number of alive players."

- **Threshold = ⌈alive / 2⌉**: 6 alive → 3, 7 alive → 4, 5 alive → 3.
- Votes from dead players count the same as votes from the living. RB example: "Six players are alive … Doug gets three votes, so the vote succeeds. It doesn't matter whether the three votes came from alive or dead players."
- "If the vote succeeds, declare that the nominated player is about to die. This player will be executed today… unless a future nominee gets even more votes."
- **Tie:** "If the vote ties with a player nominated earlier today, then neither nominated player will be executed. (They are no longer 'about to die'.) … A nominated player must get more votes than the tied number for you to declare they are about to die."
- After a tie, the "high-water mark" is the tied count: nobody is on the block, but the next nominee needs more than that count, and also needs ≥ ⌈alive/2⌉.

### Execution and end of day (RB p.15, p.29, p.42–43)

- "Give a last call for nominations … 'Last call for nominations! Three… two… one…' … If no one makes another nomination, then declare that nominations are closed for today."
- "There is only one execution per day. After an execution, the day phase is effectively over."
- "An execution is not required. If the players decide not to nominate anyone, or the nominees didn't get enough votes, or the voting ended in a tie between two nominees, the day ends without an execution."
- Executing a dead player is allowed and **counts as the day's execution**: "Regardless of whether the group executes an alive or dead player, this counts as the one execution allowed for the day." (RB p.21)
- **Virgin:** a Townsfolk nominating the Virgin is executed immediately. Because only one execution is allowed per day, "the nomination process immediately ends, even if a player was about to die" (W:Virgin).
- **The ST ends the day.** "End the day and begin the night phase when you are ready." Day abilities (the Slayer) used after the execution are at the ST's discretion: "if a player asks to use their day ability after you have called for eyes closed, then it is too late." (RB p.29)

### Dead players (RB p.15)

- They get a shroud and lose their ability immediately; they are not woken.
- "They cannot nominate, and they may only vote once for the rest of the game." With no vote token they cannot vote.
- They still talk, still close their eyes at night, and still win or lose with their team.
- A dead player can't die again: a Demon attack on a dead player means no death, and nothing is announced (RB p.21).

---

## 6. Win conditions

Sources: RB p.16, p.19, p.25, p.28, p.42–44; W pages as cited; TPI ability text.

### Official wording

| Condition | Wording and source |
|---|---|
| **Demon dies → good wins** | "Good wins if the Demon dies." (RB p.16) · "Good wins when the Demon dies." (RB p.44, WIN) |
| **2 alive → evil wins** | "Evil wins if there are only two players left alive." (RB p.16) · "Evil wins when there are only two alive players, not including Travellers." (RB p.44) · "As long as three or more players are alive, the game continues." (RB p.42, ALIVE) |
| **Both at once → good** | "If both teams would win at the same time, good wins. For example, if the Demon dies but that leaves only two players left, the good team wins." (RB p.16) |
| **Saint executed → evil** | "If you die by execution, your team loses." Being executed but not dying, or dying another way, does nothing (W:Saint). A poisoned Saint executed → "the game continues" (W:Poisoner example). |
| **Mayor** | "If only 3 players live & no execution occurs, your team wins." W:Mayor: "At dusk, if exactly three players are alive and no player was executed today, declare that the game ends and good wins." A tie counts as no execution (W:Mayor example). Travellers count toward the 3. An execution of a dead player is still an execution (RB p.21). |
| **Scarlet Woman** | "If there are 5 or more players alive & the Demon dies, you become the Demon. (Travellers don't count.)" W: "five or more players just before the Demon dies—that is, four or more players left alive after"; "If less than five players are alive when the Demon is executed, then the game ends and good wins." |
| **Imp starpass** | "If you kill yourself this way, a Minion becomes the Imp." The new Imp needs an **alive** Minion (W:Imp: "an alive Minion becomes an Imp"). If the SW is alive and ≥5 players are alive, "the Scarlet Woman must become the new Imp" (W:Scarlet_Woman). |
| **Early end (ST)** | "YOU CAN END THE GAME WHEN VICTORY IS CERTAIN for one team. If all remaining players are evil … declare that evil wins." With 4 alive and a non-Demon executed, the ST can usually call it, unless a Monk or Soldier is alive. "If there is any way for the losing team to win—however unlikely it is—then keep the game going." (RB p.28) |
| Team-wide | "If the good team wins, all good players win, whether alive or dead … There are never any neutral players." (RB p.16) |

**Not a rule:** "evil wins when evil outnumbers good". CS and SG say this; it is wrong (see §9).

### Effects that can change the outcome: what the app must know or record

"Public" means the table sees it happen. "Secret" means only the ST (and maybe the affected player) knows.

| Event | Visibility | What the app must KNOW or RECORD so automatic win detection stays correct |
|---|---|---|
| Night death | public: who died. Secret: cause and character | Record the death. If the dead player is the **current** Demon, run the SW and good-win check. Check alive (non-Traveller) ≤ 2 → evil. |
| Execution | public: who. Secret: character | Record the executed player and day (`executedToday`, needed for the Mayor). If it is the Demon → SW check. If it is the Saint → ask the ST "Saint ability active?" (poisoned → no). |
| **Imp starpass** (self-kill) | secret. Only the old Imp's death is public | Record the **new Demon** (which Minion). Without it the app would declare good wins on a death that does not end the game. If no Minion is alive → the Imp is just dead → good wins. The SW has priority at ≥5 alive. |
| **Scarlet Woman takeover** | secret | On a Demon death with ≥5 non-Traveller players alive just before it, and an alive SW, the SW becomes the Demon. **But a poisoned SW has no ability** (RB p.21), so the app cannot decide alone: the ST must confirm, or the app offers an override. On the public screen the game must simply continue, with no tell. |
| **Slayer shot** | public: claim, target, "dies" vs "nothing happens". Secret: whether the shooter is the real, sober Slayer | Record that the claimant used it and the result. The app knows the roles, so: target is the Demon → dies (if the Slayer is real and sober); target is the Recluse → the ST may make them die, with no win; otherwise no death. The poisoned/drunk case is secret, so take the outcome from the ST. Mark the Slayer NO ABILITY whatever the result. |
| **Virgin trigger** | public: nominator executed immediately, day ends | The app knows if the nominator is a Townsfolk. But the Drunk (an Outsider) never triggers it, the Spy *may* (registration, ST's choice), and a poisoned Virgin never does. So get the result from the ST. Record: the Virgin's ability is used on the first valid nomination either way; an immediate execution means today has had its execution (Mayor fails) and nominations close. |
| **Mayor win** | public end | Needs: the Mayor alive, Mayor not Drunk (the app knows a Drunk-"Mayor" can't win), Mayor not poisoned (secret → ST), exactly 3 alive *including Travellers*, no execution today (a tie or no votes counts as none). It is checked at end of day / dusk. |
| **Mayor bounce** | secret. Only the substitute's death is public | Nothing extra, as long as the app records the actual death. The substitute may even be a Minion or the Imp (W:Storyteller_Advice: having "an attacked Mayor kill the last evil player alive" is called unfair but possible) → regular Demon-death check. |
| Recluse registering | secret | No direct effect on the win check. The only path is a Slayer shot killing the Recluse: a death, but no Demon death. Never treat the Recluse as the Demon in the win check. |
| Spy registering | secret | Can make the Virgin execute the Spy. No other win effect. |
| Soldier / Monk | secret | They only prevent deaths. The app records deaths, not attacks. |
| Poisoner / Drunk | secret (the Drunk is known to the app from setup) | They change whether the Saint, Mayor, Virgin, Slayer, SW, Imp, Soldier and Monk actually work. **The app must not assume abilities fire**; the ST resolves them. |
| Travellers | public | Exclude them from the 2-alive and SW counts; include them in the Mayor's 3 and the vote threshold. Exiles are not executions. |
| Gunslinger, Scapegoat etc. | public | The Scapegoat "might be executed instead" of a same-alignment player, so the executed and dead player can differ from the nominee (W:Saint example). Record the actual dead player. |

---

## 7. Edge cases (TB)

Sources: SG; RB p.10–11, p.19–22, p.28–29; W pages as cited.

| Case | Ruling |
|---|---|
| **Imp self-kill on night 1** | Impossible: the Imp is "Each night\*" and has no N1 wake (TPI, W:Imp, SG "Der Imp tötet in der ersten Nacht nicht"). |
| Imp kills self while Monk-protected | "The Imp chooses to kill themself tonight, but nothing happens. The Imp stays alive and a new Imp is not created." (W:Monk) |
| New Imp after a starpass | Does not act the same night (W:Imp) and learns no evil-team info (RB p.21). |
| Imp attacks a dead player | Allowed; nobody dies, and "no one died" is announced (W:Imp, RB p.19, p.21). Used for Soldier/Monk bluffs. |
| Imp attacks the Soldier, or a SAFE player | Nobody dies and there is no retarget (W:Soldier, W:Monk). A poisoned Soldier, or a Drunk who thinks they are the Soldier, dies. |
| Monk protects the Mayor, and the Imp attacks the Mayor | No bounce, nobody dies (W:Monk). |
| **Drunk** | Gets a Townsfolk token and wakes as that Townsfolk, but never has the ability. The Librarian and Undertaker see "Drunk". A Drunk nominating the Virgin is not executed (RB p.10). A Drunk "Slayer" or "Mayor" achieves nothing. There is at most one Drunk. |
| **Drunk as Fortune Teller** | The Drunk-FT has no ability, so their info may be false. The ST still runs the full FT wake (W:Drunk, RB p.21). Whether the ST places a Red Herring for a Drunk-FT is **not stated in the sources**: the Red Herring belongs to the FT's ability, which the Drunk lacks. |
| **Red Herring** | Any **good** player, fixed for the whole game, possibly the FT themself (W:Fortune_Teller). |
| FT chooses a dead Demon | Nod (W:Fortune_Teller). |
| FT sees the SW after a takeover | Now a nod, since she is the Demon (W:Scarlet_Woman example). |
| **Spy misregistration** | May register as good, as any Townsfolk or Outsider, "even as many characters or both alignments during the same night" (W:Spy). For example: the Washerwoman sees the Spy as "Ravenkeeper"; the Chef counts the Spy evil while the Empath counts them good; a Spy nominating the Virgin can be executed by it. |
| **Recluse misregistration** | May register as evil or as any Minion or Demon, even when dead, per ability (W:Recluse). A Slayer shot on the Recluse can kill them while the game continues. The Undertaker may see "Imp". The Ravenkeeper may see "Scarlet Woman". The rulebook warns about this with the Fortune Teller, Undertaker and Slayer (RB p.11). |
| Recluse and the starpass | W:Storyteller_Advice: "Just because you can make the Recluse register as the Imp when the Imp kills themself during the night, that doesn't mean it will be fun or balanced." This implies the ST *may* pass Demonhood to a Recluse registering as a Minion. No explicit procedure was found (alignment etc.). |
| Poison timing | Lasts "tonight and tomorrow day" and expires at dusk. If the Poisoner dies, or becomes the Imp, the poison ends at once (RB p.20, W:Poisoner). |
| Once-per-game abilities used while drunk or poisoned | Lost (RB p.21). The Slayer and the Virgin trigger are both used up. |
| Virgin nominated by a non-Townsfolk | Nothing happens, voting continues, the ability is gone (W:Virgin). |
| Mayor bounce target | Any player chosen by the ST. A dead player, the Soldier or a SAFE player → no death (W:Mayor). |
| Ravenkeeper killed by a Mayor bounce | Still wakes (W:Ravenkeeper example). |
| Undertaker after no execution | Not woken. After a Virgin execution, it shows the executed nominator (it was an execution). |
| Butler | May pick a dead Master (then the Master must have a vote token to vote). A dead Butler votes freely with their token. The Butler can always support exiles (W:Butler). |
| Baron and the Drunk | The Baron's added Outsiders may include the Drunk, following the Drunk setup (W:Baron). |
| Dead Demon executed again | Allowed; it counts as the execution (RB p.21). The game already ended when the Demon first died, unless the SW took over. |
| Demon leaves the game | "a game cannot continue if the Demon leaves partway through", which is why players who need to leave early get Travellers (RB p.25). |
| ST mistakes | "If you make a mistake, just play on … Don't try to 'balance the game'". The ST may fix a forgotten wake privately in the morning (RB p.28). |
| Bluffing day abilities | If an evil player "uses" the Slayer or claims the Virgin, the ST mimes the token handling and says "Nothing happens" (W:Slayer, W:Storyteller_Advice). |

SG-specific tips, which are home-made and not rules:

- Fake-wake dead roles so that noise gives nothing away ("Auch tote Rollen kurz „wecken“ oder so tun"). RB p.28 supports moving around randomly at night, but RB p.13 says to skip unneeded wakes.
- The Poisoner goes first; the Empath and FT go after the Imp and see the current state. This matches the official order.

---

## 8. Implications for an app that only tracks public info

- **The model needs two layers.** A *public* state: seats, alive/dead, ghost vote used, nominations made and received today, vote tallies, block holder, execution today, Slayer/Virgin public events, Travellers and exiles. A *private* setup state seen only by the ST: assigned true characters, the Drunk's believed Townsfolk, the Red Herring if the app tracks it, and **the current Demon seat**, which changes on a starpass or SW takeover.
- **Win detection needs ST-confirmed events, not inference.** Every TB win trigger except the 2-alive count can be silently disabled by poison: the Saint, the Mayor, the SW and the Slayer. So when a trigger might fire, the app should ask the ST ("Did the Scarlet Woman become the Demon?", "Was the Saint's ability active?", "Who is the new Imp?"). It should never decide these from the roles alone.
- **Never leak secrets on the public screen.** The day screen must not change when the Demon dies and the SW takes over, must not show characters of the dead (RB p.15), must not show causes of death, and must not distinguish "poisoned Slayer" from "wrong target".
- **Evil wins at ≤2 alive non-Travellers.** It is not about outnumbering. Run the check after every death. Good takes precedence on a simultaneous trigger.
- **Use ⌈alive/2⌉ (Travellers included) as the vote threshold.** The block holder must have strictly more votes than the day's highest previous count, and a tie clears the block while keeping the bar. The vote clock starts at the seat clockwise of the nominee and ends at the nominee. Each dead voter loses their ghost vote on their first vote.
- **Validate nominations.** One open nomination at a time. Alive nominators only. Each player nominates once and is nominated once per day. Dead players can be nominated. Self-nomination is allowed.
- **There is one execution per day.** It may target a dead player, and that still counts. After it, the day is over, apart from ST-discretion Slayer use before "eyes closed". A Virgin trigger is an immediate execution that closes nominations.
- **The Mayor check runs at end of day / dusk:** exactly 3 alive (Travellers included), no execution today, and a real, sober, alive Mayor (ST-confirmed).
- **The Saint ends the game on execution plus death**, if the ability is active. Night deaths of the Saint do nothing.
- **First night:** no deaths are possible in TB; the Imp never wakes on N1. Show Minion/Demon info steps only with ≥7 non-Traveller players, and generate 3 not-in-play good bluffs (suggest 2 Townsfolk and 1 Outsider). The bluffs must exclude every in-play character; whether to also exclude the Drunk's fake Townsfolk is undetermined.
- **Night guide:** use the official order from §3. Skip dead or absent characters (except a Ravenkeeper who died tonight), place the Drunk at their believed Townsfolk's slot, show the Undertaker only after an execution, and show the SW step only after a takeover.
- **Setup validation:** use the §1 table; with a Baron, +2 Outsiders and −2 Townsfolk; the Drunk replaces a Townsfolk token; every character at most once; 5–15 non-Travellers plus Travellers up to 20 in total.
- **Travellers** are excluded from the 2-alive and SW counts but included in the Mayor's count and the vote threshold. Exile uses ½ of *all* players, alive or dead, may happen any number of times, and is not an execution.
- **The Butler is not enforced by the ST** (W:Butler). The app should not block Butler votes, and it can't anyway without revealing the Butler.

---

## 9. Contradictions and deviations

**Rulebook vs wiki.** There are no substantive rule conflicts for TB. The minor ones:

- Teensyville composition: RB p.36 says "one Demon"; W:Teensyville says "two Demons". This doesn't affect TB.
- Traveller sheet contents: RB p.44 says "Townsfolk, Outsiders and Minions"; W:Glossary says "Outsiders and Minions".
- RB p.10's setup tip says "If the Mayor is attacked at night, remember to kill another player instead". The ability says "might" die instead, so the bounce is ST-optional.

**The local SG and CS vs the official sources.** These matter for the app's text:

- **Evil win.** CS: "Evil wins when evil players outnumber good ones". SG step 7: "Nach jedem Tod prüfen, ob mehr Böse als Gute leben". **Both are wrong**; the official condition is 2 alive players, Travellers excluded (RB p.16, p.44).
- **Spy position.** SG puts the Spy at N1 #5 (right after the Poisoner) and at other nights #4 (before the SW). Official TPI order: the Spy is **last before Dawn** on both nights.
- **Minion/Demon info.** SG shows it unconditionally (it is a 12-player guide). Officially it happens only with 7+ players.
- **Abilities paraphrased on CS** lose qualifiers:
  - Butler: no "(not yourself)".
  - Scarlet Woman: no "(Travellers don't count)".
  - Saint: "If executed" instead of "If you die by execution".
  - Undertaker: "was executed" instead of "died by execution".
  - Mayor: "good wins" and "if attacked" instead of "your team wins" and "If you die at night".
  - Spy and Recluse: "even if dead" is missing from the Spy and shortened on the Recluse.
  - Use the TPI texts in §2.
- **SG "tote Rollen kurz wecken"** is a storytelling habit, not a rule. Dead characters are not woken (RB p.15).

---

## 10. Open or undetermined

- An explicit maximum Traveller count. Only the 20-player game size and the ">15 → Traveller" rule were found.
- The setup table's official source: the box's setup sheet isn't in the PDF. The table here comes from TS and is consistent with the W:Baron examples and CS.
- Whether a Drunk-Fortune Teller gets a Red Herring marker. It is moot, since their info can be anything.
- The exact procedure when a Recluse "becomes" the Imp through a starpass. It is only implied by W:Storyteller_Advice.
- Whether the Drunk's fake Townsfolk may be shown as a Demon bluff. Not addressed.
- The Mayor check's timing: W:Mayor says "At dusk". The rulebook doesn't address it. Treat it as end of day, after nominations close with no execution.
