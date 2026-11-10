"""Structured logging engine for BAN KAI."""

import json
import logging
import sys
from datetime import datetime, timezone
from typing import Any, Dict


class JSONFormatter(logging.Formatter):
    """Custom JSON formatter producing structured telemetry-compatible logs."""

    def format(self, record: logging.LogRecord) -> str:
        log_obj: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        if hasattr(record, "props"):
            log_obj["props"] = record.props
        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_obj)


def setup_logging(level: str = "INFO", log_format: str = "json") -> None:
    """Configures application-wide logging."""
    root_logger = logging.getLogger()
    root_logger.setLevel(level.upper())
    root_logger.handlers = []

    handler = logging.StreamHandler(sys.stdout)
    if log_format.lower() == "json":
        handler.setFormatter(JSONFormatter())
    else:
        handler.setFormatter(
            logging.Formatter(
                "[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s",
                "%Y-%m-%d %H:%M:%S",
            )
        )
    root_logger.addHandler(handler)


logger = logging.getLogger("bankai")

