import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
    MYSQL_USER = os.getenv('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', 'password')  
    MYSQL_DATABASE = os.getenv('MYSQL_DATABASE', 'mydb')  

    @staticmethod
    def get_db_connection():
        connection = mysql.connector.connect(
            host=Config.MYSQL_HOST,       
            user=Config.MYSQL_USER,
            password=Config.MYSQL_PASSWORD,
            database=Config.MYSQL_DATABASE
        )
        return connection
