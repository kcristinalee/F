#!/usr/bin/env python3
"""
prepare_choose_life_data.py
---------------------------

• reads the five NSDUH split TSVs
• keeps only selected variables related to drug use, mental health, gender, and arrest history
• does NOT recode or transform data — raw values are preserved
• outputs a combined file: data/choose_life_raw.tsv
"""

import pandas as pd

TSV_FILES = [
    "data/split_part_1.tsv",
    "data/split_part_2.tsv",
    "data/split_part_3.tsv",
    "data/split_part_4.tsv",
    "data/split_part_5.tsv",
]

SELECTED_COLUMNS = [
    "CIGEVER",
    "TOBFLAG",
    "ALCEVER",
    "MJEVER",
    "IEMFLAG",
    "DEPRESSIONINDEX",
    "ANYTXMDE",
    "MDETXRX",
    "CRIMEHIST",
    "FEMALE",
    "COCEVER",
    "CRKEVER",
    "HEREVER",
    "ECSTASY",
    "LSD",
    "MTHFLAG"
]

frames = []
for path in TSV_FILES:
    print(f"• Reading {path}")
    df = pd.read_csv(
        path,
        sep="\t",
        usecols=lambda col: col in SELECTED_COLUMNS,
        dtype="object"
    )
    frames.append(df)

merged = pd.concat(frames, ignore_index=True)

OUT_PATH = "data/choose_life_raw.tsv"
merged.to_csv(OUT_PATH, sep="\t", index=False, encoding="utf-8", quoting=3)

print(f"Saved selected variables to {OUT_PATH}")
