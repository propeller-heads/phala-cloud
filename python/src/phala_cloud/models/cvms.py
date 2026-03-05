from __future__ import annotations

from pydantic import Field

from .base import CloudModel
from .kms import KmsInfo


class GetCvmListRequest(CloudModel):
    page: int | None = Field(default=None, ge=1)
    page_size: int | None = Field(default=None, ge=1)
    node_id: int | None = Field(default=None, ge=1)
    teepod_id: int | None = Field(default=None, ge=1)
    user_id: str | None = None


# 2026-01-21
class CvmResourceV20260121(CloudModel):
    instance_type: str | None = None
    vcpu: int | None = None
    memory_in_gb: float | None = None
    disk_in_gb: int | None = None
    gpus: int | None = None


class CvmInfoV20260121(CloudModel):
    id: str
    name: str
    app_id: str | None = None
    instance_id: str | None = None
    resource: CvmResourceV20260121
    status: str
    kms_info: dict | None = None
    listed: bool = False


class PaginatedCvmInfosV20260121(CloudModel):
    items: list[CvmInfoV20260121]
    total: int
    page: int
    page_size: int
    pages: int


# 2025-10-28 (legacy)
class VmInfoV20251028(CloudModel):
    id: str
    name: str
    status: str
    app_id: str
    instance_id: str | None = None


class CvmInfoV20251028(CloudModel):
    hosted: VmInfoV20251028
    name: str
    status: str
    in_progress: bool = False
    kms_info: KmsInfo | None = None


class PaginatedCvmInfosV20251028(CloudModel):
    items: list[CvmInfoV20251028]
    total: int
    page: int
    page_size: int
    pages: int


PaginatedCvmInfos = PaginatedCvmInfosV20260121 | PaginatedCvmInfosV20251028
