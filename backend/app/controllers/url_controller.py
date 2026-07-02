from flask import Blueprint, jsonify, request, redirect
from app.services import UrlService
url_bp = Blueprint(
    "urls",
    __name__
)

@url_bp.route("/api/v1/urls", methods=["POST"])
def create_short_url():
    data = request.get_json()
    url = data["url"]
    url_service =UrlService()
    response = url_service.create_short_url(url=url)
    return jsonify(response)

@url_bp.route("/<short_code>", methods=["GET"])
def redirect_url(short_code: str):
    url_service = UrlService()

    original_url = url_service.get_original_url(
        short_code=short_code
    )

    if not original_url:
        return jsonify({
            "success": False,
            "data": {
                "code": 404,
                "message": "original url not found"
            }
        }), 404

    return redirect(original_url)


@url_bp.route("/api/v1/urls/<short_code>", methods=["GET"])
def get_url_stats(short_code: str):
    url_service = UrlService()

    url_stats = url_service.get_url_stats(
        short_code=short_code
    )

    if not url_stats:
        return jsonify({
            "success": False,
            "data": {
                "code": 404,
                "message": "url not found"
            }
        }), 404

    return jsonify({
        "success": True,
        "data": {
            "code": 200,
            "message": "url stats",
            "original_url": url_stats.original_url,
            "short_code": url_stats.short_code,
            "click_count": url_stats.click_count,
            "created_at": url_stats.created_at.isoformat()
        }
    }), 200
