import pandas as pd
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages

df = pd.read_csv("training_data_gemini.csv")

features = ["skill_match", "experience_gap", "location_match",
            "education_match", "job_type_match", "mode_match"]

pdf_file = "training_data_gemini.pdf"

with PdfPages(pdf_file) as pdf:
    for feature in features:
        plt.figure(figsize=(8,6))
        plt.scatter(df[feature], df["label"], alpha=0.5)
        plt.xlabel(feature.replace("_", " ").title())
        plt.ylabel("Label (Fit Score)")
        plt.title(f"{feature.replace('_',' ').title()} vs Label")
        pdf.savefig()
        plt.close()

print(f"Scatter plots saved to {pdf_file}")
