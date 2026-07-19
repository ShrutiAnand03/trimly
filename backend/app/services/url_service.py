"""url service"""
import ipaddress
import socket
from app.utils import generate_short_code
from urllib.parse import urlsplit
from urllib.request import Request, HTTPRedirectHandler, build_opener
from urllib.error import URLError, HTTPError
from app.config import database
from app.config.settings import get_settings
from app.models import Url
from datetime import datetime
from sqlalchemy.orm import Session


def _is_public_host(host: str) -> bool:
    """Return True only if `host` resolves entirely to public IP addresses.

    SSRF guard: a user submits arbitrary URLs, and validate_url makes the server
    fetch them. Without this check an attacker could target internal services or
    the cloud metadata endpoint (169.254.169.254) to steal credentials. We reject
    any host that resolves to a loopback, private, link-local, reserved,
    multicast or unspecified address.

    """
    try:
        addr_infos = socket.getaddrinfo(host, None)
    except (OSError, UnicodeError):
        return False

    for info in addr_infos:
        ip_text = info[4][0]
        try:
            ip = ipaddress.ip_address(ip_text)
        except ValueError:
            return False

        # Unwrap IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1) to catch that bypass.
        if ip.version == 6 and ip.ipv4_mapped is not None:
            ip = ip.ipv4_mapped

        if (
            ip.is_private
            or ip.is_loopback
            or ip.is_link_local
            or ip.is_reserved
            or ip.is_multicast
            or ip.is_unspecified
        ):
            return False

    return True


class _SafeRedirectHandler(HTTPRedirectHandler):
    """Follows redirects only when the target host is public.

    A redirect can bounce a safe-looking URL to an internal address, so each
    hop's destination is re-validated before it is followed.
    """

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        host = urlsplit(newurl).hostname
        if not host or not _is_public_host(host):
            raise URLError("redirect to a non-public address is not allowed")
        return super().redirect_request(req, fp, code, msg, headers, newurl)


# Opener that validates every redirect target. Built once and reused.
_URL_OPENER = build_opener(_SafeRedirectHandler)


class UrlService:
    """url service"""

    def __init__(self):
        """url service"""

    def validate_url(
        self,
        url: str
    )->bool:
        # Is the URL syntactically valid and http(s)?
        try:
            parsed_components =urlsplit(url=url)
            if parsed_components.scheme not in ["http", "https"]:
                return False

            if not parsed_components.netloc:
                return False

        except Exception:
            return False

        # SSRF guard: refuse hosts that resolve to internal addresses.
        host = parsed_components.hostname
        if not host or not _is_public_host(host):
            return False

        # Does the URL actually exist? Redirect targets are validated per hop.
        try:
            request = Request(
                url=url,
                method="HEAD"
            )

            with _URL_OPENER.open(request, timeout=5) as response:
                return response.status < 400

        except(URLError, HTTPError):
            return False


        except Exception:
            return False

    def create_short_url(
        self,
        url: str
    ):
        is_valid_url =self.validate_url(url=url)
        if not is_valid_url:
            return {
               "success": False,
               "data": {
                   "code": 500,
                   "message": "Invalid url"
               }
            }
        
        short_code = generate_short_code()
        base_url = get_settings().base_url.rstrip("/")
        session = database.SessionLocal()
        url_object = Url(
            original_url=url,
            short_code=short_code,
            created_at=datetime.now()
        )
        session.add(url_object)
        session.commit()
        session.close()

        return {
            "success": True,
            "data": {
                "code": 200,
                "message": "short url created successfully",
                "short_code": short_code,
                "short_url": f"{base_url}/{short_code}"
            }
        }

    def get_original_url(
        self,
        short_code: str
    )-> str | None:
        session = database.SessionLocal()
        try:
            url_object = session.query(Url).filter(
                Url.short_code == short_code
            ).first()
            
            if not url_object:
                return None
        
            self.increment_click_count(
                session=session, 
                url_object=url_object
            )
            
            return url_object.original_url
        
        finally:
            session.close()


    def increment_click_count(
        self,
        session: Session,
        url_object: Url,
    ) -> None:
        try:
            url_object.click_count += 1
            session.commit()

        except Exception:
            session.rollback()
            raise
        
    def get_url_stats(
        self,
        short_code: str
    )-> Url | None:
        session = database.SessionLocal()
        try:
            url_object = session.query(Url).filter(
                Url.short_code == short_code
            ).first()

            if not url_object:
                return None

            return url_object
        
        finally:
            session.close()