suppressPackageStartupMessages(library(data.table))
r <- fread("C:/project/CI5 sherlock/reports/_scratch/_audit_raw.csv")
cat("Total findings:", nrow(r), "\n")
cat("With CI5 URL info:", sum(r$info != "NO CI5 URL"), "\n")
cat("Without CI5 URL:  ", sum(r$info == "NO CI5 URL"), "\n\n")

cat("Summary of flags:\n")
cat("  DIVERGE:       ", sum(grepl("DIVERGE", r$notes)), "\n")
cat("  SMALL_N:       ", sum(grepl("SMALL_N", r$notes)), "\n")
cat("  CODING_BREAK:  ", sum(grepl("CODING_BREAK", r$notes)), "\n")
cat("  POP_WARN:      ", sum(grepl("POP_WARN", r$notes)), "\n\n")

cat("\n--- All DIVERGE findings ---\n")
d <- r[grepl("DIVERGE", notes)]
for (i in seq_len(nrow(d))) {
  cat(sprintf("[%s :: %s] %s\n  notes: %s\n  info:  %s\n\n",
              d$file[i], d$section[i], d$title[i], d$notes[i],
              substr(d$info[i], 1, 300)))
}
