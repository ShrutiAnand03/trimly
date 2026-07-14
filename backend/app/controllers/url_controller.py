from flask import redirect
from flask.views import MethodView
from flask_smorest import Blueprint, abort

from app.services import UrlService
from app.schemas import UrlCreateSchema, UrlCreatedSchema, UrlStatsSchema

url_bp = Blueprint(
    "urls",
    __name__,
    description="URL shortening and statistics operations",
)


@url_bp.route("/api/v1/urls")
class UrlCollection(MethodView):
    @url_bp.arguments(UrlCreateSchema)
    @url_bp.response(201, UrlCreatedSchema)
    def post(self, args):
        """Create a short URL."""
        result = UrlService().create_short_url(url=args["url"])
        if not result["success"]:
            abort(400, message=result["data"]["message"])
        return result["data"]


@url_bp.route("/<short_code>")
class UrlRedirect(MethodView):
    @url_bp.doc(
        responses={
            302: {"description": "Redirect to the original URL"},
            404: {"description": "Short code not found"},
        }
    )
    def get(self, short_code):
        """Redirect a short code to its original URL."""
        original_url = UrlService().get_original_url(short_code=short_code)
        if not original_url:
            abort(404, message="original url not found")
        return redirect(original_url)


@url_bp.route("/api/v1/urls/<short_code>")
class UrlStats(MethodView):
    @url_bp.response(200, UrlStatsSchema)
    def get(self, short_code):
        """Get statistics for a short URL."""
        url_stats = UrlService().get_url_stats(short_code=short_code)
        if not url_stats:
            abort(404, message="url not found")
        return url_stats
