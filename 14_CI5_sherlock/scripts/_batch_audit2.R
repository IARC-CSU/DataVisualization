suppressPackageStartupMessages({
  library(data.table)
  library(jsonlite)
})
source("C:/project/CI5 sherlock/scripts/audit_finding.R")
.load_cache()
asr <- .CI5_CACHE$asr

# wrap file loads in try for a traceback
tryCatch(
  source("C:/project/CI5 sherlock/scripts/_batch_audit.R"),
  error = function(e) {
    cat("ERROR:", conditionMessage(e), "\n")
    traceback()
  }
)
