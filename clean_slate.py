import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("data/choose_life_raw.tsv", sep="\t", dtype="object")

cols = ["CIGEVER", "ALCEVER", "MJEVER", "IEMFLAG", "DEPRESSIONINDEX", "TOBFLAG", "CRIMEHIST", "FEMALE"]
df[cols] = df[cols].apply(pd.to_numeric, errors="coerce")

clean_slate = df[
    (df["CIGEVER"] == 2) &
    (df["ALCEVER"] == 2) &
    (df["MJEVER"] == 2) &
    (df["IEMFLAG"] == 0) &
    (df["DEPRESSIONINDEX"] == 0) &
    (df["TOBFLAG"] == 0)
]

grouped = clean_slate.groupby("FEMALE")["CRIMEHIST"].agg(["count", "sum"])
grouped["arrest_rate"] = grouped["sum"] / grouped["count"] * 100
grouped.index = ["Male", "Female"]

plt.figure(figsize=(6, 5))
plt.bar(grouped.index, grouped["arrest_rate"])
plt.ylabel("Arrest Rate (%)")
plt.title("Arrest Rate Among Clean Slate Individuals")
plt.ylim(0, 10)
plt.grid(axis='y', linestyle='--', alpha=0.7)
plt.tight_layout()
plt.show()
