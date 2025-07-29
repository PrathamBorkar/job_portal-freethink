from flask import Blueprint, jsonify
from models.user import User

get_a_user_blueprint = Blueprint('get_a_user_blueprint', __name__)

@get_a_user_blueprint.route('/<int:uid>', methods=['GET'])
def get_user(uid):
    user = User.get_user(uid)
    if user:
        return jsonify({
            "message": "success",
            "user": {
                'uid': user.uid,
            'name': user.name,
            'email': user.email,
            'password': user.password,
            'role': user.role,
            'phone': user.phone,
            'created': user.created
            }
        }), 200

    return jsonify({"message": "User not found", "user" : {}}), 404


