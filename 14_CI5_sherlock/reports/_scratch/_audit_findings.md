# CI5 sherlock findings audit

**Date:** 2026-04-20
**Auditor:** iarc-cancer-data-scientist agent
**Total findings before:** 433 (index: 30, per-cancer: 403)

## Scope

Every finding in `findings/index.json` and `findings/cancers/*.json` was pulled,
its CI5 URL parsed for (cancer_code, id_codes, sex), and the raw ASR /
crude-rate / case counts computed from `C:/Data/CI5_all/summary/data_asr.csv`.

For each (registry × volume × sex) cell the helper `scripts/audit_finding.R`
flags:

- `SMALL_N`  — any volume-cell has < 20 cases
- `DIVERGE`  — ASR and crude move in opposite directions (pyramid artefact risk)
- `CODING_BREAK` — cancer in `cancer_warning.csv` (lung, bladder, brain, kidney)
- `POP_WARN`  — registry-volume in `pop_warning.csv`

Raw output is in `_audit_raw.csv` and `_audit_dump.txt`.

## Verdict conventions

- **KEEP**  — finding stands; ASR + crude + case counts all plausible.
- **CAVEAT** — kept, but one line added to the `text` pointing to the caveat.
- **KILL**  — removed from the JSON entirely.

## Index-level findings (30 entries → target: ~15)

### Section A — Most publishable novel findings

1. **The inland-China cervical cancer rise** — KEEP. Jiashan ASR 1.18→9.89,
   crude 1.50→16.25, both direction-consistent, 160 cases in vol XII; Wuhan
   433→2155 cases, ASR 3.87→11.03. Clean, big numbers, obvious public-health
   story. Beijing has a pop_warning for vol X but the inland-China pattern does
   not depend on it.
2. **Korea thyroid screening bubble** — KEEP. Seoul n=23189 (vol XII),
   Daegu 7666. No flags. Cleanest intervention signal in CI5.
3. **Hawaii-White melanoma matches Queensland** — KEEP with caveat. SMALL_N in
   vol I (19 cases) and POP_WARN vol VII both already acknowledged implicitly.
   Add caveat note.
4. **Zimbabwe Harare HIV-associated eye + NHL inverted-U** — CAVEAT. Eye vol
   VII Harare African n=8, vol XI n ≈ 43, vol XII n=82. Eye cases are small
   but NHL Harare African men 55→347 cases is large. Story coherent; caveat
   the eye-cancer small-N.
5. **Nordic stomach-cancer collapse** — KEEP. Iceland 547→75, Finland
   3040→1776 (men), huge N, ASR and crude both down ~75–95%. Textbook.
6. **Israel's gallbladder-cancer collapse** — CAVEAT. Israel 307→524 female
   cases, ASR 11.38→1.59 (−86%), crude 7.89→2.48 (−69%). Direction-consistent.
   The `Chile stays at 25–27` claim refers to Valdivia (id 215200199) in
   specific volumes, not the national Chile record. Pop_warning Israel vol V
   already mentioned. Add note that Chile 215200099 is all-Chile (very low)
   so the comparison really means Chile-Valdivia.
7. **Pacific-peoples' endometrial cancer** — KEEP. (NZ national, in a separate
   finding we will check; per-cancer file has NZ all 426→2720 cases.)
8. **Hawaii-Japanese late breast-cancer peak** — CAVEAT. Hawaii aggregate n
   large (358→5678), but the ethnic-specific Japanese subgroup is in per-cancer
   file with 90→1473 cases (acceptable). POP_WARN vol VII. Caveat.
9. **Singapore Indian women's U-shape three-site combo** — CAVEAT. SMALL_N in
   Indian subgroup (min 5–16 cases), ASR plummets 94% on tiny denominators.
   Direction is real but magnitudes are noisy. Add a "Indian-subgroup cases
   are small in early volumes — trend is directionally robust but the exact
   magnitude is uncertain" caveat.
10. **African prostate rise is not screening-driven** — CAVEAT. Uganda
    Kyadondo min cases 16 (SMALL_N), pop_warning vol VII. ASR 5.74→53.0, crude
    2.22→9.37. Both rising. Caveat the pop_warning.

### Section B — Strong known stories, fresh angle

11. **Italian sinonasal male cluster** — KILL. Parma min cases=6, Macerata 6,
    Basilicata 14, Avellino 6. ASR values sit at 0.4–0.7. M:F ratios of 63:1
    etc. are small-number artefacts (female denominator has zero or 1 case).
    Not publishable.
12. **US Black × prostate excess** — KEEP. Detroit Black 596→4115 cases,
    ASR 99.8→132.6. Large N, persistent, real.
13. **US Black × multiple-myeloma excess** — KEEP (simplify). SF Bay Black
    vol III n=49, not 8. Nebraska Black vol XII n=34. The general SF-Bay Black
    myeloma excess holds across vols with large total N.
14. **Chinese oesophagus / stomach belts** — KEEP. Cixian men 2047→1555, women
    1536→1021; Yanting 1591→1736 and 1146→1128; Shexian 1702→1633. Huge
    numerators. ASR/crude diverge in some registries (aging populations in
    these rural counties) but direction is clear in ASR. Keep with a brief
    caveat.
15. **Chile Valdivia gallbladder + testis outlier** — KEEP. Gallbladder women
    274→297 cases, testis men 86→157. Solid. Direction: gallbladder falling,
    testis rising — interesting pair.
16. **Japanese U-shape across five sites** — KEEP. Miyagi + Osaka with huge
    case counts across breast/colon/pancreas/corpus/other-female-genital.
    Clean.
17. **Polish men's slow lung-cancer decline** — KILL. No CI5 URL, no numbers
    in finding text. Generic "Polish men still high" — unverifiable and
    already covered in the per-cancer lung file. Coding_break for site.
18. **Australian NT Indigenous larynx + sinus** — CAVEAT. Larynx NT Indigenous
    vol XII women cases=7 (SMALL_N), vol X cases=1. The rate 5.20 is based on
    7 cases. Keep because the pattern (Indigenous female larynx ~11× median)
    is genuinely unusual, but caveat the tiny numerator.

### Section C — Data-quality flags

19. India Trivandrum vol VII → VIII cliff — KEEP (as a quality flag).
20. France's U-shaped pancreas trends — KEEP (quality flag).
21. Qatar/French-Polynesia/Brunei/Libya Uterus-NOS rates — KEEP (quality).
22. Brain-and-CNS vol VI → VII step — KEEP (quality).
23. Finnish/Swedish "other endocrine" 1970s spike — KEEP (quality).

### Section D — Age-curve fingerprints

24. UK cervix age peak at band 6 — KEEP. Backed up in per-cancer file with
    large English registry counts.
25. Malawi Blantyre paediatric Burkitt — KEEP. Malawi NHL men n=312 vol X, of
    whom band 2 peaks around ASR 42. Real.
26. USA aggregate bimodal age curves for Hodgkin + leukaemia — KEEP (texbook
    at n=18000 scale).
27. Israeli Sephardic childhood-brain peak — CAVEAT. Israel-Jews-Africa/Asia
    vol V women n=125 (in per-cancer file), plus pop_warning vol V, plus
    coding_break brain before vol VII. Keep but tighten caveat.

### Section "What's *not* in here"

28, 29, 30 — KEEP (short meta notes, not findings per se).

### Section "Suggested reading order" — KEEP.

---

## Per-cancer audit (summary by file)

Detailed per-finding decisions follow. Where a finding was killed, the reason
is given; where caveated, the caveat text; where kept, no annotation.

### 01_lip_oral_cavity.json (12 findings)

- **Singapore Indian women U-shape** — CAVEAT. Indian subgroup min cases=12;
  ASR 37.52→5.47 (−85%), crude only 6.64→7.29 (DIVERGE on crude). The story
  is real but crude is flat because the Indian population aged dramatically.
  Add: "Crude rate flat, ASR falls — decline is genuine but the Indian
  sub-population aged a lot; confirm across age bands."
- **Canadian lip cancer disappearing** — KEEP. Saskatchewan men n=462→426,
  ASR 36.67→9.27, crude 36.55→14.65. Both falling. Solid.
- **Inland-China intra-oral emergence** — CAVEAT. Real rises, but crude rises
  2–3× faster than ASR in several cities (Shanghai men ASR falls but crude
  rises — population aged). Caveat: "Crude rises faster than ASR in Shanghai
  men — part of the urban story is ageing-population driven."
- **India & Pakistan dominate absolute levels** — KEEP. Kamrup women 296→443,
  Meghalaya 510. Large N.
- **USA ethnic gaps** — KEEP.
- **Bimodal age curves Algeria/Jiashan** — CAVEAT. Small N on Jiashan women
  (26→71). Keep but note.
- **Uganda Kyadondo 1548% rise** — KEEP (already caveated in the text).
- **Singapore-Indian deep look** — KILL (duplicate of the first finding, same
  registry).
- **Inland-China rural→urban** — KILL (duplicate of #3).
- **Newfoundland/Saskatchewan/Malta lip collapse** — KEEP.
- Narrative "None of the main findings..." + coding caveat — KEEP.

Target kept for 01: ~9 (−3).

### 10_oesophagus.json (13)

- Cixian ASR 123 — KEEP. n=1536 women.
- Chinese oesophagus belt — KEEP.
- Puerto Rico collapse — KEEP. n=143→128 women, ASR 10.45→0.50. Small N in
  vol XII but direction overwhelming.
- Shanghai men 35.5→4.9 — KEEP.
- Singapore Indian women collapse — CAVEAT. n=6→5, tiny. But Singapore overall
  n=150→96 confirms direction. Caveat: "Ethnic-Indian numbers tiny (≤6 cases);
  Singapore-overall confirms direction."
- Uganda Kyadondo women — KEEP (already self-caveated).
- USA ethnic contrast — KILL. The provided URL only pulls USA aggregate (ASR
  5.40→5.14, almost flat); the "38×" claim in text is about 1970s data that's
  not auditable via this URL. Not a striking finding, and the within-USA
  ethnic story is covered better in the text of other per-cancer files.
- Caveats 50–52 — KEEP.
- Worth a deeper look — Shanghai vs Cixian — KEEP.
- Puerto Rico deep look — KEEP.
- Uganda rise deep look — KEEP.

Target kept: ~11 (−2).

### 11_stomach.json (10)

- Nordic collapse — KEEP.
- Chinese belt matches oesophagus belt — KEEP.
- Hawaii Japanese migrant inversion — KEEP. n=169→147 men, 89→116 women.
- Ugandan rise — CAVEAT. Men min cases 13 (SMALL_N), women min 3. Already
  caveated as "small absolute numbers".
- US ethnic spread 12× — KILL. URL only gives USA aggregate (5.66→5.56),
  and the "12×" claim is not backed by the URL. Replace with the per-cancer
  detailed version if present elsewhere; kill here.
- Caveats — KEEP.
- Worth deeper look — KEEP.

Target kept: ~9.

### 12_small_intestine.json (11)

- Almost no registry falling — KEEP (meta note).
- US Black populations climbing fast — CAVEAT. Louisiana New Orleans Black
  min 1–2 cases. The LA Black cases are small but SEER aggregate is
  the real story. Add caveat.
- Chinese registries rising from near-zero — KILL. Jiashan n=4→34 and 2→29
  (SMALL_N). Xiangfu single-volume n=212 but only one volume = no trend.
  Not publishable as a "rise".
- New Zealand Māori women tripled — CAVEAT. NZ-overall vol I n=19, tripling
  narrative is based on vol XII n=279. Caveat: "NZ-aggregate numbers; Māori
  subgroup not shown in URL."
- Strong male-heavy skew — KILL. France Tarn n=7, Spain Albacete n=2. Sex
  ratios of 19:1 on 2–7 cases per registry are noise, as text admits.
- USA ethnic spread 13× — KEEP (USA aggregate n=19000+).
- Caveats — KEEP.
- Worth deeper look (Xiangfu, carcinoid, sex ratio) — KILL the Xiangfu one
  (single-vol outlier). Keep carcinoid caveat.

Target kept: ~7.

### 13_colon.json (12)

- Japan inverted-U — KEEP.
- Singapore Chinese — KEEP.
- Kuwait 0→12 — CAVEAT. POP_WARN Kuwait vol VIII. Already mentioned in text.
- Algeria/Israel-Arab mirror — KEEP.
- USA Black men highest — KILL. URL gives vol XI→XII USA Black 26.59→24.42
  and USA 19.64→18.93. The "still highest" claim and "spread narrowed 24× to
  8×" is fine but not striking. Text already says "narrowed substantially";
  borderline. KILL as not striking enough given project's excess.
- Low-baseline floor — KEEP.
- India Chennai sex ratio 2.5:1 — KEEP.
- Caveats — KEEP.
- Worth-deeper-look — KEEP 2 of 3 (paper idea + Kuwait), KILL the Chennai
  sex-ratio revisit (already in finding 7).

Target kept: ~9.

### 14_rectum.json (12)

- Japan inverted-U — KEEP.
- India Trivandrum U — KEEP (quality flag).
- Africa/Caribbean female-heavy ratios — CAVEAT. Nigeria Ibadan n=4–19,
  Uganda 3–9, Martinique 5–15. Several SMALL_N and DIVERGE (Uganda women ASR
  up but crude down — aging-population artefact). Keep as a pattern but add:
  "Some registries here have cases <20; ratios based on single-digit female
  counts should be treated as indicative only."
- India Karunagappally men 5× — KILL. n=1 women vol VII, n=6 men. A 890 %
  change on 1 case is not a story.
- Alaska Native/NWT highest — CAVEAT. Alaska ASR 10.19→9.84 (flat) but crude
  up. The "23.2–24.0" vol IV figures are not in the URL's volume window.
  Keep as a level story (Alaska is indeed high), caveat the trend.
- Israel Jews-Israel vol-VII spike — KEEP (already self-caveated as pop_warn).
- Caveats — KEEP.
- Worth deeper — KEEP all three.

Target kept: ~10.

### 16_liver.json (13)

- Khon Kaen fluke — KEEP. n=867→2437 men.
- Qidong aflatoxin twin — KEEP. n=2381→2734 men.
- Mozambique vol I — KEEP (historical).
- Osaka HCV wave — KEEP. n=88→7073 men.
- Western creeping rise — CAVEAT. Navarra men min n=8 (SMALL_N). Caveat:
  "Baselines small (<10 cases), but totals in vol XII are substantial and
  consistent direction."
- USA ethnic contrast 12× — KILL. URL gives USA aggregate, 8.10→9.44. Flat.
  The "12×" claim is for 1980s, not auditable. Kill as weak.
- Israel-Jews-Israel +2640% — KEEP (already self-caveated as artefact).
- Caveats — KEEP.
- Worth deeper — KEEP all three (Khon Kaen + others story, Mozambique
  early-age, Israel).

Target kept: ~11.

### 17_gallbladder_etc.json (11)

- Chile world capital — KEEP. Valdivia 274→297. Solid.
- Israel collapse — KEEP.
- USA New Mexico American-Indian vol IV — CAVEAT. Vol IV figure (31.4) is not
  in the URL's volume window (vol VI onward). POP_WARN vol VIII for NM.
  Caveat: "Vol IV figure pre-dates the URL window; rate based on small native
  subpopulation."
- Algeria Sétif female-to-male skew — CAVEAT. Men n=22→31, women n=84→109.
  Both DIVERGE (ASR rises slightly, crude falls — aging). The 5:1 F:M ratio
  is real within the caveats of small N.
- Rising East/South Asia — CAVEAT. India Chennai min n=1–2 (SMALL_N).
  Qidong women n=12→224, better. Caveat.
- No bimodal curves — KEEP (meta).
- Caveats — KEEP.
- Why Israel fall — KEEP.
- Chile level + Israel fall pair — KEEP.
- North African female excess — KEEP (as quality flag note).

Target kept: ~10.

### 18_pancreas.json (10)

- Singapore Chinese cleanest catch-up — KEEP. n=25→915 men, 11→812 women.
- French U-shapes — KEEP (as quality flag).
- India Trivandrum cliff — KEEP (quality flag).
- Hawaii native women vol II — CAVEAT. URL gives Hawaii aggregate 41→600,
  ASR flat (7.40→7.31), crude up 322% — pyramid artefact in Hawaii aggregate.
  The specific "native Hawaiian vol II 18.7" is outside the URL data. Caveat:
  "Vol II native-Hawaiian rate is based on a small subgroup in a single
  volume; the Hawaii-aggregate trend is mostly population ageing."
- Kuwait, Bangalore, Chennai rising — CAVEAT. Bangalore min n=3–6, Chennai
  4–10. SMALL_N. Caveat.
- Sex-ratio anomalies — KILL. All small-N (Mali 8, Seychelles 6,
  Karunagappally 7). Text already calls these "mostly small-number artefacts"
  — the whole finding is its own caveat, so remove it.
- Caveats (2) — KEEP.
- Worth deeper — KEEP the East-Asian paper idea and the French U-shape
  vignette.

Target kept: ~8.

### 19_nose_sinuses_etc.json (13)

- Italian M:F ratios — KILL. All small-N (6–14 cases), female denominators
  near zero. The ratios are arithmetic from tiny counts. Story not
  publishable on its own; already noted in index as a caveat. Kill here.
- Australia NT Indigenous 3.30 — KILL. NT Indigenous women vol X n=3, vol XI
  n=0, vol XII n=0. Cannot support a "top spatial outlier" claim on 3 cases.
- Jamaica Kingston men inverted-U — KILL. No URL, no verifiable numbers.
- Shanghai men 2.94→0.35 — KEEP. n=63→131.
- Generalised decline — KEEP (meta).
- Iran Golestan bulge — KILL. 1, 3, 6, 11 cases. Pure noise.
- Italy Sondrio +1000% — KILL. n=1 to n=7.
- Caveats (3) — KEEP.
- Worth deeper (Italian paper) — KILL. Italian cluster story is built on
  small N (see above) — should not anchor a paper idea.
- NT Indigenous broader story — KILL (small N, not defensible).
- Biomass-female signal — KILL (noise).

Target kept: ~5 (major cut — this site is almost all small-N).

### 20_larynx.json (12)

- Australia NT Indigenous women 5.20 vol XII — CAVEAT. n=1→7 cases. Caveat:
  "Based on 7 cases in vol XII — magnitude uncertain but direction matches
  broader Indigenous tobacco + kava story."
- Tobacco-era collapses — KEEP. Mumbai 563→1126, Poona 249→404, HK 762→847,
  Finland 428→545. Solid.
- India Trivandrum U — KEEP (quality flag).
- USA ethnic contrasts — KEEP.
- Spain Zaragoza 190:1 — CAVEAT. Female n=15–15 cases, high M:F ratio on
  stable female numerator. Keep as historical curiosity but caveat: "Female
  denominator in these registries is single-digit; M:F ratios of 100+ are
  arithmetic artefacts."
- Rising women Spain/Norway/Algeria — KEEP.
- Qidong men +1315% — KEEP (already self-caveated).
- Caveats — KEEP.
- Worth deeper — KEEP.

Target kept: ~11.

### 21_lung.json (12)

All findings have CODING_BREAK (lung = cancer_warning) — need to ensure each
acknowledges it.

- Women peak nowhere — KEEP.
- Nunavut 97.5 — CAVEAT. Nunavut vol XI n=41 (women). SMALL_N borderline.
  Keep with n note.
- Finland male inverted-U — KEEP. n=3861→8962. Classic.
- Polish male — KEEP.
- Hungary Szabolcs — KILL. No URL, no auditable numbers.
- US Black vs Native ratio — KEEP.
- Muslim-majority M:F ratios — KEEP.
- Caveats — KEEP.
- Worth deeper — KEEP all.

Target kept: ~11.

### 23_bone.json (13)

- Israel Sephardic women 6.49 vol V — CAVEAT. Israel aggregate 38→255 cases,
  ASR 0.95→1.15 (flat). The 6.49 vol V figure is historical and not
  recoverable from this URL window. POP_WARN vol V. Caveat.
- Hawaii Chinese inverted-U to 0 — KILL. n=1 to n=0. Pure noise; already
  self-admitted as "handful of sarcomas".
- Italian provinces M:F — KILL. Ferrara n=5, Sassari 8, Barletta 8. Exactly
  what the caveats say — small numbers. Kill.
- USA aggregate bimodal — KEEP (large N).
- India Karunagappally women +428% — KILL. n=1→12.
- USA Black 10× vol I — KILL. The USA-Black/USA aggregate URL shows 11–12 (flat),
  which doesn't support the historical 10× claim; narrative not auditable.
- Xiangfu 5.88 — KILL. Single-volume, single-city outlier; already flagged as
  "coding peculiarity worth a phone call" — keep only if it anchors a story.
  Doesn't here.
- Caveats — KEEP.
- Worth deeper (3) — KILL the Israel and Italian ones (see above); KEEP the
  sarcoma-bundle methodological note.

Target kept: ~5 (big cut — bone is mostly small N).

### 24_melanoma_of_skin.json (13)

- Queensland — KEEP. n=405→12965. Solid.
- Hawaii-White catches Queensland — KEEP (SMALL_N vol I but text already
  acknowledges the climb from 19 cases).
- White-vs-Hispanic 276× — CAVEAT. Ratios computed from ethnic sub-popns with
  small numerators (Hispanic, Korean, Black). Keep but note: "Ratios of 200×+
  are arithmetic from small non-white denominators."
- European catch-up — KEEP (substantial totals).
- Iceland late female peak — KEEP (n=121 vol XII).
- Bimodal age curves Tyrol/Belarus/UK — KEEP.
- UK Oxford + Hawaii early female peak — KEEP.
- Indian registries acral signal — KILL. All n=0–6. Text admits "tiny numbers".
- Caveats — KEEP.
- Worth deeper — KEEP.

Target kept: ~12.

### 29_female_breast.json (13)

- LA Filipina 100 — KEEP (subgroup claim, historical, not auditable by URL
  but widely documented).
- Japan/migrant U — KEEP.
- Singapore/Algeria +785/+772% — KEEP.
- Hawaii-Japanese late peak — KEEP.
- India Karunagappally early peak — KEEP.
- US ethnic contrast — KEEP.
- Male breast +4800% Latvia — KILL. n=1 to n=41 over long period. Artefact.
- Uganda Kyadondo tripled — KEEP (self-caveated pop_warn).
- Caveats (2) — KEEP.
- Worth deeper (3) — KEEP.

Target kept: ~12.

### 32_cervix_uteri.json (12)

All the headline findings are strong. This is the anchor cancer.

- Singapore-Indian U-shape + Hawaii/NB/Geneva — CAVEAT. Indian subgroup min
  cases=8. Most others (Hawaii 116→37, Geneva 112→58, NB 276→149) are solid.
- Uganda Kyadondo — KEEP (self-caveated).
- Sub-Saharan top — KEEP.
- Inland China rise — KEEP.
- Hawaii populations collapse — KEEP.
- UK early peak — KEEP.
- Netherlands/Denmark bimodal — KEEP.
- Caveats (2) — KEEP.
- Worth deeper (3) — KEEP.

Target kept: ~12.

### 33_corpus_uteri.json (11)

- NZ Pacific peoples 52.5 — KEEP (per the index also).
- Japan U-shape — KEEP.
- Asian migrants lead US historical — KEEP.
- Singapore ethnicities — KEEP.
- US White vs Asian/PI — KEEP (narrowing story).
- Qidong +873% — CAVEAT. n=14→252; SMALL_N at baseline. Caveat.
- Caveats — KEEP.
- Worth deeper — KEEP all three.

Target kept: ~11.

### 34_uterus_nos.json (11)

All findings are data-quality flags by design — the site itself is largely a
coding-practice indicator. The value here is in flagging which registries to
treat cautiously.

- Qatar outlier — KEEP.
- Brazil/Polynesia/Libya/Brunei outliers — KEEP.
- China Yanting/Yucheng — KEEP.
- USA Black-to-Native 57× — KILL. URL gives 1.05→1.25 and 0.55→0.62, all
  tiny rates. Ratio over such small rates is statistically meaningless and
  text itself says "coding practice, not biology".
- Universal decline in high-income — KEEP.
- Handful rising — KEEP (all SMALL_N but pattern matters for QC).
- Bimodal vol-II Germany — KILL. n=45–59 with DIVERGE; clearly a vol-II
  coding issue, not an age-curve finding.
- Caveats — KEEP.
- Worth deeper — KEEP.

Target kept: ~9.

### 36_other_female_genital.json (11)

- Japan Miyagi U-shape — KEEP.
- Hawaii/LA Chinese U-shape — CAVEAT. Hawaii-Chinese min n=7. Caveat.
- India Trivandrum cliff — KEEP (quality).
- Inland China rising — KEEP.
- Poland Cracow — KEEP.
- USA/Canada ethnic contrast — KILL. URL pulls Canada and USA aggregate, both
  nearly flat (11–13, 11). The "7–8× vol VII contrast" isn't in the URL
  window. Weak finding.
- Polish/Kaifeng/SA bimodal — KILL. Aggregate-site bimodality is expected
  because the site mixes ovary/vulva/vagina; doesn't isolate a signal.
- Caveats — KEEP.
- Worth deeper — KEEP Japan bundle.

Target kept: ~8.

### 37_placenta.json (11)

All of this site is small-N by nature. Keep only the striking ones.

- USA New Mexico American-Indian vol III 8.71 — CAVEAT. URL gives 2 → 5 cases
  (min n=2). The "vol III 8.71" figure is historical and tiny-N. Keep as a
  historical curiosity but caveat: "based on very small case numbers — treat
  as indicative."
- Vietnam Hanoi 1.85 / 2.22 — KEEP. n=63, 133. OK for this rare site.
- Argentina Chaco / India Poona / Nigeria Ibadan — CAVEAT. India Poona n=1 vol
  XII, Nigeria Ibadan n=0 vol I. SMALL_N. Caveat.
- Disease disappeared in West — KILL. All n=0 by vol XII. Not a trend finding
  so much as an absence of disease.
- Early-age peak band 4–5 — KEEP (known pattern, useful visualisation).
- No signals in men — KEEP (meta, expected).
- Caveats (3) — KEEP.
- Worth deeper (Vietnam cluster, NM Native-American) — KEEP.

Target kept: ~8.

### 38_penis.json (11)

- Brazil Recife vol III — KEEP. n=70 → 23 inverted-U, ASR 9.54→0.97.
- Jamaica Kingston — KILL. No URL, no auditable numbers.
- Uganda Gulu + Zimbabwe Bulawayo African — CAVEAT. Zimbabwe Bulawayo African
  n=5 SMALL_N + POP_WARN vol XII. Uganda Gulu n=21 single volume. Keep but
  caveat.
- Switzerland/Poland/Japan rising — KILL. All n=0–12. Text itself says
  "small numbers but unexpected". Not enough signal.
- USA Missouri Black +369% — KILL. n=2→13.
- Singapore ethnic contrast 11:1 — KILL. Singapore aggregate n=35→67 only;
  ethnic-subset ratios not auditable by URL.
- Shanghai/HK U-shapes — CAVEAT. Shanghai min cases=0 (!), HK min=0.
  Caveat: "Zero-case volumes present in intermediate volumes — the U-shape is
  directionally suggestive only."
- Caveats — KEEP.
- Worth deeper — KEEP only Recife (HPV + cervix paper idea is plausible),
  KILL the HPV-cluster abstract note.

Target kept: ~6.

### 39_prostate.json (12)

- US Black top — KEEP.
- Asian catch-up — KEEP.
- Newfoundland inverted-U — KEEP.
- Spain/Israel-Arab inverted-U — KEEP.
- Algeria Sétif U-shape ascertainment — KEEP (self-caveated as ascertainment).
- Uganda +823% — KEEP (self-caveated).
- US Black-to-Asian 8–14× — KEEP.
- Caveats — KEEP.
- Worth deeper (3) — KEEP.

Target kept: ~12.

### 40_testis.json (12)

- Alpine Swiss/Austrian — KEEP.
- Chile Valdivia top — KEEP.
- Puerto Rico +998% — CAVEAT. n=7→403. SMALL_N at baseline. The rise is huge
  and direction-robust.
- Hawaii Filipino/Chinese U — KILL. Filipino min n=0, Chinese only single
  volumes. Not enough.
- Huge ethnic contrast — KEEP.
- Adolescent peak band 5 — KEEP (textbook).
- China Taiwan vol VIII band 1 — KEEP (interesting, n=59 single-vol).
- Caveats — KEEP.
- Worth deeper — KEEP Chile, KEEP Alpine, KEEP widening gap.

Target kept: ~11.

### 41_other_male_genital.json (6)

- USA LA Korean 3.33 — KILL. URL pulls Uganda Gulu (n=7), USA aggregate
  (flat), Italy Trieste (n=1 → 11). None of these support a "19.6× median"
  claim. Text itself admits "likely reflects over-coding". Kill.
- Everywhere else near zero — KEEP (meta).
- France/Korea/Japan +800% — KILL. All n=1→10–15. Noise.
- Caveats (2) — KEEP.
- Worth deeper — KEEP (the meta note "use as QC flag").

Target kept: ~4. Already small; trim the numeric-claim findings.

### 42_kidney_etc.json (12)

All have CODING_BREAK (kidney = cancer_warning). Ensure acknowledgments.

- Canada NWT/Yukon vol IV — CAVEAT. Vol IV figure out of URL window; Yukon
  n=1 (!) SMALL_N + POP_WARN. Alaska 89→249, Montana 218→409, Oklahoma
  893→1770 are solid. Caveat.
- Japanese/US-Asian catch-ups — KEEP.
- Shanghai U — KEEP.
- Spain Tarragona/Israel-Arab U — KEEP.
- Morocco/Chennai bimodal — CAVEAT. Chennai min n=4 (SMALL_N). Caveat.
- Women-heavy — CAVEAT. Gambia n=3–6 (SMALL_N). Interesting pattern but all
  DIVERGE (aging populations) and tiny. Keep but note.
- USA ethnic 11–21× — KEEP.
- Caveats (2) — KEEP.
- Worth deeper (3) — KEEP.

Target kept: ~12.

### 45_bladder.json (14)

All have CODING_BREAK.

- Zimbabwe Bulawayo 34.14 vol II — CAVEAT. n=8 vol II (SMALL_N). Historical
  figure. POP_WARN vol XII for same registry (different volume). Caveat.
- Naples cluster — KEEP. n=739→2053 etc. Solid.
- Algeria Sétif / Israel-Arab women rising — CAVEAT. Algeria n=2 (!). Small.
- Miyagi/Osaka U — KEEP.
- India Trivandrum cliff — KEEP.
- Italy Ragusa 24:1 — KEEP. (Ragusa itself n=51→457 men, Vas 26→114.)
- Kidney+bladder urinary cluster — KEEP.
- USA ethnic 14× — KEEP.
- Caveats (3) — KEEP.
- Worth deeper (3) — KEEP.

Target kept: ~13.

### 47_eye.json (10)

- Malawi Blantyre women 9.81 — KEEP. n=187 vol X.
- Zimbabwe Harare inverted-U — KEEP.
- Germany Saarland +1200% — KILL. n=2→27. Noise as text admits ("incidental
  detection"). Small-N.
- Bimodal age US large samples — KEEP.
- Japanese/Korean early-age peak — KEEP.
- Extraordinary sex ratios — KILL. All cells have n=1–8, text admits
  "single-case swings".
- Caveats — KEEP.
- Worth deeper — KEEP.

Target kept: ~8.

### 48_brain_and_central_nervous_system.json (15)

All have CODING_BREAK. Brain coding changed vol VI→VII (benign tumours
excluded from vol VII) — any finding that straddles that boundary should
acknowledge it.

- Israel Sephardic women 16.58 vol V — CAVEAT. Already mentions "North
  African cohorts". Note vol VI/VII benign-tumour coding change explicitly.
- Israel Jewish women inverted-U — CAVEAT. Same as above.
- India Trivandrum U — KEEP (quality).
- Multiple registries vol-VI peak — KEEP (quality — benign-tumour code
  change).
- Rising African rates — CAVEAT. Algeria n=6–78 SMALL_N. Uganda same. Keep
  but caveat.
- US ethnic 48× — KILL. No URL, and 48× on a small denominator is suspect.
- Sex-ratio extremes — KILL. All single-digit N, text admits "small numbers".
- Bimodal US/Belarus/Croatia — KEEP.
- Israel Jews-from-Africa peak band 1 — CAVEAT. Same file, same cohort as #1.
- Caveats (3) — KEEP.
- Worth deeper (3) — KEEP Israel cohort; KEEP methods note; KILL the African
  rise deep-dive (already covered above).

Target kept: ~11.

### 49_thyroid.json (13)

- Korean cities — KEEP. Huge N.
- Chinese cities rising — KEEP. Huge N.
- Italy Latina — KEEP.
- Sex ratio 3–5:1 — KEEP.
- Early peak band 6–7 — KEEP.
- US ethnic 15× — KEEP.
- Hawaii Chinese vol II — CAVEAT. n=21 (SMALL_N). Already historical.
- Bimodal Western — KEEP.
- Caveats (2) — KEEP.
- Worth deeper (3) — KEEP.

Target kept: ~13.

### 51_other_endocrine.json (10)

Whole site is small-N + 1970s coding story.

- Sweden vol VI 6.56 — KEEP. n ≥ 194 cases — actually reasonable N.
- Italy Trieste women 3.13 — CAVEAT. n=1→30. Small baseline.
- Early peak band 1 (neuroblastoma) — KEEP.
- Rising trends — KILL. Poland Cracow n=1, China Tianjin n=2, France Isère
  n=2, Slovenia n=2. All SMALL_N. Narrative admits "very low baselines".
- Bimodal US — KEEP.
- Sex-ratio extremes — KILL. Spain Girona 67:1 on single-digit counts, as the
  text itself admits.
- Caveats — KEEP.
- Worth deeper — KEEP Sweden; KEEP paediatric peak note.

Target kept: ~7.

### 52_hodgkin_disease.json (13)

- Canada NWT/Yukon vol IV — CAVEAT. Yukon n=2–149 SMALL_N; POP_WARN vol VII.
  Caveat.
- US Nebraska Black 5.79 — CAVEAT. n=3→15 (SMALL_N).
- Italian provinces + Israel — KEEP.
- Italy Latina / France Doubs — CAVEAT. France Doubs n=2→47 SMALL_N at
  baseline.
- Bimodal US — KEEP.
- Early-peak band 4 Russia/Detroit/Quebec — KEEP.
- Sex-ratio China Zhuhai / Peru Trujillo — KILL. All single-digit.
- Singapore Malay +704% — KILL. n=1→27. Noise from tiny baseline.
- Caveats — KEEP.
- Worth deeper (3) — KEEP.

Target kept: ~10.

### 53_non_hodgkin_lymphoma.json (14)

- Zimbabwe Harare inverted-U — KEEP. n=55→347.
- Israel Jews-Israel vol VII 21.04 — KEEP. Large N.
- India Trivandrum vol VII 19.14 — KEEP.
- Nordic catch-ups — KEEP. Large N.
- Bimodal African — KEEP.
- Malawi Blantyre men band 2 42.4 — KEEP.
- Israel Jews-from-Africa band 1 — KEEP.
- US Black-to-other 5–8× — KEEP.
- Malta/Singapore/NB rises — KEEP (large totals).
- Caveats — KEEP.
- Worth deeper — KEEP.

Target kept: ~14 (this file is mostly solid).

### 55_multiple_myeloma.json (12)

- USA Black myeloma excess — KEEP.
- USA ethnic 26× — KEEP.
- NZ Pacific-peoples women — CAVEAT. n=2→60 + POP_WARN vol X. Caveat: "Pacific
  subgroup has a pop_warning vol X — the inverted-U shape is directionally
  sound but the exact peak height should be treated cautiously."
- Universal rise — CAVEAT. Japan Miyagi n=1 women vol I (!). Algeria n=2–4.
  Magnitude of +3125% etc. is arithmetic on baseline ≤4. Keep but caveat:
  "Extreme %-changes are driven by tiny vol-I baselines; absolute final
  ASRs (2–5) are modest."
- Uganda Kyadondo U — KEEP (already self-caveated).
- Hawaiian Hawaiian vol I — KILL. No URL, unverifiable.
- No cancer_warning — KEEP.
- Caveats — KEEP.
- Worth deeper (3) — KEEP.

Target kept: ~11.

### 56_leukaemia.json (13)

- Zimbabwe Bulawayo vol II 42.52 — CAVEAT. n=7 (SMALL_N) + POP_WARN vol XII.
  Already self-caveated but reinforce with case count.
- USA Hawaiian vol I 22.99 — KILL. URL only returns USA aggregate. The vol-I
  Hawaiian figure isn't auditable.
- India Trivandrum U — KEEP.
- Kuwait non-Kuwaitis paediatric — KEEP (demographic story).
- Bimodal India/Korea/HK/China — KEEP.
- US ethnic 5× — KEEP (meta note, low contrast for this site).
- France Calvados U — KEEP. n=67→382.
- Canada NWT 18:1 — KILL. Text itself says "small-number artefact" — so
  don't put it in as a finding.
- Caveats — KEEP.
- Worth deeper (3) — KEEP.

Target kept: ~11.

---

## Grand totals

- Before: 433 (index 30 + per-cancer 403)
- After:  375 (index 28 + per-cancer 347)
- Removed: 58 findings (~13 %)
- Caveated in place: ~40 findings (case counts / pop_warning / coding_break
  notes added to the `text` field)

Per-cancer cuts (largest):
- 19 nose/sinuses: 13 → 4 (−9, entire site rebuilt on small-N grounds)
- 41 other male genital: 6 → 4 (weak numeric claims dropped)
- 23 bone: 13 → 6 (kept only USA large-N bimodal + Israel historical +
  methodology caveats)
- 38 penis: 11 → 6
- 12 small intestine: 11 → 8
- 10 oesophagus: 13 → 12
- 11 stomach: 10 → 9
- 13 colon: 12 → 10
- 48 brain: 15 → 12
- 47 eye: 10 → 8
- 52 hodgkin: 13 → 11
- 56 leukaemia: 13 → 11

Kills concentrated in: small-N-only findings (bone, nose/sinus, other male
genital, penis, small intestine), ethnic-ratio claims computed from tiny
denominators, "rises from zero" artefacts, USA-aggregate claims that can't
be checked at ethnic sub-registry level, and findings without CI5 URLs
whose magnitudes weren't verifiable.
