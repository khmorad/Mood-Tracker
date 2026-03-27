"""
Request ID propagation and latency measurement middleware.

For every incoming HTTP request this middleware:

  1. Reads ``X-Request-ID`` from the request headers, or generates a UUID4
     when the header is absent.
  2. Stores the ID in a ``ContextVar`` so it is visible to every logger in
     the same async task without being passed around explicitly.
  3. Measures end-to-end handler latency with ``time.perf_counter()``.
  4. Emits one structured log line per request (method, path, status, ms).
  5. Returns the request ID and process-time in response headers:
       X-Request-ID:    <uuid>
       X-Process-Time:  <N.NN>ms

Consumers that need the current request ID can call ``get_request_id()``
or read ``request_id_var.get("")`` directly.
"""

from __future__ import annotations

import logging
import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from ..utils.context import get_request_id, request_id_var  # noqa: TID252

__all__ = ["RequestLoggingMiddleware", "get_request_id", "request_id_var"]

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Starlette/FastAPI middleware that propagates request IDs and records
    per-request latency.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        # ------------------------------------------------------------------
        # 1. Resolve or create the request ID
        # ------------------------------------------------------------------
        request_id: str = (
            request.headers.get("X-Request-ID") or str(uuid.uuid4())
        )

        # ------------------------------------------------------------------
        # 2. Bind to the ContextVar so every logger in this async task
        #    picks it up automatically via RequestIDFilter.
        # ------------------------------------------------------------------
        token = request_id_var.set(request_id)

        start: float = time.perf_counter()
        status_code: int = 500  # safe default if an exception escapes

        try:
            # ----------------------------------------------------------------
            # 3. Hand off to the next handler and measure latency
            # ----------------------------------------------------------------
            response: Response = await call_next(request)
            status_code = response.status_code

        except Exception:
            # Unhandled exceptions are rare with FastAPI's own exception
            # handling, but we log them here just in case.
            latency_ms = (time.perf_counter() - start) * 1000
            logger.exception(
                "%s %s → 500 (%.1f ms) — unhandled exception",
                request.method,
                request.url.path,
                latency_ms,
                extra={
                    "http.method": request.method,
                    "http.path": request.url.path,
                    "http.query": str(request.url.query),
                    "http.status_code": 500,
                    "http.latency_ms": round(latency_ms, 2),
                    "request_id": request_id,
                },
            )
            raise

        finally:
            # Reset the ContextVar so the slot is clean for any future work
            # on the same async task (prevents stale IDs leaking).
            request_id_var.reset(token)

        # ------------------------------------------------------------------
        # 4. Compute latency and emit one structured log line
        # ------------------------------------------------------------------
        latency_ms = (time.perf_counter() - start) * 1000

        log_level = logging.WARNING if status_code >= 400 else logging.INFO
        logger.log(
            log_level,
            "%s %s → %d (%.1f ms)",
            request.method,
            request.url.path,
            status_code,
            latency_ms,
            extra={
                "http.method": request.method,
                "http.path": request.url.path,
                "http.query": str(request.url.query),
                "http.status_code": status_code,
                "http.latency_ms": round(latency_ms, 2),
                "request_id": request_id,
            },
        )

        # ------------------------------------------------------------------
        # 5. Echo the request ID and process-time back in response headers
        # ------------------------------------------------------------------
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Process-Time"] = f"{latency_ms:.2f}ms"

        return response
