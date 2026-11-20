// GTA VI trophy guide — entry program (Node 22, standard library only).
//
// The guide itself is plain static files under app/ (index.html, style.css,
// app.js and app/data/trophies.json): no build step, no network at run time.
// This program hands the entry in: it copies app/ and screenshots/ from
// beside this file into the output directory and writes
// /output/dossier.json with the vendored make.fun library, so the judge can
// read the screenshots, the first-load sizes and the source.
//
// vendor/makefun-frontend.ts is the kit's copy, unchanged: the scorer
// rebuilds the dossier with its own copy and requires the two to match
// byte for byte.
//
// Local check:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the app itself with any static server rooted at app/.
// The program is deterministic: two runs over the same tree write the same
// bytes, which the grader checks.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The caps mirror the scorer's gate (reference/gate.json): only
// text_max_bytes shapes the dossier's bytes; the rest refuse an entry the
// scorer would refuse anyway (more than 4 screenshots or one over 256 KiB;
// app/ over 993 files and directories or 48 MiB).
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
