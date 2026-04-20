suppressPackageStartupMessages({
  library(data.table)
  library(jsonlite)
})
source("C:/project/CI5 sherlock/scripts/audit_finding.R")
.load_cache()
asr <- .CI5_CACHE$asr

url <- "https://www.the-iacr.net/en/ci5-2.0/dataviz/all/trends_volumes?mode=population&multiple_populations=1&cancers=32&populations=415600199_415600299_415600399_415600799_415600999_415601499_415601599&sexes=2"

parse_ci5_url <- function(url) {
  if (is.null(url) || is.na(url) || url == "") return(NULL)
  m_cancer <- regmatches(url, regexpr("cancers=\\d+", url))
  m_pops   <- regmatches(url, regexpr("populations=[0-9_]+", url))
  m_sex    <- regmatches(url, regexpr("sexes=\\d+", url))
  if (length(m_cancer) == 0) return(NULL)
  list(
    cancer_code = as.integer(sub("cancers=", "", m_cancer)),
    id_codes    = as.integer(strsplit(sub("populations=", "", m_pops), "_", fixed = TRUE)[[1]]),
    sex         = as.integer(sub("sexes=", "", m_sex))
  )
}

p <- parse_ci5_url(url)
print(p)
cat("cancer class:", class(p$cancer_code), "id class:", class(p$id_codes), "\n")

# audit_one inline
idc <- p$id_codes[1]
keep <- asr$cancer_code == p$cancer_code & asr$id_code == idc & asr$sex %in% p$sex
cat("keep TRUE count:", sum(keep), "\n")
print(asr[keep, .(CI5_volume, cases, asr)])
