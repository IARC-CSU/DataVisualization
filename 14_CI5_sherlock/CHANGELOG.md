# Changelog

All notable changes to CI5 sherlock. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); this project does not yet use semantic versioning — entries are dated.

## [Unreleased]

## 2026-04-20 (JSON-driven site, image-led findings)

### Changed
- **Architecture overhaul.** The website is no longer derived from `reports/*.md`; it now reads JSON files under `findings/` directly via `fetch()`. One file per cancer (`findings/cancers/NN_label.json`) plus one all-sites overview (`findings/index.json`) plus a small `findings/manifest.json` that lists which cancers exist. The JSON files are the source of truth — edit them by hand. See `findings/README.md` for the schema.
- **Findings are now image-led, not chart-led.** Each finding has an `image_url` field that points at a PNG (saved manually from the CI5 2.0 Downloads tab). When `image_url` is empty the site renders a striped "No image yet — Open on CI5 2.0 →" placeholder that links to the same chart. The d3 line vignettes (`charts.js`, `data.js`) and the d3.js CDN are gone.
- **Site loads via `fetch()`** — no longer works on `file://`. Run `cd "C:/project/CI5 sherlock" && python -m http.server 8765` and open `http://127.0.0.1:8765/site/index.html`. This trade was made deliberately so each finding's JSON is independently editable / diffable / visible in the browser, and to make hosting on a static web server (GitHub Pages, Netlify, etc.) trivial when shared with colleagues.
- `findings/cancers/NN_label.json` schema: `{code, label, icd10, slug, quick_take, sections: [{heading, intro, findings: [{id, title, text, image_url, image_alt, ci5_url, extra_links}]}]}`. Text supports inline markdown (`**bold**`, `*italic*`, `[text](url)`).
- `findings/index.json` schema: same shape, but each finding has `cancer_codes: [NN, ...]` and `ci5_urls: [{cancer_code, cancer_label, sex, url}, ...]` so multi-cancer entries (e.g. A.9 lip/oral + cervix + oesophagus) get one IACR button per referenced cancer.
- "See `NN_slug.md`" cross-references in prose are now rewritten to clickable internal links (`cancer.html#code=NN`) at migration time.

### Added
- `scripts/05_md_to_json.R` — one-shot migration that reads `reports/*.md` + `reports/README.md` and emits the `findings/` tree. After the first run the markdown files are kept as a backup but the JSON is authoritative.
- `findings/README.md` — schema reference and "how to add an image / a finding / a cancer" instructions for non-technical editors.
- "Cancer not found" page now updates `document.title` (no more stale tab label after a bad hash).

### Removed
- `site/data.js` and `site/js/charts.js` — the old monolithic d3-vignette bundle is gone.
- `scripts/04_build_site.R` — kept as a dead stub that errors out with a pointer to `05_md_to_json.R`. The script's responsibility (bundling MD into a single `data.js`) no longer exists.

### How to add a PNG image
1. Click the orange **"Open this chart on CI5 2.0 →"** button on any finding.
2. On the IACR page, click the **Downloads** tab → **PNG** button. (PNG URLs are client-side `blob:` URLs — they cannot be hot-linked, so the manual save step is unavoidable.)
3. Save the file under `site/img/<cancer-slug>/<finding-id>.png`.
4. Edit the finding's `image_url` field to that relative path.
5. Refresh the page.

## 2026-04-20 (index page now bullet-driven)

### Changed
- **Index page rebuilt around the same per-bullet vignette pattern as the per-cancer pages.** The 10 hand-curated spotlights are gone; instead, every bullet of `reports/README.md` (sections A–D plus the trailing notes) becomes a story = bullet text + auto-matched vignette + "Open this chart on CI5 2.0 (N populations) →".
- New helper `extract_bullet_cancer_codes()` parses `[NN_slug.md]` links inside each README bullet. For multi-cancer bullets (e.g. A.9 references lip/oral + cervix + oesophagus), one vignette per referenced cancer is rendered as a vertical stack with a small cancer-name header above each.
- `parse_findings()` now also handles numbered lists (`1.` / `10.` style), not just `- ` bullets.
- `index` JSON shape: `{markdown_html, spotlights}` → `{intro_html, findings: [{heading, intro_html, bullets: [{text_html, cancers: [{code, label, registries, combined_iacr_url, sex}]}]}]}`.
- Auto-matcher: added a blocklist of generic single-word distinctives (`East`, `West`, `North`, `South`, `Central`, `White`, `Black`, etc.) so prose like "East Asia" no longer false-matches `Switzerland, East` or `England, East`.

## 2026-04-20 (per-bullet vignettes)

### Changed
- **Per-cancer pages now render every bullet of the report as its own story** — text + vignette + CI5 2.0 link — instead of a single "Headline trends" section followed by the whole markdown body. The "Headline trends" section is removed.
- `04_build_site.R` parses each `reports/NN_*.md` into sections of bullets and auto-matches registries to each bullet by searching the bullet text for the registry's distinctive name (last comma-separated chunk of `id_label`, normalised by stripping `:` and generic suffixes like "City"/"County"/"Province"). Word-boundary regex avoids false positives like "Chile" matching "Chilean". Country-aggregate ids (no comma in `id_label`) are dropped when a more-specific city of the same country also matches the bullet.
- Sex per bullet is inferred from explicit "women"/"men" tokens in the prose, with a per-cancer default (sex-specific cancers force their sex; non-sex-specific default to `0` = combined for the IACR URL).
- Bullets where no registries match still render as text. The "Bimodal age curves absent" / pure-hypothesis caveats render text-only without a vignette, which is the desired behaviour.
- `per_cancer["NN"]` JSON shape replaced: `{markdown_html, hero}` → `{findings: [{heading, intro_html, bullets: [{text_html, sex, registries, combined_iacr_url}]}]}`. `markdown_html` and `hero` removed.

## 2026-04-20 (storytelling rework)

### Changed
- **Per-registry card grid replaced with one vignette per finding.** Every spotlight on the index page and every per-cancer hero panel now renders as a `<article class="story">` — the text of the finding (rank, title, subtitle) on top, then a single multi-line d3 chart with all registries plotted together, an under-chart legend, and the "Open this chart on CI5 2.0 (N populations)" button. Reads like a series of mini-stories instead of a dense card grid.
- Per-registry deep-link cards removed; the only IACR link per finding is now the combined multi-population URL. Single-population findings still get a single line on the chart and a "Open this chart on CI5 2.0 →" button (without "(N populations)" suffix).
- Trimmed `style.css` of the orphaned `.reg-card`, `.reg-grid`, `.spot`, `.spot-grid`, `.chart-card`, `.hero-line`, `.hero-card` rules left over from the previous two iterations.

## 2026-04-20 (latest)

### Added
- **Combined "Open all N on one CI5 2.0 chart →" link** on every spotlight and per-cancer hero panel, opening every registry of that finding on a single multi-population IACR chart. Discovered the IACR SPA accepts multi-population via underscore-separated id_codes (`populations=ID1_ID2_...`) plus a `sexes=0|1|2` parameter — earlier comma / repeated-key attempts silently reset to defaults, which is why I had previously concluded multi-pop links were not supported.

### Changed
- `iacr_url(code, ids, sex)` in `04_build_site.R` now accepts a vector of `ids` and a sex code, producing the underscore-joined / `sexes=` URL.
- `make_spotlight()` and `hero_panel()` emit `combined_iacr_url` alongside the per-registry URLs.
- `app.js` renders the combined link as an accent-coloured pill above each card grid.

## 2026-04-20 (later)

### Changed
- **Site UX redesigned around link-throughs to the official IACR CI5 2.0 dataviz.** The big inline d3 line charts are replaced by a grid of small **registry cards** — each card shows a tiny sparkline preview + registry label + first→last ASR + shape tag + percent change, and the whole card is a link that opens the official trend chart for that registry on `https://www.the-iacr.net/en/ci5-2.0/dataviz/all/trends_volumes`. Same data, but the IACR site is now the destination for exploration. The d3 sparkline is just a preview.
- `04_build_site.R` now emits an `iacr_url` for every registry in spotlights and per-cancer hero panels, using the URL scheme `?mode=population&multiple_populations=1&cancers=NN&populations=ID`. The IACR SPA only accepts one population per URL, so multi-population deep links are not possible — each registry gets its own card.
- `app.js` rewritten: hero charts and spotlight composites are gone; everything renders through one `registryCardHtml()` helper.
- CSS: new `.reg-card` / `.reg-grid` rules for the card grid; old `.spot .spark` and `.hero-card` rules retired.

## 2026-04-20

### Added
- **Public-facing static site** under `site/` (d3.js v7, no build step). Two entry points:
  - `site/index.html` — overview with 10 curated spotlight cards (sparklines for the A.1–A.10 findings in `reports/README.md`) plus the rendered cross-site README.
  - `site/cancer.html#code=NN` — per-cancer page; hero ASR-over-volume line chart (one panel per sex unless sex-specific) + the rendered per-cancer report.
- **Sidebar nav** lists all 34 site-level cancers (codes 1–56, excluding 62/63 all-sites aggregates), with active-page highlighting.
- **`scripts/04_build_site.R`** — generator that reads `cache/asr.rds` + `reports/*.md` and writes `site/data.js` (a `window.CI5 = {…}` payload). Re-run after editing any report.
- `site/README.md` documenting the directory layout and preview command (`python -m http.server`).
- This `CHANGELOG.md`.
- CLAUDE.md section describing the static site, its derivation rules, and the d3 CDN dependency.

### Fixed
- **Chart series mixed cancers** (critical): `series_for(id, sex)` in `04_build_site.R` did not filter by `cancer_code`, so each registry line plotted every cancer's ASR for that registry stacked together. All trend lines were nonsense (Iceland stomach showed 281 ASR in vol XII instead of 5.1; Daegu thyroid showed 273 instead of 87). Fixed by threading `code` through `series_for` → `make_registry` → `make_spotlight` / `hero_panel`. `data.js` size dropped 1.3 MB → 182 KB after the rebuild.
- **README markdown links 404'd** when clicked from the rendered overview — `[32_cervix_uteri.md](32_cervix_uteri.md)` was passed through verbatim by commonmark. Added a `rewrite_md_links()` step that turns `(NN_slug.md)` into `(cancer.html#code=NN)` before HTML rendering.
- **Spotlight registry resolution**: 5 of 10 spotlights initially failed to find their registries because of wrong `ethnic_code` constants or over-strict regex patterns. Corrected lookups for Harbin Nangang, Zimbabwe Harare African (ethnic 70), Israel Jews (ethnic 90), NZ Pacific peoples (ethnic 29), Hawaii Japanese (ethnic 21).
- **`lineChart` global collision**: `charts.js` declared `function lineChart` at top level which conflicted with `app.js`'s `const { lineChart } = window.CI5_CHART` destructuring. Wrapped `charts.js` in an IIFE so only `window.CI5_CHART` leaks to global scope.
- **Per-cancer markdown lookup** mismatched padded vs. unpadded cancer codes (`md_by_code["1"]` vs. lookup with `"01"`). Switched the map keys to the file's two-digit prefix.
- **Spotlight sparklines unreadable**: 90 px container ran the full axis/legend rendering path. Switched spotlights to true sparkline mode (no axes, no internal legend) and moved the registry legend to a coloured-swatch list under each card.
