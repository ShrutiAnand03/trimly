from datetime import datetime
from unittest.mock import patch

import pytest

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


def test_create_short_url_uses_base_url_env(mocker, monkeypatch, db_session):
    monkeypatch.setenv("BASE_URL", "https://trim.ly/")
    mocker.patch.object(url_service, "validate_url", return_value=True)

    with patch("app.services.url_service.generate_short_code", return_value="abc123"):
        result = url_service.create_short_url(url="https://example.com/page")

    assert result["data"]["short_url"] == "https://trim.ly/abc123"


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


def test_get_original_url_increments_click_count(db_session):
    db_session.add(
        Url(
            original_url="https://example.com",
            short_code="click1",
            created_at=datetime.now(),
        )
    )
    db_session.commit()

    url_service.get_original_url(short_code="click1")

    stored = db_session.query(Url).filter(Url.short_code == "click1").one()
    assert stored.click_count == 1


def test_increment_click_count_rolls_back_and_raises_on_error(mocker):
    session = mocker.MagicMock()
    session.commit.side_effect = RuntimeError("commit failed")
    url_object = Url(
        original_url="https://example.com",
        short_code="rollbk",
        click_count=0,
        created_at=datetime.now(),
    )

    with pytest.raises(RuntimeError):
        url_service.increment_click_count(
            session=session, url_object=url_object
        )

    session.rollback.assert_called_once()


def test_get_url_stats_returns_url_when_found(db_session):
    db_session.add(
        Url(
            original_url="https://example.com",
            short_code="stat01",
            created_at=datetime.now(),
        )
    )
    db_session.commit()

    result = url_service.get_url_stats(short_code="stat01")

    assert result is not None
    assert result.original_url == "https://example.com"
    assert result.short_code == "stat01"


def test_get_url_stats_returns_none_when_not_found(postgres_db):
    result = url_service.get_url_stats(short_code="missing")

    assert result is None
