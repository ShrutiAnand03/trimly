import os
from contextlib import contextmanager
from unittest.mock import MagicMock

import pytest
from dotenv import load_dotenv

from app.config import database
from app.config.database import init_db
from app.models import Url
from app.models.base import Base

load_dotenv()


def _get_test_database_url() -> str | None:
    return os.getenv("TEST_DATABASE_URL") or os.getenv("DATABASE_URL")


@pytest.fixture(scope="session")
def test_database_url():
    url = _get_test_database_url()
    if not url:
        pytest.skip("Set TEST_DATABASE_URL or DATABASE_URL to run database tests")
    return url


@pytest.fixture
def postgres_db(test_database_url):
    init_db(test_database_url)
    Base.metadata.create_all(bind=database.engine)
    yield
    session = database.SessionLocal()
    try:
        session.query(Url).delete()
        session.commit()
    finally:
        session.close()


@pytest.fixture
def db_session(test_database_url):
    init_db(test_database_url)
    Base.metadata.create_all(bind=database.engine)
    session = database.SessionLocal()
    yield session
    try:
        session.query(Url).delete()
        session.commit()
    finally:
        session.close()


@pytest.fixture
def app(monkeypatch, test_database_url):
    monkeypatch.setenv("DATABASE_URL", test_database_url)
    from app import create_app

    application = create_app()
    Base.metadata.create_all(bind=database.engine)
    yield application
    session = database.SessionLocal()
    try:
        session.query(Url).delete()
        session.commit()
    finally:
        session.close()


@pytest.fixture
def client(app):
    return app.test_client()


@contextmanager
def mock_urlopen_response(status: int):
    mock_response = MagicMock()
    mock_response.status = status
    mock_response.__enter__ = MagicMock(return_value=mock_response)
    mock_response.__exit__ = MagicMock(return_value=False)
    yield mock_response


@pytest.fixture
def mock_url_head_ok(mocker):
    def _patch(status: int = 200):
        mock_response = MagicMock()
        mock_response.status = status
        mock_response.__enter__ = MagicMock(return_value=mock_response)
        mock_response.__exit__ = MagicMock(return_value=False)
        return mocker.patch(
            "app.services.url_service._URL_OPENER.open",
            return_value=mock_response,
        )

    return _patch


@pytest.fixture
def mock_url_head_fail(mocker):
    def _patch(error):
        return mocker.patch(
            "app.services.url_service._URL_OPENER.open",
            side_effect=error,
        )

    return _patch
