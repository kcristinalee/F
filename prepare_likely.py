import pandas as pd
import csv  # Needed for quoting=csv.QUOTE_NONE

# List of 5 file paths
tsv_files = [
    'data/split_part_1.tsv',
    'data/split_part_2.tsv',
    'data/split_part_3.tsv',
    'data/split_part_4.tsv',
    'data/split_part_5.tsv'
]

# Columns of interest (added IRSEX for gender)
columns_to_keep = ['ALCEVER', 'TOBFLAG', 'CG05', 'DEPRESSIONINDEX', 'IRSEX']

# Load and filter each file
dataframes = []
for file in tsv_files:
    print(f"Loading {file}...")
    df = pd.read_csv(file, sep='\t')
    df = df[columns_to_keep]
    dataframes.append(df)

# Concatenate all filtered DataFrames
merged_df = pd.concat(dataframes, ignore_index=True)

# Save raw merged output for backup or inspection
output_path = 'data/likely.tsv'
merged_df.to_csv(output_path, sep='\t', index=False, quoting=csv.QUOTE_NONE)
print(f"✅ Merged and saved to {output_path}")

# Reload for further processing
df = pd.read_csv(output_path, sep='\t')

# Filter only valid DEPRESSIONINDEX values (0-9)
df = df[df['DEPRESSIONINDEX'].between(0, 9)]

# Filter valid responses for each categorical variable
df = df[df['ALCEVER'].isin([1, 2])]
df = df[df['TOBFLAG'].isin([0, 1])]
df = df[df['CG05'].isin([1, 2])]
df = df[df['IRSEX'].isin([1, 2])]  # Male=1, Female=2

# Create binary column indicating high depression
df['Depressed'] = df['DEPRESSIONINDEX'] >= 5

# ===== Summary for bar visualizations =====
# Alcohol
alcohol_summary = df.groupby('ALCEVER')['Depressed'].mean().reset_index()
alcohol_summary['Substance'] = 'Alcohol'
alcohol_summary['Usage'] = alcohol_summary['ALCEVER'].map({1: 'Yes', 2: 'No'})

# Tobacco
all_tob_flags = pd.DataFrame({'TOBFLAG': [0, 1]})
tobacco_summary = df.groupby('TOBFLAG')['Depressed'].mean().reset_index()
tobacco_summary = all_tob_flags.merge(tobacco_summary, on='TOBFLAG', how='left')
tobacco_summary['Depressed'] = tobacco_summary['Depressed'].fillna(0)
tobacco_summary['Substance'] = 'Tobacco'
tobacco_summary['Usage'] = tobacco_summary['TOBFLAG'].map({1: 'Yes', 0: 'No'})

# Cigarettes
cig_summary = df.groupby('CG05')['Depressed'].mean().reset_index()
cig_summary['Substance'] = 'Cigarettes'
cig_summary['Usage'] = cig_summary['CG05'].map({1: 'Yes', 2: 'No'})

# Combine summaries
final_df = pd.concat([
    alcohol_summary[['Substance', 'Usage', 'Depressed']],
    tobacco_summary[['Substance', 'Usage', 'Depressed']],
    cig_summary[['Substance', 'Usage', 'Depressed']]
])

final_df['Percent_Depressed'] = (final_df['Depressed'] * 100).round(1)
final_df.drop(columns='Depressed', inplace=True)

# Save bar chart data
final_df.to_csv("depression_by_substance.csv", index=False)
print("✅ Final summary saved to depression_by_substance.csv")


######### for grids

df = pd.read_csv("data/likely.tsv", sep="\t")


# ===== Export for icon visualization =====
alcohol_gender_df = df[['ALCEVER', 'IRSEX']].copy()
alcohol_gender_df['gender'] = alcohol_gender_df['IRSEX'].map({1: 'Male', 2: 'Female'})
alcohol_gender_df['consumed'] = alcohol_gender_df['ALCEVER'] == 1

# Final format: gender + consumed
icon_data = alcohol_gender_df[['gender', 'consumed']]

# Export as JSON for frontend
icon_data.to_json("alcoholPeople.json", orient="records", lines=False)
print("✅ Exported alcoholPeople.json for icon visualization")

# ===== Export for icon visualization =====

# Include all (both consumed and not)
tobacco_gender_df = df[['TOBFLAG', 'IRSEX']].copy()
tobacco_gender_df = tobacco_gender_df[df['TOBFLAG'].isin([0, 1])]  # Optional: exclude invalids like -9

tobacco_gender_df['gender'] = tobacco_gender_df['IRSEX'].map({1: 'Male', 2: 'Female'})
tobacco_gender_df['consumed'] = tobacco_gender_df['TOBFLAG'] == 1

icon_data1 = tobacco_gender_df[['gender', 'consumed']]
icon_data1.to_json("tobaccoPeople.json", orient="records", lines=False)
print("✅ Exported tabacooPeople.json for icon visualization")

# ===== Export for icon visualization =====
cig_gender_df = df[['CG05', 'IRSEX']].copy()
cig_gender_df['gender'] = cig_gender_df['IRSEX'].map({1: 'Male', 2: 'Female'})
cig_gender_df['consumed'] = cig_gender_df['CG05'] == 1

# Final format: gender + consumed
icon_data2 = cig_gender_df[['gender', 'consumed']]

# Export as JSON for frontend
icon_data2.to_json("cigPeople.json", orient="records", lines=False)
print("✅ Exported cigPeople.json for icon visualization")


####### for tree

# Load the data
df = pd.read_csv("data/likely.tsv", sep="\t")

# Clean invalid CG05 values (98 = missing), and DEPRESSIONINDEX (-9 = invalid)
df_clean = df[
    (df['CG05'].isin([1, 2])) &
    (df['ALCEVER'].isin([1, 2])) &
    (df['TOBFLAG'].isin([0, 1]))
]

df_clean = df_clean.reset_index(drop=True)

def get_path(row):
    if row["ALCEVER"] == 1:
        level1 = "Alcohol"
    else:
        return None  # skip non-drinkers
    
    level2 = "Tobacco" if row["TOBFLAG"] == 1 else "No Tobacco"
    
    if row["CG05"] == 1:
        level3 = "Cigarettes"
    else:
        level3 = "No Cigarettes"
    
    return [level1, level2, level3]

# Create a list of paths
paths = df_clean.apply(get_path, axis=1).dropna()

# Flatten paths into rows
from collections import Counter

path_counts = Counter(tuple(p) for p in paths)

# Convert to parent-child format
tree_data = []

for path, value in path_counts.items():
    tree_data.append({"name": path[0], "parent": "", "value": None})  # Alcohol root
    tree_data.append({"name": path[1], "parent": path[0], "value": None})  # Tobacco/No Tobacco
    tree_data.append({"name": path[2], "parent": path[1], "value": value})  # Cigarettes or not

# Remove duplicates
tree_df = pd.DataFrame(tree_data).drop_duplicates()

