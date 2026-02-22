"""
Structured JSON logging configuration.

Call ``setup_logging()`` once at application startup (before the FastAPI app
is created).  After that every ``logging.getLogger(__name__)`` logger in the
project will automatically emit single-line JSON with:

  * timestamp   – UTC ISO-8601 with millisecond precision
  * level       – DEBUG / INFO / WARNING / ERROR / CRITICAL
  * logger      – dotted module name
  * message     – the formatted log message
  * module      – source file module name
  * function    – function / method where the log call was made
  * line        – line number
  * request_id  – propagated from RequestLoggingMiddleware via ContextVar
                  (empty string for logs that originate outside an HTTP request)
  * <extra>     – any keyword arguments passed through ``extra={}``
  * exception   – formatted traceback, present only when exc_info is truthy

No third-party libraries are required – only the Python standard library.
"""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Any

from .context import request_id_var  # noqa: TID252


# ---------------------------------------------------------------------------
# Fields that are part of LogRecord's own __dict__ and must NOT be copied
# into the JSON output as extra fields.
# ---------------------------------------------------------------------------
_STDLIB_FIELDS: frozenset[str] = frozenset(
    {
        "name", "msg", "args", "levelname", "levelno", "pathname",
        "filename", "module", "exc_info", "exc_text", "stack_info",
        "lineno", "funcName", "created", "msecs", "relativeCreated",
        "thread", "threadName", "processName", "process", "message",
        "taskName", "request_id",
    }
)


class StructuredJSONFormatter(logging.Formatter):
    """Serialize every ``LogRecord`` as a single-line JSON object."""

    def format(self, record: logging.LogRecord) -> str:  # noqa: A003
        # Populate record.message (needed before we reference it below)
        record.message = record.getMessage()

        entry: dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(timespec="milliseconds"),
            "level": record.levelname,
            "logger": record.name,
            "message": record.message,
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # Inject request_id when present (populated by RequestIDFilter)
        request_id: str = getattr(record, "request_id", "")
        if request_id:
            entry["request_id"] = request_id

        # Forward any caller-supplied ``extra={}`` fields
        for key, value in record.__dict__.items():
            if key not in _STDLIB_FIELDS and not key.startswith("_"):
                entry[key] = value

        # Append exception traceback when present
        if record.exc_info:
            entry["exception"] = self.formatException(record.exc_info)
        elif record.exc_text:
            entry["exception"] = record.exc_text

        return json.dumps(entry, default=str)


class RequestIDFilter(logging.Filter):
    """
    Inject the current ``request_id`` from the ContextVar into every
    ``LogRecord`` so the JSON formatter can include it.
    """

    def filter(self, record: logging.LogRecord) -> bool:  # noqa: A003
        record.request_id = request_id_var.get("")
        return True


def setup_logging(level: int = logging.INFO) -> None:
    """
    Configure structured JSON logging for the entire application.

    Replaces any handlers that may have been added by scattered
    ``logging.basicConfig()`` calls (e.g. in scheduler modules) with a
    single JSON handler on the root logger.

    Args:
        level: Minimum log level for the root logger.  Defaults to INFO.
    """
    handler = logging.StreamHandler()
    handler.setFormatter(StructuredJSONFormatter())
    handler.addFilter(RequestIDFilter())

    root = logging.getLogger()
    # Clear handlers from any earlier basicConfig() calls
    root.handlers.clear()
    root.setLevel(level)
    root.addHandler(handler)

    # Reduce noise from chatty third-party libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
