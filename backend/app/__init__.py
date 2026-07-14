import os
from flask import Flask
from app.controllers import url_bp
from app.config import init_db, init_api

from dotenv import load_dotenv
load_dotenv()

def create_app():
    app = Flask(__name__)
    init_db(database_url=os.environ["DATABASE_URL"])
    api = init_api(app)
    api.register_blueprint(url_bp)
    return app
