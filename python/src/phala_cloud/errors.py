from __future__ import annotations

from typing import Any


class PhalaCloudError(Exception):
    """Base error for all SDK exceptions."""


class RequestError(PhalaCloudError):
    """Network/transport level failure."""


class ApiError(PhalaCloudError):
    """HTTP error returned by Phala Cloud API."""

    def __init__(
        self,
        *,
        status_code: int,
        message: str,
        code: str | None = None,
        detail: Any | None = None,
    ) -> None:
        self.status_code = status_code
        self.code = code
        self.detail = detail
        super().__init__(message)


class ValidationError(PhalaCloudError):
    """Response validation failed (Pydantic)."""
