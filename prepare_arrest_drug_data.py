#!/usr/bin/env python3
"""
prepare_arrest_drug_data.py
---------------------------

• reads the five NSDUH split TSVs
• keeps only the variables needed for drug-use and criminal justice involvement
• recodes ‘ever used’ drug variables and ‘system involvement’ variables
• outputs a cleaned file:  data/arrest_drug_clean.tsv
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
    "COCEVER",   # Ever used cocaine
    "CRKEVER",   # Ever used crack
    "HEREVER",   # Ever used heroin
    "LSD",       # Ever used LSD
    "PCP",       # Ever used PCP
    "ECSTASY",   # Ever used ecstasy
    "INHEVER",   # Ever used inhalants
    "BOOKED",    # Ever been booked/arrested
    "PROBATON",  # Ever been on probation
    "PAROLREL",  # Ever been on parole
]

def recode_drug(val):
    """Returns 1 if ever used drug, 0 if never, else NA."""
    v = pd.to_numeric(val, errors="coerce")
    if v == 1:
        return 1
    if v == 2:
        return 0
    return pd.NA

def recode_criminal(val):
    """Returns 1 if had criminal justice involvement, 0 if not, else NA."""
    v = pd.to_numeric(val, errors="coerce")
    if v == 1:
        return 1
    if v == 2:
        return 0
    return pd.NA

frames = []

for path in TSV_FILES:
    print(f"• loading {path}")
    df = pd.read_csv(
        path,
        sep="\t",
        usecols=KEEP,
        dtype="Int8"
    )

    for col in ["COCEVER", "CRKEVER", "HEREVER", "LSD", "PCP", "ECSTASY", "INHEVER"]:
        df[col] = df[col].apply(recode_drug)

    for col in ["BOOKED", "PROBATON", "PAROLREL"]:
        df[col] = df[col].apply(recode_criminal)

    frames.append(df)

print("• concatenating files …")
merged = pd.concat(frames, ignore_index=True)

merged["ANY_SYSTEM"] = merged[["BOOKED", "PROBATON", "PAROLREL"]].max(axis=1)

merged = merged.dropna(subset=["COCEVER", "CRKEVER", "HEREVER", "LSD", "PCP", "ECSTASY", "INHEVER"], how="all")

OUT_PATH = "data/arrest_drug_clean.tsv"
merged.to_csv(OUT_PATH, sep="\t", index=False, encoding="utf-8", quoting=3)

print(f"Cleaned arrest vs drug-use dataset written to {OUT_PATH}")
