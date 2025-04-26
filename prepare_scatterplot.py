import pandas as pd

# File paths for the split TSV files
TSV_FILES = [
    "data/split_part_1.tsv",
    "data/split_part_2.tsv",
    "data/split_part_3.tsv",
    "data/split_part_4.tsv",
    "data/split_part_5.tsv",
]

# Columns to keep
KEEP = [
    "ASDSOVRL",   # Intensity of depression
    "DSTDEPRS",    # Depression frequency score
    "HLTINMNT",    # Mental health treatment status
    "NOBOOKY2",    # Times arrested and booked in the past 12 months
    "GENDER_R"     # Gender (0 = Female, 1 = Male)
]

frames = []

# Load each file, keep & clean
for path in TSV_FILES:
    print(f"• loading {path}")
    df = pd.read_csv(
        path,
        sep="\t",
        usecols=KEEP,
        dtype={
            "ASDSOVRL": "Int8",
            "DSTDEPRS": "Int8",
            "HLTINMNT": "Int8",
            "NOBOOKY2": "Int8",      # Times arrested and booked
            "GENDER_R": "Int8"       # Gender variable
        },
    )
    frames.append(df)

# Concatenate all dataframes
print("• concatenating files …")
merged = pd.concat(frames, ignore_index=True)

# Drop rows with missing values in the relevant columns
merged = merged.dropna(subset=["ASDSOVRL", "DSTDEPRS", "HLTINMNT", "NOBOOKY2", "GENDER_R"])

# Save the cleaned data
OUT_PATH = "data/cleaned_depression_data.tsv"
merged.to_csv(OUT_PATH, sep="\t", index=False, encoding="utf-8", quoting=3)

print(f"✅ Cleaned dataset written to {OUT_PATH}")