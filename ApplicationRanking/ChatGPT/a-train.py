from required_modules.pdf_report_generator import create_pdf_report
from required_modules.model_handler import save_model
import matplotlib.pyplot as plt
from sklearn.ensemble import GradientBoostingRegressor, VotingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.neighbors import KNeighborsRegressor
from sklearn.preprocessing import StandardScaler, QuantileTransformer
from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.metrics import mean_squared_error, r2_score
import pandas as pd


df = pd.read_csv('training_data_chatgpt.csv')

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
            ('scale', StandardScaler()),  
            ('quantile', QuantileTransformer()),  
        ]), ['skill_match', 'experience_gap']), 
        
        ('passthrough', 'passthrough', ['uid', 'jobid', 'education_match', 'location_match', 'job_type_match', 'mode_match'])
    ]
)

# Base models
knn = KNeighborsRegressor(n_neighbors=5)
gbr = GradientBoostingRegressor(n_estimators=150, learning_rate=0.1, max_depth=3)
lin_reg = LinearRegression()

# Voting Regressor with KNN, GBR and Linear Regression
voting = VotingRegressor(
    estimators=[
        ('knn', knn),
        ('gbr', gbr),
        ('lin', lin_reg)
    ],
     weights=[0.15, 2.0, 0.10]
)

pipe = Pipeline([
    ('preprocessor', preprocessor),
    ('model', voting)  
])

# Example grid search (can be expanded if tuning is needed)
param_grid = {
    # 'model__knn__n_neighbors': [3, 5, 7],
    # 'model__gbr__n_estimators': [100, 200],
    # 'model__gbr__max_depth': [3, 5]
}

grid_search = GridSearchCV(pipe, param_grid, cv=5, n_jobs=-1, verbose=1)
grid_search.fit(X, y)

best_params = grid_search.best_params_
pred = grid_search.predict(X)

mse = mean_squared_error(y, pred)
r2 = r2_score(y, pred)

print(f"Mean Squared Error (MSE): {mse}")
print(f"R-squared (R²): {r2}")

# save_model(grid_search.best_estimator_, 'chatgpt_model_voting.joblib')
# create_pdf_report(pred, y, best_params, mse, r2, child_folder='./report/')
