# Rectum (code 14, C19–21)

## Quick take
Rectum follows colon in most places, but there are a handful of registries where the two sites diverge — pointing to different underlying risk factors (or different coding practices). The most interesting anomaly is the female sex-ratio skew in Africa and the Caribbean.

## What catches the eye

- **Japan again shows the inverted-U.** Miyagi men 6.47 → 24.47 (vol X) → 22.49 (vol XII). More gentle than the colon curve — consistent with the idea that screening turns colon around faster than rectum.
- **India Trivandrum women: U-shape collapse then partial rebound.** 22.0 (vol VII) → 1.77 (vol VIII) → 4.09 (vol XII). An 81 % fall then 130 % rise. Almost certainly reflects a registry-coding change between vol VII and VIII; flag for verification.
- **Female-heavy sex ratios in Africa/Caribbean are striking.** Brazil Recife vol III M:F = 0.35 (women 3× men); Nigeria Ibadan 0.34; France Martinique 0.41; Uganda Kyadondo 0.39. Global vol-III median ratio is 1.5:1 male. Either a real biological signal or an ascertainment artefact (women more likely to reach registered care) — but consistent across multiple registries.
- **India Karunagappally men rose 5× relative to women.** Women 0.31 → 3.07 (+890 %) *plus* a male-heavy 5:1 ratio in vol VII — something odd happening in coding or ascertainment.
- **Alaska Native and NWT women are the highest global outliers** (23.2 and 24.0 — about 3× the world median). Consistent with colorectal-cancer excess reported in Alaska Native populations elsewhere.
- **Israel Jews born in Israel women: inverted-U with a vol-VII spike of 21.7.** That vol is flagged in pop_warning for Israel — double-check before claiming a real peak.

## Caveats
- India Trivandrum vol VII vs VIII: the 22→1.77 step is suspicious; probably a scope change between the two volumes.
- Israel pop_warning for vol V applies to the whole Israel file; the Israel-Jews-born-in-Israel vol-VII spike needs checking against the registry note.
- Martinique 1975-era numbers have small denominators for ethnic/sex stratification.

## Worth a deeper look
- A "colon vs rectum" pair-plot across CI5 XI–XII to see which registries break the 2:1 colon-to-rectum rule, and why.
- Explore the sub-Saharan / Caribbean female-heavy signal across multiple related sites (colon, rectum) — might indicate an entirely different aetiological contributor.
- Alaska Native / NWT excess: is it right-side colon creeping into rectal codes, or a genuine rectal excess?
