from config.db import Config

class User:
    def __init__(self, uid, name, email, password, role, phone, created):
        self.uid = uid
        self.name = name
        self.email = email
        self.password = password
        self.role = role
        self.phone = phone
        self.created = created

    @staticmethod
    def get_user(user_id):
        connection = Config.get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE uid = %s", (user_id,))
        user_data = cursor.fetchone()
        cursor.close()
        connection.close()

        if user_data:
            return User(**user_data) 
        return None