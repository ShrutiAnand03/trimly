"""Marshmallow schemas for URL endpoints.

These describe request/response shapes once, and flask-smorest uses them to
both validate incoming data and generate the OpenAPI spec — no docstring YAML.
"""
from marshmallow import Schema, fields


class UrlCreateSchema(Schema):
    """Request body for creating a short URL."""

    url = fields.Url(
        required=True,
        schemes={"http", "https"},
        metadata={"description": "The URL to shorten", "example": "https://example.com"},
    )


class UrlCreatedSchema(Schema):
    """Response returned after a short URL is created."""

    short_code = fields.String(
        metadata={"description": "The generated short code", "example": "abc123"},
    )
    short_url = fields.Url(
        metadata={"description": "The full short URL", "example": "http://localhost:8004/abc123"},
    )


class UrlStatsSchema(Schema):
    """Statistics for a short URL."""

    original_url = fields.Url(metadata={"description": "The original long URL"})
    short_code = fields.String(metadata={"description": "The short code"})
    click_count = fields.Integer(metadata={"description": "Number of times the short URL was visited"})
    created_at = fields.DateTime(metadata={"description": "When the short URL was created"})
