suppressPackageStartupMessages(library(data.table))

DATA_DIR  <- "C:/Data/CI5_all/summary"
CACHE_DIR <- "C:/project/CI5 sherlock/cache"
dir.create(CACHE_DIR, showWarnings = FALSE, recursive = TRUE)

csv <- function(name) file.path(DATA_DIR, name)
rds <- function(name) file.path(CACHE_DIR, name)

fresh <- function(rds_path, csv_paths) {
  if (!file.exists(rds_path)) return(FALSE)
  rds_mtime <- file.info(rds_path)$mtime
  all(file.info(csv_paths)$mtime < rds_mtime)
}

id_raw      <- fread(csv("id_dict.csv"))
cancer_dict <- fread(csv("cancer_dict.csv"))
cancer_warn <- fread(csv("cancer_warning.csv"))
pop_warn    <- fread(csv("pop_warning.csv"))

# Long registry x volume table with parsed period.
vol_cols <- grep("^CI5_", names(id_raw), value = TRUE)
id_long <- melt(
  id_raw,
  id.vars       = c("id_code", "country_code", "registry_code", "ethnic_code", "id_label"),
  measure.vars  = vol_cols,
  variable.name = "vol_label",
  value.name    = "period"
)
id_long[, period := ifelse(period == "NA" | period == "", NA_character_, as.character(period))]
id_long <- id_long[!is.na(period)]
id_long[, CI5_volume := as.integer(sub("CI5_", "", vol_cols))[match(vol_label, vol_cols)]]
id_long[, c("year_start", "year_end") := {
  p <- tstrsplit(period, "-", fixed = TRUE)
  list(as.integer(p[[1]]), as.integer(p[[2]]))
}]
id_long[, vol_label := NULL]
setcolorder(id_long, c("id_code", "CI5_volume", "country_code", "registry_code",
                       "ethnic_code", "id_label", "period", "year_start", "year_end"))
setkey(id_long, id_code, CI5_volume)

saveRDS(id_long, rds("id_long.rds"))
saveRDS(list(cancer = cancer_dict, cancer_warning = cancer_warn, pop_warning = pop_warn),
        rds("dict.rds"))

# Enrich ASR with labels + periods. Cache-gated — 7 MB so cheap, but still skip if fresh.
if (!fresh(rds("asr.rds"), c(csv("data_asr.csv"), csv("id_dict.csv"), csv("cancer_dict.csv")))) {
  asr <- fread(csv("data_asr.csv"))
  asr[, CI5_volume := as.integer(CI5_volume)]
  asr <- merge(asr, id_long, by = c("id_code", "CI5_volume"), all.x = TRUE)
  asr <- merge(asr,
               cancer_dict[, .(cancer_code, cancer_label, short_label, icd10)],
               by = "cancer_code", all.x = TRUE)
  saveRDS(asr, rds("asr.rds"))
} else {
  asr <- readRDS(rds("asr.rds"))
}

# Age-specific data is 3.8M rows — only re-read if stale.
if (!fresh(rds("age.rds"), c(csv("data.csv"), csv("id_dict.csv"), csv("cancer_dict.csv")))) {
  age <- fread(csv("data.csv"))
  age[, CI5_volume := as.integer(CI5_volume)]
  age <- merge(age, id_long, by = c("id_code", "CI5_volume"), all.x = TRUE)
  age <- merge(age,
               cancer_dict[, .(cancer_code, cancer_label, short_label)],
               by = "cancer_code", all.x = TRUE)
  saveRDS(age, rds("age.rds"))
} else {
  age <- readRDS(rds("age.rds"))
}

cat(sprintf(
  "ASR rows: %d | age rows: %d | registries: %d | cancers: %d | volumes %d-%d\n",
  nrow(asr), nrow(age),
  uniqueN(asr$id_code), uniqueN(asr$cancer_code),
  min(asr$CI5_volume, na.rm = TRUE), max(asr$CI5_volume, na.rm = TRUE)
))
