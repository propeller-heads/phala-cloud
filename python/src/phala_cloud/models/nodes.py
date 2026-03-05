from __future__ import annotations

from pydantic import Field

from .base import CloudModel
from .kms import KmsInfo


class AvailableOSImage(CloudModel):
    name: str
    is_dev: bool
    version: tuple[int, int, int] | tuple[int, int, int, int]
    os_image_hash: str | None = None


class TeepodCapacity(CloudModel):
    teepod_id: int
    name: str
    listed: bool
    resource_score: float
    remaining_vcpu: float
    remaining_memory: float
    remaining_cvm_slots: float
    images: list[AvailableOSImage]
    support_onchain_kms: bool | None = None
    fmspc: str | None = None
    device_id: str | None = None
    region_identifier: str | None = None
    default_kms: str | None = None
    kms_list: list[str] = Field(default_factory=list)


class ResourceThreshold(CloudModel):
    max_instances: int | None = None
    max_vcpu: int | None = None
    max_memory: int | None = None
    max_disk: int | None = None


class AvailableNodes(CloudModel):
    tier: str
    capacity: ResourceThreshold
    nodes: list[TeepodCapacity]
    kms_list: list[KmsInfo]
