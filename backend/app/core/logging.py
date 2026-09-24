import logging
import sys
import json
import time
from typing import Any, Dict, Optional
from datetime import datetime

class StructuredJsonFormatter(logging.Formatter):
    """
    Format logs as structured JSON for enterprise observability.
    Filters out sensitive keys like passwords, api_keys, tokens.
    """
    SENSITIVE_KEYS = {"api_key", "password", "token", "service_role_key", "secret", "authorization"}

    def format(self, record: logging.LogRecord) -> str:
        log_data: Dict[str, Any] = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Contextual metadata if passed in extra
        for key in ["request_id", "user_id", "organization_id", "incident_id", "machine_id", "hindsight_op", "ai_op", "response_time_ms"]:
            val = getattr(record, key, None)
            if val is not None:
                log_data[key] = val

        # Handle exception
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        # Sanitize sensitive fields if in record.__dict__
        for k, v in record.__dict__.items():
            if any(sens in k.lower() for sens in self.SENSITIVE_KEYS):
                pass  # never include
            elif k.startswith("ctx_"):
                clean_k = k[4:]
                log_data[clean_k] = v

        return json.dumps(log_data)

def setup_logger(name: str = "remembr") -> logging.Logger:
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(StructuredJsonFormatter())
        logger.addHandler(handler)
        
    return logger

logger = setup_logger()
