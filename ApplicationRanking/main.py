import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.ensemble import StackingRegressor
from sklearn.linear_model import RidgeCV
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from required_modules.model_handler import load_model
from sklearn.model_selection import KFold

# Step 1: Load Pretrained Models
chatgpt_model = load_model("chatgpt_model.joblib", folder="./ChatGPT/models/")
claude_model = load_model("claude_model.joblib", folder="./Claude/models/")
deepseek_model = load_model("deepseek_model.joblib", folder="./DeepSeek/models/")
gemini_model = load_model("gemini_model.joblib", folder="./Gemini/models/")

# Step 2: Load and Prepare Data
data_path = "./ChatGPT/testing_data_chatgpt.csv"
df = pd.read_csv(data_path)


# Features and target
feature_cols = [
    "uid", 
    "jobid", 
    "skill_match", 
    "experience_gap", 
    "location_match", 
    "education_match", 
    "job_type_match", 
    "mode_match"
]
X = df[feature_cols]
y = df["label"]

# Step 3: Train/Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)



# Get individual model predictions
preds = {
    "chatgpt": chatgpt_model.predict(X_test),
    "claude": claude_model.predict(X_test),
    "deepseek": deepseek_model.predict(X_test),
    "gemini": gemini_model.predict(X_test)
}

pred_df = pd.DataFrame(preds)

# Correlation matrix
correlation = pred_df.corr()
print("\n🔗 Correlation Between Model Predictions:")
print(correlation)

stacker = StackingRegressor(
    estimators=[
        ('chatgpt', chatgpt_model),
        ('claude', claude_model),
        ('deepseek', deepseek_model),
        ('gemini', gemini_model)
    ],
    final_estimator=RidgeCV(),
    passthrough=True,
    cv=KFold(n_splits=5, shuffle=True, random_state=42)
)


# Step 5: Train the Stacking Regressor
stacker.fit(X_train, y_train)

# Step 6: Make Predictions
y_pred = stacker.predict(X_test)

# Step 7: Evaluation
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

print(f"\n📊 Evaluation on Test Set:")
print(f"RMSE: {rmse:.4f}")
print(f"R²: {r2:.4f}")

# Step 8: Plot Predicted vs Actual
plt.figure(figsize=(8, 6))
plt.scatter(y_test, y_pred, alpha=0.7, color='blue', label='Predicted vs Actual')
plt.plot([min(y_test), max(y_test)], [min(y_test), max(y_test)], color='red', linestyle='--', label='Ideal Line')
plt.xlabel('Actual Values')
plt.ylabel('Predicted Values')
plt.title('Predicted vs Actual (Stacking Regressor)')
plt.legend()
plt.grid(True)
plt.tight_layout()
plt.show()
