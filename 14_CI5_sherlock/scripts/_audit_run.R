suppressPackageStartupMessages(library(data.table))
source("C:/project/CI5 sherlock/scripts/audit_finding.R")
.load_cache()
asr <- .CI5_CACHE$asr

run <- function(label, code, id, sex, vols = 1:12) {
  cat("\n=== ", label, " ===\n", sep = "")
  a <- print_audit(code, id, sex, vols, label = label)
  invisible(a)
}

# Finding A1 — inland-China cervix rise
# URL pops: 415600199_415600299_415600399_415600799_415600999_415601499_415601599
inland_ids <- c(415600199,415600299,415600399,415600799,415600999,415601499,415601599)
for (idc in inland_ids) {
  lbl <- unique(asr[id_code == idc, id_label])[1]
  run(paste("A1 cervix", idc, lbl), 32, idc, 2)
}
# also Jiashan — look up
cat("\n-- Jiashan search:\n")
print(find_registry("Jiashan"))
cat("\n-- Qidong search:\n")
print(find_registry("Qidong"))
cat("\n-- Harbin search:\n")
print(find_registry("Harbin"))
cat("\n-- Wuhan search:\n")
print(find_registry("Wuhan"))
cat("\n-- Zhongshan search:\n")
print(find_registry("Zhongshan"))
cat("\n-- Beijing search:\n")
print(find_registry("Beijing"))
cat("\n-- Shanghai search:\n")
print(find_registry("Shanghai"))
