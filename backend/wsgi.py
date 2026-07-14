"""WSGI entrypoint for production servers.

Run with gunicorn:

    uv run gunicorn --config gunicorn.conf.py wsgi:app

The app factory is called once at import time; gunicorn forks workers after.
"""
from app import create_app

app = create_app()
