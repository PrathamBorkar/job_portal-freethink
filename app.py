from flask import Flask
from flask_cors import CORS
from db import close_db
from routes.predict import predict_bp
from routes.regression import regressor_bp  # Import the regressor blueprint
from blueprints.user_blueprint import get_a_user_blueprint
from blueprints.applicant_blueprint import suggest_skills_for_applicant        

# Import the applicant blueprint    


def create_app():
    app = Flask(__name__)
    
    # Enable CORS for all routes
    CORS(app)
    
    # Or enable CORS only for specific origins (more secure)
    # CORS(app, origins=['http://localhost:9000'])
    
    # Register blueprints
    app.register_blueprint(predict_bp)
    app.register_blueprint(regressor_bp)  # Register the regressor blueprint
    app.register_blueprint(get_a_user_blueprint, url_prefix='/user')
    app.register_blueprint(suggest_skills_for_applicant, url_prefix='/user')
    
    app.teardown_appcontext(close_db)
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)