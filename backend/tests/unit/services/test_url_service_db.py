from datetime import datetime
from unittest.mock import patch

from app.models import Url
from app.services import UrlService

url_service = UrlService()


def test_create_short_url_returns_error_for_invalid_url(mocker, db_session):
    mocker.patch.object(url_service, "validate_url", return_value=False)

    result = url_service.create_short_url(url="not-valid")

    assert result == {
        "success": False,
        "data": {
            "code": 500,
            "message": "Invalid url",
        },
    }
    assert db_session.query(Url).count() == 0


def test_create_short_url_persists_and_returns_success(mocker, db_session):
    mocker.patch.object(url_service, "validate_url", return_value=True)

    with patch("app.services.url_service.generate_short_code", return_value="abc123"):
        result = url_service.create_short_url(url="https://example.com/page")

    assert result == {
        "success": True,
        "data": {
            "code": 200,
            "message": "short url created successfully",
            "short_code": "abc123",
            "short_url": "http://localhost:8004/abc123",
        },
    }

    stored = db_session.query(Url).filter(Url.short_code == "abc123").one()
    assert stored.original_url == "https://example.com/page"
    assert isinstance(stored.created_at, datetime)


def test_get_original_url_returns_url_when_found(db_session):
    db_session.add(
        Url(
            original_url="https://example.com",
            short_code="found1",
            created_at=datetime.now(),
        )
    )
    db_session.commit()

    result = url_service.get_original_url(short_code="found1")

    assert result == "https://example.com"


def test_get_original_url_returns_none_when_not_found(postgres_db):
    result = url_service.get_original_url(short_code="missing")

    assert result is None
