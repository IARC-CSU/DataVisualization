suppressPackageStartupMessages(library(data.table))
r <- fread("C:/project/CI5 sherlock/reports/_scratch/_audit_raw.csv")
cat("rows:", nrow(r), "\n")
cat("Notes populated:\n")
r[nzchar(notes), .N]
head(r[nzchar(notes), .(title, notes)], 5)
cat("---\n")
# 738%: Jiashan cervix. Let me look manually.
r[grepl("Jiashan|Inland", title, ignore.case = TRUE), .(title, info, notes)]
