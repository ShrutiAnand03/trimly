from flask import Flask
from app.controllers import url_bp
from app.config import init_db, init_api
from app.config.settings import get_settings


def create_app():
    settings = get_settings()
    app = Flask(__name__)
    init_db(database_url=settings.database_url)
    api = init_api(app)
    api.register_blueprint(url_bp)
    return app
