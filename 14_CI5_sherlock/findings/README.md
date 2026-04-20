# findings/

Source of truth for the public-facing site. Edit these JSON files by hand — the
website (`site/`) reads them directly via `fetch()`.

## Files

- `index.json` — the all-sites overview shown on `index.html`. Mirrors what
  used to live in `reports/README.md`.
- `cancers/NN_label.json` — per-cancer page shown on `cancer.html#code=NN`.
  One file per cancer code, mirroring what used to live in `reports/NN_*.md`.
- `manifest.json` — generated. Lists which per-cancer JSON files exist plus
  the volume → calendar-period lookup. Re-run `scripts/05_md_to_json.R` to
  rebuild it after adding/removing per-cancer files.

## Per-cancer schema (`cancers/NN_label.json`)

```json
{
  "code": 32,
  "label": "Cervix uteri",
  "icd10": "C53",
  "slug": "cervix_uteri",
  "quick_take": "One-paragraph lede shown at the top of the page.",
  "sections": [
    {
      "heading": "What catches the eye",
      "intro": "",
      "findings": [
        {
          "id": "shanghai-u-shape",
          "title": "Shanghai's classic U-shape",
          "text": "Free-form prose. Supports inline **bold**, *italic*, and [links](https://example.com).",
          "image_url": "img/32_cervix/shanghai.png",
          "image_alt": "Cervix ASR trend, Shanghai across CI5 vols I–XII",
          "ci5_url": "https://www.the-iacr.net/en/ci5-2.0/dataviz/all/trends_volumes?...",
          "extra_links": [
            {"label": "Optional reference", "url": "https://..."}
          ]
        }
      ]
    }
  ]
}
```

## Index schema (`index.json`)

Same shape, but each finding can reference multiple cancers:

```json
{
  "id": "thyroid-screening-bubble",
  "title": "Korea's thyroid-cancer screening bubble",
  "text": "...",
  "cancer_codes": [49],
  "image_url": "",
  "image_alt": "...",
  "ci5_urls": [
    {"cancer_code": 49, "cancer_label": "Thyroid", "sex": 2,
     "url": "https://www.the-iacr.net/en/ci5-2.0/dataviz/all/trends_volumes?..."}
  ],
  "extra_links": []
}
```

## How to add an image

1. On the site, click the orange **"Open this chart on CI5 2.0 →"** button.
2. On the IACR page, click the **Downloads** tab → **PNG**.
3. Save the file under `site/img/<slug>/<finding-id>.png`.
4. Edit the finding's `image_url` to that path (relative to `site/`).
5. Refresh the site — the image now renders inline.

If `image_url` is left empty, the site shows a "No image yet — open on CI5 2.0"
placeholder that links to the same chart.

## How to edit text

Just edit the JSON. `text` supports inline markdown:

- `**bold**`, `*italic*`
- `[link text](https://url)`
- Blank lines separate paragraphs.

## How to add a new finding

Add a new object to the appropriate `sections[i].findings[]` array. Required
fields: `id` (unique within the file), `title`, `text`. Everything else is
optional.

## How to add a new cancer

Drop a new `cancers/NN_label.json` file following the schema, then re-run
`Rscript scripts/05_md_to_json.R` to refresh `manifest.json` (it picks up
new files from the per-cancer dictionary).

## Source / regeneration

The initial JSON files were generated from `reports/*.md` by
`scripts/05_md_to_json.R`. After the first migration, the JSON files are
authoritative; the markdown reports are kept as a backup but are no longer
read by the site.
