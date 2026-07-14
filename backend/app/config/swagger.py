"""OpenAPI / Swagger configuration via flask-smorest.

The spec is generated from marshmallow schemas on the routes (see app/schemas),
so there are no hand-written docstring specs. Swagger UI is served at /apidocs.
"""
from flask_smorest import Api

OPENAPI_CONFIG = {
    "API_TITLE": "Trimly API",
    "API_VERSION": "1.0.0",
    "API_DESCRIPTION": "A URL shortener service.",
    "OPENAPI_VERSION": "3.0.3",
    "OPENAPI_URL_PREFIX": "/",
    "OPENAPI_JSON_PATH": "openapi.json",
    "OPENAPI_SWAGGER_UI_PATH": "/apidocs",
    "OPENAPI_SWAGGER_UI_URL": "https://cdn.jsdelivr.net/npm/swagger-ui-dist/",
}


def init_api(app):
    """Attach flask-smorest to the app. Swagger UI is served at /apidocs."""
    for key, value in OPENAPI_CONFIG.items():
        app.config.setdefault(key, value)
    return Api(app)
