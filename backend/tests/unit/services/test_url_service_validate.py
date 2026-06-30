from urllib.error import HTTPError, URLError

import pytest

from app.services import UrlService

url_service = UrlService()


@pytest.mark.parametrize(
    "url",
    [
        "ftp://example.com",
        "http://",
        "not-a-url",
    ],
)
def test_validate_url_rejects_invalid_format(url):
    result = url_service.validate_url(url=url)

    assert result is False


def test_validate_url_returns_true_for_successful_head(mock_url_head_ok):
    mock_url_head_ok(status=200)

    result = url_service.validate_url(url="https://example.com")

    assert result is True


@pytest.mark.parametrize("status", [400, 404, 500])
def test_validate_url_rejects_http_error_status(mock_url_head_ok, status):
    mock_url_head_ok(status=status)

    result = url_service.validate_url(url="https://example.com")

    assert result is False


@pytest.mark.parametrize(
    "error",
    [
        URLError("connection failed"),
        HTTPError(
            url="https://example.com",
            code=503,
            msg="Service Unavailable",
            hdrs=None,
            fp=None,
        ),
    ],
)
def test_validate_url_rejects_url_and_http_errors(mock_url_head_fail, error):
    mock_url_head_fail(error)

    result = url_service.validate_url(url="https://example.com")

    assert result is False


def test_validate_url_rejects_generic_head_exception(mock_url_head_fail):
    mock_url_head_fail(RuntimeError("unexpected failure"))

    result = url_service.validate_url(url="https://example.com")

    assert result is False


def test_validate_url_rejects_parse_exception(mocker):
    mocker.patch(
        "app.services.url_service.urlsplit",
        side_effect=ValueError("parse error"),
    )

    result = url_service.validate_url(url="https://example.com")

    assert result is False
