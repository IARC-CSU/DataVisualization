#!/usr/bin/env bash
cd "$(dirname "$0")/.."
CODES="1 10 11 12 13 14 16 17 18 19 20 21 23 24 29 34 32 37 33 36 39 40 38 41 45 42 47 48 49 51 52 53 55 56"
for c in $CODES; do
  Rscript scripts/03_review.R "$c" 2>&1
done
