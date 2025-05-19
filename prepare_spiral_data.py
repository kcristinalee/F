#!/usr/bin/env python3
"""
prepare_spiral_data.py
----------------------

• reads the five NSDUH split TSVs
• keeps only the variables needed for the alcohol- and marijuana-day spirals
• converts the special NSDUH ‘91/93/94/97/98/99’ codes
• writes one compact file:  data/spiral_clean.tsv
"""

import pandas as pd

TSV_FILES = [
    "data/split_part_1.tsv",
    "data/split_part_2.tsv",
    "data/split_part_3.tsv",
    "data/split_part_4.tsv",
    "data/split_part_5.tsv",
]

KEEP = [
    "GENDER_R",   # 0 = female, 1 = male
    "ALCDAYS",    # days drank past 30 (0-30, 91, 93, 94, 97-99)
    "MJDAY30A",   # days used marijuana past 30 (same coding)
    "DSTDEPRS",   # depression-frequency score (for future color/tooltips)
]
def clean_days(val):
    """Return 0-30, map 91→0 (‘did not use’), else NA."""
    v = pd.to_numeric(val, errors="coerce")
    if 0 <= v <= 30:
        return v                    # real answer
    if v == 91:
        return 0                    # explicit no-use code
    return pd.NA                    # 93,94,97,98,99 → missing


frames = []

for path in TSV_FILES:
    print(f"• loading {path}")
    df = pd.read_csv(
        path,
        sep="\t",
        usecols=KEEP,
        dtype={
            "GENDER_R":  "Int8",
            "ALCDAYS":   "Int16",
            "MJDAY30A":  "Int16",
            "DSTDEPRS":  "Int8",
        },
    )

    df["ALCDAYS"]  = df["ALCDAYS"].apply(clean_days).astype("Int16")
    df["MJDAY30A"] = df["MJDAY30A"].apply(clean_days).astype("Int16")

    frames.append(df)

print("• concatenating files …")
merged = pd.concat(frames, ignore_index=True)

merged = merged.dropna(subset=["ALCDAYS", "MJDAY30A"])

OUT_PATH = "data/spiral_clean.tsv"
merged.to_csv(OUT_PATH, sep="\t", index=False, encoding="utf-8", quoting=3)

print(f"Cleaned spiral dataset written to {OUT_PATH}")
