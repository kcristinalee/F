
### THIS IS FOR THE DONUT CHARTS

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

# quantitative var 
# CIG30USE - HOW MANY DAYS SMOKED CIG IN PAST 30 DAYS

# categorical vars (slices in donut)
# STOLE50 -  STOLE SOMETHING WORTH 50+ DOLLARS IN LAST 12 MONTHS
#  SOLDILLEGAL - SOLD ILLEGAL DRUGS, LAST 12 MONTHS
# SNYATTAK - ATTACKED SOMEONEW/INTENT TOSERIOUSLY HURT THEM (in last 12 months)
# TXLYJAIL - TREATMENT IN PRISON ORJAIL LAST YEAR
columns_to_keep = ['GENDER_R', 'CIG30USE', 'STOLE50', 'SOLDILLEGAL', 'SNYATTAK', 'TXLYJAIL']

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
output_path = 'data/merged_clean2.tsv'
merged_df.to_csv(output_path, sep='\t', index=False, encoding='utf-8', quoting=3)  # 3 = csv.QUOTE_NONE

print(f"✅ Merged and saved to {output_path}")

# Load merged file if doing this in a separate script
# merged_df = pd.read_csv('data/merged_clean2.tsv', sep='\t')

# Filter out rows with missing gender
merged_df = merged_df[merged_df['GENDER_R'].isin([0, 1])]

# Define behavior columns
behavior_cols = ['STOLE50', 'SOLDILLEGAL', 'SNYATTAK', 'TXLYJAIL']

# Optional: clean values (make sure 1 = Yes, 0 = No, and remove or convert invalid values)
for col in behavior_cols:
    merged_df[col] = merged_df[col].apply(lambda x: 1 if x == 1 else 0)

# Add column: Smoked in past 30 days
merged_df['Smoked'] = merged_df['CIG30USE'].apply(lambda x: 1 if x > 0 else 0)

labels = ['Stole $50+', 'Sold Drugs', 'Attacked Someone', 'Jail Treatment']

output_dfs = {}

# Loop through gender (0=Female, 1=Male) and smoking status (0=Did not smoke, 1=Smoked)
for gender in [0, 1]:
    for smoked in [0, 1]:
        group = merged_df[(merged_df['GENDER_R'] == gender) & (merged_df['Smoked'] == smoked)]
        
        # Check if we have any data for this group
        if group.empty:
            print(f"⚠️ No data for {'Male' if gender == 1 else 'Female'} {'Smoked' if smoked == 1 else 'Non-smoker'}")
            continue

        averages = []
        for col in behavior_cols:
            # Only take subset where behavior == 1
            subset = group[group[col] == 1]
            if len(subset) > 0:
                avg = subset['CIG30USE'].mean()
            else:
                avg = 0
            averages.append(avg)

        # Create DataFrame with averages for this group
        df = pd.DataFrame({'Behavior': labels, 'AvgCIG30USE': averages})

        key = f"{'male' if gender == 1 else 'female'}_{'smoked' if smoked == 1 else 'nonsmoker'}"
        output_dfs[key] = df
        
        # Save to CSV
        df.to_csv(f"data/donut_{key}.csv", index=False)
        print(f"✅ Created data/donut_{key}.csv")

# Optional: print to debug if any missing files
print("Check for created files:")
for key in output_dfs:
    print(f"- data/donut_{key}.csv")


