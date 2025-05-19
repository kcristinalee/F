import pandas as pd
import glob

tsv_files = [
    'data/split_part_1.tsv',
    'data/split_part_2.tsv',
    'data/split_part_3.tsv',
    'data/split_part_4.tsv',
    'data/split_part_5.tsv'
]

columns_to_keep = ['GENDER_R', 'ALCDAYS', 'MJDAY30A', 'DSTDEPRS', 'CIG30USE', 'COCUS30A', 'HER30USE']

dataframes = []
for file in tsv_files:
    print(f"Loading {file}...")
    df = pd.read_csv(file, sep='\t')
    df = df[columns_to_keep]

    dataframes.append(df)

merged_df = pd.concat(dataframes, ignore_index=True)

output_path = 'data/heatmap.tsv'
merged_df.to_csv(output_path, sep='\t', index=False, encoding='utf-8', quoting=3)

print(f" Merged and saved to {output_path}")