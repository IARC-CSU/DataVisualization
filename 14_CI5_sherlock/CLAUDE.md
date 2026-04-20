# CI5 sherlock

Pattern-hunting investigation of the CI5 (Cancer Incidence in Five Continents) data — volumes I through XII, 35 cancer sites, hundreds of registries, ~1953 to 2017. The goal is to surface *interesting* temporal or spatial evolutions (à la the U-shape in Shanghai cervix cancer) that could motivate articles or public-facing highlights.

This is an exploratory workspace — a **sherlock**, not a confirmatory analysis. Findings go into per-cancer markdown reports in `reports/`.

## Data location

All inputs live under `C:\Data\CI5_all\summary\` (read-only — never modify):

| File | Rows | What it contains |
|---|---|---|
| `data.csv` | 3.84 M | Age-specific cases & person-years. Columns: `id_code, CI5_volume, sex, cancer_code, age, cases, py`. `age` is a 1–19 band (1 = 0–4 yrs … 18 = 85+). |
| `data_asr.csv` | 202 k | Age-standardized rates (world standard). Columns: `sex, id_code, cancer_code, CI5_volume, cases, py, asr`. **Use this for cross-registry / cross-volume comparisons.** |
| `id_dict.csv` | 844 | Registry dictionary. `id_code, country_code, registry_code, ethnic_code, id_label` + `CI5_01…CI5_12` giving the calendar-year span each registry contributed to each volume (NA if absent). |
| `cancer_dict.csv` | 36 | Cancer codes (1–63), ICD-9/ICD-10 mapping, labels. Codes 62/63 are "All sites" / "All but skin" — exclude from site-by-site work. |
| `cancer_warning.csv` | 4 | Definitional breaks — **lung (21), bladder (45), brain (48), kidney (42)** have coding changes across volumes; use caution when claiming trends. |
| `pop_warning.csv` | 41 | Registries with a flagged population jump between volumes — can fake "trends"; flag/exclude for the affected volume. |

## Key conventions

- **Sex**: `1` = male, `2` = female.
- **Volumes → approximate periods**: I (~1953–1965), II (~1963–1967), III (~1968–1972), IV (~1973–1977), V (~1978–1982), VI (~1983–1987), VII (~1988–1992), VIII (~1993–1997), IX (~1998–2002), X (~2003–2007), XI (~2008–2012), XII (~2013–2017). Exact periods per registry are in `id_dict.csv`.
- **Ethnic code** `99` = whole population; any other value is an ethnic sub-population (e.g. SEER racial groups, NZ Maori).
- **ASR** is age-standardized to the Segi-Doll World standard, per 100 000 person-years.

## What counts as "interesting"

Patterns worth reporting usually fall into one of these buckets:

1. **Non-monotonic time trends in a single registry** — U-shape, inverted U, sharp inflection. Cervix in Shanghai is the archetype.
2. **Large spatial contrasts** — one registry an order of magnitude above/below its neighbours in the same period.
3. **Ethnic divergence within a country** — same registry, different ethnic code, very different level or trend.
4. **Sex-ratio anomalies** — cancers where M:F ratio flips across registries or across time.
5. **Age-curve anomalies** — bimodal curve, unusually young peak, flat-then-exploding.
6. **Cohort signals** — ASRs dropping across volumes in one sex but not the other; young-age rates rising while older-age rates fall.

Boring findings (monotonic rise of breast cancer in most registries, etc.) do **not** need a report — aim for 5–10 striking items per site, or skip the site entirely.

## Caveats that must be checked before claiming a trend

- **cancer_warning.csv** — lung, bladder, brain, kidney definitions changed. Don't claim a volume-V → volume-VI jump on these sites without flagging the definition break.
- **pop_warning.csv** — if the affected registry/volume appears in your finding, say so or drop it.
- **Small numbers** — a registry with < ~20 cases per volume-sex-cancer cell is noisy; don't overinterpret ASR swings there.
- **Registry coverage** — a "trend" in Africa across volumes I–XII often reflects different cities being added, not a real change. Check `id_dict.csv` volume columns.

## Workflow

1. `scripts/01_prepare.R` — loads all CSVs, joins, caches a compact RDS. Run once.
2. `scripts/02_per_cancer.R CANCER_CODE` — produces diagnostic outputs (trend tables, outlier lists, age curves) for one cancer.
3. Review outputs under `reports/_scratch/<cancer>/` and write a human-curated `reports/<short_label>.md` highlighting only the interesting patterns.
4. Once all sites have been walked, write `reports/README.md` ranking the most publishable findings across sites.
5. `scripts/05_md_to_json.R` — **one-shot** migration that converts `reports/*.md` + `reports/README.md` into the JSON tree under `findings/`. After the first run, `findings/*.json` is the source of truth for the website — edit by hand from then on.

Reports are markdown only — no HTML, no heavy plotting infrastructure. Keep them readable in a terminal.

`scripts/04_build_site.R` is **deprecated** (errors out on launch) and superseded by `05_md_to_json.R` plus the JSON-driven site below.

## Public-facing static site (`site/` + `findings/`)

A small static website that makes the findings browsable for non-technical readers (one page per cancer + an all-sites overview). It reads JSON files from `findings/` directly via `fetch()`. The JSON files are **the source of truth** — edit `findings/cancers/NN_label.json` and `findings/index.json` by hand to add findings, change wording, swap images, add references.

**Storytelling layout**: each finding is a `<article class="story-finding">` — text on the left (title + prose + an accent-coloured **"Open this chart on CI5 2.0 →"** button), and an image cell on the right showing the finding's PNG. When `image_url` is empty, the image cell is a striped "No image yet" placeholder that links to the same chart on CI5 2.0.

- **Index page** (`site/index.html`) renders `findings/index.json`. Sections A–D + trailing notes. A finding can reference one or more cancers (`cancer_codes: [NN, ...]`) and gets one CI5 2.0 button per referenced cancer.
- **Per-cancer pages** (`site/cancer.html#code=NN`) render `findings/cancers/NN_label.json`. One CI5 2.0 button per finding.
- Inline markdown is supported in `text` fields: `**bold**`, `*italic*`, `[link text](url)`. Cross-cancer references like `[32_cervix_uteri.md](cancer.html#code=32)` work as internal links.

IACR deep-link URL scheme (verified live):
`https://www.the-iacr.net/en/ci5-2.0/dataviz/all/trends_volumes?mode=population&multiple_populations=1&cancers=<NN>&populations=<ID1>_<ID2>_<...>&sexes=<0|1|2>`
- `cancers=NN` — a single cancer code (`32` = cervix, etc.)
- `populations=ID1_ID2` — one or more 9-digit `id_code`s joined with **underscore**.
- `sexes=` — `0` both / by sex, `1` males, `2` females.

PNG images: the IACR site renders charts client-side and exposes downloads as per-session `blob:` URLs that **cannot be hot-linked**. Workflow is therefore manual: open the chart on CI5 2.0 → Downloads tab → PNG → save the file under `site/img/<cancer-slug>/<finding-id>.png` → set the finding's `image_url` to that relative path. See `findings/README.md` for the full how-to.

Files:
- `site/index.html`, `site/cancer.html` — entry points (cancer page selects code via URL hash).
- `site/css/style.css`, `site/js/app.js` — static templates; safe to edit by hand.
- `site/img/...` — saved PNG screenshots, referenced by `image_url` in the JSON.
- `findings/manifest.json` — generated by `05_md_to_json.R`. Lists which per-cancer JSON files exist + the volume-period dictionary. Re-run the migration script if you add/remove a per-cancer file.
- `findings/index.json` — all-sites overview, hand-editable.
- `findings/cancers/NN_label.json` — one per cancer, hand-editable.
- `findings/README.md` — schema reference and "how to add an image / a finding / a cancer" instructions.
- `site/_audit/`, `site/_screenshots/` — disposable, gitignored.

The site loads via `fetch()`, so it does **not** work on `file://`. Preview locally with:
`cd "C:/project/CI5 sherlock" && python -m http.server 8765`
then open `http://127.0.0.1:8765/site/index.html`.

For sharing with colleagues, the entire repo (or just `site/` + `findings/`) can be served from any static host (GitHub Pages, Netlify, the IARC intranet, an S3 bucket, etc.) — no build step, no server logic.

## Do / don't

- **Do** be concise in reports — one paragraph per finding, with registry + volume + ASR values so the claim is checkable.
- **Do** name the caveat if the finding is borderline (small N, pop_warning, coding break).
- **Don't** restate the data schema in every report.
- **Don't** invent mechanisms — describe the pattern and suggest *plausible* drivers (HPV rollout, smoking cohorts, screening) without asserting causation.
- **Don't** generate PDFs, HTML, or slides unless asked. Markdown reports are the deliverable.
