from datetime import datetime
from types import SimpleNamespace


def test_create_short_url_success(client, mocker):
    mock_service = mocker.patch("app.controllers.url_controller.UrlService")
    mock_service.return_value.create_short_url.return_value = {
        "success": True,
        "data": {
            "code": 200,
            "message": "short url created successfully",
            "short_code": "abc123",
            "short_url": "http://localhost:8004/abc123",
        },
    }

    response = client.post("/api/v1/urls", json={"url": "https://example.com"})

    assert response.status_code == 201
    assert response.get_json() == {
        "short_code": "abc123",
        "short_url": "http://localhost:8004/abc123",
    }
    mock_service.return_value.create_short_url.assert_called_once_with(
        url="https://example.com"
    )


def test_create_short_url_service_rejects(client, mocker):
    mock_service = mocker.patch("app.controllers.url_controller.UrlService")
    mock_service.return_value.create_short_url.return_value = {
        "success": False,
        "data": {
            "code": 500,
            "message": "Invalid url",
        },
    }

    response = client.post("/api/v1/urls", json={"url": "https://example.com"})

    assert response.status_code == 400
    assert response.get_json()["message"] == "Invalid url"


def test_create_short_url_invalid_url_format(client):
    response = client.post("/api/v1/urls", json={"url": "not-valid"})

    assert response.status_code == 422
    assert "url" in response.get_json()["errors"]["json"]


def test_create_short_url_missing_url_key(client):
    response = client.post("/api/v1/urls", json={})

    assert response.status_code == 422
    assert "url" in response.get_json()["errors"]["json"]


def test_redirect_url_success(client, mocker):
    mock_service = mocker.patch("app.controllers.url_controller.UrlService")
    mock_service.return_value.get_original_url.return_value = "https://example.com"

    response = client.get("/abc123", follow_redirects=False)

    assert response.status_code == 302
    assert response.headers["Location"] == "https://example.com"
    mock_service.return_value.get_original_url.assert_called_once_with(
        short_code="abc123"
    )


def test_redirect_url_not_found(client, mocker):
    mock_service = mocker.patch("app.controllers.url_controller.UrlService")
    mock_service.return_value.get_original_url.return_value = None

    response = client.get("/missing")

    assert response.status_code == 404
    assert response.get_json()["message"] == "original url not found"


def test_get_url_stats_success(client, mocker):
    mock_service = mocker.patch("app.controllers.url_controller.UrlService")
    url_stats = SimpleNamespace(
        original_url="https://example.com",
        short_code="abc123",
        click_count=5,
        created_at=datetime(2026, 7, 1, 12, 0, 0),
    )
    mock_service.return_value.get_url_stats.return_value = url_stats

    response = client.get("/api/v1/urls/abc123")

    assert response.status_code == 200
    assert response.get_json() == {
        "original_url": "https://example.com",
        "short_code": "abc123",
        "click_count": 5,
        "created_at": "2026-07-01T12:00:00",
    }
    mock_service.return_value.get_url_stats.assert_called_once_with(
        short_code="abc123"
    )


def test_get_url_stats_not_found(client, mocker):
    mock_service = mocker.patch("app.controllers.url_controller.UrlService")
    mock_service.return_value.get_url_stats.return_value = None

    response = client.get("/api/v1/urls/missing")

    assert response.status_code == 404
    assert response.get_json()["message"] == "url not found"
