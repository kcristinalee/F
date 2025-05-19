
### THIS IS FOR THE DONUT CHARTS

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

# quantitative var 
# CIG30USE - HOW MANY DAYS SMOKED CIG IN PAST 30 DAYS

# categorical vars (slices in donut)
# STOLE50 -  STOLE SOMETHING WORTH 50+ DOLLARS IN LAST 12 MONTHS
#  SOLDILLEGAL - SOLD ILLEGAL DRUGS, LAST 12 MONTHS
# SNYATTAK - ATTACKED SOMEONEW/INTENT TOSERIOUSLY HURT THEM (in last 12 months)
# TXLYJAIL - TREATMENT IN PRISON ORJAIL LAST YEAR
columns_to_keep = ['GENDER_R', 'CIG30USE', 'STOLE50', 'SOLDILLEGAL', 'SNYATTAK', 'TXLYJAIL']

dataframes = []
for file in tsv_files:
    print(f"Loading {file}...")
    df = pd.read_csv(file, sep='\t')
    df = df[columns_to_keep]  

    dataframes.append(df)

merged_df = pd.concat(dataframes, ignore_index=True)

output_path = 'data/merged_clean2.tsv'
merged_df.to_csv(output_path, sep='\t', index=False, encoding='utf-8', quoting=3)  # 3 = csv.QUOTE_NONE

print(f"✅ Merged and saved to {output_path}")

merged_df = merged_df[merged_df['GENDER_R'].isin([0, 1])]

behavior_cols = ['STOLE50', 'SOLDILLEGAL', 'SNYATTAK', 'TXLYJAIL']

for col in behavior_cols:
    merged_df[col] = merged_df[col].apply(lambda x: 1 if x == 1 else 0)

merged_df['Smoked'] = merged_df['CIG30USE'].apply(lambda x: 1 if x > 0 else 0)

labels = ['Stole $50+', 'Sold Drugs', 'Attacked Someone', 'Jail Treatment']

output_dfs = {}

for gender in [0, 1]:
    for smoked in [0, 1]:
        group = merged_df[(merged_df['GENDER_R'] == gender) & (merged_df['Smoked'] == smoked)]
        
        if group.empty:
            print(f"⚠️ No data for {'Male' if gender == 1 else 'Female'} {'Smoked' if smoked == 1 else 'Non-smoker'}")
            continue

        averages = []
        for col in behavior_cols:
           
            subset = group[group[col] == 1]
            if len(subset) > 0:
                avg = subset['CIG30USE'].mean()
            else:
                avg = 0
            averages.append(avg)

        df = pd.DataFrame({'Behavior': labels, 'AvgCIG30USE': averages})

        key = f"{'male' if gender == 1 else 'female'}_{'smoked' if smoked == 1 else 'nonsmoker'}"
        output_dfs[key] = df
        
        df.to_csv(f"data/donut_{key}.csv", index=False)
        print(f"✅ Created data/donut_{key}.csv")

print("Check for created files:")
for key in output_dfs:
    print(f"- data/donut_{key}.csv")


