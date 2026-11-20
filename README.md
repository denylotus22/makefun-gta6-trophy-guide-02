# GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/denylotus22/makefun-gta6-trophy-guide-02/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/denylotus22/makefun-gta6-trophy-guide-02/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand
Theft Auto VI (1 platinum, 2 gold, 6 silver, 46 bronze) — built for the
[make.fun bounty](https://make.fun/bounty/gta6-trophy-guide-01).

## What it does

- **Checklist tracker** — every trophy with its official name, description
  and grade as PlayStation publishes them. Tick trophies off; progress is
  saved in the browser (`localStorage`) and can be **exported to a file and
  imported back**.
- **Filters** — by kind (story, missable, collectibles, activities, online),
  by grade, and by free-text search.
- **Spoiler setting** — hides the names and descriptions of story trophies
  until you earn them.
- **Roadmap to the platinum** — three stages built from the official
  descriptions: story first, then the 100% completion checklist, then
  Strangers & Freaks and cleanup. About 200 hours by PowerPyx's estimate,
  250+ by Push Square's.
- **Missable flags** — the one trophy that may be missable
  (**Positive Mental Attitude**, per PowerPyx) is flagged with exactly what
  to do in Chapter 1; everything else is marked safe where the sources say so.
- **A guide for every trophy, in our own words, with its sources named**
  beside it — PowerPyx, Push Square, PSNProfiles, TrueAchievements,
  GamesRadar and others, via the write-ups that cite them. Where a trigger
  is not pinned down yet, the guide says so plainly instead of guessing.
- **Next best trophy** — a suggestion based on your checked progress.
- **Printable checklist** — a clean print view of what you still need.

## Offline

The app is static files under `app/` with no build step. Serve `app/` with
any static HTTP server and open `index.html`; it works with the network off
and loads nothing from outside `app/`. No Rockstar logo or official artwork
is used — the look is our own.

## Files

- `app/index.html`, `app/style.css`, `app/app.js` — the app.
- `app/data/trophies.json` — the 55 official trophies (name, description,
  grade) plus a guide, sources, kind, missable flag and difficulty/time
  estimate for each, written for this entry.
- `app/data/roadmap.json` — the three-stage platinum roadmap.
- `screenshots/` — renders of the running app.
- `main.ts` — the entry program: copies `app/` and `screenshots/` to
  `/output` and writes `dossier.json` with `vendor/makefun-frontend.ts`.

## Sources

The official trophy names, descriptions and grades are as PlayStation
publishes them, as listed by Exophase and PSNProfiles and cross-checked by
the guide sites below. Guide facts are drawn from, and cited to:

- PowerPyx — GTA 6 trophy guide & roadmap (via SixShore's cited round-up)
- Push Square — GTA 6 trophy guide
- PSNProfiles / TrueTrophies / TrueAchievements — trophy counts and values
- GamesRadar+ — full trophy list
- PC Gamer / Game Rant — mission list by chapter (via HUDWIRE, GTA6.house)

Per-trophy source links live in `app/data/trophies.json` and are shown
beside each guide in the app.

## License

MIT — see [LICENSE](LICENSE).
