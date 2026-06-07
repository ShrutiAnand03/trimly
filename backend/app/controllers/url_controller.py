from flask import Blueprint, jsonify

url_bp = Blueprint(
    "urls",
    __name__
)

@url_bp.route("/api/v1/urls", methods=["POST"])
def create_short_url():
    return jsonify({
        "message": "url shortening endpoint"
    })