// Leonida Trophy Guide — tracker logic. Static data only: app/data/trophies.json
// (the 55 official trophies plus our own guides) and app/data/roadmap.json.
// Progress lives in localStorage; nothing is fetched from the network.

const TROPHIES_URL = 'data/trophies.json';
const ROADMAP_URL = 'data/roadmap.json';
const PROGRESS_KEY = 'gta6-trophy-progress-v1';
const SPOILER_KEY = 'gta6-trophy-spoiler-v1';

const KIND_LABELS = {
  all: 'All kinds',
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
};

const state = {
  trophies: [],
  roadmap: null,
  earned: new Set(),
  spoiler: false,
  kind: 'all',
  grade: 'all',
  query: '',
  openGuides: new Set(),
};

/** Load the trophy list and the roadmap from app/data/. */
async function loadTrophyData() {
  const [trophyRes, roadmapRes] = await Promise.all([fetch(TROPHIES_URL), fetch(ROADMAP_URL)]);
  const trophyDoc = await trophyRes.json();
  state.trophies = trophyDoc.trophies;
  state.roadmap = await roadmapRes.json();
}

/** Read the saved earned set from localStorage (empty when nothing is saved). */
function loadSavedProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return;
    const ids = JSON.parse(raw);
    if (Array.isArray(ids)) state.earned = new Set(ids.filter((id) => state.trophies.some((t) => t.id === id)));
  } catch {
    state.earned = new Set();
  }
}

/** Persist the earned set to localStorage. */
function saveProgress() {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...state.earned].sort()));
  const note = document.getElementById('savedNote');
  note.textContent = 'Progress saved';
  window.clearTimeout(saveProgress.timer);
  saveProgress.timer = window.setTimeout(() => { note.textContent = ''; }, 2000);
}

/** Read the saved spoiler preference, overridden by a ?spoiler=on deep link. */
function loadSpoilerPreference(params) {
  if (params.get('spoiler') === 'on') { state.spoiler = true; return; }
  if (params.get('spoiler') === 'off') { state.spoiler = false; return; }
  state.spoiler = localStorage.getItem(SPOILER_KEY) === '1';
}

/** Apply ?kind= and ?open= deep links (view state, not saved progress). */
function applyDeepLinks(params) {
  const kind = params.get('kind');
  if (kind && Object.hasOwn(KIND_LABELS, kind)) state.kind = kind;
  const open = params.get('open');
  if (open && state.trophies.some((t) => t.id === open)) state.openGuides.add(open);
}

/** Whether a trophy's name and description stay hidden behind the spoiler setting. */
function isSpoilerHidden(trophy) {
  return state.spoiler && trophy.kind === 'story' && !state.earned.has(trophy.id);
}

/** Render the progress bar and the "X of 55 earned" line. */
function renderProgress() {
  const earned = state.earned.size;
  const total = state.trophies.length;
  const pct = total ? Math.round((earned / total) * 100) : 0;
  document.getElementById('progressFill').style.width = `${pct}%`;
  document.getElementById('progressText').textContent =
    `${earned} of ${total} earned · ${pct}% · ${total - earned} to go`;
}

/** Pick the next best trophy: easiest unchecked one, story first, then by difficulty. */
function pickNextBestTrophy() {
  const remaining = state.trophies.filter((t) => t.id !== 'vice-got-a-price' && !state.earned.has(t.id));
  if (remaining.length === 0) return null;
  const stageOf = (t) => (t.kind === 'story' ? 0 : t.kind === 'collectibles' ? 1 : 2);
  remaining.sort((a, b) => stageOf(a) - stageOf(b) || a.difficulty - b.difficulty || a.name.localeCompare(b.name));
  return remaining[0];
}

/** Render the "next best trophy" suggestion from the checked progress. */
function renderNextBest() {
  const box = document.getElementById('nextBest');
  if (state.earned.size === state.trophies.length && state.trophies.length > 0) {
    box.innerHTML = '<h2>Next best trophy</h2><p><span class="next-name">Vice Got a Price!</span> — every other trophy is earned. The platinum is yours.</p>';
    return;
  }
  const next = pickNextBestTrophy();
  if (!next) { box.innerHTML = ''; return; }
  const why = next.kind === 'story'
    ? 'the next story trophy in order — play the story and it comes to you.'
    : `difficulty ${next.difficulty} of 5, about ${next.time.toLowerCase()} — the easiest thing left on your list.`;
  box.innerHTML = `<h2>Next best trophy</h2><p><span class="next-name"></span> — ${why}</p>`;
  box.querySelector('.next-name').textContent = next.name;
}

/** Render the three-stage roadmap to the platinum, marking earned trophies. */
function renderRoadmap() {
  const box = document.getElementById('roadmap');
  const byId = new Map(state.trophies.map((t) => [t.id, t]));
  const stages = state.roadmap.stages.map((stage) => {
    const chips = stage.trophies.map((id) => {
      const t = byId.get(id);
      if (!t) return '';
      const done = state.earned.has(id) ? ' class="done"' : '';
      return `<li${done}>${escapeHtml(t.name)}</li>`;
    }).join('');
    return `<article class="stage"><h3>Stage ${stage.stage}: ${escapeHtml(stage.name)} <span class="stage-time">${escapeHtml(stage.time)}</span></h3><p>${escapeHtml(stage.text)}</p><ul class="chips">${chips}</ul></article>`;
  }).join('');
  box.innerHTML = `<h2>${escapeHtml(state.roadmap.title)}</h2><p class="summary">${escapeHtml(state.roadmap.summary)}</p>${stages}`;
}

/** The trophies matching the current kind, grade and search filters. */
function filteredTrophies() {
  const q = state.query.trim().toLowerCase();
  return state.trophies.filter((t) => {
    if (state.kind === 'missable' && !t.missable) return false;
    if (state.kind === 'online') return false;
    if (state.kind !== 'all' && state.kind !== 'missable' && t.kind !== state.kind) return false;
    if (state.grade !== 'all' && t.grade !== state.grade) return false;
    if (q && !(t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(q)) return false;
    return true;
  });
}

/** One trophy card: checkbox, badges, guide with its sources. */
function trophyCard(trophy) {
  const li = document.createElement('li');
  li.className = 'trophy' + (state.earned.has(trophy.id) ? ' earned' : '');
  const hidden = isSpoilerHidden(trophy);
  const name = hidden ? '<span class="spoiler-mask">Story trophy — hidden until earned</span>' : escapeHtml(trophy.name);
  const desc = hidden ? 'Complete the story to reveal this trophy.' : escapeHtml(trophy.description);
  const missable = trophy.missable ? '<span class="badge missable">Missable — see guide</span>' : '';
  const count = trophy.count !== undefined ? `<span class="badge meta">Target: ${formatCount(trophy)}</span>` : '';
  const chapter = trophy.chapter !== undefined ? `<span class="badge meta">Chapter ${trophy.chapter}</span>` : '';
  const open = state.openGuides.has(trophy.id);
  const sources = trophy.sources.map((s) => `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.name)}</a>`).join(' · ');
  const unconfirmed = trophy.time === 'Unconfirmed'
    ? '<p class="unconfirmed">Not yet confirmed by any source — this guide will not guess the method.</p>' : '';
  li.innerHTML = `
    <div class="trophy-head">
      <input type="checkbox" aria-label="Mark ${escapeHtml(trophy.name)} as earned">
      <div class="trophy-title">
        <h3>${name}</h3>
        <p class="trophy-desc">${desc}</p>
        <div class="badges">
          <span class="badge ${trophy.grade}">${trophy.grade}</span>
          <span class="badge kind">${KIND_LABELS[trophy.kind] ?? trophy.kind}</span>
          ${missable}${count}${chapter}
          <span class="badge meta">Difficulty ${trophy.difficulty}/5</span>
          <span class="badge meta">About ${escapeHtml(trophy.time)}</span>
        </div>
        <button type="button" class="guide-toggle" aria-expanded="${open}">${open ? 'Hide guide' : 'Show guide'}</button>
        <div class="guide"${open ? '' : ' hidden'}>
          ${unconfirmed}
          <p></p>
          <p class="sources"><strong>Sources:</strong> ${sources}</p>
        </div>
      </div>
    </div>`;
  const checkbox = li.querySelector('input[type="checkbox"]');
  checkbox.checked = state.earned.has(trophy.id);
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) state.earned.add(trophy.id); else state.earned.delete(trophy.id);
    saveProgress();
    renderAll();
  });
  li.querySelector('.guide p').textContent = trophy.guide;
  li.querySelector('.guide-toggle').addEventListener('click', (event) => {
    const guide = li.querySelector('.guide');
    const willOpen = guide.hidden;
    guide.hidden = !willOpen;
    event.currentTarget.textContent = willOpen ? 'Hide guide' : 'Show guide';
    event.currentTarget.setAttribute('aria-expanded', String(willOpen));
    if (willOpen) state.openGuides.add(trophy.id); else state.openGuides.delete(trophy.id);
  });
  return li;
}

/** Render the filtered trophy list and the count line above it. */
function renderTrophyList() {
  const list = document.getElementById('trophyList');
  const matches = filteredTrophies();
  list.replaceChildren(...matches.map(trophyCard));
  document.getElementById('emptyState').hidden = matches.length > 0;
  const note = document.getElementById('listNote');
  if (state.kind === 'online') {
    note.textContent = 'No online trophies — all 55 are single-player, so this filter is empty by design (PowerPyx, Push Square).';
  } else {
    const earnedShown = matches.filter((t) => state.earned.has(t.id)).length;
    note.textContent = `Showing ${matches.length} of ${state.trophies.length} trophies · ${earnedShown} earned in this view.`;
  }
}

/** Render the kind filter buttons with their pressed state. */
function renderKindFilters() {
  const box = document.getElementById('kindFilters');
  box.replaceChildren(...Object.entries(KIND_LABELS).map(([kind, label]) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label;
    btn.setAttribute('aria-pressed', String(state.kind === kind));
    btn.addEventListener('click', () => { state.kind = kind; renderAll(); });
    return btn;
  }));
}

/** Download the earned trophy ids as a JSON file. */
function exportProgress() {
  const blob = new Blob([JSON.stringify({ earned: [...state.earned].sort(), exported: new Date().toISOString() }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

/** Import progress from a JSON file the reader picks (same shape as export). */
function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const doc = JSON.parse(String(reader.result));
      const ids = Array.isArray(doc) ? doc : doc.earned;
      if (!Array.isArray(ids)) throw new Error('no earned list');
      const known = new Set(state.trophies.map((t) => t.id));
      state.earned = new Set(ids.filter((id) => known.has(id)));
      saveProgress();
      renderAll();
    } catch {
      document.getElementById('savedNote').textContent = 'That file is not a progress export.';
    }
  };
  reader.readAsText(file);
}

/** Format a trophy's target count for its badge. */
function formatCount(trophy) {
  if (trophy.count >= 1000) return `$${trophy.count.toLocaleString('en-US')}`;
  return String(trophy.count);
}

/** Escape text for insertion into HTML. */
function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** Re-render progress, next-best, roadmap and list after any state change. */
function renderAll() {
  renderProgress();
  renderNextBest();
  renderRoadmap();
  renderKindFilters();
  renderTrophyList();
}

/** Wire the controls, load the data and render the app. */
async function initGuide() {
  const params = new URLSearchParams(location.search);
  await loadTrophyData();
  loadSavedProgress();
  loadSpoilerPreference(params);
  applyDeepLinks(params);
  document.getElementById('spoiler').checked = state.spoiler;
  document.getElementById('grade').value = state.grade;
  document.getElementById('search').addEventListener('input', (e) => { state.query = e.target.value; renderTrophyList(); });
  document.getElementById('grade').addEventListener('change', (e) => { state.grade = e.target.value; renderTrophyList(); });
  document.getElementById('spoiler').addEventListener('change', (e) => {
    state.spoiler = e.target.checked;
    localStorage.setItem(SPOILER_KEY, state.spoiler ? '1' : '0');
    renderTrophyList();
  });
  document.getElementById('exportBtn').addEventListener('click', exportProgress);
  document.getElementById('importFile').addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) importProgress(e.target.files[0]);
    e.target.value = '';
  });
  document.getElementById('printBtn').addEventListener('click', () => window.print());
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (window.confirm('Clear all checked trophies?')) {
      state.earned.clear();
      saveProgress();
      renderAll();
    }
  });
  renderAll();
}

initGuide();
