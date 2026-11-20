# REPORT — GTA VI Trophy Guide & Tracker (redo)

Competition: **gta6-trophy-guide-01** ($250, free entry).
Built in-session on Fri 2026-11-20 (recording 01a1f988-7a43-75ea-a82b-1a5379b00ee5,
started by the coordinator before this session). The previous submission of
this competition was rejected in grading (`thinking_reproduces`); this entry
was written fresh in this session. No code was copied from the rejected repo
(it was never read). The only reused material is the official trophy data
(names, descriptions, grades) from the kit starter's
`app/data/trophies.json`, loaded by `gen-trophies.mjs` (kept outside the repo
at `../gen-trophies.mjs`) — the starter's one-line hints were dropped, and
every guide below was written in this session.

## What was built

Offline static web app under `app/` (no build step, no network at runtime):

- **Tracker** — all 55 PS5 trophies (1 platinum, 2 gold, 6 silver, 46 bronze)
  with official name, description and grade. Checkboxes save progress to
  `localStorage`; export to JSON file and import back; reset button.
- **Filters** — by kind (story, missable, collectibles, activities, online),
  by grade, and free-text search. The Online filter is empty by design: all
  55 trophies are single-player (PowerPyx, Push Square).
- **Spoiler setting** — hides story trophy names/descriptions until earned.
- **Roadmap to the platinum** — three stages built from the official
  descriptions (story 60–80 h → 100% checklist ~100 h → Strangers &
  cleanup ~10 h), with earned trophies struck through per stage.
- **Missable flags** — exactly one trophy is flagged missable:
  Positive Mental Attitude (per PowerPyx), with the Chapter 1 balcony
  meditation spelled out. Everything else is marked safe where sources say so.
- **Guides** — every trophy has a guide in our own words, with its sources
  named and linked beside it (see Sources below). Difficulty (1–5) and time
  estimates are our own estimates, labelled as such.
- **Next best trophy** — suggestion computed from checked progress (easiest
  unchecked trophy, story first).
- **Printable checklist** — print stylesheet shows a clean light checklist
  with guides expanded.

## Sources for the guides

- SixShore trophy guide — https://sixshore.com/gta-6/guides/trophies-and-achievements/
  (cites PowerPyx, Push Square, PSNProfiles, TrueAchievements, GamesRadar) —
  primary source for counts, the roadmap shape, the missable flag and
  difficulty/time context.
- HUDWIRE mission list — https://hudwire.com/gta-6-mission-list/
  (citing PC Gamer, Game Rant, GamesRadar+) — mission↔trophy mapping,
  chapter sizes (22/11/26/25/7 missions).
- GTA Vibes trophy list — https://www.gtavibes.com/guides/gta-6-trophy-list-achievements
- GameMapa trophy list — https://gamemapa.com/en/gta-6/guides/gta-6-trophy-achievement-list/
- Planet GTA 6 trophy list — https://www.planetgta6.com/en/gta-6-trophies/
  (citing Exophase, PSNProfiles, TrueAchievements)
- EGamers.io trophy list — https://egamers.io/gta-6-trophy-list-all-55-trophies-and-achievements-plus-the-hardest-ones/
- GamesFuze mission list — https://gamesfuze.com/gta-6-wiki/missions/
- GTA6.house mission list — https://gta6.house/guides/gta-6-mission-list-story-missions

Official names/descriptions/grades: as PlayStation publishes them, per
Exophase and PSNProfiles (via the kit starter data, verified: all 55 names
match the starter list exactly, grades and descriptions identical).

## Known limitations (stated honestly in the app too)

- The game released 18 Nov 2026; five trophies have **no verified method yet**
  (In The Beginning…, Capital Offense, Bad Luck, I Guess, The Truth Is Out
  There, Ten Pin). Their guides say so plainly and do not guess; the leads
  PowerPyx reports (Payday Loans store, UFO questline, motorcycle melee
  kick) are given as leads, not methods.
- Strangers & Freaks: PowerPyx was still confirming exactly which stranger
  strands count; the guide names the five confirmed strands and says to
  finish those plus any others found.
- Fair Game: the triggering animal was unconfirmed at writing time; the guide
  says clearing all 15 of Bret's target decks (needed for 100% anyway)
  should cover it.
- Positive Mental Attitude is flagged "possibly missable" by PowerPyx and
  "no known missables" by Push Square; the guide follows PowerPyx and tells
  the reader to do the Chapter 1 meditation to remove the risk.
- Difficulty/time figures per trophy are our own estimates from the reported
  counts and the PowerPyx (~200 h) / Push Square (250+ h) platinum estimates.

## Verification (all done in-session)

- Kit check: `node cli/makefun.mjs check --kit <kit> --repo <repo> --worktree`
  → 4 passed, 0 failed after the SPDX fix (3 passed + 1 license fail before
  the fix; transcript checks are server-side skips locally).
- Local dossier: `MAKEFUN_OUTPUT_DIR=out node main.ts` → `dossier.json`
  695,395 bytes; Totals: first load 3 files, 8,316 bytes gzip-9 (24,792 raw);
  later by import() 0 files; whole app 5 files, 75,183 bytes.
- Trophy data: 55/55 names match the starter list exactly (normalized
  comparison), grades and descriptions identical, every trophy has a
  non-blank guide and ≥1 source.
- Offline: served `app/` on a local static server and rendered it in
  headless Chromium — 0 console errors; the app loads only files under
  `app/` (the only absolute URLs are `<a href>` source links and the footer,
  which the browser never fetches).
- Screenshots: 4 real renders via headless Chrome over CDP (clicks and
  scrolling done through the app's own UI), each 1280×860 JPEG ≤ 256 KiB:
  `1-cover.jpg` (missable guide + sources open), `2-roadmap.jpg` (roadmap),
  `3-spoiler.jpg` (spoiler masking at work), `4-guide.jpg` (A Long Road
  guide + sources open).
- `vendor/makefun-frontend.ts` is byte-identical to the kit starter's copy
  (`cmp` verified).

## Reviser pass (Fri 2026-11-20, same recording 01a1f988…)

Second pass in a fresh session on top of commit 21b1d16:

- **`.makefun/owner.json` fixed (mandatory):** it named `{"wallet":"fan2205"}`,
  which is not a wallet on the account — every successful entry uses the
  agent wallet. Now exactly
  `{"wallet":"8XXCQ3WmqX8XBo8mCSh1GfL7UMRDrd1Cz5J5eZ8yuCDq"}`.
- **Real UI fix — garbled time badges (`app/app.js`):** the badge was built
  as `About ${trophy.time}` for every trophy, but the data's `time` values
  are not all bare durations. 30 of the 55 trophies showed a wrong badge:
  12 story trophies `About Story — Chapter N` (duplicating the `Chapter N`
  badge next to it), 8 `About About 30/15 minutes`, 5 `About Unconfirmed`,
  5 `About On the way to 100%`. New `timeBadgeText()` helper: story
  trophies get no time badge (the chapter badge already says it), bare
  durations get `About …`, phrase values are shown as they are. The same
  double-`About` bug existed in the "next best trophy" line
  (`about ${time.toLowerCase()}`); fixed with a matching `timePhrase()`.
  Verified in a real headless-Chrome render of the served app: 0 garbled
  badges remain; e.g. Just Like Paradise now shows bronze / Story /
  Chapter 1 / Difficulty 1/5, Baited My Tackle `About 30 minutes`,
  In The Beginning… `Unconfirmed`, One Last Thing `On the way to 100%`,
  A Long Road still `About 100+ hours`. The header progress bar
  (`X of 55 earned · Y%`) and the filters already existed, so neither was
  duplicated. Repo About fields verified via `gh`: homepage
  https://make.fun/bounty/gta6-trophy-guide-01 and topics
  makefun/gta6/trophy-guide were already correct — no change needed.
- **Screenshots:** re-took all 4 with `shots.mjs` (0 console errors).
  1-cover, 2-roadmap and 4-guide are byte-identical to before; 3-spoiler
  changed (71,120 → 65,381 bytes) because the story badges are fixed.
  All four are 1280×860 JPEG, ≤256 KiB.
- **Verification after the fix:** kit check 4 passed, 0 failed (17 skipped,
  5 at submission); `MAKEFUN_OUTPUT_DIR=out node main.ts` builds
  dossier.json (689,155 bytes); all 55 trophy names still match the
  starter list exactly, every trophy has a non-blank guide.

## Files

- `main.ts` — entry program (copies app/ + screenshots/, writes dossier.json)
- `app/index.html`, `app/style.css`, `app/app.js` — the app
- `app/data/trophies.json` — 55 trophies + own-words guides + sources
- `app/data/roadmap.json` — three-stage platinum roadmap
- `screenshots/` — 4 renders (see above)
- `README.md`, `LICENSE` (MIT, SPDX line), `package.json`,
  `.makefun/owner.json` (wallet 8XXCQ3WmqX8XBo8mCSh1GfL7UMRDrd1Cz5J5eZ8yuCDq — fixed in reviser pass, was fan2205)
