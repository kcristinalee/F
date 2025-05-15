import pandas as pd

df = pd.read_csv("data/choose_life_raw.tsv", sep="\t", dtype="object")
print(df.columns.tolist())
