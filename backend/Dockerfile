# syntax=docker/dockerfile:1

# =============================================================================
# Trimly backend — production image
#
# Multi-stage build:
#   1. builder  — resolves and installs dependencies with uv into a venv
#   2. runtime  — a slim Python image with just the venv + app code
#
# =============================================================================

# --- Stage 1: builder --------------------------------------------------------
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder


ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=0

WORKDIR /app

# Install dependencies first, using only the lockfiles, so this layer is cached
# and only re-runs when dependencies change (not on every source edit).
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-project --no-dev

COPY . /app
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev

FROM python:3.12-slim-bookworm

# Run as an unprivileged user, never root.
RUN groupadd --system app && useradd --system --gid app --home-dir /app app

WORKDIR /app

COPY --from=builder --chown=app:app /app /app

# Put the venv on PATH so `gunicorn`, `alembic`, etc. resolve without activation.
ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

USER app

EXPOSE 8004

CMD ["gunicorn", "--config", "gunicorn.conf.py", "wsgi:app"]
