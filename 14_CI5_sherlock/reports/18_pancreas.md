# Pancreas (code 18, C25)

## Quick take
Pancreas is generally a rising-everywhere cancer, but the CI5 data reveal *how* the rise came about — almost all of the French registries (Isère, Tarn, Doubs, Hérault) show a perfect U-shape, suggesting a coding correction in the late 1980s rather than a real dip. The biggest *real* story is the East-Asian catch-up in Singapore Chinese, both sexes.

## What catches the eye

- **Singapore Chinese: the cleanest inverted-catch-up.** Women 0.27 (vol I) → 5.51 (vol XII), a 20-fold rise. Men 0.68 → 7.33 (+978 %). Almost monotonic — not clearly peaking yet.
- **French registries share a U-shape across sexes.** Isère men 3.87 → 3.23 (bottom vol VI) → 10.28 (vol XII); Tarn men 3.70 → 3.36 → 9.35; Doubs women 3.85 → 1.85 → 7.71. The uniform shape suggests a vol V/VI under-coding issue that was later corrected — not a real biological dip. Flag for any trend-writeup.
- **India Trivandrum men: 12.89 (vol VII) → 1.69 (vol VIII) → 2.81 (vol XII).** A single-volume cliff of the kind that almost always means a scope or denominator change in the registry.
- **Hawaii native Hawaiian women (vol II): ASR 18.7, 3.4× the world median.** This is the top clean outlier (non-US-ethnic) for the site and deserves its own quick look — indigenous-Pacific pancreatic cancer is poorly described.
- **Biggest rises after Singapore Chinese come from Kuwaitis, Bangalore, and Chennai** — a real convergence of Gulf and Indian urban rates toward OECD levels.
- **Sex-ratio anomalies are mostly small-number artefacts** (Malawi, Bamako, Seychelles) but India Karunagappally's 10.7:1 male ratio in vol VII is odd enough to check against the registry.

## Caveats
- No formal cancer_warning, but pancreas has had long-running diagnostic difficulty — a large share of cases historically registered as pancreas were actually peri-ampullary; the U-shape in French registries likely reflects this.
- Trivandrum vol VII → VIII looks like a registry-level recoding, not biology.

## Worth a deeper look
- A paper focused *just* on the East-Asian pancreas rise (Singapore, Chinese-American, Japan) would land well — the 20-fold climb in Singapore Chinese women is the single most under-reported magnitude in the dataset for this site.
- Reverse-engineering the French U-shape would be a nice methods vignette on how coding reviews show up in CI5 trajectories.
