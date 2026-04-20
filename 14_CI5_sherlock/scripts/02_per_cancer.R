suppressPackageStartupMessages(library(data.table))

args <- commandArgs(trailingOnly = TRUE)
if (length(args) < 1) stop("Usage: Rscript 02_per_cancer.R <cancer_code>")
CANCER <- as.integer(args[[1]])
if (CANCER %in% c(62, 63)) stop("Refusing to run on all-sites aggregate (", CANCER, ").")

CACHE    <- "C:/project/CI5 sherlock/cache"
REPORTS  <- "C:/project/CI5 sherlock/reports/_scratch"

asr  <- readRDS(file.path(CACHE, "asr.rds"))
age  <- readRDS(file.path(CACHE, "age.rds"))
dct  <- readRDS(file.path(CACHE, "dict.rds"))
cancer_row <- dct$cancer[cancer_code == CANCER]
if (!nrow(cancer_row)) stop("Unknown cancer code: ", CANCER)

safe_label <- gsub("[^A-Za-z0-9]+", "_", cancer_row$short_label[1])
out_dir <- file.path(REPORTS, sprintf("%02d_%s", CANCER, safe_label))
dir.create(out_dir, showWarnings = FALSE, recursive = TRUE)

SEX_SPECIFIC <- c(29, 32, 33, 34, 36, 37, 38, 39, 40, 41)  # breast, cervix, corpus, uterus NOS, oth female, placenta, penis, prostate, testis, oth male

A <- asr[cancer_code == CANCER]
# Ethnic filter: keep ethnic_code 99 always; for others, require >=3 volumes *per sex*.
keep_eth <- A[, .(nvol = uniqueN(CI5_volume)),
              by = .(country_code, ethnic_code, sex)][nvol >= 3]
A <- A[ethnic_code == 99 |
       paste(country_code, ethnic_code, sex) %in%
       paste(keep_eth$country_code, keep_eth$ethnic_code, keep_eth$sex)]

## 01 top trends ---------------------------------------------------------------
shape_tag <- function(asrs, vols) {
  if (length(asrs) < 4) return(NA_character_)
  o <- order(vols); asrs <- asrs[o]; vols <- vols[o]
  rng <- range(asrs); mn <- mean(asrs)
  if (mn > 0 && (rng[2] - rng[1]) / mn < 0.25) return("flat")
  imin <- which.min(asrs); imax <- which.max(asrs)
  interior_min <- imin > 1 && imin < length(asrs)
  interior_max <- imax > 1 && imax < length(asrs)
  ratio <- if (rng[1] > 0) rng[2] / rng[1] else Inf
  if (interior_min && ratio >= 1.5 && asrs[1] > asrs[imin] && asrs[length(asrs)] > asrs[imin]) return("U")
  if (interior_max && ratio >= 1.5 && asrs[1] < asrs[imax] && asrs[length(asrs)] < asrs[imax]) return("inverted-U")
  mono_up   <- all(diff(asrs) >= -0.05 * mn)
  mono_down <- all(diff(asrs) <=  0.05 * mn)
  if (mono_up)   return("rising")
  if (mono_down) return("falling")
  "erratic"
}

A_trend <- A[!is.na(asr)]
trend_tbl <- A_trend[, {
  o <- order(CI5_volume)
  v <- CI5_volume[o]; a <- asr[o]
  .(n_vol     = length(v),
    first_vol = v[1], first_asr = a[1],
    last_vol  = tail(v, 1), last_asr = tail(a, 1),
    min_asr   = min(a), min_vol = v[which.min(a)],
    max_asr   = max(a), max_vol = v[which.max(a)],
    pct_change = if (isTRUE(a[1] > 0)) (tail(a, 1) - a[1]) / a[1] * 100 else NA_real_,
    shape = shape_tag(a, v))
}, by = .(id_code, id_label, ethnic_code, sex)][n_vol >= 4]

trend_tbl[, abs_pct := abs(pct_change)]
for (s in unique(trend_tbl$sex)) {
  top <- trend_tbl[sex == s][order(-abs_pct)][1:40]
  fwrite(top, file.path(out_dir, sprintf("01_top_trends_sex%d.tsv", s)), sep = "\t")
}

## 02 shape catalog ------------------------------------------------------------
fwrite(trend_tbl[order(sex, shape, -abs_pct)],
       file.path(out_dir, "02_shape_catalog.tsv"), sep = "\t")

## 03 spatial outliers ---------------------------------------------------------
out_list <- list()
for (s in unique(A$sex)) for (v in unique(A$CI5_volume)) {
  sub <- A[sex == s & CI5_volume == v & asr > 0]
  if (nrow(sub) < 20) next
  med <- median(sub$asr)
  hi  <- sub[asr > 3.0 * med][, .(id_code, id_label, ethnic_code, sex, CI5_volume,
                                   asr, median_asr = med, ratio = asr / med, flag = "high")]
  lo  <- sub[asr < 0.2 * med][, .(id_code, id_label, ethnic_code, sex, CI5_volume,
                                   asr, median_asr = med, ratio = asr / med, flag = "low")]
  out_list[[length(out_list) + 1]] <- rbind(hi, lo)
}
spat <- rbindlist(out_list)
if (nrow(spat)) spat <- spat[order(sex, CI5_volume, -ratio)]
fwrite(spat, file.path(out_dir, "03_spatial_outliers.tsv"), sep = "\t")

## 04 ethnic contrasts ---------------------------------------------------------
eth_sub <- A[ethnic_code != 99 & !is.na(asr)]
if (nrow(eth_sub)) {
  eth_ctr <- eth_sub[, .(max_asr = max(asr), min_asr = min(asr),
                         ratio   = if (isTRUE(min(asr) > 0)) max(asr) / min(asr) else NA_real_,
                         hi_eth  = ethnic_code[which.max(asr)],
                         lo_eth  = ethnic_code[which.min(asr)],
                         n_sub   = uniqueN(ethnic_code)),
                     by = .(country_code, CI5_volume, sex)]
  eth_ctr <- eth_ctr[n_sub >= 2 & !is.na(ratio) & ratio >= 2][order(-ratio)]
  fwrite(eth_ctr, file.path(out_dir, "04_ethnic_contrasts.tsv"), sep = "\t")
} else {
  fwrite(data.table(), file.path(out_dir, "04_ethnic_contrasts.tsv"), sep = "\t")
}

## 05 sex ratio ----------------------------------------------------------------
if (!CANCER %in% SEX_SPECIFIC) {
  wide <- dcast(A[ethnic_code == 99 & asr > 0],
                id_code + id_label + CI5_volume ~ sex, value.var = "asr")
  setnames(wide, c("1", "2"), c("asr_m", "asr_f"), skip_absent = TRUE)
  if (all(c("asr_m", "asr_f") %in% names(wide))) {
    wide <- wide[!is.na(asr_m) & !is.na(asr_f) & asr_f > 0]
    wide[, mf_ratio := asr_m / asr_f]
    # global median ratio per volume
    med_by_vol <- wide[, .(vol_med = median(mf_ratio)), by = CI5_volume]
    wide <- merge(wide, med_by_vol, by = "CI5_volume")
    wide[, flag := ifelse(mf_ratio > 2 * vol_med, "male_heavy",
                   ifelse(mf_ratio < 0.5 * vol_med, "female_heavy", ""))]
    flagged <- wide[flag != ""][order(CI5_volume, -mf_ratio)]
    fwrite(flagged, file.path(out_dir, "05_sex_ratio.tsv"), sep = "\t")
  }
} else {
  writeLines("(sex-specific cancer — skipped)", file.path(out_dir, "05_sex_ratio.tsv"))
}

## 06 age curve anomalies ------------------------------------------------------
ag <- age[cancer_code == CANCER & py > 0]
ag[, rate := cases / py * 1e5]
# total cases per (id_code, CI5_volume, sex)
totals <- ag[, .(tot_cases = sum(cases)), by = .(id_code, CI5_volume, sex)]
ag <- merge(ag, totals, by = c("id_code", "CI5_volume", "sex"))
ag <- ag[tot_cases >= 50]
if (nrow(ag)) {
  anom <- ag[, {
    o <- order(age)
    a <- age[o]; r <- rate[o]
    gmax <- max(r)
    peak <- a[which.max(r)]
    early <- peak <= 8
    # bimodal: a local max in low bands and another in high bands, each >= 50% gmax
    low_peak  <- any(r[a <= 8]  >= 0.5 * gmax & r[a <= 8]  == max(r[a <= 8], 0))
    high_peak <- any(r[a >= 12] >= 0.5 * gmax & r[a >= 12] == max(r[a >= 12], 0))
    # require the low and high peaks to be separated by a trough at least 30% below whichever peak is lower
    bimodal <- FALSE
    if (low_peak && high_peak) {
      lp <- max(r[a <= 8]);  hp <- max(r[a >= 12])
      mid <- r[a > 8 & a < 12]
      if (length(mid) && min(mid) < 0.7 * min(lp, hp) && min(lp, hp) >= 0.3 * gmax) bimodal <- TRUE
    }
    .(peak_age_band = peak, peak_rate = gmax, tot_cases = tot_cases[1],
      early_peak = early, bimodal = bimodal)
  }, by = .(id_code, id_label, ethnic_code, CI5_volume, sex)]
  flagged <- anom[early_peak | bimodal][order(-bimodal, peak_age_band)]
  fwrite(flagged, file.path(out_dir, "06_age_curve_anomalies.tsv"), sep = "\t")
} else {
  fwrite(data.table(), file.path(out_dir, "06_age_curve_anomalies.tsv"), sep = "\t")
}

## 07 caveats ------------------------------------------------------------------
caveat_lines <- c(sprintf("Cancer: %s (code %d, %s)",
                          cancer_row$cancer_label[1], CANCER, cancer_row$icd10[1]))
w <- dct$cancer_warning[cancer_code == CANCER]
if (nrow(w)) caveat_lines <- c(caveat_lines, "", "Definition warning:", w$warning)
pw <- dct$pop_warning[id_code %in% unique(A$id_code)]
if (nrow(pw)) {
  caveat_lines <- c(caveat_lines, "",
                    "Population jumps flagged for these registries (see pop_warning.csv):")
  caveat_lines <- c(caveat_lines,
                    sprintf("  - %s (vol %d)", pw$id_label, pw$volume))
}
writeLines(caveat_lines, file.path(out_dir, "07_caveats.txt"))

## stdout summary --------------------------------------------------------------
n_shapes <- trend_tbl[, .N, by = shape]
top_high <- if (nrow(spat) && any(spat$flag == "high"))
              spat[flag == "high"][order(-ratio)][1] else NULL
cat(sprintf("=== %s (code %d) ===\n", cancer_row$short_label[1], CANCER))
cat(sprintf("trend rows: %d\n", nrow(trend_tbl)))
print(n_shapes)
if (!is.null(top_high)) {
  cat(sprintf("top spatial outlier: %s sex=%d vol=%d asr=%.1f (%.1fx median)\n",
              top_high$id_label, top_high$sex, top_high$CI5_volume,
              top_high$asr, top_high$ratio))
} else {
  cat("top spatial outlier: (none passed threshold)\n")
}
cat(sprintf("age-curve flags: %d\n",
            tryCatch(nrow(flagged), error = function(e) 0L)))
cat(sprintf("output: %s\n", out_dir))
