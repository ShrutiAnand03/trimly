from flask import Flask


def test_create_app_returns_flask_instance(app):
    assert isinstance(app, Flask)


def test_create_app_registers_urls_blueprint(app):
    assert "urls" in app.blueprints
