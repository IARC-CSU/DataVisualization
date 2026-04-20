# Extract GLOBOCAN 2024 statistics that pair with CI5 findings.
#
# CI5 is registry-level and temporal (1953-2017, incidence only). GLOBOCAN
# 2024 is country-level, 2024 estimate, with both incidence and mortality.
# The interesting overlap is: (1) where a CI5 registry-level pattern extends
# to the country level and still shows in 2024, (2) the mortality / absolute
# burden dimension that CI5 does not carry.

library(data.table)

G <- "C:/Data/Globocan2024"

asr  <- fread(file.path(G, "data_asr.csv"))        # country, cancer, type (0=inc, 1=mort), sex, cases, py, asr
dctr <- fread(file.path(G, "id_dict.csv"))         # country_code -> label
dcan <- fread(file.path(G, "cancer_dict.csv"))     # cancer_code  -> label

# quick helpers --------------------------------------------------------------
g_row <- function(country, cancer, sex_ = 0, type_ = 0) {
  asr[country_code == country & cancer_code == cancer & sex == sex_ & type == type_,
      .(country_code, cancer_code, cases, asr)]
}

# world ranking for a cancer/sex/type (excluding regional aggregates 900+)
g_rank <- function(cancer, sex_ = 0, type_ = 0, country) {
  d <- asr[cancer_code == cancer & sex == sex_ & type == type_ & country_code < 900]
  setorder(d, -asr)
  d[, rank := .I]
  d[country_code == country]
}

# mortality-to-incidence ratio
mir <- function(country, cancer, sex_ = 0) {
  i <- g_row(country, cancer, sex_, 0)$asr
  m <- g_row(country, cancer, sex_, 1)$asr
  round(m / i, 2)
}

# --------------------------- CI5 finding cross-checks -----------------------

cat("\n=== A1 Cervix / China (CI5 32 -> GLOBOCAN 23) ===\n")
print(g_row(156, 23, 2, 0));  print(g_row(156, 23, 2, 1))
cat("MIR China cervix women:", mir(156, 23, 2), "\n")
# compare India
print(g_row(356, 23, 2, 0));  print(g_row(356, 23, 2, 1))

cat("\n=== A2 Thyroid / Korea (CI5 49 -> GLOBOCAN 32) ===\n")
print(g_row(410, 32, 2, 0))
print(g_rank(32, 2, 0, 410))
cat("China thyroid women 2024:\n"); print(g_row(156, 32, 2, 0))

cat("\n=== A3 Melanoma / Australia + USA (CI5 24 -> GLOBOCAN 16) ===\n")
print(g_row(36, 16, 1, 0));   print(g_row(840, 16, 1, 0))
print(g_rank(16, 1, 0, 36))
print(g_rank(16, 1, 0, 840))

cat("\n=== A4 NHL / Zimbabwe (CI5 53 -> GLOBOCAN 34) ===\n")
print(g_row(716, 34, 0, 0));  print(g_row(716, 34, 0, 1))
cat("MIR Zimbabwe NHL both:", mir(716, 34, 0), "\n")
cat("MIR USA NHL both:",       mir(840, 34, 0), "\n")

cat("\n=== A5 Stomach / Nordics (CI5 11 -> GLOBOCAN 7) ===\n")
for (cc in c(352, 246, 578, 208)) {
  cat(dctr[country_code == cc]$country_label, "\n")
  print(g_row(cc, 7, 1, 0));  print(g_row(cc, 7, 1, 1))
}
# World and high-burden comparators
cat("World stomach men:\n"); print(g_row(900, 7, 1, 0))
cat("Mongolia stomach men:\n"); print(g_row(496, 7, 1, 0))

cat("\n=== A6 Gallbladder / Israel + Chile (CI5 17 -> GLOBOCAN 12) ===\n")
print(g_row(376, 12, 2, 0));  print(g_row(376, 12, 2, 1))
print(g_row(152, 12, 2, 0));  print(g_row(152, 12, 2, 1))
print(g_rank(12, 2, 0, 152))
cat("MIR Chile gallbladder women:", mir(152, 12, 2), "\n")

cat("\n=== A7 Corpus uteri / NZ (CI5 33 -> GLOBOCAN 24) ===\n")
print(g_row(554, 24, 2, 0))
print(g_rank(24, 2, 0, 554))

cat("\n=== A9 Singapore Indian women — country-level only ===\n")
print(g_row(702, 23, 2, 0))   # cervix
print(g_row(702, 1,  2, 0))   # lip/oral
print(g_row(702, 6,  2, 0))   # oesophagus

cat("\n=== A10 Prostate / Africa (CI5 39 -> GLOBOCAN 27) ===\n")
for (cc in c(800, 716, 231, 710, 180)) {
  lab <- dctr[country_code == cc]$country_label
  if (length(lab) == 0) next
  cat(lab, "\n")
  print(g_row(cc, 27, 1, 0))
  print(g_row(cc, 27, 1, 1))
  cat("  MIR:", mir(cc, 27, 1), "\n")
}
cat("MIR USA prostate men:", mir(840, 27, 1), "\n")
cat("MIR France prostate men:", mir(250, 27, 1), "\n")

cat("\n=== B3 China oesophagus + stomach (GLOBOCAN 6 + 7) ===\n")
print(g_row(156, 6, 0, 0))  # oesophagus both
print(g_row(156, 7, 0, 0))  # stomach both
cat("China share of world oesophagus:\n")
print(g_row(156, 6, 0, 0)$cases / g_row(900, 6, 0, 0)$cases)
cat("China share of world stomach:\n")
print(g_row(156, 7, 0, 0)$cases / g_row(900, 7, 0, 0)$cases)

cat("\n=== World top-line anchors ===\n")
# absolute burden per cancer in 2024
for (cc in c(23, 32, 16, 34, 7, 12, 24, 27, 6)) {
  lab <- dcan[cancer_code == cc]$short_label
  w <- g_row(900, cc, 0, 0)
  d <- g_row(900, cc, 0, 1)
  cat(sprintf("%-20s inc cases=%d asr=%.1f   mort cases=%d asr=%.1f\n",
              lab, w$cases, w$asr, d$cases, d$asr))
}
