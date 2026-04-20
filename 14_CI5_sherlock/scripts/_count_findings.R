suppressPackageStartupMessages(library(jsonlite))
dir <- "C:/project/CI5 sherlock/findings/cancers"
files <- list.files(dir, pattern = "\\.json$", full.names = TRUE)
total <- 0
per_file <- list()
for (f in files) {
  j <- fromJSON(f, simplifyVector = FALSE)
  n <- 0
  if (!is.null(j$sections)) {
    for (s in j$sections) {
      if (!is.null(s$findings)) {
        n <- n + length(s$findings)
      }
    }
  }
  per_file[[basename(f)]] <- n
  total <- total + n
}
cat("Per-cancer total findings:", total, "\n")
for (nm in names(per_file)) cat(sprintf("  %-45s %d\n", nm, per_file[[nm]]))

# index
idx <- fromJSON("C:/project/CI5 sherlock/findings/index.json", simplifyVector = FALSE)
n_idx <- 0
for (s in idx$sections) {
  if (!is.null(s$findings)) n_idx <- n_idx + length(s$findings)
}
cat("\nIndex.json findings:", n_idx, "\n")
cat("GRAND TOTAL:", total + n_idx, "\n")
