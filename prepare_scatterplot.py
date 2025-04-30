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
#FOR THE FIRST PLOT
KEEP1 = [
    "ASDSOVRL",   # Intensity of depression
    "NOBOOKY2",    # Times arrested and booked in the past 12 months
    #"GENDER_R"     # Gender (0 = Female, 1 = Male)
]


#for the second plot
KEEP2 = [
    "DSTDEPRS",    # Depression frequency score
    "HLTINMNT",    # Mental health treatment status
]

frames1 = []
frames2 = []

# Load each file, keep & clean
for path in TSV_FILES:
    print(f"• loading {path}")
    df1 = pd.read_csv(
        path,
        sep="\t",
        usecols=KEEP1,
        dtype="Int8"
    )

    df2 = pd.read_csv(
        path,
        sep="\t",
        usecols=KEEP2,
        dtype="Int8"
    )
    frames1.append(df1)
    frames2.append(df2)

# Concatenate all dataframes
print("• concatenating files …")
merged1 = pd.concat(frames1, ignore_index=True)
merged2 = pd.concat(frames2, ignore_index=True)

# Drop rows with missing values in the relevant columns
merged1 = merged1.dropna(subset=["ASDSOVRL", "NOBOOKY2"])
merged2 = merged2.dropna(subset=["DSTDEPRS", "HLTINMNT"])


merged1 = merged1[(merged1["ASDSOVRL"]>=1) & (merged1["ASDSOVRL"]<=5)]
merged1 = merged1[(merged1["NOBOOKY2"]>= 0) & (merged1["NOBOOKY2"]<=3)]
dataset1 = merged1.groupby("ASDSOVRL").mean()
dataset1 = dataset1.reset_index()




merged2 = merged2[(merged2["DSTDEPRS"]>=1) & (merged2["DSTDEPRS"]<=5)]
merged2 = merged2[(merged2["HLTINMNT"]>= 1) & (merged2["HLTINMNT"]<=2)]

# Save the cleaned data
OUT_PATH1 = "data/depression_vs_arrested.tsv"
OUT_PATH2 = "data/depressionFrequency_treatmentStatus.tsv"

dataset1.to_csv(OUT_PATH1, sep="\t", index=False, encoding="utf-8", quoting=3)
merged2.to_csv(OUT_PATH2, sep="\t", index=False, encoding="utf-8", quoting=3)


print(f"✅ Cleaned dataset written to {OUT_PATH1}")
print(f"✅ Cleaned dataset written to {OUT_PATH2}")

