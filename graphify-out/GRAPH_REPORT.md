# Graph Report - Rues-Arcade  (2026-11-05)

## Corpus Check
- Large corpus: 699 files · ~495,414 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 3579 nodes · 7749 edges · 198 communities (181 shown, 17 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 510 edges (avg confidence: 0.87)
- Token cost: 1,529,837 input · 0 output

## Community Hubs (Navigation)
- Most Likely Engine
- Imposter Engine & Rng
- Clocktower Deal & Seat Actions
- Clocktower Day Layout E2E
- Codes Engine
- Motion & Winner UI
- Imposter & Most Likely Specs
- Clocktower Engine & Night
- Clocktower Win & Night Tests
- Clocktower Character Board
- Clocktower Living Spec
- Content Editor Page
- Look Walk E2E
- Feud History & Round E2E
- E2E Helpers & Content Tests
- Content Server & Parsing
- Package Dependencies
- Nachtlicht Design Mockup
- Feud Engine
- Clocktower Day & Vote E2E
- Codes Screen & HoldToView
- Feud Prep & Demo E2E
- Duck Engine
- Duck & Wavelength E2E
- Server Hooks & Fonts
- Import Script & Rhymes
- Clocktower End & Death Step
- Players Server & Roster
- Wavelength Engine & Setup
- Clocktower Setup & Shuffle
- Players Page
- Automat Design Mockup
- Survey Editor
- Clocktower Show Bar & Info
- Feud Prep Screen
- Rebuild Design Tokens
- Clocktower Design Decisions R2
- Clocktower Rules Spec Delta
- Feud Screen
- Faster CI Design
- Clocktower Deck & Vote
- Gate Workflow
- Survey Parsing & Types
- Clocktower Circle Component
- Explanation Page & Banner
- Clocktower Walk Helpers
- Guided Demo Runner
- Clocktower Night E2E
- Clocktower Vote Clock
- Feud Full Game E2E
- Spielbrett Design Mockup
- Database & Import Tests
- Deco Grid & Arcs
- Wavelength Dial
- Codes & Deco E2E
- Game Frame E2E
- Release Workflow Steps
- Arcade Polish Scope
- Game Engine & Duck Specs
- Clocktower Wake Step
- Imposter Played Swap Design
- Clocktower Layout Decisions
- Clocktower Change Flow
- Trouble Brewing Rules
- Look Walk Design Rules
- Play Session Page
- Clocktower Deck E2E
- CI Workflow
- Codes & Design System Specs
- Deco Art Motifs
- Clocktower Setup Board
- Duck Screen
- Feud Setup
- Most Likely Screen
- Sound Tests
- Game Detail Page
- Clocktower Setup E2E
- Family Feud Tasks
- Revised Demos Design
- Player Database Design
- Revised Demos Tasks
- Arcade Polish Tasks
- Clocktower Day Screen
- Feud Engine Tests
- Wavelength Screen
- Clocktower Atmosphere E2E
- Clocktower Theme E2E
- Family Feud Design
- Feud Host Flow Design
- Duck Wordlist Migration
- Feud & Content Specs
- Clocktower Show E2E
- Add Three Games Scope
- Clocktower Architecture Decisions
- Roster Store
- Imposter Played Store
- Clocktower Dawn & Theme
- UI Tokens
- Lobby Page
- Most Likely E2E
- Rebuild Design System Spec
- Clocktower Circle Geometry
- Game Registry & Sessions
- Scoreboard
- README & Repo Rules
- Add Three Games Design
- Clocktower Game E2E
- Content Store Rebuild Spec
- Most Likely Spec Revision
- Arcade Polish Flow
- Codes Deco Art
- Feud Deco Art
- Most Likely Deco Art
- Feud Prep Autofill
- Wavelength Engine Tests
- Pager
- Clocktower Circle E2E
- Clocktower Day Marks E2E
- Demo E2E
- Release Workflow Jobs
- Party Games Rebuild Flow
- Feud Host Flow Spec
- Clocktower Theme Sources
- App Shell & Font Licences
- Local Storage & Counts
- Clocktower Deco Art
- Masks Deco Art
- Feud Controls E2E
- Pager E2E
- Players E2E
- Rebuild Demo Verification
- Wavelength & Engine Spec
- Family Feud Flow
- Family Feud Spec Delta
- Clocktower Scope
- Gauge Deco Art
- Clocktower Deck Overlay
- Clocktower Slide
- Feud Prep Cards E2E
- Release Publish Job
- Content Migrations
- Codes Spec Delta
- Arcade Polish Design
- Arcade Polish Research
- Clocktower Win Conditions
- Content Store Spec
- Repo Learnings
- Clocktower Start E2E
- Feud Setup E2E
- Release Permissions
- Release Env Steps
- Player Database Flow
- Catalogue Spec
- Duck Deco Art
- Feud Catalogue & Explanation
- Player Database Tasks
- Roster Spec Delta
- Feud Host Flow Flow
- Revised Demos Flow
- Imposter Swap Scope
- Imposter Swap Flow
- OpenSpec Config
- Sky Deco Art
- Clocktower Timer
- Sound Effects
- Dependabot Config
- Add Three Games Flow
- Rebuild Catalogue Spec
- Rebuild Imposter Spec
- Clocktower Catalogue Delta
- Duck Wordlist Flow
- TypeScript Config
- Clocktower Day Timer
- Clocktower Session Tasks
- Release Tag Check
- Game Tile
- Single Content Migration
- Start Screen Revision
- Scoreboard Sorting
- Clocktower Look Spec
- Old Schema Fixture
- Session Storage Test
- Playwright Config
- App Types
- Mobbin Setup Notes
- Mobbin Cross-Cut Notes
- Catalogue Clocktower Entry
- Unselectable UI Text

## God Nodes (most connected - your core abstractions)
1. `live()` - 114 edges
2. `play()` - 73 edges
3. `@playwright/test` - 67 edges
4. `seated()` - 59 edges
5. `vitest` - 55 edges
6. `seedRoster()` - 52 edges
7. `ClocktowerState` - 45 edges
8. `seedClocktower()` - 42 edges
9. `clocktower Specification` - 42 edges
10. `svelte` - 39 edges

## Surprising Connections (you probably didn't know these)
- `Learning: e2e on the shared DB (exact-text locators, emptyServer)` --semantically_similar_to--> `E2E data isolation on seeded shared DB`  [INFERRED] [semantically similar]
  CLAUDE.md → openspec/changes/archive/2026-10-05-add-three-games/design.md
- `seedSession()` --calls--> `start()`  [EXTRACTED]
  e2e/frame.test.ts → src/lib/demo/runner.ts
- `Learning: COLLATE NOCASE plus toLocaleLowerCase('de')` --conceptually_related_to--> `Single-value content (one text per entry)`  [INFERRED]
  CLAUDE.md → openspec/changes/archive/2026-10-05-add-three-games/specs/content-store/spec.md
- `Learning: games need non-empty demo script with data-demo controls` --conceptually_related_to--> `Every user tap is a reducer action`  [INFERRED]
  CLAUDE.md → openspec/changes/archive/2026-10-05-party-games-rebuild/design.md
- `%arcade.fonts% placeholder` --references--> `Alegreya Sans font`  [INFERRED]
  src/app.html → static/fonts/AlegreyaSans-OFL.txt

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Spielbrett four-screen flow: Home → Start → Lobby → Play** — openspec_changes_archive_2026_10_05_party_games_rebuild_design_deco_1_spielbrett_home_screen, openspec_changes_archive_2026_10_05_party_games_rebuild_design_deco_1_spielbrett_start_screen, openspec_changes_archive_2026_10_05_party_games_rebuild_design_deco_1_spielbrett_lobby_screen, openspec_changes_archive_2026_10_05_party_games_rebuild_design_deco_1_spielbrett_play_screen [EXTRACTED 1.00]
- **Illustrations built from each game's own shapes** — openspec_changes_archive_2026_10_05_party_games_rebuild_design_deco_1_spielbrett_wavelength_dial_art, openspec_changes_archive_2026_10_05_party_games_rebuild_design_deco_1_spielbrett_imposter_mask_row, openspec_changes_archive_2026_10_05_party_games_rebuild_design_deco_1_spielbrett_locked_tile, openspec_changes_archive_2026_10_05_party_games_rebuild_design_deco_1_spielbrett_spielbrett [EXTRACTED 1.00]
- **Automat decoration layer (CRT, pixel sprites, bulbs, LED, twinkle)** — openspec_changes_archive_2026_10_05_party_games_rebuild_design_deco_2_automat_crt_screen, openspec_changes_archive_2026_10_05_party_games_rebuild_design_deco_2_automat_pixel_sprites, openspec_changes_archive_2026_10_05_party_games_rebuild_design_deco_2_automat_marquee_bulb_strip, openspec_changes_archive_2026_10_05_party_games_rebuild_design_deco_2_automat_led_label, openspec_changes_archive_2026_10_05_party_games_rebuild_design_deco_2_automat_twinkle_stars [EXTRACTED 1.00]
- **Mocked screen flow Home → Start → Lobby → Play** — openspec_changes_archive_2026_10_05_party_games_rebuild_design_deco_2_automat_home_screen, openspec_changes_archive_2026_10_05_party_games_rebuild_design_deco_2_automat_start_screen, openspec_changes_archive_2026_10_05_party_games_rebuild_design_deco_2_automat_lobby_screen, openspec_changes_archive_2026_10_05_party_games_rebuild_design_deco_2_automat_play_screen [EXTRACTED 1.00]
- **Mobbin references behind the Automat variant** — openspec_changes_archive_2026_10_05_party_games_rebuild_design_deco_2_automat_mobbin_higgsfield, openspec_changes_archive_2026_10_05_party_games_rebuild_design_deco_2_automat_mobbin_fal, openspec_changes_archive_2026_10_05_party_games_rebuild_design_deco_2_automat_mobbin_browserbase, openspec_changes_archive_2026_10_05_party_games_rebuild_design_deco_2_automat_mobbin_box_box_club [EXTRACTED 1.00]
- **Wavelength mockup flow: Home → Start → Lobby → Play** — openspec_changes_archive_2026_10_05_party_games_rebuild_design_deco_3_nachtlicht_screen_home, openspec_changes_archive_2026_10_05_party_games_rebuild_design_deco_3_nachtlicht_screen_start_wavelength, openspec_changes_archive_2026_10_05_party_games_rebuild_design_deco_3_nachtlicht_screen_lobby_wavelength, openspec_changes_archive_2026_10_05_party_games_rebuild_design_deco_3_nachtlicht_screen_play_wavelength_hint [EXTRACTED 1.00]
- **Nachtlicht light-based decoration motifs** — openspec_changes_archive_2026_10_05_party_games_rebuild_design_deco_3_nachtlicht_soft_game_colour_glows, openspec_changes_archive_2026_10_05_party_games_rebuild_design_deco_3_nachtlicht_dotted_rings, openspec_changes_archive_2026_10_05_party_games_rebuild_design_deco_3_nachtlicht_grain_noise_texture, openspec_changes_archive_2026_10_05_party_games_rebuild_design_deco_3_nachtlicht_glowing_outline_icons, openspec_changes_archive_2026_10_05_party_games_rebuild_design_deco_3_nachtlicht_stardust_dots [EXTRACTED 1.00]
- **Mobbin inspiration references for Nachtlicht** — openspec_changes_archive_2026_10_05_party_games_rebuild_design_deco_3_nachtlicht_mobbin_craft_agency, openspec_changes_archive_2026_10_05_party_games_rebuild_design_deco_3_nachtlicht_mobbin_clay, openspec_changes_archive_2026_10_05_party_games_rebuild_design_deco_3_nachtlicht_mobbin_oura, openspec_changes_archive_2026_10_05_party_games_rebuild_design_deco_3_nachtlicht_mobbin_grok [EXTRACTED 1.00]
- **Three new games implementing the GameDef engine contract** — openspec_changes_archive_2026_10_05_add_three_games_design_codes_gamedef, openspec_changes_archive_2026_10_05_add_three_games_design_duck_gamedef, openspec_changes_archive_2026_10_05_add_three_games_design_mostlikely_gamedef, openspec_changes_archive_2026_10_05_party_games_rebuild_design_gamedef_contract, openspec_changes_archive_2026_10_05_party_games_rebuild_design_game_registry [EXTRACTED 1.00]
- **Single-value content pipeline (types, parser, store, seeds)** — openspec_changes_archive_2026_10_05_add_three_games_design_single_value_content_shape, openspec_changes_archive_2026_10_05_add_three_games_design_issingle, openspec_changes_archive_2026_10_05_add_three_games_design_parsebulk, openspec_changes_archive_2026_10_05_add_three_games_design_seed_migrations, openspec_changes_archive_2026_10_05_add_three_games_specs_content_store_spec_single_value_content, openspec_changes_archive_2026_10_05_add_three_games_specs_content_store_spec_default_content_seeds [INFERRED 0.85]
- **Guided demo framework (tap = action, context gating, isolation)** — openspec_changes_archive_2026_10_05_party_games_rebuild_design_every_tap_is_reducer_action, openspec_changes_archive_2026_10_05_party_games_rebuild_design_demo_gating_via_context, openspec_changes_archive_2026_10_05_party_games_rebuild_design_demo_isolation, openspec_changes_archive_2026_10_05_party_games_rebuild_design_shared_ui_components [EXTRACTED 1.00]
- **Per-game demo scripts driving the guided demo** — openspec_changes_archive_2026_10_05_party_games_rebuild_specs_demo_spec_guided_demo, openspec_changes_archive_2026_10_05_party_games_rebuild_specs_imposter_spec_imposter_demo_script, openspec_changes_archive_2026_10_05_party_games_rebuild_specs_wavelength_spec_wavelength_demo_script, openspec_changes_archive_2026_10_06_family_feud_specs_feud_spec_demo, openspec_changes_archive_2026_10_05_party_games_rebuild_tasks_demo_runner [INFERRED 0.85]
- **Family Feud round flow: face-off, board, steal, result, sudden death, undo** — openspec_changes_archive_2026_10_06_family_feud_specs_feud_spec_face_off, openspec_changes_archive_2026_10_06_family_feud_specs_feud_spec_board, openspec_changes_archive_2026_10_06_family_feud_specs_feud_spec_steal, openspec_changes_archive_2026_10_06_family_feud_specs_feud_spec_round_result, openspec_changes_archive_2026_10_06_family_feud_specs_feud_spec_end_and_sudden_death, openspec_changes_archive_2026_10_06_family_feud_specs_feud_spec_undo [EXTRACTED 1.00]
- **Release pipeline: proof, CI, package, release** — openspec_changes_archive_2026_10_05_party_games_rebuild_specs_harness_spec_proof_commands, openspec_changes_archive_2026_10_05_party_games_rebuild_specs_release_spec_ci_workflow, openspec_changes_archive_2026_10_05_party_games_rebuild_specs_release_spec_package_script, openspec_changes_archive_2026_10_05_party_games_rebuild_specs_release_spec_release_workflow, openspec_changes_archive_2026_10_05_party_games_rebuild_specs_release_spec_health_check [EXTRACTED 1.00]
- **Stable player identity as foundation for Feud played-with history** — openspec_changes_archive_2026_10_06_player_database_design_link_is_the_id, openspec_changes_archive_2026_10_06_player_database_design_foreign_keys_in_opendb, openspec_changes_archive_2026_10_06_player_database_design_contract_for_family_feud, openspec_changes_archive_2026_10_06_family_feud_tasks_savedonly_lobby_gate, openspec_changes_archive_2026_10_06_family_feud_tasks_feud_migrations_0005_0006, openspec_changes_archive_2026_10_06_family_feud_tasks_unit_played_with_recording [INFERRED 0.85]
- **Feud round flow: reveal, buzzer choice, face-off and undo** — openspec_changes_archive_2026_10_07_feud_host_flow_specs_feud_spec_requirement_question_reveal, openspec_changes_archive_2026_10_07_feud_host_flow_specs_feud_spec_requirement_face_off, openspec_changes_archive_2026_10_07_feud_host_flow_specs_feud_spec_requirement_undo, openspec_changes_archive_2026_10_07_feud_host_flow_design_reveal_and_buzz_engine_state, openspec_changes_archive_2026_10_07_feud_host_flow_tasks_unit_round_flow_reveal_buzz_controls, openspec_changes_archive_2026_10_07_feud_host_flow_design_question_reveal_gates_board, openspec_changes_archive_2026_10_07_feud_host_flow_design_buzzer_team_every_round [INFERRED 0.85]
- **Demo scripts cover every outcome branch via the shared runner** — openspec_changes_archive_2026_10_07_revise_demos_most_likely_scope_demo_coverage_rule_s2, openspec_changes_archive_2026_10_07_revise_demos_most_likely_design_branch_checklist_per_engine, openspec_changes_archive_2026_10_07_revise_demos_most_likely_design_controls_demo_cannot_reach, openspec_changes_archive_2026_10_07_revise_demos_most_likely_design_demo_runner, openspec_changes_archive_2026_10_07_feud_host_flow_specs_feud_spec_requirement_demo, openspec_changes_archive_2026_10_07_feud_host_flow_design_demo_buzz_highlighting [INFERRED 0.85]
- **Per-game demo scripts covering every outcome branch** — openspec_changes_archive_2026_10_07_revise_demos_most_likely_specs_demo_spec_guided_demo, openspec_changes_archive_2026_10_07_revise_demos_most_likely_specs_imposter_spec_imposter_demo_script, openspec_changes_archive_2026_10_07_revise_demos_most_likely_specs_wavelength_spec_wavelength_demo_script, openspec_changes_archive_2026_10_07_revise_demos_most_likely_specs_feud_spec_family_feud_demo, openspec_changes_archive_2026_10_07_revise_demos_most_likely_specs_codes_spec_codes_engine_session_and_demo, openspec_changes_archive_2026_10_07_revise_demos_most_likely_specs_duck_spec_duck_engine_session_and_demo, openspec_changes_archive_2026_10_07_revise_demos_most_likely_specs_most_likely_spec_most_likely_engine_session_and_demo [EXTRACTED 1.00]
- **Shared in-game pieces composed by every game Screen** — openspec_changes_archive_2026_10_08_arcade_polish_specs_design_system_spec_in_game_frame, openspec_changes_archive_2026_10_08_arcade_polish_specs_design_system_spec_handoff, openspec_changes_archive_2026_10_08_arcade_polish_specs_design_system_spec_reveal, openspec_changes_archive_2026_10_08_arcade_polish_specs_design_system_spec_round_outcome, openspec_changes_archive_2026_10_08_arcade_polish_specs_design_system_spec_scoreboard_reorder, openspec_changes_archive_2026_10_08_arcade_polish_specs_design_system_spec_game_over [EXTRACTED 1.00]
- **arcade-polish motion system (tokens, phase transition, fault, vocabulary)** — openspec_changes_archive_2026_10_08_arcade_polish_specs_design_system_spec_motion, openspec_changes_archive_2026_10_08_arcade_polish_specs_design_system_spec_phase_transition, openspec_changes_archive_2026_10_08_arcade_polish_specs_design_system_spec_fault_motion, openspec_changes_archive_2026_10_08_arcade_polish_design_motion_values, openspec_changes_archive_2026_10_08_arcade_polish_research_motion_vocabulary, openspec_changes_archive_2026_10_08_arcade_polish_scope_s16_motion_tokens [INFERRED 0.85]
- **Imposter played-with history pipeline** — openspec_changes_archive_2026_10_10_imposter_played_swap_design_migration_0008_imposter_played, openspec_changes_archive_2026_10_10_imposter_played_swap_design_imposter_played_store, openspec_changes_archive_2026_10_10_imposter_played_swap_design_imposter_played_api_routes, openspec_changes_archive_2026_10_10_imposter_played_swap_design_played_svelte_module, openspec_changes_archive_2026_10_10_imposter_played_swap_specs_imposter_spec_imposter_crew_reveal_records_the_round, openspec_changes_archive_2026_10_10_imposter_played_swap_specs_imposter_spec_imposter_who_knows_the_prompt, openspec_changes_archive_2026_10_10_imposter_played_swap_specs_imposter_spec_imposter_played_with_on_inhalte [INFERRED 0.85]
- **Round-2 S-items landing on Circle.svelte (owned by U17)** — openspec_changes_archive_2026_10_16_blood_on_the_clocktower_design_circle_component, openspec_changes_archive_2026_10_16_blood_on_the_clocktower_design_seat_node, openspec_changes_archive_2026_10_16_blood_on_the_clocktower_design_ghost_vote_badge, openspec_changes_archive_2026_10_16_blood_on_the_clocktower_design_block_badge, openspec_changes_archive_2026_10_16_blood_on_the_clocktower_design_nomination_rings, openspec_changes_archive_2026_10_16_blood_on_the_clocktower_design_press_feedback, openspec_changes_archive_2026_10_16_blood_on_the_clocktower_design_marks_while_text_shown, openspec_changes_archive_2026_10_16_blood_on_the_clocktower_design_vote_sweep_sector, openspec_changes_archive_2026_10_16_blood_on_the_clocktower_design_execution_death_animation [EXTRACTED 1.00]
- **Arcade-polish shared play frame** — openspec_changes_archive_2026_10_08_arcade_polish_tasks_unit_3_play_frame, openspec_changes_archive_2026_10_08_arcade_polish_tasks_unit_4_shared_in_game_components, openspec_changes_archive_2026_10_08_arcade_polish_tasks_units_5_10_games_in_the_frame, openspec_changes_archive_2026_10_08_arcade_polish_specs_game_engine_spec_play_header, openspec_changes_archive_2026_10_08_arcade_polish_specs_game_engine_spec_round_status_in_the_play_header, openspec_changes_archive_2026_10_08_arcade_polish_tasks_stage_out_in_transition [INFERRED 0.85]
- **BotC win detection and private dusk resolution** — openspec_changes_archive_2026_10_16_blood_on_the_clocktower_research_rules_win_conditions, openspec_changes_archive_2026_10_16_blood_on_the_clocktower_research_rules_st_confirmed_events, openspec_changes_archive_2026_10_16_blood_on_the_clocktower_specs_clocktower_spec_win_detection, openspec_changes_archive_2026_10_16_blood_on_the_clocktower_specs_clocktower_spec_ambiguous_outcomes, openspec_changes_archive_2026_10_16_blood_on_the_clocktower_specs_clocktower_spec_end_reveal, openspec_changes_archive_2026_10_16_blood_on_the_clocktower_scope_dusk_resolution [INFERRED 0.85]
- **BotC day nomination and voting flow** — openspec_changes_archive_2026_10_16_blood_on_the_clocktower_specs_clocktower_spec_nominations, openspec_changes_archive_2026_10_16_blood_on_the_clocktower_specs_clocktower_spec_voting_clock, openspec_changes_archive_2026_10_16_blood_on_the_clocktower_specs_clocktower_spec_vote_result, openspec_changes_archive_2026_10_16_blood_on_the_clocktower_specs_clocktower_spec_block_card, openspec_changes_archive_2026_10_16_blood_on_the_clocktower_specs_clocktower_spec_nomination_rings, openspec_changes_archive_2026_10_16_blood_on_the_clocktower_research_rules_vote_threshold [INFERRED 0.85]
- **Duck 750-word seed list, migration and guard** — openspec_changes_archive_2026_10_16_duck_wordlist_750_design_migration_0009, openspec_changes_archive_2026_10_16_duck_wordlist_750_design_rhyme_key, openspec_changes_archive_2026_10_16_duck_wordlist_750_specs_duck_spec_guard, openspec_changes_archive_2026_10_16_duck_wordlist_750_specs_duck_spec_duck_seed_words, openspec_changes_archive_2026_10_16_duck_wordlist_750_specs_content_store_spec_default_seeds, openspec_changes_archive_2026_10_16_duck_wordlist_750_verification_wordlist_review [INFERRED 0.85]
- **Faster CI change: decisions, delta requirements and task units** — openspec_changes_archive_2026_10_16_faster_ci_design_d1_look_walk_in_beforeall, openspec_changes_archive_2026_10_16_faster_ci_design_d2_self_sized_tests_run_in_one_project, openspec_changes_archive_2026_10_16_faster_ci_design_d3_gate_runs_check_package_test_unit, openspec_changes_archive_2026_10_16_faster_ci_design_d4_runner_by_event_and_cancel_superseded_pr_runs, openspec_changes_archive_2026_10_16_faster_ci_design_d5_release_promotes_push_run_artifact, openspec_changes_archive_2026_10_16_faster_ci_design_d6_workers_measured_not_assumed, openspec_changes_archive_2026_10_16_faster_ci_specs_harness_spec_e2e_runs_each_check_once_per_viewport, openspec_changes_archive_2026_10_16_faster_ci_specs_harness_spec_look_rules_share_one_walk, openspec_changes_archive_2026_10_16_faster_ci_specs_release_spec_ci_workflow, openspec_changes_archive_2026_10_16_faster_ci_specs_release_spec_release_workflow [EXTRACTED 1.00]
- **Look walk rules proven across game specs** — openspec_changes_archive_2026_10_16_faster_ci_design_look_walk, openspec_specs_harness_spec_look_rules_share_one_walk, openspec_specs_design_system_spec_arcade_abend_tokens, openspec_specs_design_system_spec_shared_components, openspec_specs_design_system_spec_responsive_layout, openspec_specs_codes_spec_codes_look_and_copy, openspec_specs_duck_spec_duck_look_and_copy, openspec_specs_feud_spec_family_feud_look_motion_and_sound [INFERRED 0.85]
- **Clocktower day vote flow** — openspec_specs_clocktower_spec_nominations, openspec_specs_clocktower_spec_voting_clock, openspec_specs_clocktower_spec_vote_result, openspec_specs_clocktower_spec_block_card, openspec_specs_clocktower_spec_end_of_day, openspec_specs_clocktower_spec_death_animation, openspec_specs_clocktower_spec_win_detection [INFERRED 0.85]
- **Committed game demo scripts ending at Demo beendet** — openspec_specs_imposter_spec_imposter_demo_script, openspec_specs_most_likely_spec_most_likely_engine_session_and_demo, openspec_specs_wavelength_spec_wavelength_demo_script [INFERRED 0.85]
- **Imposter played-with history feature** — openspec_specs_imposter_spec_imposter_played_with_store, openspec_specs_imposter_spec_imposter_played_table, openspec_specs_imposter_spec_api_imposter_played, openspec_specs_imposter_spec_imposter_crew_reveal_records_round, openspec_specs_imposter_spec_imposter_played_with_on_inhalte, openspec_specs_imposter_spec_imposter_who_knows_the_prompt [EXTRACTED 1.00]
- **CI gate to tagged release pipeline** — openspec_specs_release_spec_ci_workflow, openspec_specs_release_spec_package_script, openspec_specs_release_spec_release_workflow, openspec_specs_release_spec_version_0_7_1 [EXTRACTED 1.00]

## Communities (198 total, 17 thin omitted)

### Community 0 - "Most Likely Engine"
Cohesion: 0.05
Nodes (52): ContentItem, CodesState, demo, Step, lastTurn, play(), states, choices() (+44 more)

### Community 1 - "Imposter Engine & Rng"
Cohesion: 0.06
Nodes (47): PairPlayed, int(), next(), Rng, sequence(), saved, demo, H (+39 more)

### Community 2 - "Clocktower Deal & Seat Actions"
Cohesion: 0.05
Nodes (43): at, open(), role, s, seat, send(), shown, { state: game, dispatch } (+35 more)

### Community 3 - "Clocktower Day Layout E2E"
Cohesion: 0.09
Nodes (54): blocked(), dawn2(), F15C, F8, open(), picker(), timed(), toClock() (+46 more)

### Community 4 - "Codes Engine"
Cohesion: 0.05
Nodes (46): demo, GUESSED, MISSED, NEXT, START, run(), walk(), codes (+38 more)

### Community 5 - "Motion & Winner UI"
Cohesion: 0.06
Nodes (43): flip(), order, Props, { tiles, revealed, before, result = false, verb, onpick, locked = false, expected = null }, tween(), band(), burst(), countUp() (+35 more)

### Community 6 - "Imposter & Most Likely Specs"
Cohesion: 0.06
Nodes (11): Imposter Specification, /api/imposter/played API, imposter_played table, Most Likely To Specification, Players Specification, /api/players API, players table, Release Specification (+3 more)

### Community 7 - "Clocktower Engine & Night"
Cohesion: 0.09
Nodes (45): pick(), rings(), canBeNominated(), canNominate(), dawn(), day(), daybreak(), DayScreen (+37 more)

### Community 8 - "Clocktower Win & Night Tests"
Cohesion: 0.09
Nodes (39): base(), circle(), deaths(), flat, reveal(), saint(), screens, saintDusk() (+31 more)

### Community 9 - "Clocktower Character Board"
Cohesion: 0.07
Nodes (31): svelte, have, need, Props, { seats, picked, pending, onpick }, teams, c, { id, size = 40 } (+23 more)

### Community 10 - "Clocktower Living Spec"
Cohesion: 0.07
Nodes (44): Player count before the lobby, clocktower Specification, Ambiguous outcomes resolved at dusk, Animated voting slide, Block card, Centred text in info panels, Character board with team counters, Character sheet (+36 more)

### Community 11 - "Content Editor Page"
Cohesion: 0.05
Nodes (34): a, add(), api, b, base, bulk, bulkLines, { data, params } (+26 more)

### Community 12 - "Look Walk E2E"
Cohesion: 0.07
Nodes (27): Check, content(), found, names, NEW_COPY, PIXEL, press(), walk() (+19 more)

### Community 13 - "Feud History & Round E2E"
Cohesion: 0.10
Nodes (30): begin(), begin(), CREW, handoff(), pick(), Played, press(), Server (+22 more)

### Community 14 - "E2E Helpers & Content Tests"
Cohesion: 0.09
Nodes (17): port, imposterPlayed(), playerCall(), seedContent(), seedImposterPlayed(), seedPairs(), seedPlayed(), shot() (+9 more)

### Community 15 - "Content Server & Parsing"
Cohesion: 0.15
Nodes (30): pairError(), parseBulk(), singleError(), isSingle(), isSurvey(), MAX_TEXT, add(), clean() (+22 more)

### Community 16 - "Package Dependencies"
Cohesion: 0.06
Nodes (37): devDependencies, @playwright/test@^1.64.1, svelte@^5.57.2, svelte-check@^4.7.6, @sveltejs/adapter-node@^6.0.0, @sveltejs/kit@^3.1.0, @sveltejs/vite-plugin-svelte@^7.3.1, @types/node@^26.6.5 (+29 more)

### Community 17 - "Nachtlicht Design Mockup"
Cohesion: 0.11
Nodes (31): Nachtlicht Desktop 1280px mockup render, Banner component (.banner, toned variant), Button.svelte styles (.btn primary/secondary/sm), Coming soon: Duck, Family Feud, Codes, Most Likely To, Charade, Frame Container Queries (768px / 1024px), Spieler (crew) panel, Arcade Design Tokens (.fr custom properties), Press Start 2P (data font, embedded woff2) (+23 more)

### Community 18 - "Feud Engine"
Cohesion: 0.11
Nodes (31): demo, surveys, run(), walk(), act(), advance(), answer(), bank() (+23 more)

### Community 19 - "Clocktower Day & Vote E2E"
Cohesion: 0.09
Nodes (33): dialog(), endDay(), F15C, F5C, F8, frozen(), handAngle(), lit() (+25 more)

### Community 20 - "Codes Screen & HoldToView"
Cohesion: 0.07
Nodes (32): act(), best, clue, guessed(), last, many, missed(), next() (+24 more)

### Community 21 - "Feud Prep & Demo E2E"
Cohesion: 0.08
Nodes (30): emptied(), playToEnd(), progress(), Server, TIMEOUT, back(), cards(), CREW (+22 more)

### Community 22 - "Duck Engine"
Cohesion: 0.10
Nodes (25): demo, gained(), run(), walk(), words(), DEFAULT_TARGET, draw(), duck (+17 more)

### Community 23 - "Duck & Wavelength E2E"
Cohesion: 0.08
Nodes (21): card(), expectScoringFrame(), names, press(), startGame(), tapBox(), tapLetter(), toScoring() (+13 more)

### Community 24 - "Server Hooks & Fonts"
Cohesion: 0.11
Nodes (18): @sveltejs/kit, arcadeFonts, clocktowerFonts, handle(), init(), games, count(), getDb() (+10 more)

### Community 25 - "Import Script & Rhymes"
Cohesion: 0.10
Nodes (16): vitest, fixture, script, hash, root, staging, { version }, { version } (+8 more)

### Community 26 - "Clocktower End & Death Step"
Cohesion: 0.09
Nodes (23): DemoStep, Player, picked, Props, selected, { state: s, dispatch, peek }, event(), good (+15 more)

### Community 27 - "Players Server & Roster"
Cohesion: 0.13
Nodes (21): NAME_MAX, nameError(), FakeStorage, serve(), openDb(), player(), player(), addPlayer() (+13 more)

### Community 28 - "Wavelength Engine & Setup"
Cohesion: 0.09
Nodes (26): DEFAULT_ROUNDS, draw(), MAX_TEAM_SIZE, MAX_TEAMS, MIN_KOOP_PLAYERS, MIN_TEAM_SIZE, MIN_TEAMS, MIN_VERSUS_PLAYERS (+18 more)

### Community 29 - "Clocktower Setup & Shuffle"
Cohesion: 0.14
Nodes (21): shuffle(), complete(), ids(), NAMES, believable(), counts(), drawBluffs(), drunkSeat() (+13 more)

### Community 30 - "Players Page"
Cohesion: 0.07
Nodes (20): back, crewMessage, doomed, draft, editing, editMessage, from, inCrew (+12 more)

### Community 31 - "Automat Design Mockup"
Cohesion: 0.11
Nodes (28): Banner component (copy + CRT art), Button.svelte styles (primary/secondary with ledge shadow), CRT screen (.crt with scanlines), Deko 2 · Automat (decoration variant 2 of 3), Arcade design tokens (navy ground, primary/gold/imposter/wavelength, ledge), Home · game catalogue screen, Imposter (game), LED label (.led, Press Start 2P with glow) (+20 more)

### Community 32 - "Survey Editor"
Cohesion: 0.09
Nodes (25): ImportReport, add(), base, blank(), body(), bulk, bulkLines, { def, surveys } (+17 more)

### Community 33 - "Clocktower Show Bar & Info"
Cohesion: 0.09
Nodes (23): alignment(), groups, choose(), evil(), info(), pairs, expectPair(), stepOf() (+15 more)

### Community 34 - "Feud Prep Screen"
Cohesion: 0.08
Nodes (22): add(), byId, drop(), full, list, listOf(), names, notice (+14 more)

### Community 35 - "Rebuild Design Tokens"
Cohesion: 0.11
Nodes (21): Colour tokens --codes #9d8cff, --duck #ff9f43, --most-likely #f27bc4, Motif union extended with codes, duck, most-likely, Arcade-Abend tokens requirement, Look of the new games (tokens, badges, motifs), Schema migrations/0001_content.sql (imposter_pairs, wavelength_spectra), ContentItem {id, a, b} generic content shape, Decoration dispatcher motifFor + Art.svelte, A1 · Matt artboard (rejected muted palette) (+13 more)

### Community 36 - "Clocktower Design Decisions R2"
Cohesion: 0.11
Nodes (24): Blind bluffs (S66): no preview, Drunk excluded, Block badge (S59): blood-red disc with axe, BlockCard.svelte (S61): parchment card with axe, name, votes, Circle.svelte seat circle contract (owned by U17), Execution and dawn death animation (S63, S64): DayState.killed, Ghost-vote badge (S60): light-blue disc, spent hollow and struck, Marks while a show text is shown (S65, pointed prop), No text selection and one background tone (S50, S62) (+16 more)

### Community 37 - "Clocktower Rules Spec Delta"
Cohesion: 0.11
Nodes (28): Imp starpass, Vote threshold ceil(alive/2) and high-water mark, Animated voting slide, Manual and random assignment (seeded RNG), Block card, Dawn, Day timer, Death animation (+20 more)

### Community 38 - "Feud Screen"
Cohesion: 0.08
Nodes (25): banks(), act(), acting, answer(), arena, before, buzzer, colours (+17 more)

### Community 39 - "Faster CI Design"
Cohesion: 0.13
Nodes (20): Faster CI design, homelab-check self-hosted runner (check01), release-tarball CI artifact, Parked stash wip ci/release-promotes-ci-artifact, Faster CI proposal, Faster CI harness delta spec, E2E runs each check once per viewport (delta), Faster CI release delta spec (+12 more)

### Community 40 - "Clocktower Deck & Vote"
Cohesion: 0.16
Nodes (22): sectorOf(), Card, Kind, Mood, slides(), Step, teamNames, counts() (+14 more)

### Community 41 - "Gate Workflow"
Cohesion: 0.08
Nodes (25): name, runs-on, steps, runner, jobs, ci, name, on (+17 more)

### Community 42 - "Survey Parsing & Types"
Cohesion: 0.17
Nodes (19): ParsedBulk, parseSurveyBulk(), surveyError(), ContentType, ImportError, ItemType, MAX_ANSWERS, MAX_POINTS (+11 more)

### Community 43 - "Clocktower Circle Component"
Cohesion: 0.10
Nodes (24): at, box, buttons, centre, count, d, deco, down() (+16 more)

### Community 44 - "Explanation Page & Banner"
Cohesion: 0.11
Nodes (16): c, Props, { slug, place, colour, children }, { children }, roster, setMuted(), { children }, silent (+8 more)

### Community 45 - "Clocktower Walk Helpers"
Cohesion: 0.18
Nodes (22): open(), open(), open(), open(), seedClocktower(), open(), reveal(), seedRoster() (+14 more)

### Community 46 - "Guided Demo Runner"
Cohesion: 0.15
Nodes (18): DemoState, getDemo(), setDemo(), source(), DemoRun, done(), END_TIP, next() (+10 more)

### Community 47 - "Clocktower Night E2E"
Cohesion: 0.10
Nodes (18): atEmpath(), atImp(), bar(), chip(), fifteen(), heldNames, hidden, NAMES (+10 more)

### Community 48 - "Clocktower Vote Clock"
Cohesion: 0.11
Nodes (21): casts(), count, hand, handMs, key(), mark(), off(), order (+13 more)

### Community 49 - "Feud Full Game E2E"
Cohesion: 0.15
Nodes (13): CREW, fullGame(), handoff(), pick(), press(), score(), Server, strikeOut() (+5 more)

### Community 50 - "Spielbrett Design Mockup"
Cohesion: 0.21
Nodes (18): Spielbrett desktop mockup (1280px, four screens), Spielbrett phone mockup (390px, four screens), Banner component (copy plus art panel), Button.svelte primary/secondary ledge buttons, Container-query breakpoints (768px / 1024px), Spielbrett palette and design tokens (.fr custom properties), Rich GameTile (art, badge, pitch, player range), Home · Spielekatalog screen (+10 more)

### Community 51 - "Database & Import Tests"
Cohesion: 0.13
Nodes (10): copies, { positionals, values }, source, target, closeDb(), loadMigrations(), migrate(), Migration (+2 more)

### Community 52 - "Deco Grid & Arcs"
Cohesion: 0.11
Nodes (14): { cx, cy, radii, opacity = 0.3, stroke = 'var(--wavelength)' }, Props, pawns, { place }, Props, id, Props, { width, height, opacity = 0.3 } (+6 more)

### Community 53 - "Wavelength Dial"
Cohesion: 0.11
Nodes (20): angleAt(), bands, clamp(), demo, down(), dragging, expected, key() (+12 more)

### Community 54 - "Codes & Deco E2E"
Cohesion: 0.10
Nodes (7): play(), Saved, crew, PITCH, screens, ambient(), decoAudit()

### Community 55 - "Game Frame E2E"
Cohesion: 0.10
Nodes (7): all, Game, Sample, seedSession(), DemoScript, GameDef, GameEntry

### Community 56 - "Release Workflow Steps"
Cohesion: 0.10
Nodes (21): with, context, file, github-token, images, labels, name, password (+13 more)

### Community 57 - "Arcade Polish Scope"
Cohesion: 0.15
Nodes (20): src/lib/ui/pager.ts (pageCount, clampPage, pageItems, pageOf), arcade-polish proposal, S10 Shared Handoff replacing Feud overlay, S14 Game over with winner burst and one final Scoreboard, S15 Codes Daneben and Duck letter loss reuse Feud fault motion, S1 Play header without Demo, red danger Spiel beenden, S3 Shared Pager (6/12 per page), S4 Inhalte through the Pager (+12 more)

### Community 58 - "Game Engine & Duck Specs"
Cohesion: 0.13
Nodes (21): Game start screen layout, Clocktower session, Codes engine, session and demo, Content editor, Minimum content pool, demo Specification, Coach tip with step progress, Guided demo (+13 more)

### Community 59 - "Clocktower Wake Step"
Cohesion: 0.10
Nodes (17): bar, candidates, card, choosing, drunk, group, hint, intro (+9 more)

### Community 60 - "Imposter Played Swap Design"
Cohesion: 0.17
Nodes (16): e2e helpers seedPairs, seedImposterPlayed, imposterPlayed, /api/imposter/played routes (GET, POST, DELETE), imposter-played.ts store (listImposterPlayed, addImposterPlayed, removeImposterPlayed), Migration 0008_imposter_played.sql (imposter_played table + interchangeable column), played.svelte.ts client module (record, knownBy, history), Requirement: Imposter crew reveal records the round, Requirement: Imposter played-with on Inhalte, Requirement: Imposter played-with store (+8 more)

### Community 61 - "Clocktower Layout Decisions"
Cohesion: 0.12
Nodes (17): Deck voting slide via voteTimeline (S40, S55), End reveal grouped by team (S49), Held grimoire shows character icons (S51), 2 s per seat vote sweep (S67, SEAT_MS = 2000), Characters on the setup circle (Circle token prop, S41), Compact show-bar (S45), Vote sweep with constant-speed hand and lit sector (S53), Gate 2 feedback round 1 (2026-10-14) (+9 more)

### Community 62 - "Clocktower Change Flow"
Cohesion: 0.10
Nodes (19): base, gate0, gate0_r2, gate0_r3, gate1, gate1_r2, gate1_r3, gate2 (+11 more)

### Community 63 - "Trouble Brewing Rules"
Cohesion: 0.13
Nodes (18): Trouble Brewing rules research, Drunk character, First night vs other nights, Official TB night order, Nomination rules (RB p.14–15), Fortune Teller Red Herring, Trouble Brewing setup table (5–15 players), Storyteller Guide / Character Sheet deviations (+10 more)

### Community 64 - "Look Walk Design Rules"
Cohesion: 0.22
Nodes (19): Look walk (e2e/look.test.ts), Look rules share one walk (delta), Task unit 1: Look rules share one walk, Day timer, Codes look and copy, design-system Specification, Arcade-Abend tokens, Clocktower atmosphere (+11 more)

### Community 65 - "Play Session Page"
Cohesion: 0.15
Nodes (17): leave(), clearSession(), fits(), key(), kind(), loadSession(), saveSession(), start() (+9 more)

### Community 66 - "Clocktower Deck E2E"
Cohesion: 0.13
Nodes (10): box(), crew(), forward(), goTo(), list, openDeck(), progress(), Recorded (+2 more)

### Community 67 - "CI Workflow"
Cohesion: 0.11
Nodes (18): uses, with, concurrency, cancel-in-progress, group, jobs, ci, security-baseline (+10 more)

### Community 68 - "Codes & Design System Specs"
Cohesion: 0.15
Nodes (19): codes Specification, Arcade draw() pattern (no repeats until pool used), Codes Aufdecken, Codes play and scoring, Codes roles and turn order, Codes setup, Codes word draw, Fault motion (+11 more)

### Community 69 - "Deco Art Motifs"
Cohesion: 0.16
Nodes (12): motif, Props, { slug, place }, Motif, motifFor(), own, Place, draws (+4 more)

### Community 70 - "Clocktower Setup Board"
Cohesion: 0.12
Nodes (15): blocked, choose(), confirming, drunk, herring, pending, picked, s (+7 more)

### Community 71 - "Duck Screen"
Cohesion: 0.14
Nodes (15): checkWin(), act(), askSkip(), box(), chuck, commit(), demo, over (+7 more)

### Community 72 - "Feud Setup"
Cohesion: 0.11
Nodes (18): blocked, deal(), DEFAULTS, final, loaded, names, needed, { players, onstart } (+10 more)

### Community 73 - "Most Likely Screen"
Cohesion: 0.12
Nodes (16): act(), best, demo, lastGame, lastTurn, members, next(), s (+8 more)

### Community 74 - "Sound Tests"
Cohesion: 0.12
Nodes (5): FakeAudioContext, FakeNode, FakeParam, load(), saved

### Community 75 - "Game Detail Page"
Cohesion: 0.11
Nodes (17): base, cards, count, { data, params }, def, discarded, entry, fewPlayers (+9 more)

### Community 76 - "Clocktower Setup E2E"
Cohesion: 0.14
Nodes (15): character(), count(), counters(), FIVE, held(), hide(), NAMES, nameScreen() (+7 more)

### Community 77 - "Family Feud Tasks"
Cohesion: 0.16
Nodes (14): family-feud release delta spec, Requirement: Version 0.3.0, family-feud tasks, Migrations 0005_feud / 0006_seed_surveys (feud_surveys, feud_played), Feud U1: Contracts and shared foundation, Feud U7: Demo (Alex & Bo vs Cleo & Dani), Feud U2: Engine (face-off, board, steal, sudden death, undo), Feud U4: Lobby gate, setup, host prep and played-with store (+6 more)

### Community 78 - "Revised Demos Design"
Cohesion: 0.17
Nodes (11): Demo highlighting for buzz (buzz-other pattern), Requirement: Family Feud demo, revise-demos-most-likely design, Shared demo runner (DemoScript, data-demo=expected), Most Likely engine contract (MostLikelyConfig, choices, maxTeams), Most Likely To on team rules, Start page: Demo card first, Erklärung route removed, revise-demos-most-likely proposal (+3 more)

### Community 79 - "Player Database Design"
Cohesion: 0.16
Nodes (13): player-database design, Contract for family-feud (savedId, roster.ready, players FK), Players API /api/players (GET/POST/PATCH/DELETE), players table (migrations/0004_players.sql), player-database proposal, players capability (new), roster capability (modified), player-database scope (+5 more)

### Community 80 - "Revised Demos Tasks"
Cohesion: 0.20
Nodes (18): Requirement: Codes engine, session and demo, Requirement: Guided demo (revise-demos), Requirement: Duck engine, session and demo, Requirement: Family Feud demo (revise-demos), Requirement: Imposter demo script, Requirement: Neutral turn verdicts (Wavelength), Requirement: Wavelength demo script (Versus only), revise-demos-most-likely tasks (waves U1-U8) (+10 more)

### Community 81 - "Arcade Polish Tasks"
Cohesion: 0.16
Nodes (16): Requirement: Play header, Requirement: Round status in the play header, Requirement: Most Likely turns, Requirement: Gespeicherte Spieler section, Motion helpers (rise, phaseOut, pop, band, turn, fault, scatter, burst), Shared Pager (pager.ts + Pager.svelte), Unit 1: Motion tokens, motion helpers and round status, Unit 2: Shared Pager for Feud prep, Inhalte and Gespeicherte Spieler (+8 more)

### Community 82 - "Clocktower Day Screen"
Cohesion: 0.12
Nodes (15): { name, votes }, barred(), barredSeats, blockVotes, ending, last, name(), nominator (+7 more)

### Community 83 - "Feud Engine Tests"
Cohesion: 0.17
Nodes (16): FeudTeam, named(), A2, A3, B2, bank40(), board40(), closeAt() (+8 more)

### Community 84 - "Wavelength Screen"
Cohesion: 0.13
Nodes (17): scoreFor(), act(), best, clue, koop, last, lockIn(), many (+9 more)

### Community 85 - "Clocktower Atmosphere E2E"
Cohesion: 0.14
Nodes (11): crew(), DAY, heading(), lobby(), NIGHT, reveal(), setupBoard(), sky() (+3 more)

### Community 86 - "Clocktower Theme E2E"
Cohesion: 0.12
Nodes (5): crew(), crewNames, toPlay(), reveal(), F7

### Community 87 - "Family Feud Design"
Cohesion: 0.18
Nodes (11): Family Feud design, feud_surveys / feud_played tables (migrations 0005, 0006), Family Feud proposal, feud capability (new), Family Feud scope, player-database change (saved players, players table), Family Feud: content-store spec delta, Default survey seeds (26 archive surveys) (+3 more)

### Community 88 - "Feud Host Flow Design"
Cohesion: 0.17
Nodes (12): feud-host-flow design, Button contract (danger, warning, square, label), feud-host-flow proposal, arcade-polish (split-off change), feud-host-flow scope, Feud host flow S1-S8 scope items, feud-host-flow design-system delta spec, Requirement: Shared components (danger/warning/square button) (+4 more)

### Community 89 - "Duck Wordlist Migration"
Cohesion: 0.18
Nodes (14): Nine kept seed words, Migration 0009_duck_wordlist.sql, Proposal: duck-wordlist-750, Scope: duck-wordlist-750, Duck word criteria (syllables, word class, Duden, no rhymes), Start screens of the new games (750 Wörter), Default content seeds (0003 + 0009), SQLite content store (+6 more)

### Community 90 - "Feud & Content Specs"
Cohesion: 0.15
Nodes (17): Family Feud start screen, Codes round result and Endstand, feud_played table, Survey content type, Game over, Round outcome, feud Specification, Family Feud board (+9 more)

### Community 91 - "Clocktower Show E2E"
Cohesion: 0.17
Nodes (11): atStep(), bar(), card(), chip(), night1(), open(), pointed(), reveal() (+3 more)

### Community 92 - "Add Three Games Scope"
Cohesion: 0.18
Nodes (15): duck GameDef<DuckState, DuckAction, DuckConfig>, mostLikely GameDef<MostLikelyState, MostLikelyAction, MostLikelyConfig>, Scope: add-three-games (S1-S30), Archived Party-Games app (00_Archive/Party-Games), Start screens of the new games (So geht's, nouns, seeded counts), Default content seeds (Codes 91, Duck 60, Most Likely 60), Chuck the Duck, Duck standings and Spielende (+7 more)

### Community 93 - "Clocktower Architecture Decisions"
Cohesion: 0.13
Nodes (9): Imposter engine deal applies the swap after bind, ClocktowerState / ClocktowerAction / NightState / DayState types (U2), count.ts (loadCount/saveCount, arcade:count:<slug>), Fixtures F5, F7, F15 with expected night order, Pure rules API (characters, setup, night, info, vote modules), Proposal: Blood on the Clocktower (Trouble Brewing) game, Capability: clocktower, Mobbin explore a): lobby with player count first, Explanation deck (+1 more)

### Community 94 - "Roster Store"
Cohesion: 0.16
Nodes (13): playersApi, check(), key(), load(), newId(), offline, players, Result (+5 more)

### Community 95 - "Imposter Played Store"
Cohesion: 0.22
Nodes (8): addImposterPlayed(), listImposterPlayed(), removeImposterPlayed(), Handler, pair(), DELETE(), GET(), POST()

### Community 96 - "Clocktower Dawn & Theme"
Cohesion: 0.15
Nodes (12): deaths, minutes, names, Props, said, screen, { state: s, dispatch }, change() (+4 more)

### Community 97 - "UI Tokens"
Cohesion: 0.22
Nodes (13): clocktowerDay, clocktowerGrounds, clocktowerMarks, clocktowerNight, clocktowerPairs, ClocktowerToken, contrast(), grounds (+5 more)

### Community 98 - "Lobby Page"
Cohesion: 0.13
Nodes (12): chosen, entry, failure, full, guests, most, n, { params } (+4 more)

### Community 99 - "Most Likely E2E"
Cohesion: 0.21
Nodes (10): board(), choice(), eight, names, onTurn(), playTo(), playTurn(), press() (+2 more)

### Community 100 - "Rebuild Design System Spec"
Cohesion: 0.22
Nodes (14): Party Games Rebuild: design-system spec, Arcade-Abend design tokens, Decoration "Spielbrett" (inline-SVG motifs, ambient motion), Motion (transform/opacity only, never blocks input), Neutral grown-up copy (no "!", no puns), Responsive layout (390px phone, 1280px desktop), Shared UI components (Button, HoldToView, Lives, CoachTip, ...), Party Games Rebuild: sound spec (+6 more)

### Community 101 - "Clocktower Circle Geometry"
Cohesion: 0.35
Nodes (12): angleOf(), around(), clear(), f(), ornament(), Point, polar(), seatPositions() (+4 more)

### Community 102 - "Game Registry & Sessions"
Cohesion: 0.19
Nodes (10): comingSoon, loadGameSession(), preKoop, run(), walk(), modeOf(), psychic(), wavelength (+2 more)

### Community 103 - "Scoreboard"
Cohesion: 0.22
Nodes (11): outCurve, moved(), order, place, places(), Props, ranked(), { rows, detail } (+3 more)

### Community 104 - "README & Repo Rules"
Cohesion: 0.22
Nodes (12): Harness: proof / proof:full / package, Kit CSRF check behind proxy (PROTOCOL_HEADER / ORIGIN), Rue's Arcade (CLAUDE.md), add-three-games proposal, Version 0.2.0 release, Split off: Homelab deploy and later games (Duck, Feud, Codes, Most Likely, Charade), Container image ghcr.io/rue-asha/rues-arcade, GET /healthz health check (+4 more)

### Community 105 - "Add Three Games Design"
Cohesion: 0.22
Nodes (8): add-three-games design, isSingle(type), parseBulk(text, single), Migrations 0002_single_content.sql + 0003_seed_content.sql, e2e seedContent(request, type, rows), add-three-games tasks (units 1-6), Ship-time step: push tag v0.2.0 (irreversible), Unit 1: Contracts and shared foundation

### Community 106 - "Clocktower Game E2E"
Cohesion: 0.27
Nodes (10): bodyIsGround(), endDay(), heading(), html(), lastNight(), NAMES, press(), read() (+2 more)

### Community 107 - "Content Store Rebuild Spec"
Cohesion: 0.23
Nodes (13): Party Games Rebuild: content-store spec, Content editor (Inhalte), Old-schema content importer (npm run import), SQLite content store (node:sqlite, forward-only migrations), Party Games Rebuild: harness spec, Proof commands (npm run proof / proof:full), Party Games Rebuild: release spec, CI workflow (.github/workflows/ci.yml) (+5 more)

### Community 108 - "Most Likely Spec Revision"
Cohesion: 0.24
Nodes (13): Requirement: Home catalogue from the registry, Requirement: Tile pitch (registry pitch line), Requirement: Most Likely Endstand, Requirement: Most Likely engine, session and demo, Requirement: Most Likely look and copy, Removed Requirement: Most Likely pick and reveal, Requirement: Most Likely prompt (Anderer Spruch), Requirement: Most Likely scoring (largest group) (+5 more)

### Community 109 - "Arcade Polish Flow"
Cohesion: 0.15
Nodes (12): base, explore_notes, gate0, gate1, gate2, learnings, learnings_gate2, flow (+4 more)

### Community 110 - "Codes Deco Art"
Cohesion: 0.15
Nodes (12): bubble, count, gap, height, left, odd, { place }, Props (+4 more)

### Community 111 - "Feud Deco Art"
Cohesion: 0.15
Nodes (12): cells, gapX, gapY, h, height, left, { place }, Props (+4 more)

### Community 112 - "Most Likely Deco Art"
Cohesion: 0.15
Nodes (12): cx, floor, gap, head, height, lift, others, { place } (+4 more)

### Community 113 - "Feud Prep Autofill"
Cohesion: 0.27
Nodes (10): autofill(), drawTiebreak(), fill(), leastKnown(), Row, rows(), sortRows(), survey() (+2 more)

### Community 114 - "Wavelength Engine Tests"
Cohesion: 0.17
Nodes (9): DIAL_DEGREES, formatAverage(), koopResult(), allActions, names, players, step(), turn() (+1 more)

### Community 115 - "Pager"
Cohesion: 0.27
Nodes (10): clampPage(), current, PAGE, { page = $bindable(), total, size }, pageCount(), pageItems(), pageOf(), pages (+2 more)

### Community 116 - "Clocktower Circle E2E"
Cohesion: 0.21
Nodes (9): atCircle(), audit(), frozen(), handAudit(), iconOf(), NAMES, seat(), sheet() (+1 more)

### Community 117 - "Clocktower Day Marks E2E"
Cohesion: 0.20
Nodes (9): executed(), F15C, LIVING, motion(), open(), press(), rings(), seat() (+1 more)

### Community 118 - "Demo E2E"
Cohesion: 0.20
Nodes (8): playToEnd(), progress(), snapshot(), demo, spectra, WavelengthAction, WavelengthConfig, localStorage()

### Community 119 - "Release Workflow Jobs"
Cohesion: 0.17
Nodes (12): name, needs, secrets, uses, with, bump, app_id, app_private_key (+4 more)

### Community 120 - "Party Games Rebuild Flow"
Cohesion: 0.17
Nodes (11): base, gate0, gate0_ext, gate1, gate1_ext, gate2, gate2_notes, learnings (+3 more)

### Community 121 - "Feud Host Flow Spec"
Cohesion: 0.24
Nodes (11): e2e helpers surveyCard / chooseSurveys / openFaceoff, Prep DOM contract (data-survey cards, Seiten pager, pageCount/clampPage), feud-host-flow feud delta spec, Requirement: Family Feud host prep (card grid), Requirement: Family Feud prep pages (6/12 per page), Requirement: Family Feud teams and rounds, feud-host-flow tasks, FHF U1: Pager-aware survey picking in e2e (+3 more)

### Community 122 - "Clocktower Theme Sources"
Cohesion: 0.21
Nodes (9): Character sheet component (Sheet.svelte) placed on setup board and as last deck slide, Clocktower theme: tokens redefined under html[data-theme='clocktower'] + data-variant day/night, Shorter deck: 23 slides, sheet last (S69), Sky motif (stars, moon, sun) in the deco backdrop, Mobbin S39: atmosphere (night stars/moon, day sun), Character Sheet PDF (Trouble Brewing, parchment, verbatim ability texts), BotC design tokens (night bg, parchment, gold, blood red, good blue; IM Fell English + Alegreya Sans), 22 single-path SVG icons (likely game-icons.net, CC BY 3.0) (+1 more)

### Community 123 - "App Shell & Font Licences"
Cohesion: 0.21
Nodes (12): app.html document shell, %arcade.fonts% placeholder, %arcade.theme% / %arcade.variant% placeholders, Alegreya Sans OFL license file, Alegreya Sans font, IM Fell English OFL license file, IM Fell English font, Press Start 2P OFL license file (+4 more)

### Community 124 - "Local Storage & Counts"
Cohesion: 0.42
Nodes (9): key(), loadCount(), saveCount(), range, local(), memory, read(), remove() (+1 more)

### Community 125 - "Clocktower Deco Art"
Cohesion: 0.17
Nodes (11): cx, cy, height, [hx, hy], [mx, my], { place }, Props, r (+3 more)

### Community 126 - "Masks Deco Art"
Cohesion: 0.17
Nodes (11): centre, gap, height, left, lift, { place }, Props, scale (+3 more)

### Community 127 - "Feud Controls E2E"
Cohesion: 0.35
Nodes (10): boxes(), button(), CREW, readsAsFault(), rgb(), rowOf(), Server, settled() (+2 more)

### Community 128 - "Pager E2E"
Cohesion: 0.25
Nodes (9): back(), DESKTOP, entries(), next(), pager(), PHONE, seed(), texts() (+1 more)

### Community 129 - "Players E2E"
Cohesion: 0.25
Nodes (8): create(), crew(), DESKTOP, next(), pager(), PHONE, saved(), tag()

### Community 130 - "Rebuild Demo Verification"
Cohesion: 0.22
Nodes (11): Minimum content pool gate, Party Games Rebuild: demo spec, Guided demo (coach tip, fixed players, [Demo] tag), Wavelength demo script (Versus only), Party Games Rebuild tasks, src/lib/demo/runner.ts demo runner, src/lib/engine/rng.ts seeded RNG, Party Games Rebuild verification (round 7) (+3 more)

### Community 131 - "Wavelength & Engine Spec"
Cohesion: 0.31
Nodes (11): Party Games Rebuild: game-engine spec, Pure reducer with seeded RNG, Session save and resume, Party Games Rebuild: wavelength spec, Wavelength dial input (touch, mouse, keyboard), Saved Versus sessions stay compatible, Wavelength game flow (Versus, 4/3/2/0 scoring), Wavelength Koop mode (shared score, rating tiers) (+3 more)

### Community 132 - "Family Feud Flow"
Cohesion: 0.18
Nodes (10): base, depends_on, gate0, gate1, gate2, learnings, release, track (+2 more)

### Community 133 - "Family Feud Spec Delta"
Cohesion: 0.35
Nodes (11): Family Feud: feud spec, Family Feud board (pot, strikes), Family Feud end and sudden death, Family Feud face-off, Family Feud host prep, Family Feud played-with history, Family Feud random fill (prefers unknown surveys), Family Feud round result (last round x2) (+3 more)

### Community 134 - "Clocktower Scope"
Cohesion: 0.22
Nodes (7): Count-first lobby (choose N before lobby), Scope: blood-on-the-clocktower, Clocktower entity model (game, seats, layers), Player count before the lobby (Spielerzahl stepper), Show-bar, True info suggestion, Roster against game limits (exactly N)

### Community 135 - "Gauge Deco Art"
Cohesion: 0.25
Nodes (10): ticks, bands, { cx, cy, r, face, needle = 100 }, mixes, Props, ticks, f(), polar() (+2 more)

### Community 136 - "Clocktower Deck Overlay"
Cohesion: 0.24
Nodes (9): { count, onclose }, frame, go(), guarded(), key(), list, press(), release() (+1 more)

### Community 137 - "Clocktower Slide"
Cohesion: 0.24
Nodes (9): triggerLabel, alive, polar(), { slide }, steps(), sweep(), ticks(), tl (+1 more)

### Community 138 - "Feud Prep Cards E2E"
Cohesion: 0.24
Nodes (8): cells(), CREW, prep(), Server, settled(), setup(), toPrep(), surveyCard()

### Community 139 - "Release Publish Job"
Cohesion: 0.20
Nodes (9): jobs, publish, name, on, push, name, needs, runs-on (+1 more)

### Community 140 - "Content Migrations"
Cohesion: 0.22
Nodes (6): imposter_pairs, wavelength_spectra, players, feud_played, feud_surveys, imposter_played

### Community 141 - "Codes Spec Delta"
Cohesion: 0.22
Nodes (9): codes GameDef<CodesState, CodesAction, CodesConfig>, Codes (Passwort-style port, not Codenames), Codes Aufdecken with HoldToView and Anderes Wort, Codes round result and Endstand, Codes play and scoring 3/2/1, Daneben, Ueberspringen, Codes roles and turn order, Codes word draw without repeats, Most Likely prompt draw and Anderer Spruch (+1 more)

### Community 142 - "Arcade Polish Design"
Cohesion: 0.31
Nodes (7): arcade-polish design, expectFrame(page) e2e helper, GameFrame.svelte (hero, children, actions, rail), PlayHeader.svelte (name, label, status, onend), Status interface { parts, progress }, S2 Round status in the play header, Requirement: In-game frame

### Community 143 - "Arcade Polish Research"
Cohesion: 0.20
Nodes (9): Motion values and motion.ts contract (rise, phaseOut, pop, band, burst, turn, fault, scatter), Current weaknesses (origin/main) per game screen, Mobbin evidence (Kahoot, Duolingo, Babbel, Tolan ...), Motion vocabulary (ease/dur tokens, phase-out, handover, reveal, fault, winner), arcade-polish research (Mobbin, 2026-10-07), S16 Motion tokens in app.css and tokens.ts, S6-S8 Phase out/in motion, reduced motion instant, never blocks input, Requirement: Motion (tokens, reduced motion) (+1 more)

### Community 144 - "Clocktower Win Conditions"
Cohesion: 0.24
Nodes (10): Mayor win, BOTC Main Rulebook (RB), Scarlet Woman takeover, Official win conditions, Gate 2 revisions S39–S69, Ambiguous outcomes resolved at dusk, Verification r10 (blood-on-the-clocktower), Gate 2 manual checklist (+2 more)

### Community 145 - "Content Store Spec"
Cohesion: 0.24
Nodes (10): content-store Specification, Default content seeds, Default survey seeds, Importer, Migration 0009_duck_wordlist.sql, Show survey seeds, Single-value content, SQLite content store (+2 more)

### Community 146 - "Repo Learnings"
Cohesion: 0.22
Nodes (4): Rues-Arcade learnings, Content editor (Inhalte), Single-value content (one text per entry), SQLite content store (pair and single-value tables)

### Community 147 - "Clocktower Start E2E"
Cohesion: 0.25
Nodes (3): count(), openLobby(), openStart()

### Community 148 - "Feud Setup E2E"
Cohesion: 0.25
Nodes (5): lobby(), members(), NAMES, team(), Survey

### Community 149 - "Release Permissions"
Cohesion: 0.25
Nodes (9): permissions, permissions, permissions, actions, attestations, contents, id-token, packages (+1 more)

### Community 150 - "Release Env Steps"
Cohesion: 0.33
Nodes (9): steps, GH_TOKEN, steps, env, id, name, run, uses (+1 more)

### Community 151 - "Player Database Flow"
Cohesion: 0.22
Nodes (8): base, gate0, gate1, gate2, learnings, track, triage, worktree

### Community 152 - "Catalogue Spec"
Cohesion: 0.25
Nodes (9): catalogue Specification, Blood on the Clocktower start screen, Game registry, Home catalogue from the registry, Locked later games, Start screens of the new games, Tile pitch, Clocktower transitions (+1 more)

### Community 153 - "Duck Deco Art"
Cohesion: 0.22
Nodes (8): height, { place }, Props, scale, start, width, x, y

### Community 154 - "Feud Catalogue & Explanation"
Cohesion: 0.29
Nodes (8): Party Games Rebuild: explanation spec, Explanation viewer (sandboxed iframe, static/explain/<slug>), Family Feud: catalogue spec delta, Family Feud start screen, Game start screen layout (banner, panel, So geht's, Mehr zu), Home catalogue from the registry (six games), Locked later games (Charade only), Tile pitch

### Community 155 - "Player Database Tasks"
Cohesion: 0.32
Nodes (6): player-database tasks, PD U2: Roster with saved players and guests, PD U1: Saved-player store and API, PD U3: Spieler page, sync on load and lobby, player-database verification, Spec coverage: all player-database scenarios green

### Community 156 - "Roster Spec Delta"
Cohesion: 0.32
Nodes (8): roster store contract (roster.svelte.ts), player-database roster delta spec, Requirement: Link existing roster entries on load, Requirement: Save a guest in place, Requirement: Saved-player changes follow into the roster, Requirement: Saved players and guests in the roster, Requirement: Shared roster, Requirement: Stable player identity

### Community 157 - "Feud Host Flow Flow"
Cohesion: 0.25
Nodes (7): base, gate0, gate1, gate2, learnings, track, triage

### Community 158 - "Revised Demos Flow"
Cohesion: 0.25
Nodes (7): base, gate0, gate1, gate2, learnings, track, triage

### Community 159 - "Imposter Swap Scope"
Cohesion: 0.25
Nodes (3): ContentItem.interchangeable? and PairPlayed types, Proposal: Imposter played-with history and interchangeable pairs, Scope: imposter-played-swap (S1-S7)

### Community 160 - "Imposter Swap Flow"
Cohesion: 0.25
Nodes (7): base, gate0, gate1, gate2, learnings, track, triage

### Community 161 - "OpenSpec Config"
Cohesion: 0.25
Nodes (7): context, rules, design, proposal, specs, tasks, schema

### Community 162 - "Sky Deco Art"
Cohesion: 0.39
Nodes (7): f(), motes, { place }, Props, rays, rnd(), stars

### Community 163 - "Clocktower Timer"
Cohesion: 0.43
Nodes (5): { deadline }, done, now, over(), reading()

### Community 164 - "Sound Effects"
Cohesion: 0.25
Nodes (5): effects, muted, Sfx, Tone, Win

### Community 165 - "Dependabot Config"
Cohesion: 0.29
Nodes (6): interval, updates, directory, package-ecosystem, schedule, version

### Community 166 - "Add Three Games Flow"
Cohesion: 0.29
Nodes (6): base, gate0, gate1, gate2, learnings, triage

### Community 167 - "Rebuild Catalogue Spec"
Cohesion: 0.43
Nodes (6): Catalogue delta: five playable tiles, Feud and Charade locked, Game registry (games, comingSoon, playerRange, GameEntry), Game start screen layout, Home catalogue from the registry, Locked later games (Bald verfügbar), Tile pitch

### Community 168 - "Rebuild Imposter Spec"
Cohesion: 0.38
Nodes (7): Party Games Rebuild: imposter spec, Imposter demo script, Imposter pair drawing without repeats, Imposter round flow, Party Games Rebuild: roster spec, Roster against game player limits, Shared roster (Spieler screen)

### Community 169 - "Clocktower Catalogue Delta"
Cohesion: 0.38
Nodes (7): R1 generic contracts assume demo and content, Blood on the Clocktower start screen, Game start screen layout (Demo/Inhalte/Erklärung cards), Character sheet, Explanation deck (23 slides), Guided demo (Clocktower without demo), Games without content (contentType 'none')

### Community 170 - "Duck Wordlist Flow"
Cohesion: 0.29
Nodes (6): base, gate1, gate2, learnings, track, triage

### Community 171 - "TypeScript Config"
Cohesion: 0.29
Nodes (6): $app/tsconfig, compilerOptions, strict, exclude, extends, include

### Community 172 - "Clocktower Day Timer"
Cohesion: 0.33
Nodes (6): Day emphasis: prominent timer and Facts box (S46, S48), Day timer top right of the head (S56), Mobbin r2 §4: timer in the top-right corner, Mobbin S46: prominent day timer, Mobbin S48: small legend box, Mobbin explore f): day timer, red at zero, non-blocking

### Community 173 - "Clocktower Session Tasks"
Cohesion: 0.33
Nodes (5): Clocktower session, Session save and resume (shape template), Clocktower reducer and win checks (U5), Blood on the Clocktower tasks (U1–U23), Build waves and units

### Community 174 - "Release Tag Check"
Cohesion: 0.40
Nodes (5): name, outputs, runs-on, check-tag, ci-run-id

### Community 175 - "Game Tile"
Cohesion: 0.40
Nodes (4): playerRange(), def, { entry, locked }, Props

### Community 176 - "Single Content Migration"
Cohesion: 0.50
Nodes (3): codes_words, duck_words, most_likely_prompts

### Community 177 - "Start Screen Revision"
Cohesion: 0.67
Nodes (4): Requirement: Family Feud start screen, Requirement: Game start screen layout (Mehr zu box, no Erklaerung), Requirement: Start screens of the new games (Codes, Duck, Most Likely), U6 Start page without Erklaerung

### Community 178 - "Scoreboard Sorting"
Cohesion: 0.50
Nodes (3): Requirement: Codes round result and Endstand, Requirement: Round outcome (+N count-up), Requirement: Scoreboard reorder (FLIP)

### Community 179 - "Clocktower Look Spec"
Cohesion: 0.50
Nodes (4): Arcade-Abend tokens, Clocktower atmosphere (sky, moon, sun), Look of Blood on the Clocktower (night/day variants), Clocktower view transitions

### Community 180 - "Old Schema Fixture"
Cohesion: 0.50
Nodes (3): imposter_prompts, schema_migrations, wavelength_prompts

## Knowledge Gaps
- **108 isolated node(s):** `$app/tsconfig`, `Locked 'Bald verfügbar' tile with dashed corner`, `Setup.svelte lobby settings (teams stepper, team chips, rounds segment)`, `Punktestand board and team list`, `Container-query breakpoints (768px / 1024px)` (+103 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1423 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `Import Script & Rhymes` to `Most Likely Engine`, `Imposter Engine & Rng`, `Clocktower Deal & Seat Actions`, `Codes Engine`, `Motion & Winner UI`, `Clocktower Engine & Night`, `Clocktower Win & Night Tests`, `Clocktower Character Board`, `Content Server & Parsing`, `Package Dependencies`, `Feud Engine`, `Duck Engine`, `Server Hooks & Fonts`, `Players Server & Roster`, `Clocktower Setup & Shuffle`, `Clocktower Show Bar & Info`, `Clocktower Timer`, `Clocktower Deck & Vote`, `Survey Parsing & Types`, `Guided Demo Runner`, `Database & Import Tests`, `Deco Art Motifs`, `Sound Tests`, `Feud Engine Tests`, `Imposter Played Store`, `UI Tokens`, `Clocktower Circle Geometry`, `Game Registry & Sessions`, `Scoreboard`, `Feud Prep Autofill`, `Wavelength Engine Tests`, `Pager`, `Local Storage & Counts`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **What connects `$app/tsconfig`, `Locked 'Bald verfügbar' tile with dashed corner`, `Setup.svelte lobby settings (teams stepper, team chips, rounds segment)` to the rest of the system?**
  _108 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Most Likely Engine` be split into smaller, more focused modules?**
  _Cohesion score 0.04895104895104895 - nodes in this community are weakly interconnected._
- **Why does `@playwright/test` connect `E2E Helpers & Content Tests` to `Pager E2E`, `Players E2E`, `Clocktower Day Layout E2E`, `Clocktower Win & Night Tests`, `Feud Prep Cards E2E`, `Look Walk E2E`, `Feud History & Round E2E`, `Package Dependencies`, `Clocktower Day & Vote E2E`, `Clocktower Start E2E`, `Feud Prep & Demo E2E`, `Feud Setup E2E`, `Duck & Wavelength E2E`, `Clocktower Walk Helpers`, `Clocktower Night E2E`, `Feud Full Game E2E`, `Codes & Deco E2E`, `Game Frame E2E`, `Playwright Config`, `Clocktower Deck E2E`, `Clocktower Setup E2E`, `Clocktower Atmosphere E2E`, `Clocktower Theme E2E`, `Clocktower Show E2E`, `Most Likely E2E`, `Clocktower Game E2E`, `Clocktower Circle E2E`, `Clocktower Day Marks E2E`, `Demo E2E`, `Feud Controls E2E`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Should `Imposter Engine & Rng` be split into smaller, more focused modules?**
  _Cohesion score 0.05654761904761905 - nodes in this community are weakly interconnected._
- **Why does `live()` connect `Clocktower Day & Vote E2E` to `Clocktower Day Layout E2E`, `Clocktower Win & Night Tests`, `Feud History & Round E2E`, `E2E Helpers & Content Tests`, `Clocktower Start E2E`, `Duck & Wavelength E2E`, `Clocktower Walk Helpers`, `Clocktower Night E2E`, `Feud Full Game E2E`, `Codes & Deco E2E`, `Game Frame E2E`, `Clocktower Setup E2E`, `Clocktower Atmosphere E2E`, `Clocktower Theme E2E`, `Clocktower Show E2E`, `Most Likely E2E`, `Clocktower Game E2E`, `Clocktower Circle E2E`, `Clocktower Day Marks E2E`, `Feud Controls E2E`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Should `Clocktower Deal & Seat Actions` be split into smaller, more focused modules?**
  _Cohesion score 0.04608294930875576 - nodes in this community are weakly interconnected._