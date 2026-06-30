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

    assert response.status_code == 200
    assert response.get_json()["success"] is True
    mock_service.return_value.create_short_url.assert_called_once_with(
        url="https://example.com"
    )


def test_create_short_url_invalid_url(client, mocker):
    mock_service = mocker.patch("app.controllers.url_controller.UrlService")
    mock_service.return_value.create_short_url.return_value = {
        "success": False,
        "data": {
            "code": 500,
            "message": "Invalid url",
        },
    }

    response = client.post("/api/v1/urls", json={"url": "not-valid"})

    assert response.status_code == 200
    assert response.get_json()["success"] is False


def test_create_short_url_missing_url_key(client):
    response = client.post("/api/v1/urls", json={})

    assert response.status_code == 500


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
    assert response.get_json() == {
        "success": False,
        "data": {
            "code": 404,
            "message": "original url not found",
        },
    }
