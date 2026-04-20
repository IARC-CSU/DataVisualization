## Batch-audit every finding in findings/index.json and findings/cancers/*.json.
## For each finding we (a) parse the ci5_url(s) to get cancer+populations+sex,
## (b) pull ASR + crude across all available volumes, (c) flag likely issues.

suppressPackageStartupMessages({
  library(data.table)
  library(jsonlite)
})
source("C:/project/CI5 sherlock/scripts/audit_finding.R")
.load_cache()
asr <- .CI5_CACHE$asr
dict <- .CI5_CACHE$dict

# Parse a CI5 2.0 URL to get cancer code, id codes, sex.
parse_ci5_url <- function(url) {
  if (is.null(url) || is.na(url) || url == "") return(NULL)
  m_cancer <- regmatches(url, regexpr("(?<![a-zA-Z_])cancers=\\d+", url, perl = TRUE))
  m_pops   <- regmatches(url, regexpr("(?<![a-zA-Z_])populations=[0-9_]+", url, perl = TRUE))
  m_sex    <- regmatches(url, regexpr("(?<![a-zA-Z_])sexes=\\d+", url, perl = TRUE))
  if (length(m_cancer) == 0 || length(m_pops) == 0) return(NULL)
  # split populations on underscore — but need numeric, handle >int32 by as.numeric
  pop_str <- sub("populations=", "", m_pops)
  ids <- strsplit(pop_str, "_", fixed = TRUE)[[1]]
  list(
    cancer_code = as.integer(sub("cancers=", "", m_cancer)),
    id_codes    = as.numeric(ids),  # some CI5 ids are large; matched as numeric
    sex         = if (length(m_sex)) as.integer(sub("sexes=", "", m_sex)) else 0L
  )
}

audit_one <- function(cancer_code, id_codes, sex) {
  if (is.null(cancer_code) || length(cancer_code) == 0) return(NULL)
  sx_arg <- if (is.null(sex) || any(is.na(sex)) || any(sex == 0)) c(1,2) else sex
  results <- list()
  for (idc in id_codes) {
    keep <- asr$cancer_code == cancer_code &
              asr$id_code == idc &
              asr$sex %in% sx_arg
    sub <- asr[keep]
    if (!nrow(sub)) next
    r <- data.table(
      id_code = idc,
      volume  = sub$CI5_volume,
      period  = sub$period,
      sex     = sub$sex,
      cases   = sub$cases,
      py      = sub$py,
      asr     = sub$asr,
      crude   = sub$cases / sub$py * 1e5
    )
    setorder(r, sex, volume)
    results[[as.character(idc)]] <- r
  }
  if (!length(results)) return(NULL)
  rbindlist(results)
}

# Summarise — first-last ASR/crude for each registry × sex, flag divergence.
summarise_trend <- function(r) {
  if (is.null(r) || !nrow(r)) return(data.table())
  s <- r[, .(
    n_vols     = .N,
    vol_first  = min(volume),
    vol_last   = max(volume),
    asr_first  = asr[which.min(volume)],
    asr_last   = asr[which.max(volume)],
    crude_first= crude[which.min(volume)],
    crude_last = crude[which.max(volume)],
    cases_min  = min(cases),
    cases_first= cases[which.min(volume)],
    cases_last = cases[which.max(volume)],
    asr_min    = min(asr),
    asr_max    = max(asr)
  ), by = .(id_code, sex)]
  s[, d_asr   := asr_last - asr_first]
  s[, d_crude := crude_last - crude_first]
  s[, pct_asr := ifelse(asr_first > 0, (asr_last - asr_first) / asr_first * 100, NA_real_)]
  s[, pct_crude := ifelse(crude_first > 0, (crude_last - crude_first) / crude_first * 100, NA_real_)]
  s[, diverge := sign(d_asr) != 0 & sign(d_crude) != 0 & sign(d_asr) != sign(d_crude)]
  s[, tiny    := cases_min < 20]
  s[, really_tiny := FALSE]
  s
}

# --- Iterate through all findings ------------------------------------------

out_rows <- list()
add_row <- function(source_file, section, id, title, text, info, notes) {
  out_rows[[length(out_rows) + 1L]] <<- data.table(
    file = source_file, section = section, fid = id,
    title = title, text = text, info = info, notes = notes
  )
}

process_finding <- function(source_file, section, f) {
  title <- if (!is.null(f$title)) f$title else ""
  fid   <- if (!is.null(f$id))    f$id    else ""
  text  <- if (!is.null(f$text))  f$text  else ""
  # handle both per-cancer (ci5_url scalar) and index (ci5_urls array)
  urls <- character(0)
  cu <- f$ci5_url
  if (!is.null(cu)) {
    cu <- unlist(cu)
    cu <- cu[!is.na(cu) & nzchar(cu)]
    urls <- c(urls, cu)
  }
  if (!is.null(f$ci5_urls) && length(f$ci5_urls) > 0) {
    for (u in f$ci5_urls) {
      if (!is.null(u$url)) {
        v <- unlist(u$url)
        v <- v[!is.na(v) & nzchar(v)]
        urls <- c(urls, v)
      }
    }
  }
  urls <- unique(urls)
  if (!length(urls)) {
    add_row(source_file, section, fid, title, text,
            "NO CI5 URL", "cannot auto-audit")
    return(invisible(NULL))
  }
  info_lines <- c()
  notes <- c()
  for (u in urls) {
    p <- parse_ci5_url(u)
    if (is.null(p)) next
    r <- audit_one(p$cancer_code, p$id_codes, p$sex)
    s <- summarise_trend(r)
    if (!nrow(s)) {
      info_lines <- c(info_lines, sprintf("cancer=%d: no data", p$cancer_code))
      next
    }
    for (i in seq_len(nrow(s))) {
      row <- s[i]
      idc <- as.numeric(row$id_code)
      keep_lbl <- asr$id_code == idc
      lbl <- unique(asr$id_label[keep_lbl])[1]
      info_lines <- c(info_lines, sprintf(
        "[C%d|id=%d|sx=%d] vols %d->%d  cases %d->%d  ASR %.2f->%.2f (%+.0f%%)  CRU %.2f->%.2f (%+.0f%%)  %s",
        p$cancer_code, row$id_code, row$sex,
        row$vol_first, row$vol_last,
        row$cases_first, row$cases_last,
        row$asr_first, row$asr_last, row$pct_asr,
        row$crude_first, row$crude_last, row$pct_crude,
        lbl
      ))
      if (!is.na(row$diverge) && isTRUE(row$diverge)) {
        notes <- c(notes, sprintf("DIVERGE id=%d sx=%d (ASR %+.2f, crude %+.2f)",
                                  row$id_code, row$sex, row$d_asr, row$d_crude))
      }
      if (isTRUE(row$tiny)) {
        notes <- c(notes, sprintf("SMALL_N id=%d sx=%d min cases=%d",
                                  row$id_code, row$sex, row$cases_min))
      }
    }
    # coding break
    cw <- dict$cancer_warning
    if (p$cancer_code %in% cw$cancer_code) {
      notes <- c(notes, sprintf("CODING_BREAK cancer=%d", p$cancer_code))
    }
    # pop warning
    pw <- dict$pop_warning
    bad <- pw[pw$id_code %in% p$id_codes]
    if (nrow(bad)) {
      for (k in seq_len(nrow(bad))) {
        notes <- c(notes, sprintf("POP_WARN id=%d vol=%d", bad$id_code[k], bad$volume[k]))
      }
    }
  }
  add_row(source_file, section, fid, title, text,
          paste(info_lines, collapse = " || "),
          paste(unique(notes), collapse = "; "))
}

process_file <- function(path, is_index = FALSE) {
  j <- fromJSON(path, simplifyVector = FALSE)
  if (!is.null(j$sections)) {
    for (sec in j$sections) {
      section_name <- if (!is.null(sec$heading)) sec$heading else ""
      if (!is.null(sec$findings)) {
        for (f in sec$findings) {
          process_finding(basename(path), section_name, f)
        }
      }
    }
  }
}

process_file("C:/project/CI5 sherlock/findings/index.json")
for (f in list.files("C:/project/CI5 sherlock/findings/cancers",
                     pattern = "\\.json$", full.names = TRUE)) {
  process_file(f)
}

res <- rbindlist(out_rows, fill = TRUE)
fwrite(res, "C:/project/CI5 sherlock/reports/_scratch/_audit_raw.csv")
cat("Wrote", nrow(res), "findings to _audit_raw.csv\n")
# print summary of diverge/small_N flags
flagged <- res[grepl("DIVERGE", notes) | grepl("SMALL_N", notes)]
cat("\nFindings with DIVERGE or SMALL_N flag:", nrow(flagged), "\n")
