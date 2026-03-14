from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class CloudModel(BaseModel):
    """Base model with forward-compatible parsing (allow unknown fields)."""

    model_config = ConfigDict(extra="allow")
