from flask import Blueprint, jsonify, request
from app.services import UrlService
url_bp = Blueprint(
    "urls",
    __name__
)

@url_bp.route("/api/v1/urls", methods=["POST"])
def create_short_url():
    data = request.get_json()
    url = data["url"]
    print("==url==", url)
    url_service =UrlService()
    response = url_service.create_short_url(url=url)
    return jsonify(response)