// CI5 sherlock site — JSON-driven, image-based.
// Loads findings/manifest.json + findings/index.json (or per-cancer file)
// and renders each finding as an image-led story with a CI5 2.0 link.

const FINDINGS_BASE = "../findings";  // findings/ sits next to site/

function escapeHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  }[c]));
}

// Inline minimal markdown: **bold**, *italic*, [text](url), \n\n -> paragraph break.
function renderInline(s) {
  if (s == null) return "";
  let h = escapeHtml(s);
  h = h.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  h = h.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  h = h.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
    (m, text, url) => `<a href="${url}" target="_blank" rel="noopener">${text}</a>`);
  return h;
}
function renderProse(s) {
  if (s == null || !s.length) return "";
  return s.split(/\n\s*\n/).map(p => `<p>${renderInline(p.trim())}</p>`).join("");
}

async function loadJSON(path) {
  const r = await fetch(path, { cache: "no-cache" });
  if (!r.ok) throw new Error(`fetch ${path}: ${r.status}`);
  return r.json();
}

let _manifest = null;
async function manifest() {
  if (!_manifest) _manifest = await loadJSON(`${FINDINGS_BASE}/manifest.json`);
  return _manifest;
}

function renderNav(activeCode, cancers) {
  const nav = document.getElementById("nav");
  if (!nav) return;
  const items = cancers.map(c =>
    `<li><a href="cancer.html#code=${c.code}" class="${c.code == activeCode ? "active" : ""}">${escapeHtml(c.label)}</a></li>`
  ).join("");
  nav.innerHTML = `
    <h1>CI5 sherlock</h1>
    <div class="tagline">Patterns in five continents</div>
    <div class="sec">Overview</div>
    <ul><li><a href="index.html" class="${activeCode === "_index" ? "active" : ""}">All-sites overview</a></li></ul>
    <div class="sec">Per cancer</div>
    <ul>${items}</ul>
  `;
}

// Image cell — an <img> tag if image_url is set, otherwise nothing.
// When empty, the caller should add a `no-image` class to collapse the card to one column.
function imageCell(image_url, image_alt, fallback_url) {
  if (!image_url || !image_url.length) return "";
  const inner = `<img src="${escapeHtml(image_url)}" alt="${escapeHtml(image_alt || "")}" loading="lazy">`;
  return fallback_url
    ? `<a class="finding-image" href="${escapeHtml(fallback_url)}" target="_blank" rel="noopener">${inner}</a>`
    : `<div class="finding-image">${inner}</div>`;
}

function ci5Button(url, label) {
  if (!url) return "";
  return `<a class="ci5-link" href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(label || "Open on CI5 2.0 →")}</a>`;
}

function extraLinksHtml(links) {
  if (!links || !links.length) return "";
  return `<ul class="extra-links">${links.map(l =>
    `<li><a href="${escapeHtml(l.url)}" target="_blank" rel="noopener">${escapeHtml(l.label || l.url)}</a></li>`
  ).join("")}</ul>`;
}

// Per-cancer finding card.
function findingCardCancer(f) {
  const hasImage = !!(f.image_url && f.image_url.length);
  return `
    <article class="story story-finding${hasImage ? "" : " no-image"}">
      <div class="story-text">
        ${f.title ? `<h3>${escapeHtml(f.title)}</h3>` : ""}
        ${renderProse(f.text)}
        ${ci5Button(f.ci5_url, "Open this chart on CI5 2.0 →")}
        ${extraLinksHtml(f.extra_links)}
      </div>
      ${imageCell(f.image_url, f.image_alt, f.ci5_url)}
    </article>
  `;
}

// Index finding card — may have multiple ci5_urls (one per referenced cancer).
function findingCardIndex(f) {
  const hasImage = !!(f.image_url && f.image_url.length);
  const buttons = (f.ci5_urls || []).map(c =>
    ci5Button(c.url, `${c.cancer_label} on CI5 2.0 →`)
  ).join(" ");
  return `
    <article class="story story-finding${hasImage ? "" : " no-image"}">
      <div class="story-text">
        ${f.title ? `<h3>${escapeHtml(f.title)}</h3>` : ""}
        ${renderProse(f.text)}
        <div class="ci5-buttons">${buttons}</div>
        ${extraLinksHtml(f.extra_links)}
      </div>
      ${imageCell(f.image_url, f.image_alt, (f.ci5_urls && f.ci5_urls[0] && f.ci5_urls[0].url) || null)}
    </article>
  `;
}

function sectionHtml(sec, cardFn) {
  const intro = sec.intro && sec.intro.length
    ? `<div class="section-intro">${renderProse(sec.intro)}</div>` : "";
  const cards = (sec.findings || []).map(cardFn).join("");
  return `
    <section class="section findings">
      <h2>${escapeHtml(sec.heading)}</h2>
      ${intro}
      <div class="story-list one-col">${cards}</div>
    </section>
  `;
}

async function renderIndex() {
  let m, idx;
  try {
    m = await manifest();
    idx = await loadJSON(`${FINDINGS_BASE}/index.json`);
  } catch (e) {
    document.getElementById("main").innerHTML = errorBlock(e);
    return;
  }
  renderNav("_index", m.cancers);
  document.title = "CI5 sherlock — overview";
  const sections = (idx.sections || []).map(s => sectionHtml(s, findingCardIndex)).join("");
  document.getElementById("main").innerHTML = `
    <header>
      <h1>CI5 sherlock</h1>
      <div class="meta">Cancer Incidence in Five Continents · vols I–XII (~1953–2017) · 35 sites · hundreds of registries</div>
    </header>
    <div class="lede-block">${renderProse(idx.intro || "")}</div>
    ${sections}
    <footer>
      Source: <code>C:\\Data\\CI5_all\\summary</code> · ASR per 100 000 person-years (Segi-Doll world standard) · Each finding's image is sourced from the CI5 2.0 download tab; the link opens the same view on the official IACR dataviz.
    </footer>
  `;
}

async function renderCancer() {
  const params = new URLSearchParams(location.hash.slice(1));
  const code = parseInt(params.get("code"), 10);
  let m;
  try { m = await manifest(); }
  catch (e) { document.getElementById("main").innerHTML = errorBlock(e); return; }

  const meta = m.cancers.find(c => c.code === code);
  if (!meta) {
    document.title = "Cancer not found — CI5 sherlock";
    renderNav(code, m.cancers);
    document.getElementById("main").innerHTML = `
      <header><h1>Cancer not found</h1>
      <p class="lede">No report for cancer code ${escapeHtml(String(code))}. Pick one from the sidebar.</p>
      </header>`;
    return;
  }

  let c;
  try { c = await loadJSON(`${FINDINGS_BASE}/cancers/${meta.file}`); }
  catch (e) { document.getElementById("main").innerHTML = errorBlock(e); return; }

  renderNav(code, m.cancers);
  document.title = `${c.label} — CI5 sherlock`;
  const sections = (c.sections || []).map(s => sectionHtml(s, findingCardCancer)).join("");
  document.getElementById("main").innerHTML = `
    <header>
      <h1>${escapeHtml(c.label)}</h1>
      <div class="meta">Code ${c.code} · ${escapeHtml(c.icd10 || "")}</div>
      ${c.quick_take ? `<p class="lede">${renderInline(c.quick_take)}</p>` : ""}
    </header>
    ${sections || "<p>No findings.</p>"}
    <footer>
      Cancer Incidence in Five Continents · code ${c.code} · ASR per 100 000 person-years (Segi-Doll world). Each finding's image is sourced from the CI5 2.0 download tab; the link opens the same view on the official IACR dataviz.
    </footer>
  `;
}

function errorBlock(e) {
  return `
    <header><h1>Could not load findings</h1></header>
    <div class="caveat-box">
      <strong>Error:</strong> ${escapeHtml(e.message || String(e))}
      <p style="margin-top:8px;">If you opened this file directly with <code>file://</code>, browsers block <code>fetch()</code> on local files.
      Run a tiny static server first: <code>cd site &amp;&amp; python -m http.server 8765</code> then open <code>http://localhost:8765/index.html</code>.</p>
    </div>`;
}

window.CI5_APP = { renderIndex, renderCancer };
