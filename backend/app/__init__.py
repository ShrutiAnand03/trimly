from flask import Flask
from app.controllers import url_bp

def create_app():
    app = Flask(__name__)
    app.register_blueprint(url_bp)

    return app
