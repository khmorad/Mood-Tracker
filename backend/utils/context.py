"""
Async context variables shared across the backend.

Placing ContextVars here (rather than inside the middleware module) gives
every module a clean, dependency-free import path and avoids circular
imports between the middleware and the logging configuration.
"""

from contextvars import ContextVar

# Populated by RequestLoggingMiddleware for every incoming HTTP request.
# Background tasks that are not triggered by an HTTP request will read the
# default value ("").
request_id_var: ContextVar[str] = ContextVar("request_id", default="")


def get_request_id() -> str:
    """Return the request ID bound to the current async task, or '' if none."""
    return request_id_var.get("")
