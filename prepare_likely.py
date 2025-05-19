import pandas as pd
import csv  


tsv_files = [
    'data/split_part_1.tsv',
    'data/split_part_2.tsv',
    'data/split_part_3.tsv',
    'data/split_part_4.tsv',
    'data/split_part_5.tsv'
]

columns_to_keep = ['ALCEVER', 'TOBFLAG', 'CG05', 'DEPRESSIONINDEX', 'IRSEX']

dataframes = []
for file in tsv_files:
    print(f"Loading {file}...")
    df = pd.read_csv(file, sep='\t')
    df = df[columns_to_keep]
    dataframes.append(df)

merged_df = pd.concat(dataframes, ignore_index=True)

output_path = 'data/likely.tsv'
merged_df.to_csv(output_path, sep='\t', index=False, quoting=csv.QUOTE_NONE)
print(f"Merged and saved to {output_path}")

df = pd.read_csv(output_path, sep='\t')

df = df[df['DEPRESSIONINDEX'].between(0, 9)]

df = df[df['ALCEVER'].isin([1, 2])]
df = df[df['TOBFLAG'].isin([0, 1])]
df = df[df['CG05'].isin([1, 2])]
df = df[df['IRSEX'].isin([1, 2])]

df['Depressed'] = df['DEPRESSIONINDEX'] >= 5

alcohol_summary = df.groupby('ALCEVER')['Depressed'].mean().reset_index()
alcohol_summary['Substance'] = 'Alcohol'
alcohol_summary['Usage'] = alcohol_summary['ALCEVER'].map({1: 'Yes', 2: 'No'})

all_tob_flags = pd.DataFrame({'TOBFLAG': [0, 1]})
tobacco_summary = df.groupby('TOBFLAG')['Depressed'].mean().reset_index()
tobacco_summary = all_tob_flags.merge(tobacco_summary, on='TOBFLAG', how='left')
tobacco_summary['Depressed'] = tobacco_summary['Depressed'].fillna(0)
tobacco_summary['Substance'] = 'Tobacco'
tobacco_summary['Usage'] = tobacco_summary['TOBFLAG'].map({1: 'Yes', 0: 'No'})

cig_summary = df.groupby('CG05')['Depressed'].mean().reset_index()
cig_summary['Substance'] = 'Cigarettes'
cig_summary['Usage'] = cig_summary['CG05'].map({1: 'Yes', 2: 'No'})

final_df = pd.concat([
    alcohol_summary[['Substance', 'Usage', 'Depressed']],
    tobacco_summary[['Substance', 'Usage', 'Depressed']],
    cig_summary[['Substance', 'Usage', 'Depressed']]
])

final_df['Percent_Depressed'] = (final_df['Depressed'] * 100).round(1)
final_df.drop(columns='Depressed', inplace=True)

final_df.to_csv("depression_by_substance.csv", index=False)
print("Final summary saved to depression_by_substance.csv")


df = pd.read_csv("data/likely.tsv", sep="\t")

alcohol_gender_df = df[['ALCEVER', 'IRSEX']].copy()
alcohol_gender_df['gender'] = alcohol_gender_df['IRSEX'].map({1: 'Male', 2: 'Female'})
alcohol_gender_df['consumed'] = alcohol_gender_df['ALCEVER'] == 1
icon_data = alcohol_gender_df[['gender', 'consumed']]

icon_data.to_json("alcoholPeople.json", orient="records", lines=False)
print("Exported alcoholPeople.json for icon visualization")

tobacco_gender_df = df[['TOBFLAG', 'IRSEX']].copy()
tobacco_gender_df = tobacco_gender_df[df['TOBFLAG'].isin([0, 1])]

tobacco_gender_df['gender'] = tobacco_gender_df['IRSEX'].map({1: 'Male', 2: 'Female'})
tobacco_gender_df['consumed'] = tobacco_gender_df['TOBFLAG'] == 1

icon_data1 = tobacco_gender_df[['gender', 'consumed']]
icon_data1.to_json("tobaccoPeople.json", orient="records", lines=False)
print("Exported tabacooPeople.json for icon visualization")

cig_gender_df = df[['CG05', 'IRSEX']].copy()
cig_gender_df['gender'] = cig_gender_df['IRSEX'].map({1: 'Male', 2: 'Female'})
cig_gender_df['consumed'] = cig_gender_df['CG05'] == 1

icon_data2 = cig_gender_df[['gender', 'consumed']]

icon_data2.to_json("cigPeople.json", orient="records", lines=False)
print("Exported cigPeople.json for icon visualization")

df = pd.read_csv("data/likely.tsv", sep="\t")

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
        return None  
    
    level2 = "Tobacco" if row["TOBFLAG"] == 1 else "No Tobacco"
    
    if row["CG05"] == 1:
        level3 = "Cigarettes"
    else:
        level3 = "No Cigarettes"
    
    return [level1, level2, level3]

paths = df_clean.apply(get_path, axis=1).dropna()

from collections import Counter

path_counts = Counter(tuple(p) for p in paths)

tree_data = []

for path, value in path_counts.items():
    tree_data.append({"name": path[0], "parent": "", "value": None})  # Alcohol root
    tree_data.append({"name": path[1], "parent": path[0], "value": None})  # Tobacco/No Tobacco
    tree_data.append({"name": path[2], "parent": path[1], "value": value})  # Cigarettes or not

tree_df = pd.DataFrame(tree_data).drop_duplicates()

