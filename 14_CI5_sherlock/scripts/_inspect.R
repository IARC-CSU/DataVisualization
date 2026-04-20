suppressPackageStartupMessages(library(jsonlite))
j <- fromJSON("C:/project/CI5 sherlock/findings/cancers/32_cervix_uteri.json",
              simplifyVector = FALSE)
f <- j$sections[[1]]$findings[[1]]
cat("ci5_url class:", class(f$ci5_url), "len:", length(f$ci5_url), "\n")
print(f$ci5_url)
cat("\n---\n")
# index.json - has ci5_urls
j2 <- fromJSON("C:/project/CI5 sherlock/findings/index.json", simplifyVector = FALSE)
f2 <- j2$sections[[1]]$findings[[1]]
cat("index findings[1] keys:", paste(names(f2), collapse=","), "\n")
cat("ci5_urls class:", class(f2$ci5_urls), "len:", length(f2$ci5_urls), "\n")
str(f2$ci5_urls)
