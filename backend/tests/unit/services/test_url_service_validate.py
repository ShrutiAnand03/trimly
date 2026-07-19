import email.message
from urllib.error import HTTPError, URLError
from urllib.request import Request

import pytest

from app.services import UrlService
from app.services.url_service import _SafeRedirectHandler, _is_public_host

url_service = UrlService()


# --- Format validation (never reaches DNS or the network) -------------------
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


def _addrinfo(*ips):
    """Build a getaddrinfo-shaped result for the given IP strings."""
    return [(2, 1, 6, "", (ip, 0)) for ip in ips]


def test_is_public_host_allows_public_address(mocker):
    mocker.patch(
        "app.services.url_service.socket.getaddrinfo",
        return_value=_addrinfo("93.184.216.34"),
    )

    assert _is_public_host("example.com") is True


@pytest.mark.parametrize(
    "ip",
    [
        "127.0.0.1",  # loopback
        "10.0.0.5",  # private
        "192.168.1.1",  # private
        "169.254.169.254",  # link-local (cloud metadata endpoint)
        "224.0.0.1",  # multicast
        "0.0.0.0",  # unspecified
        "240.0.0.1",  # reserved
    ],
)
def test_is_public_host_blocks_internal_addresses(mocker, ip):
    mocker.patch(
        "app.services.url_service.socket.getaddrinfo",
        return_value=_addrinfo(ip),
    )

    assert _is_public_host("attacker.example") is False


def test_is_public_host_blocks_ipv4_mapped_ipv6(mocker):
    # ::ffff:127.0.0.1 must not sneak past as a "public" IPv6 address.
    mocker.patch(
        "app.services.url_service.socket.getaddrinfo",
        return_value=[(10, 1, 6, "", ("::ffff:127.0.0.1", 0, 0, 0))],
    )

    assert _is_public_host("sneaky.example") is False


def test_is_public_host_rejects_when_dns_fails(mocker):
    mocker.patch(
        "app.services.url_service.socket.getaddrinfo",
        side_effect=OSError("name resolution failed"),
    )

    assert _is_public_host("does-not-exist.example") is False


def test_is_public_host_rejects_malformed_resolved_ip(mocker):
    mocker.patch(
        "app.services.url_service.socket.getaddrinfo",
        return_value=_addrinfo("not-an-ip"),
    )

    assert _is_public_host("weird.example") is False


def test_validate_url_rejects_internal_host(mocker):
    # A URL whose host resolves internally must be rejected before any request.
    mocker.patch("app.services.url_service._is_public_host", return_value=False)
    opener = mocker.patch("app.services.url_service._URL_OPENER.open")

    result = url_service.validate_url(url="http://169.254.169.254/latest/meta-data/")

    assert result is False
    opener.assert_not_called()


# --- SSRF guard: redirect handler ------------------------------------------
def test_safe_redirect_allows_public_target(mocker):
    mocker.patch("app.services.url_service._is_public_host", return_value=True)
    handler = _SafeRedirectHandler()

    new_request = handler.redirect_request(
        Request("https://example.com"),
        None,
        302,
        "Found",
        email.message.Message(),
        "https://www.example.com/",
    )

    assert new_request.full_url == "https://www.example.com/"


def test_safe_redirect_blocks_internal_target(mocker):
    mocker.patch("app.services.url_service._is_public_host", return_value=False)
    handler = _SafeRedirectHandler()

    with pytest.raises(URLError):
        handler.redirect_request(
            Request("https://example.com"),
            None,
            302,
            "Found",
            email.message.Message(),
            "http://169.254.169.254/",
        )


# --- HEAD request behaviour (host already validated as public) --------------
@pytest.fixture(autouse=True)
def _allow_public_host(mocker):
    """Default the SSRF check to 'public' so HEAD-behaviour tests below focus on
    the request itself. Tests that need the opposite patch it explicitly."""
    return mocker.patch("app.services.url_service._is_public_host", return_value=True)


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
