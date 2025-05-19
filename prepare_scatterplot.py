import pandas as pd

TSV_FILES = [
    "data/split_part_1.tsv",
    "data/split_part_2.tsv",
    "data/split_part_3.tsv",
    "data/split_part_4.tsv",
    "data/split_part_5.tsv",
]

KEEP1 = [
    "ASDSOVRL",   # Intensity of depression
    "NOBOOKY2",    # Times arrested and booked in the past 12 months
    #"GENDER_R"     # Gender (0 = Female, 1 = Male)
]

KEEP2 = [
    "IRSEX",       # Gender (1 = Male, 2 = Female)
    "BOOKED",      # Ever arrested/booked (1 = Yes, 0 = No)
    "NOBOOKY2",    # Times arrested in past year (0-3)
    "BKAGASLT"     # Arrested for aggravated assault (1 = Yes, 2 = No)
]

frames1 = []
frames2 = []

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

print("• concatenating files …")
merged1 = pd.concat(frames1, ignore_index=True)
merged2 = pd.concat(frames2, ignore_index=True)

merged1 = merged1.dropna(subset=["ASDSOVRL", "NOBOOKY2"])
merged2 = merged2.dropna(subset=[ "IRSEX", "BOOKED","NOBOOKY2","BKAGASLT"])

merged1 = merged1[(merged1["ASDSOVRL"]>=1) & (merged1["ASDSOVRL"]<=5)]
merged1 = merged1[(merged1["NOBOOKY2"]>= 0) & (merged1["NOBOOKY2"]<=3)]
dataset1 = merged1.groupby("ASDSOVRL").mean()
dataset1 = dataset1.reset_index()


merged2 = merged2[(merged2["IRSEX"]>=1) & (merged2["IRSEX"]<=2)]
merged2 = merged2[(merged2["BOOKED"]>=1) & (merged2["BOOKED"]<=3)]
merged2 = merged2[(merged2["NOBOOKY2"]>=0) & (merged2["NOBOOKY2"]<=3)]
merged2 = merged2[(merged2["BKAGASLT"]>=1) & (merged2["BKAGASLT"]<=3)]

merged2["GENDER"] = merged2["IRSEX"].map({1: "Male", 2: "Female"})

merged2["ASSAULT_ARREST"] = merged2["BKAGASLT"].map({1: "Yes", 2: "No"})

OUT_PATH1 = "data/depression_vs_arrested.tsv"
OUT_PATH2 = "data/male_vs_female_arrest.tsv"

dataset1.to_csv(OUT_PATH1, sep="\t", index=False, encoding="utf-8", quoting=3)
merged2.to_csv(OUT_PATH2, sep="\t", index=False, encoding="utf-8", quoting=3)


print(f"Cleaned dataset written to {OUT_PATH1}")
print(f"Cleaned dataset written to {OUT_PATH2}")

