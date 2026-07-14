"""url service"""
from app.utils import generate_short_code
from urllib.parse import urlsplit
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
from app.config import database
from app.config.settings import get_settings
from app.models import Url
from datetime import datetime
from sqlalchemy.orm import Session
class UrlService:
    """url service"""

    def __init__(self):
        """url service"""

    def validate_url(
        self,
        url: str
    )->bool:
        # Is the URL valid
        try:
            parsed_components =urlsplit(url=url)
            if parsed_components.scheme not in ["http", "https"]:
                return False
            
            if not parsed_components.netloc: 
                return False

        except Exception:
            return False
        
        # Does the URL actually exist
        try:
            request = Request(
                url=url,
                method="HEAD"
            )

            with urlopen(request,timeout=5) as response:
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