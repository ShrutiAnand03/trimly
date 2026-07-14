from flask import Flask
from flask_cors import CORS

from app.controllers import url_bp
from app.config import init_db, init_api
from app.config.settings import get_settings


def create_app():
    settings = get_settings()
    app = Flask(__name__)

    # Allow the Angular frontend (a different origin in dev) to call the API.
    # Only /api/* needs CORS; the /<short_code> redirect is a plain navigation.
    CORS(app, resources={r"/api/*": {"origins": settings.cors_origins}})

    init_db(database_url=settings.database_url)
    api = init_api(app)
    api.register_blueprint(url_bp)
    return app
