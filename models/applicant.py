from config.db import Config

class Applicant:
    def __init__(self, uid, resume_url):
        self.uid = uid
        self.resume_url = resume_url
        
    @staticmethod
    def get_applicant(user_id):
        connection = Config.get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM applicants WHERE uid = %s", (user_id,))
        applicant_data = cursor.fetchone()
        cursor.close()
        connection.close()

        if applicant_data:
            return Applicant(**applicant_data) 
        return None