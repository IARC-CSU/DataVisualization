## scripts/audit_finding.R
## Reusable helper for CI5 sherlock finding audits.
## Pulls ASR, crude rate, cases and person-years for a given
## (cancer_code, id_code, sex, volume) cell; flags pyramid artefacts,
## low case counts, coding breaks, population jumps, coverage changes.

suppressPackageStartupMessages({
  library(data.table)
})

.CI5_CACHE <- new.env(parent = emptyenv())

.load_cache <- function(with_age = FALSE) {
  if (!exists("asr", envir = .CI5_CACHE)) {
    .CI5_CACHE$asr     <- readRDS("C:/project/CI5 sherlock/cache/asr.rds")
    .CI5_CACHE$id_long <- readRDS("C:/project/CI5 sherlock/cache/id_long.rds")
    .CI5_CACHE$dict    <- readRDS("C:/project/CI5 sherlock/cache/dict.rds")
  }
  if (with_age && !exists("age", envir = .CI5_CACHE)) {
    .CI5_CACHE$age <- readRDS("C:/project/CI5 sherlock/cache/age.rds")
  }
  invisible(.CI5_CACHE)
}

#' audit_finding: core checker for one registry x cancer x sex x volume range.
#'
#' @param cancer_code integer
#' @param id_code integer (9-digit CI5 id_code), or vector for combos
#' @param sex 1=M, 2=F; if NA, both sexes are summed
#' @param volumes integer vector of CI5 volumes to inspect
#' @return data.table with one row per volume listing cases, py, asr, crude rate,
#'         and a set of caveat flags.
audit_finding <- function(cancer_code, id_code, sex = NA,
                          volumes = 1:12) {
  .load_cache()
  asr <- .CI5_CACHE$asr
  dict <- .CI5_CACHE$dict

  sexes_arg    <- if (any(is.na(sex))) c(1, 2) else sex
  cancer_arg   <- cancer_code
  id_arg       <- id_code
  volumes_arg  <- volumes
  keep <- asr$cancer_code %in% cancer_arg &
            asr$id_code   %in% id_arg &
            asr$sex       %in% sexes_arg &
            asr$CI5_volume %in% volumes_arg
  sub <- asr[keep]
  if (!nrow(sub)) {
    return(data.table(volume = integer(), cases = integer(), py = numeric(),
                      asr = numeric(), crude = numeric(), period = character(),
                      n_registries = integer()))
  }

  # sum cases and py across possibly multiple id_codes or sexes; ASR combined
  # via person-years weighting would be inaccurate here -> instead report the
  # case-weighted average ASR (fine for sanity-checking, not publication).
  out <- sub[, .(
    cases        = sum(cases),
    py           = sum(py),
    asr_casewt   = sum(asr * cases) / pmax(sum(cases), 1),
    n_rows       = .N,
    period       = paste(sort(unique(period)), collapse = "/"),
    year_start   = min(year_start, na.rm = TRUE),
    year_end     = max(year_end, na.rm = TRUE)
  ), by = .(volume = CI5_volume)]

  # single-id_code + single sex case: ASR is exact
  if (length(id_code) == 1 && length(sexes_arg) == 1) {
    out_exact <- sub[, .(asr = mean(asr)), by = .(volume = CI5_volume)]
    out <- merge(out, out_exact, by = "volume", all.x = TRUE)
  } else {
    out[, asr := asr_casewt]
  }
  out[, crude := cases / py * 1e5]
  out[, asr_casewt := NULL]

  # caveat flags
  cw <- dict$cancer_warning
  pw <- dict$pop_warning
  out[, flag_small_N   := cases < 20]
  out[, flag_coding    := cancer_code %in% cw$cancer_code]
  id_arg2 <- id_code
  out[, flag_pop_warn  := vapply(volume, function(v) {
    any(pw$id_code %in% id_arg2 & pw$volume == v)
  }, logical(1))]
  setcolorder(out, c("volume", "period", "year_start", "year_end",
                     "cases", "py", "asr", "crude",
                     "flag_small_N", "flag_coding", "flag_pop_warn"))
  setorder(out, volume)
  out[]
}

#' Compact label for a registry from id_dict
id_label <- function(id_code) {
  .load_cache()
  dict <- .CI5_CACHE$dict
  # look it up from the id_long (has a label via merged data)
  ids <- unique(.CI5_CACHE$asr[id_code %in% ..id_code,
                               .(id_code, id_label)])
  ids
}

#' Pretty-print audit, adding crude/ASR divergence verdict
print_audit <- function(cancer_code, id_code, sex = NA,
                        volumes = 1:12, label = "") {
  a <- audit_finding(cancer_code, id_code, sex = sex, volumes = volumes)
  if (!nrow(a)) {
    cat(sprintf("[%s] NO DATA (cancer=%s id=%s sex=%s)\n",
                label, cancer_code, paste(id_code, collapse=","), sex))
    return(invisible(a))
  }
  cat(sprintf("[%s] cancer=%s id=%s sex=%s\n",
              label, cancer_code, paste(id_code, collapse=","), paste(sex, collapse=",")))
  print(a[, .(volume, period, cases, py = round(py),
              asr = round(asr, 2), crude = round(crude, 2),
              flags = paste0(
                ifelse(flag_small_N,  "N",  ""),
                ifelse(flag_coding,   "C",  ""),
                ifelse(flag_pop_warn, "P",  "")))])
  # crude-vs-asr sanity
  if (nrow(a) >= 2) {
    first <- a[1]; last <- a[.N]
    d_asr   <- last$asr   - first$asr
    d_crude <- last$crude - first$crude
    verdict <- if (sign(d_asr) != 0 &&
                   sign(d_crude) != 0 &&
                   sign(d_asr) != sign(d_crude)) {
      "*** ASR and crude DIVERGE -> possibly pyramid artefact ***"
    } else if (abs(d_asr) < 0.1 * max(abs(first$asr), 1)) {
      "ASR roughly flat — trend story weak."
    } else {
      "ASR and crude agree in direction."
    }
    cat("  ", verdict, "\n")
  }
  invisible(a)
}

# a helper: resolve a registry by label substring
find_registry <- function(pattern) {
  .load_cache()
  asr <- .CI5_CACHE$asr
  u <- unique(asr[, .(id_code, id_label, ethnic_code, country_code)])
  u[grepl(pattern, u$id_label, ignore.case = TRUE)]
}

invisible(NULL)
