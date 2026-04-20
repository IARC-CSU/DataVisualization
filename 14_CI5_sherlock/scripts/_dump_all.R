suppressPackageStartupMessages(library(data.table))
r <- fread("C:/project/CI5 sherlock/reports/_scratch/_audit_raw.csv")
out <- file("C:/project/CI5 sherlock/reports/_scratch/_audit_dump.txt", "w")
for (i in seq_len(nrow(r))) {
  row <- r[i]
  cat(sprintf("--- #%d  %s :: %s ---\n", i, row$file, row$section), file = out)
  cat(sprintf("TITLE: %s\n", row$title), file = out)
  cat(sprintf("TEXT:  %s\n", substr(row$text, 1, 600)), file = out)
  cat(sprintf("INFO:  %s\n", row$info), file = out)
  cat(sprintf("NOTES: %s\n", row$notes), file = out)
  cat("\n", file = out)
}
close(out)
cat("Wrote dump to _audit_dump.txt\n")
