from required_modules.pdf_report_generator import create_pdf_report
from required_modules.model_handler import save_model
import matplotlib.pyplot as plt
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler, QuantileTransformer
from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.metrics import mean_squared_error, r2_score
import pandas as pd



df = pd.read_csv('training_data_claude.csv')

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
y = df["label"]

preprocessor = ColumnTransformer(
    transformers=[
        ('scale_and_quantile', Pipeline([
            ('scale', StandardScaler()),  # Scaling both as their axis are large 
            ('quantile', QuantileTransformer()),  # Then applying quantile transformation to reduce the effect of outliers
        ]), ['skill_match', 'experience_gap']), 
        
        ('passthrough', 'passthrough', ['uid', 'jobid', 'education_match', 'location_match', 'job_type_match', 'mode_match'])  # Leaving other columns unchanged
    ]
)

model_one = GradientBoostingRegressor(n_estimators=150, learning_rate=0.1, max_depth=3)

pipe = Pipeline([
    ('preprocessor', preprocessor),
    ('model', model_one)  
])


param_grid = {
    # 'model__n_estimators': [100, 200, 300],
    # 'model__max_depth': [3, 5, 7],
    # 'model__learning_rate': [0.01, 0.05, 0.1],
    # 'model__subsample': [0.7, 0.8, 1.0],
    # 'model__min_samples_split': [2, 5, 10],
    # 'model__min_samples_leaf': [1, 2, 5],
    # 'model__max_features': ['sqrt', 'log2', None]
}


grid_search = GridSearchCV(pipe, param_grid, cv=5, n_jobs=-1, verbose=1)
grid_search.fit(X, y)


best_params = grid_search.best_params_


pred = grid_search.predict(X)


mse = mean_squared_error(y, pred)
r2 = r2_score(y, pred)


# Display regression scores (MSE and R²)
print(f"Mean Squared Error (MSE): {mse}")
print(f"R-squared (R²): {r2}")


# save_model(grid_search.best_estimator_, 'claude_model.joblib')

# create_pdf_report(pred, y, best_params, mse, r2, child_folder='./report/')
