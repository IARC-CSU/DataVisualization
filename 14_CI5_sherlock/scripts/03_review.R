suppressPackageStartupMessages(library(data.table))

args <- commandArgs(trailingOnly = TRUE)
CANCER <- as.integer(args[[1]])

CACHE   <- "C:/project/CI5 sherlock/cache"
REPORTS <- "C:/project/CI5 sherlock/reports/_scratch"

dct <- readRDS(file.path(CACHE, "dict.rds"))
cancer_row <- dct$cancer[cancer_code == CANCER]
safe_label <- gsub("[^A-Za-z0-9]+", "_", cancer_row$short_label[1])
dir <- file.path(REPORTS, sprintf("%02d_%s", CANCER, safe_label))

cat(sprintf("\n============== %s (code %d, %s) ==============\n",
            cancer_row$cancer_label[1], CANCER, cancer_row$icd10[1]))

cav <- readLines(file.path(dir, "07_caveats.txt"))
cat(paste(cav, collapse = "\n"), "\n\n")

fmt <- function(dt, n = 10, cols = NULL) {
  if (!nrow(dt)) return(invisible())
  if (!is.null(cols)) dt <- dt[, ..cols]
  print(head(dt, n))
}

# Top U-shapes and inverted-U
for (s in 1:2) {
  f <- file.path(dir, sprintf("01_top_trends_sex%d.tsv", s))
  if (!file.exists(f)) next
  t <- fread(f)
  if (!nrow(t)) next
  sex_lbl <- c("male", "female")[s]
  cat(sprintf("---- %s U-shapes (top 6 by magnitude) ----\n", sex_lbl))
  u <- t[shape == "U"][order(-max_asr / min_asr)]
  fmt(u, 6, c("id_label","first_vol","first_asr","min_vol","min_asr","max_vol","max_asr","last_vol","last_asr"))
  cat(sprintf("\n---- %s inverted-U (top 6 by magnitude) ----\n", sex_lbl))
  iu <- t[shape == "inverted-U"][order(-max_asr / pmax(min_asr, 0.01))]
  fmt(iu, 6, c("id_label","first_vol","first_asr","max_vol","max_asr","last_vol","last_asr"))
  cat(sprintf("\n---- %s biggest increases (top 6) ----\n", sex_lbl))
  up <- t[pct_change > 0][order(-pct_change)]
  fmt(up, 6, c("id_label","first_vol","first_asr","last_vol","last_asr","pct_change","shape"))
  cat(sprintf("\n---- %s biggest decreases (top 6) ----\n", sex_lbl))
  dn <- t[pct_change < 0][order(pct_change)]
  fmt(dn, 6, c("id_label","first_vol","first_asr","last_vol","last_asr","pct_change","shape"))
  cat("\n")
}

# Spatial outliers
spat <- fread(file.path(dir, "03_spatial_outliers.tsv"))
if (nrow(spat)) {
  cat("---- top 8 spatial outliers (ratio to volume-sex median) ----\n")
  fmt(spat[order(-ratio)], 8, c("id_label","sex","CI5_volume","asr","median_asr","ratio","flag"))
  cat("\n")
}

# Ethnic contrasts
eth <- fread(file.path(dir, "04_ethnic_contrasts.tsv"))
if (nrow(eth)) {
  cat("---- top 6 ethnic contrasts within country ----\n")
  id_dict <- dct$cancer  # just to avoid scoping surprise
  fmt(eth[order(-ratio)], 6)
  cat("\n")
}

# Sex ratio
sr_path <- file.path(dir, "05_sex_ratio.tsv")
if (file.exists(sr_path)) {
  sr_first <- readLines(sr_path, n = 1)
  if (!startsWith(sr_first, "(sex-specific")) {
    sr <- fread(sr_path)
    if (nrow(sr)) {
      cat("---- top 6 sex-ratio anomalies ----\n")
      fmt(sr[order(-abs(log(mf_ratio / vol_med)))], 6,
          c("id_label","CI5_volume","asr_m","asr_f","mf_ratio","vol_med","flag"))
      cat("\n")
    }
  }
}

# Age-curve anomalies — focus on bimodal then early peak
age <- fread(file.path(dir, "06_age_curve_anomalies.tsv"))
if (nrow(age)) {
  bi <- age[bimodal == TRUE]
  if (nrow(bi)) {
    cat("---- bimodal age-curve registries (top 8 by cases) ----\n")
    fmt(bi[order(-tot_cases)], 8,
        c("id_label","ethnic_code","CI5_volume","sex","peak_age_band","peak_rate","tot_cases"))
    cat("\n")
  }
  ep <- age[early_peak == TRUE & bimodal == FALSE]
  if (nrow(ep)) {
    cat("---- early-peak (<=45 yr) registries (top 8 by cases) ----\n")
    fmt(ep[order(peak_age_band, -tot_cases)], 8,
        c("id_label","ethnic_code","CI5_volume","sex","peak_age_band","peak_rate","tot_cases"))
    cat("\n")
  }
}
