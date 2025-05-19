
### THIS IS FOR THE HEATMAPS


import pandas as pd
import glob

tsv_files = [
    'data/split_part_1.tsv',
    'data/split_part_2.tsv',
    'data/split_part_3.tsv',
    'data/split_part_4.tsv',
    'data/split_part_5.tsv'
]

# Only the columns you want to keep

# GENDER_R - gender (0 or 1)

# Y
# NOBOOKY2 -  # TIMES ARRESTED AND BOOKED PAST 12 MONTHS (85.4%) <- Y

# X
# ALCDAYS - # DAYS HAD ONE OR MORE DRINKS PAST 30 DAYS (56.4%)
# CHW30USE - HOW MANY DAYS USED CHEW IN PAST 30 DAYS
# MJDAY30A - # DAYS USED MARIJUANA / HASHISH PAST 30 DAYS
# WORKDAYS - # DAYS MISSED WORK FOR INJURY / ILLNESS PAST 30 DAYS

# Color
# DSTDEPRS - HOW OFTEN FELT DEPRESSED IN WORST MONTH (66.7%)

columns_to_keep = ['GENDER_R', 'NOBOOKY2', 'ALCDAYS', 'CHW30USE', 'MJDAY30A', 'WORKDAYS', 'DSTDEPRS']

dataframes = []
for file in tsv_files:
    print(f"Loading {file}...")
    df = pd.read_csv(file, sep='\t')
    df = df[columns_to_keep] 

    dataframes.append(df)

merged_df = pd.concat(dataframes, ignore_index=True)

output_path = 'data/merged_clean.tsv'
merged_df.to_csv(output_path, sep='\t', index=False, encoding='utf-8', quoting=3)  # 3 = csv.QUOTE_NONE

print(f"✅ Merged and saved to {output_path}")
