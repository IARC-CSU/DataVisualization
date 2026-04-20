## DEPRECATED 2026-04-20 — superseded by scripts/05_md_to_json.R + the JSON-driven
## site under findings/. This script used to bundle reports/*.md + cache/asr.rds
## into site/data.js; that pipeline is gone. Kept here for git history only.
stop("04_build_site.R is deprecated. Use scripts/05_md_to_json.R instead — see findings/README.md.")

suppressPackageStartupMessages({
  library(data.table)
  if (!requireNamespace("commonmark", quietly = TRUE))
    install.packages("commonmark", repos = "https://cloud.r-project.org")
  if (!requireNamespace("jsonlite", quietly = TRUE))
    install.packages("jsonlite",  repos = "https://cloud.r-project.org")
  library(commonmark)
  library(jsonlite)
})

CACHE   <- "C:/project/CI5 sherlock/cache"
REPORTS <- "C:/project/CI5 sherlock/reports"
SITE    <- "C:/project/CI5 sherlock/site"

asr <- readRDS(file.path(CACHE, "asr.rds"))
dct <- readRDS(file.path(CACHE, "dict.rds"))

SEX_SPECIFIC <- c(29, 32, 33, 34, 36, 37, 38, 39, 40, 41)

VOL_PERIODS <- list(
  "1"  = "1953\u20131965", "2"  = "1963\u20131967", "3"  = "1968\u20131972",
  "4"  = "1973\u20131977", "5"  = "1978\u20131982", "6"  = "1983\u20131987",
  "7"  = "1988\u20131992", "8"  = "1993\u20131997", "9"  = "1998\u20132002",
  "10" = "2003\u20132007", "11" = "2008\u20132012", "12" = "2013\u20132017"
)

## helpers --------------------------------------------------------------------

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

# Cancer-scoped ASR table with the same ethnic filter as 02_per_cancer.R.
cancer_asr <- function(code) {
  A <- asr[cancer_code == code]
  keep_eth <- A[, .(nvol = uniqueN(CI5_volume)),
                by = .(country_code, ethnic_code, sex)][nvol >= 3]
  A[ethnic_code == 99 |
    paste(country_code, ethnic_code, sex) %in%
    paste(keep_eth$country_code, keep_eth$ethnic_code, keep_eth$sex)]
}

# Trend table mirroring 02_per_cancer.R (n_vol >= 4, sorted by abs(pct_change)).
trend_table <- function(A) {
  At <- A[!is.na(asr)]
  tt <- At[, {
    o <- order(CI5_volume); v <- CI5_volume[o]; a <- asr[o]
    .(n_vol = length(v),
      first_asr = a[1], last_asr = tail(a, 1),
      pct_change = if (isTRUE(a[1] > 0)) (tail(a, 1) - a[1]) / a[1] * 100 else NA_real_,
      shape = shape_tag(a, v))
  }, by = .(id_code, id_label, ethnic_code, sex)][n_vol >= 4]
  tt[, abs_pct := abs(pct_change)]
  tt
}

# Pull a (vol, asr) series for one (cancer_code, id_code, sex) as a list of length-2 vecs.
series_for <- function(code, id, s) {
  d <- asr[cancer_code == code & id_code == id & sex == s & !is.na(asr)][order(CI5_volume)]
  if (!nrow(d)) return(list())
  lapply(seq_len(nrow(d)), function(i) c(d$CI5_volume[i], round(d$asr[i], 2)))
}

IACR_BASE <- "https://www.the-iacr.net/en/ci5-2.0/dataviz/all/trends_volumes"

# Deep link into the IACR CI5 2.0 dataviz.
# - One id_code: single-registry chart.
# - Multiple id_codes: joined with "_" — IACR plots them on the same chart.
# `sex` is 1 (Males), 2 (Females), or 0 (both / by sex).
iacr_url <- function(code, ids, sex = 0L) {
  sprintf("%s?mode=population&multiple_populations=1&cancers=%d&populations=%s&sexes=%d",
          IACR_BASE, code, paste(ids, collapse = "_"), sex)
}

# Build a registry block (label/shape/series + IACR deep link) for spotlight or hero.
make_registry <- function(code, id, s, label = NULL, shape = NA_character_) {
  ser <- series_for(code, id, s)
  if (!length(ser)) return(NULL)
  lab <- if (is.null(label)) asr[id_code == id, id_label[1L]] else label
  list(label = lab, shape = shape, series = ser,
       id_code = id, sex = s,
       iacr_url = iacr_url(code, id, s))
}

# Resolve a registry by a partial id_label match (+ optional ethnic_code).
resolve_id <- function(pattern, ethnic = 99L, ignore_case = TRUE) {
  ids <- unique(asr[, .(id_code, id_label, ethnic_code)])
  hit <- ids[grepl(pattern, id_label, ignore.case = ignore_case) & ethnic_code == ethnic]
  if (!nrow(hit)) {
    cat(sprintf("WARN: registry not found: pattern='%s' ethnic=%s\n", pattern, ethnic))
    return(NA_integer_)
  }
  hit$id_code[1L]
}

# Build a spotlight from a list of registry specs.
make_spotlight <- function(rank, title, subtitle, cancer_code, cancer_short, sex, regs) {
  ids   <- vapply(regs, function(r) resolve_id(r$pattern, r$ethnic %||% 99L), integer(1))
  out   <- list()
  for (i in seq_along(regs)) {
    if (is.na(ids[i])) next
    rg <- make_registry(cancer_code, ids[i], sex, label = regs[[i]]$label, shape = regs[[i]]$shape)
    if (!is.null(rg)) out[[length(out) + 1L]] <- rg
  }
  combined <- if (length(out)) iacr_url(cancer_code, vapply(out, `[[`, integer(1), "id_code"), sex) else NA_character_
  list(rank = rank, title = title, subtitle = subtitle,
       cancer_code = cancer_code, cancer_short = cancer_short, sex = sex,
       combined_iacr_url = combined,
       registries = out)
}

`%||%` <- function(a, b) if (is.null(a)) b else a

# Top-N hero registries for a (cancer, sex) — by abs % change, n_vol >= 4.
hero_panel <- function(code, s, sex_label, n = 8) {
  A  <- cancer_asr(code)
  tt <- trend_table(A[sex == s])
  if (!nrow(tt)) {
    return(list(sex = s, sex_label = sex_label,
                title = sprintf("%s: striking ASR trends across CI5 vols I\u2013XII", sex_label),
                registries = list()))
  }
  top <- tt[order(-abs_pct)][seq_len(min(n, .N))]
  regs <- list()
  for (i in seq_len(nrow(top))) {
    rg <- make_registry(code, top$id_code[i], s, label = top$id_label[i], shape = top$shape[i])
    if (!is.null(rg)) regs[[length(regs) + 1L]] <- rg
  }
  combined <- if (length(regs)) iacr_url(code, vapply(regs, `[[`, integer(1), "id_code"), s) else NA_character_
  list(sex = s, sex_label = sex_label,
       title = sprintf("%s: striking ASR trends across CI5 vols I\u2013XII", sex_label),
       combined_iacr_url = combined,
       registries = regs)
}

## markdown helpers ----------------------------------------------------------

# Strip the "# Title" line and the "## Quick take" section from a per-cancer .md.
strip_title_and_quick <- function(lines) {
  drop <- rep(FALSE, length(lines))
  in_quick <- FALSE
  for (i in seq_along(lines)) {
    ln <- lines[i]
    if (i == 1 && grepl("^# ", ln)) { drop[i] <- TRUE; next }
    if (grepl("^##\\s+Quick take", ln, ignore.case = TRUE)) { in_quick <- TRUE; drop[i] <- TRUE; next }
    if (in_quick && grepl("^##\\s", ln)) in_quick <- FALSE
    if (in_quick) drop[i] <- TRUE
  }
  lines[!drop]
}

# First paragraph after "## Quick take".
extract_quick_take <- function(lines) {
  i <- grep("^##\\s+Quick take", lines, ignore.case = TRUE)
  if (!length(i)) return("")
  j <- i[1] + 1L
  while (j <= length(lines) && !nzchar(trimws(lines[j]))) j <- j + 1L
  para <- character()
  while (j <= length(lines) && nzchar(trimws(lines[j])) && !grepl("^##\\s", lines[j])) {
    para <- c(para, lines[j]); j <- j + 1L
  }
  paste(trimws(para), collapse = " ")
}

# Rewrite [text](NN_slug.md) markdown links to point at cancer.html#code=NN.
rewrite_md_links <- function(md_text) {
  gsub("\\]\\(([0-9]{1,2})_[A-Za-z0-9_]+\\.md\\)",
       "](cancer.html#code=\\1)", md_text)
}

md_to_html <- function(md_text) {
  if (!length(md_text) || !nzchar(md_text)) return("")
  commonmark::markdown_html(rewrite_md_links(md_text), extensions = TRUE)
}

## findings parsing & registry auto-matching --------------------------------

# Parse a per-cancer .md into list(section). Each section has heading,
# intro_md (text between heading and first bullet), and bullets (list of md).
# "Quick take" is skipped (handled separately).
parse_findings <- function(md_lines) {
  starts <- grep("^## ", md_lines)
  if (!length(starts)) return(list())
  starts_ext <- c(starts, length(md_lines) + 1L)
  titles <- sub("^##\\s+", "", md_lines[starts])
  out <- list()
  for (i in seq_along(titles)) {
    if (grepl("Quick take", titles[i], ignore.case = TRUE)) next
    body <- md_lines[(starts_ext[i] + 1L):(starts_ext[i + 1] - 1L)]
    # Bullet starts: "- " or "1." / "10." style numbered list
    bs <- grep("^(- |\\d+\\.\\s)", body, perl = TRUE)
    if (!length(bs)) {
      out[[length(out) + 1L]] <- list(heading = titles[i],
                                       intro_md = paste(body, collapse = "\n"),
                                       bullets = list())
      next
    }
    intro <- if (bs[1] > 1L) body[seq_len(bs[1] - 1L)] else character()
    bes <- c(tail(bs, -1L) - 1L, length(body))
    bullets <- lapply(seq_along(bs), function(j) {
      list(md = paste(body[bs[j]:bes[j]], collapse = "\n"))
    })
    out[[length(out) + 1L]] <- list(heading = titles[i],
                                     intro_md = paste(intro, collapse = "\n"),
                                     bullets = bullets)
  }
  out
}

# Strip leading "- " or "N." marker and any 2-space continuation indent so a
# bullet renders as a paragraph (not a one-item <ul>/<ol>).
bullet_md_to_paragraph <- function(bullet_md) {
  lines <- strsplit(bullet_md, "\n", fixed = TRUE)[[1]]
  lines[1] <- sub("^(-\\s+|\\d+\\.\\s+)", "", lines[1], perl = TRUE)
  lines <- sub("^  ", "", lines)
  paste(lines, collapse = "\n")
}

# Generic single-word "distinctive" names that match too liberally (e.g.
# "East" in id_labels like "UK, England, East" matches "East Asia" in prose).
# When the distinctive normalises to one of these alone, we skip the registry
# from auto-matching (the cancer-specific top-N hero would still surface it).
GENERIC_TOKENS <- c("east", "west", "north", "south", "central",
                    "northern", "southern", "eastern", "western",
                    "midlands", "midwest", "rural", "urban",
                    "metropolitan", "mainland", "island", "islands",
                    "white", "black", "other")

# Cached registry index for word-boundary regex matching against bullet text.
REGISTRY_INDEX <- NULL
init_registry_index <- function() {
  if (!is.null(REGISTRY_INDEX)) return(invisible())
  ids <- unique(asr[, .(id_code, id_label, country_code, ethnic_code)])
  # distinctive = the most specific comma-separated chunk of id_label
  ids[, distinctive := vapply(strsplit(id_label, ", ", fixed = TRUE),
                              function(p) p[length(p)], "")]
  # Strip punctuation (": " etc.) and generic geographic suffixes.
  drop_words <- "\\b(County|City|Prefecture|Region|State|District|Area|Province)\\b"
  ids[, dist_alt := trimws(gsub("\\s+", " ",
                                 gsub(":\\s*", " ", distinctive, perl = TRUE)))]
  ids[, dist_short := trimws(gsub("\\s+", " ",
                                   gsub(drop_words, "", dist_alt, perl = TRUE)))]
  # Skip registries whose distinctive name normalises to a single generic word.
  ids[, is_generic := tolower(dist_alt) %in% GENERIC_TOKENS |
                       tolower(dist_short) %in% GENERIC_TOKENS]
  # Country-aggregate row = id_label has no comma (e.g. "Chile", "Iceland").
  ids[, is_country_agg := !grepl(", ", id_label, fixed = TRUE)]
  REGISTRY_INDEX <<- ids
}

apply_bullet_synonyms <- function(s) {
  s <- gsub("\\bJewish\\b", "Jews", s, perl = TRUE)
  s
}

# Word-boundary regex match (escaped). Matches the registry name as a token,
# so "Chilean" does NOT match "Chile".
.contains_token <- function(token, text) {
  if (!nzchar(token)) return(FALSE)
  pat <- paste0("(?<![\\p{L}\\p{N}])", regex_escape(token), "(?![\\p{L}\\p{N}])")
  grepl(pat, text, perl = TRUE)
}
regex_escape <- function(s) gsub("([][{}()+*^$.|?\\\\])", "\\\\\\1", s, perl = TRUE)

# Return id_codes whose distinctive name appears as a token in the bullet.
# Country-aggregate rows (no comma in id_label) are dropped when a more
# specific city/registry from the same country also matches.
match_bullet_registries <- function(bullet_md) {
  init_registry_index()
  bn <- apply_bullet_synonyms(bullet_md)
  hits <- vapply(seq_len(nrow(REGISTRY_INDEX)), function(i) {
    if (REGISTRY_INDEX$is_generic[i]) return(FALSE)
    d  <- REGISTRY_INDEX$distinctive[i]
    da <- REGISTRY_INDEX$dist_alt[i]
    ds <- REGISTRY_INDEX$dist_short[i]
    nchar(d) > 2L && (
      .contains_token(d,  bn) ||
      .contains_token(da, bn) ||
      (nchar(ds) > 2L && .contains_token(ds, bn))
    )
  }, logical(1))
  matched <- REGISTRY_INDEX[hits]
  if (!nrow(matched)) return(integer(0))
  # Drop country-aggregate rows when a more specific city of the same country matches.
  countries_with_city <- matched[is_country_agg == FALSE, unique(country_code)]
  matched <- matched[!(is_country_agg == TRUE & country_code %in% countries_with_city)]
  matched$id_code
}

# Sex inference: explicit "women"/"men" overrides default; default is per-cancer.
infer_bullet_sex <- function(bullet_md, default_sex) {
  has_w <- grepl("\\b(women|female|woman)\\b",  bullet_md, ignore.case = TRUE, perl = TRUE)
  has_m <- grepl("\\b(men|male|man)\\b",        bullet_md, ignore.case = TRUE, perl = TRUE)
  if (has_w && !has_m) return(2L)
  if (has_m && !has_w) return(1L)
  default_sex
}

# Build a structured finding for one bullet — text + matched registries +
# combined CI5 2.0 deep link. Drops registries with no series for the chosen sex.
build_bullet <- function(bullet_md, code, default_sex) {
  ids   <- match_bullet_registries(bullet_md)
  sx    <- infer_bullet_sex(bullet_md, default_sex)
  sx_ser <- if (sx == 0L) 1L else sx  # series fetch needs a real sex; URL keeps 0
  regs <- list()
  for (id in ids) {
    rg <- make_registry(code, id, sx_ser)
    if (!is.null(rg)) regs[[length(regs) + 1L]] <- rg
  }
  combined <- if (length(regs))
    iacr_url(code, vapply(regs, `[[`, integer(1), "id_code"), sx)
  else NA_character_
  list(text_html        = md_to_html(bullet_md_to_paragraph(bullet_md)),
       sex              = sx,
       registries       = regs,
       combined_iacr_url = combined)
}

## per_cancer block ----------------------------------------------------------

cancer_codes <- sort(setdiff(dct$cancer$cancer_code, c(62L, 63L)))

# Map cancer code -> reports/NN_label.md.
md_files <- list.files(REPORTS, pattern = "^[0-9]{2}_.*\\.md$", full.names = TRUE)
md_by_code <- setNames(md_files, sub("^.*/([0-9]{2})_.*$", "\\1", md_files))

build_per_cancer <- function(code) {
  row <- dct$cancer[cancer_code == code]
  md_path <- md_by_code[as.character(sprintf("%02d", code))]
  quick <- ""
  findings <- list()
  if (!is.na(md_path) && file.exists(md_path)) {
    lns <- readLines(md_path, warn = FALSE, encoding = "UTF-8")
    quick <- extract_quick_take(lns)
    sections <- parse_findings(lns)
    default_sex <- if (code %in% SEX_SPECIFIC) {
      if (code %in% c(29L, 32L, 33L, 34L, 36L, 37L)) 2L else 1L
    } else 0L
    findings <- lapply(sections, function(sec) {
      list(heading    = sec$heading,
           intro_html = if (nzchar(trimws(sec$intro_md))) md_to_html(sec$intro_md) else "",
           bullets    = lapply(sec$bullets, function(b)
             build_bullet(b$md, code, default_sex)))
    })
  } else {
    cat(sprintf("WARN: no markdown report for cancer %d\n", code))
  }
  list(code = code, label = row$cancer_label[1L], short = row$short_label[1L],
       icd10 = row$icd10[1L], quick_take = quick, findings = findings)
}

per_cancer <- list()
for (cc in cancer_codes) per_cancer[[as.character(cc)]] <- build_per_cancer(cc)
cat(sprintf("per_cancer entries built: %d\n", length(per_cancer)))

## cancers (sidebar nav) -----------------------------------------------------

cancers_nav <- lapply(cancer_codes, function(cc) {
  row <- dct$cancer[cancer_code == cc]
  list(code = cc, label = row$cancer_label[1L],
       short = row$short_label[1L], icd10 = row$icd10[1L])
})

## index findings (parsed from README.md) -----------------------------------

# Extract cancer codes referenced in a README bullet via [NN_slug.md] links.
extract_bullet_cancer_codes <- function(bullet_md) {
  hits <- regmatches(bullet_md,
                     gregexpr("\\b([0-9]{1,2})_[A-Za-z0-9_]+\\.md", bullet_md))[[1]]
  if (!length(hits)) return(integer(0))
  unique(as.integer(sub("_.*$", "", hits)))
}

# Build per-cancer chunks for one README bullet (one chunk per cancer mentioned).
build_index_bullet <- function(bullet_md) {
  codes <- extract_bullet_cancer_codes(bullet_md)
  ids_for_bullet <- match_bullet_registries(bullet_md)
  cancers_chunks <- lapply(codes, function(code) {
    default_sex <- if (code %in% SEX_SPECIFIC) {
      if (code %in% c(29L, 32L, 33L, 34L, 36L, 37L)) 2L else 1L
    } else 0L
    sx <- infer_bullet_sex(bullet_md, default_sex)
    sx_ser <- if (sx == 0L) 1L else sx
    regs <- list()
    for (id in ids_for_bullet) {
      rg <- make_registry(code, id, sx_ser)
      if (!is.null(rg)) regs[[length(regs) + 1L]] <- rg
    }
    if (!length(regs)) return(NULL)
    combined <- iacr_url(code, vapply(regs, `[[`, integer(1), "id_code"), sx)
    cancer_row <- dct$cancer[cancer_code == code]
    list(code = code,
         label = cancer_row$cancer_label[1L],
         short = cancer_row$short_label[1L],
         sex = sx,
         registries = regs,
         combined_iacr_url = combined)
  })
  cancers_chunks <- Filter(Negate(is.null), cancers_chunks)
  list(text_html = md_to_html(bullet_md_to_paragraph(bullet_md)),
       cancers = cancers_chunks)
}

readme_lines <- readLines(file.path(REPORTS, "README.md"),
                          warn = FALSE, encoding = "UTF-8")

# Intro = lines before the first ## section, drop any leading "# Title".
first_h2 <- grep("^## ", readme_lines)[1]
intro_lines <- if (is.na(first_h2) || first_h2 < 2) character() else readme_lines[1:(first_h2 - 1L)]
if (length(intro_lines) && grepl("^# ", intro_lines[1])) intro_lines <- intro_lines[-1]
index_intro_html <- md_to_html(paste(intro_lines, collapse = "\n"))

readme_sections <- parse_findings(readme_lines)
index_findings <- lapply(readme_sections, function(sec) {
  list(heading    = sec$heading,
       intro_html = if (nzchar(trimws(sec$intro_md))) md_to_html(sec$intro_md) else "",
       bullets    = lapply(sec$bullets, function(b) build_index_bullet(b$md)))
})
n_index_bullets <- sum(vapply(index_findings, function(s) length(s$bullets), integer(1)))
n_index_with_chart <- sum(vapply(index_findings, function(s)
  sum(vapply(s$bullets, function(b) as.integer(length(b$cancers) > 0), integer(1))),
  integer(1)))
cat(sprintf("index bullets: %d (%d with at least one vignette)\n",
            n_index_bullets, n_index_with_chart))

## assemble + write ----------------------------------------------------------

CI5 <- list(
  vol_periods = VOL_PERIODS,
  cancers     = cancers_nav,
  index       = list(intro_html = index_intro_html, findings = index_findings),
  per_cancer  = per_cancer
)

js_body <- jsonlite::toJSON(CI5, dataframe = "rows", auto_unbox = TRUE,
                            na = "null", null = "null", pretty = FALSE)
out_path <- file.path(SITE, "data.js")
con <- file(out_path, open = "wb", encoding = "UTF-8")
writeLines(c("window.CI5 = ", js_body, ";"), con, sep = "")
writeLines(";", con)
close(con)

# Re-write more cleanly: prepend / append in a single pass.
js_text <- paste0("window.CI5 = ", as.character(js_body), ";\n")
writeBin(charToRaw(enc2utf8(js_text)), out_path)

sz <- file.info(out_path)$size
cat(sprintf("wrote %s (%.1f KB)\n", out_path, sz / 1024))
cat("--- first 30 lines ---\n")
cat(paste(readLines(out_path, n = 30, warn = FALSE), collapse = "\n"), "\n")
