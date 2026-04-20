## One-shot migration: reports/*.md + reports/README.md  ->  findings/*.json
## After this runs, the JSON files are the source of truth — edit them by hand.
suppressPackageStartupMessages({
  library(data.table)
  if (!requireNamespace("jsonlite",   quietly = TRUE)) install.packages("jsonlite",   repos = "https://cloud.r-project.org")
  if (!requireNamespace("commonmark", quietly = TRUE)) install.packages("commonmark", repos = "https://cloud.r-project.org")
  library(jsonlite); library(commonmark)
})

ROOT     <- "C:/project/CI5 sherlock"
CACHE    <- file.path(ROOT, "cache")
REPORTS  <- file.path(ROOT, "reports")
OUT      <- file.path(ROOT, "findings")
OUT_CAN  <- file.path(OUT, "cancers")
dir.create(OUT_CAN, showWarnings = FALSE, recursive = TRUE)

asr <- readRDS(file.path(CACHE, "asr.rds"))
dct <- readRDS(file.path(CACHE, "dict.rds"))

SEX_SPECIFIC_F <- c(29L, 32L, 33L, 34L, 36L, 37L)
SEX_SPECIFIC_M <- c(38L, 39L, 40L, 41L)

IACR_BASE <- "https://www.the-iacr.net/en/ci5-2.0/dataviz/all/trends_volumes"
iacr_url <- function(code, ids, sex = 0L) {
  if (!length(ids)) return("")
  sprintf("%s?mode=population&multiple_populations=1&cancers=%d&populations=%s&sexes=%d",
          IACR_BASE, code, paste(ids, collapse = "_"), sex)
}

## --- registry index + matching (lifted/adapted from 04_build_site.R) ---------

GENERIC_TOKENS <- c("east","west","north","south","central",
                    "northern","southern","eastern","western",
                    "midlands","midwest","rural","urban",
                    "metropolitan","mainland","island","islands",
                    "white","black","other")

REGISTRY_INDEX <- NULL
init_registry_index <- function() {
  if (!is.null(REGISTRY_INDEX)) return(invisible())
  ids <- unique(asr[, .(id_code, id_label, country_code, ethnic_code)])
  ids[, distinctive := vapply(strsplit(id_label, ", ", fixed = TRUE),
                              function(p) p[length(p)], "")]
  drop_words <- "\\b(County|City|Prefecture|Region|State|District|Area|Province)\\b"
  ids[, dist_alt   := trimws(gsub("\\s+", " ", gsub(":\\s*", " ", distinctive, perl = TRUE)))]
  ids[, dist_short := trimws(gsub("\\s+", " ", gsub(drop_words, "", dist_alt,  perl = TRUE)))]
  ids[, is_generic := tolower(dist_alt)   %in% GENERIC_TOKENS |
                       tolower(dist_short) %in% GENERIC_TOKENS]
  ids[, is_country_agg := !grepl(", ", id_label, fixed = TRUE)]
  REGISTRY_INDEX <<- ids
}
regex_escape <- function(s) gsub("([][{}()+*^$.|?\\\\])", "\\\\\\1", s, perl = TRUE)
.contains_token <- function(token, text) {
  if (!nzchar(token)) return(FALSE)
  pat <- paste0("(?<![\\p{L}\\p{N}])", regex_escape(token), "(?![\\p{L}\\p{N}])")
  grepl(pat, text, perl = TRUE)
}
apply_bullet_synonyms <- function(s) gsub("\\bJewish\\b", "Jews", s, perl = TRUE)

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
  countries_with_city <- matched[is_country_agg == FALSE, unique(country_code)]
  matched <- matched[!(is_country_agg == TRUE & country_code %in% countries_with_city)]
  matched$id_code
}

infer_bullet_sex <- function(bullet_md, default_sex) {
  has_w <- grepl("\\b(women|female|woman)\\b", bullet_md, ignore.case = TRUE, perl = TRUE)
  has_m <- grepl("\\b(men|male|man)\\b",       bullet_md, ignore.case = TRUE, perl = TRUE)
  if (has_w && !has_m) return(2L)
  if (has_m && !has_w) return(1L)
  default_sex
}

default_sex_for <- function(code) {
  if (code %in% SEX_SPECIFIC_F) return(2L)
  if (code %in% SEX_SPECIFIC_M) return(1L)
  0L
}

## --- markdown parsing -------------------------------------------------------

read_md <- function(path) readLines(path, warn = FALSE, encoding = "UTF-8")

# Drop "# Title" and "## Quick take" sections; return the rest.
strip_title_and_quick <- function(lines) {
  drop <- rep(FALSE, length(lines))
  in_quick <- FALSE
  for (i in seq_along(lines)) {
    if (i == 1 && grepl("^# ", lines[i])) { drop[i] <- TRUE; next }
    if (grepl("^##\\s+Quick take", lines[i], ignore.case = TRUE)) {
      in_quick <- TRUE; drop[i] <- TRUE; next
    }
    if (in_quick && grepl("^##\\s", lines[i])) in_quick <- FALSE
    if (in_quick) drop[i] <- TRUE
  }
  lines[!drop]
}

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

# section -> { heading, intro_md, bullets:[md] }
parse_findings <- function(md_lines) {
  starts <- grep("^## ", md_lines)
  if (!length(starts)) return(list())
  starts_ext <- c(starts, length(md_lines) + 1L)
  titles <- sub("^##\\s+", "", md_lines[starts])
  out <- list()
  for (i in seq_along(titles)) {
    if (grepl("Quick take", titles[i], ignore.case = TRUE)) next
    body <- md_lines[(starts_ext[i] + 1L):(starts_ext[i + 1] - 1L)]
    bs <- grep("^(- |\\d+\\.\\s)", body, perl = TRUE)
    if (!length(bs)) {
      out[[length(out) + 1L]] <- list(heading = titles[i],
                                       intro_md = paste(body, collapse = "\n"),
                                       bullets = list())
      next
    }
    intro <- if (bs[1] > 1L) body[seq_len(bs[1] - 1L)] else character()
    bes <- c(tail(bs, -1L) - 1L, length(body))
    bullets <- lapply(seq_along(bs),
                     function(j) paste(body[bs[j]:bes[j]], collapse = "\n"))
    out[[length(out) + 1L]] <- list(heading = titles[i],
                                     intro_md = paste(intro, collapse = "\n"),
                                     bullets = bullets)
  }
  out
}

# Strip bullet marker so it renders as a paragraph.
strip_bullet_marker <- function(bullet_md) {
  lines <- strsplit(bullet_md, "\n", fixed = TRUE)[[1]]
  lines[1] <- sub("^(-\\s+|\\d+\\.\\s+)", "", lines[1], perl = TRUE)
  lines <- sub("^  ", "", lines)
  paste(lines, collapse = "\n")
}

# Pull a leading **bold** prefix as the title; the rest of the bullet -> text.
# - Lazy `.+?` lets the bold span include inner *italic* asterisks.
# - Inner *italic* markers are stripped from the plain-text title.
# - When there is no leading bold prefix, title is "" (empty) and the full bullet
#   becomes the text — the site renders title-less findings cleanly.
split_title_text <- function(bullet_md) {
  body <- strip_bullet_marker(bullet_md)
  m <- regmatches(body, regexec("^\\*\\*(.+?)\\*\\*[[:space:]]*([\u2014\u2013\\-:.])?[[:space:]]*(.*)$",
                                 body, perl = TRUE))[[1]]
  if (length(m) >= 4 && nzchar(m[2])) {
    title <- gsub("\\*", "", trimws(m[2]))      # strip inner italic markers
    title <- gsub("[[:space:]]*[.,;:]+$", "", title)
    rest  <- trimws(m[4])
    if (!nzchar(rest)) rest <- gsub("^\\*\\*.+?\\*\\*[[:space:]]*[\u2014\u2013\\-:.]?[[:space:]]*",
                                     "", body, perl = TRUE)
    if (!nzchar(rest)) rest <- body
    return(list(title = title, text = rest))
  }
  list(title = "", text = body)
}

slugify <- function(s) {
  s <- tolower(s)
  s <- gsub("[^a-z0-9]+", "-", s, perl = TRUE)
  s <- gsub("^-+|-+$", "", s, perl = TRUE)
  if (!nchar(s)) s <- "finding"
  substr(s, 1, 60)
}

# Resolve a name -> two-digit padded "NN_label" used for the JSON filename.
slug_for_cancer <- function(label) {
  s <- tolower(label)
  s <- gsub("[^a-z0-9]+", "_", s, perl = TRUE)
  s <- gsub("^_+|_+$", "", s, perl = TRUE)
  s
}

extract_bullet_cancer_codes <- function(bullet_md) {
  hits <- regmatches(bullet_md,
                     gregexpr("\\b([0-9]{1,2})_[A-Za-z0-9_]+\\.md", bullet_md))[[1]]
  if (!length(hits)) return(integer(0))
  unique(as.integer(sub("_.*$", "", hits)))
}

# Convert markdown references to per-cancer reports into clickable links to the
# per-cancer site page, using the cancer's human label as the link text:
#   [32_cervix_uteri.md](32_cervix_uteri.md) -> [Cervix uteri](cancer.html#code=32)
#   bare 11_stomach.md                       -> [Stomach](cancer.html#code=11)
cancer_label_for <- function(code) {
  lab <- dct$cancer[cancer_code == code, cancer_label[1L]]
  if (length(lab) && !is.na(lab) && nchar(lab)) lab else sprintf("cancer %d", code)
}
strip_md_links_to_text <- function(md_text) {
  # First pass: explicit [...](NN_slug.md) markdown links.
  out <- gsub("\\[[^\\]]+\\]\\(([0-9]{1,2})_[A-Za-z0-9_]+\\.md\\)",
              "[__CCODE__\\1](cancer.html#code=\\1)", md_text, perl = TRUE)
  # Second pass: bare NN_slug.md references in the prose.
  out <- gsub("\\b([0-9]{1,2})_[A-Za-z0-9_]+\\.md\\b",
              "[__CCODE__\\1](cancer.html#code=\\1)", out, perl = TRUE)
  # Resolve __CCODE__NN tokens to the cancer label.
  m <- gregexpr("__CCODE__([0-9]{1,2})", out, perl = TRUE)
  matches <- regmatches(out, m)[[1]]
  if (length(matches)) {
    for (tok in unique(matches)) {
      code <- as.integer(sub("__CCODE__", "", tok))
      out <- gsub(tok, cancer_label_for(code), out, fixed = TRUE)
    }
  }
  out
}

## --- per-cancer build -------------------------------------------------------

build_finding <- function(bullet_md, code, default_sex, used_ids) {
  ids <- match_bullet_registries(bullet_md)
  sx  <- infer_bullet_sex(bullet_md, default_sex)
  url <- if (length(ids)) iacr_url(code, ids, sx) else ""
  st  <- split_title_text(bullet_md)
  base_id <- slugify(st$title)
  if (!nchar(base_id)) base_id <- "finding"
  fid <- base_id; n <- 1L
  while (fid %in% used_ids) { n <- n + 1L; fid <- paste0(base_id, "-", n) }
  list(
    id          = fid,
    title       = st$title,
    text        = strip_md_links_to_text(st$text),
    image_url   = "",
    image_alt   = sprintf("CI5 trend chart — %s",
                          if (nchar(st$title)) st$title else substr(st$text, 1, 60)),
    ci5_url     = url,
    extra_links = list()
  )
}

build_per_cancer <- function(code) {
  row <- dct$cancer[cancer_code == code]
  md_files <- list.files(REPORTS, pattern = "^[0-9]{2}_.*\\.md$", full.names = TRUE)
  md_by_code <- setNames(md_files, sub("^.*/([0-9]{2})_.*$", "\\1", md_files))
  md_path <- md_by_code[[sprintf("%02d", code)]]
  quick <- ""; sections <- list()
  if (!is.null(md_path) && file.exists(md_path)) {
    lns <- read_md(md_path)
    quick <- extract_quick_take(lns)
    secs <- parse_findings(lns)
    used_ids <- character(0)
    sections <- lapply(secs, function(sec) {
      findings <- lapply(sec$bullets, function(b) {
        f <- build_finding(b, code, default_sex_for(code), used_ids)
        used_ids <<- c(used_ids, f$id)
        f
      })
      list(heading  = sec$heading,
           intro    = trimws(sec$intro_md),
           findings = findings)
    })
  }
  list(
    code       = code,
    label      = row$cancer_label[1L],
    short      = row$short_label[1L],
    icd10      = row$icd10[1L],
    slug       = slug_for_cancer(row$cancer_label[1L]),
    quick_take = quick,
    sections   = sections
  )
}

## --- index build ------------------------------------------------------------

build_index_finding <- function(bullet_md, used_ids) {
  codes <- extract_bullet_cancer_codes(bullet_md)
  body  <- strip_bullet_marker(bullet_md)
  st    <- split_title_text(bullet_md)
  base_id <- slugify(st$title)
  fid <- base_id; n <- 1L
  while (fid %in% used_ids) { n <- n + 1L; fid <- paste0(base_id, "-", n) }
  ids <- match_bullet_registries(bullet_md)
  # Build one ci5_url per cancer (multi-cancer bullets: list of urls).
  ci5_urls <- lapply(codes, function(code) {
    sx <- infer_bullet_sex(bullet_md, default_sex_for(code))
    url <- if (length(ids)) iacr_url(code, ids, sx) else ""
    label <- dct$cancer[cancer_code == code, cancer_label[1L]]
    list(cancer_code = code, cancer_label = label, sex = sx, url = url)
  })
  # Strip [link.md](...) from text so JSON is human-readable.
  text_clean <- strip_md_links_to_text(st$text)
  list(
    id           = fid,
    title        = st$title,
    text         = text_clean,
    cancer_codes = as.list(codes),  # force JSON array even when length 1
    image_url    = "",
    image_alt    = sprintf("CI5 chart — %s", st$title),
    ci5_urls     = ci5_urls,
    extra_links  = list()
  )
}

build_index <- function() {
  lns <- read_md(file.path(REPORTS, "README.md"))
  first_h2 <- grep("^## ", lns)[1]
  intro_lines <- if (is.na(first_h2) || first_h2 < 2) character() else lns[1:(first_h2 - 1L)]
  if (length(intro_lines) && grepl("^# ", intro_lines[1])) intro_lines <- intro_lines[-1]
  intro <- trimws(paste(intro_lines, collapse = "\n"))
  secs <- parse_findings(lns)
  used_ids <- character(0)
  sections <- lapply(secs, function(sec) {
    findings <- lapply(sec$bullets, function(b) {
      f <- build_index_finding(b, used_ids)
      used_ids <<- c(used_ids, f$id)
      f
    })
    list(heading  = sec$heading,
         intro    = strip_md_links_to_text(trimws(sec$intro_md)),
         findings = findings)
  })
  list(intro = strip_md_links_to_text(intro), sections = sections)
}

## --- write ------------------------------------------------------------------

write_json <- function(obj, path) {
  txt <- toJSON(obj, dataframe = "rows", auto_unbox = TRUE,
                na = "null", null = "null", pretty = TRUE)
  writeBin(charToRaw(enc2utf8(paste0(txt, "\n"))), path)
}

cancer_codes <- sort(setdiff(dct$cancer$cancer_code, c(62L, 63L)))
md_files <- list.files(REPORTS, pattern = "^[0-9]{2}_.*\\.md$")
have_md  <- as.integer(sub("^([0-9]{2})_.*$", "\\1", md_files))

written <- 0L
for (cc in cancer_codes) {
  if (!(cc %in% have_md)) { cat(sprintf("SKIP %d (no md)\n", cc)); next }
  obj <- build_per_cancer(cc)
  fn <- sprintf("%02d_%s.json", cc, obj$slug)
  write_json(obj, file.path(OUT_CAN, fn))
  written <- written + 1L
}
cat(sprintf("wrote %d per-cancer JSON files\n", written))

idx <- build_index()
write_json(idx, file.path(OUT, "index.json"))
cat(sprintf("wrote index.json (%d sections, %d findings)\n",
            length(idx$sections),
            sum(vapply(idx$sections, function(s) length(s$findings), integer(1)))))

# Build a small manifest the site uses to know which cancer JSONs exist.
manifest <- list(
  cancers = lapply(cancer_codes, function(cc) {
    row <- dct$cancer[cancer_code == cc]
    fn  <- sprintf("%02d_%s.json", cc, slug_for_cancer(row$cancer_label[1L]))
    list(code = cc, label = row$cancer_label[1L],
         short = row$short_label[1L], icd10 = row$icd10[1L],
         file  = fn)
  }),
  vol_periods = list(
    "1"="1953-1965","2"="1963-1967","3"="1968-1972","4"="1973-1977",
    "5"="1978-1982","6"="1983-1987","7"="1988-1992","8"="1993-1997",
    "9"="1998-2002","10"="2003-2007","11"="2008-2012","12"="2013-2017"
  )
)
write_json(manifest, file.path(OUT, "manifest.json"))
cat("wrote manifest.json\n")
