"""Gunicorn production configuration."""
import multiprocessing
import os

bind = os.getenv("GUNICORN_BIND", "0.0.0.0:8004")
workers = int(os.getenv("GUNICORN_WORKERS", (multiprocessing.cpu_count() * 2) + 1))
threads = int(os.getenv("GUNICORN_THREADS", "4"))

worker_class = "gthread"
timeout = int(os.getenv("GUNICORN_TIMEOUT", "30"))
graceful_timeout = 30

keepalive = 5
max_requests = 1000
max_requests_jitter = 100

preload_app = True
accesslog = "-"
errorlog = "-"
loglevel = os.getenv("GUNICORN_LOG_LEVEL", "info")

forwarded_allow_ips = os.getenv("GUNICORN_FORWARDED_ALLOW_IPS", "127.0.0.1")

def post_fork(server, worker):
    """Give each forked worker its own database connections.

    `preload_app` builds the SQLAlchemy engine in the master process. Any pooled
    connection inherited across fork would be shared by multiple workers and
    corrupt each other, so dispose the pool here and let each worker reconnect.
    """
    from app.config import database

    if database.engine is not None:
        database.engine.dispose()

