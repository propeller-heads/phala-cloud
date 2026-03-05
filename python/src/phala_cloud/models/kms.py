from __future__ import annotations

from pydantic import Field

from .base import CloudModel


class KmsInfo(CloudModel):
    id: str
    slug: str | None = None
    url: str
    version: str
    chain_id: int | None = None
    kms_contract_address: str | None = None
    gateway_app_id: str | None = None


class GetKmsListRequest(CloudModel):
    page: int | None = Field(default=None, ge=1)
    page_size: int | None = Field(default=None, ge=1)
    is_onchain: bool | None = None


class GetKmsListResponse(CloudModel):
    items: list[KmsInfo]
    total: int
    page: int
    page_size: int
    pages: int
