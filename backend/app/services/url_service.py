"""url service"""
from app.utils import generate_short_code
from urllib.parse import urlsplit
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

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


    def generate_short_code():
        pass

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
        print("==short_code==", short_code)

        