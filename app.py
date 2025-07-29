from flask import Flask
from blueprints.user_blueprint import get_a_user_blueprint
from blueprints.applicant_blueprint import suggest_skills_for_applicant

app = Flask(__name__)

app.register_blueprint(get_a_user_blueprint, url_prefix='/user')
app.register_blueprint(suggest_skills_for_applicant, url_prefix='/user')


if __name__ == '__main__':
    app.run(debug=True)
