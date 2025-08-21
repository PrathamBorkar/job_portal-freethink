import pandas as pd
import matplotlib.pyplot as plt
from required_modules.model_handler import load_model


df = pd.read_csv('testing_data_claude.csv')

X = df[[
    "uid", 
    "jobid", 
    "skill_match", 
    "experience_gap", 
    "location_match", 
    "education_match", 
    "job_type_match", 
    "mode_match"
]]


model = load_model("claude_model.joblib")


if model:

    y_pred = model.predict(X)
    

    y_actual = df["label"]


    plt.figure(figsize=(8, 6))
    plt.scatter(y_actual, y_pred, alpha=0.6)
    plt.xlabel('Actual Values')
    plt.ylabel('Predicted Values')
    plt.title('Predicted vs Actual Values')
    plt.plot([min(y_actual), max(y_actual)], [min(y_actual), max(y_actual)], 'k--', lw=2) 
    plt.grid(True)
    plt.show()

else:
    print("Model not loaded successfully.")
