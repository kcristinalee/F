import pandas as pd
import glob

# List of your 5 file paths
tsv_files = [
    'data/split_part_1.tsv',
    'data/split_part_2.tsv',
    'data/split_part_3.tsv',
    'data/split_part_4.tsv',
    'data/split_part_5.tsv'
]

# Only the columns you want to keep

# GENDER_R - gender (0 or 1)
# NOBOOKY2 -  # TIMES ARRESTED AND BOOKED PAST 12 MONTHS (85.4%)
# ALCDAYS - # DAYS HAD ONE OR MORE DRINKS PAST 30 DAYS (56.4%)
# DSTDEPRS - HOW OFTEN FELT DEPRESSED IN WORST MONTH (66.7%)

columns_to_keep = ['GENDER_R', 'NOBOOKY2', 'ALCDAYS', 'DSTDEPRS']

# Load and filter each file
dataframes = []
for file in tsv_files:
    print(f"Loading {file}...")
    df = pd.read_csv(file, sep='\t')
    df = df[columns_to_keep]  # Now filter cleanly by name

    dataframes.append(df)

# Concatenate all filtered DataFrames
merged_df = pd.concat(dataframes, ignore_index=True)

# Save to new TSV
output_path = 'data/merged_clean.tsv'
merged_df.to_csv(output_path, sep='\t', index=False, encoding='utf-8', quoting=3)  # 3 = csv.QUOTE_NONE

print(f"✅ Merged and saved to {output_path}")
