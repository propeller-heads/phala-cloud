from __future__ import annotations

from typing import Literal

from .base import CloudModel


class UserInfo(CloudModel):
    username: str
    email: str
    role: Literal["admin", "user"]
    avatar: str
    email_verified: bool
    totp_enabled: bool
    has_backup_codes: bool
    flag_has_password: bool


class WorkspaceInfo(CloudModel):
    id: str
    name: str
    slug: str | None = None
    tier: str
    role: str
    avatar: str | None = None


class CreditsInfo(CloudModel):
    balance: str | float
    granted_balance: str | float
    is_post_paid: bool
    outstanding_amount: str | float | None = None


class CurrentUserV20260121(CloudModel):
    user: UserInfo
    workspace: WorkspaceInfo
    credits: CreditsInfo


class CurrentUserV20251028(CloudModel):
    username: str
    email: str
    credits: float
    granted_credits: float
    avatar: str
    team_name: str
    team_tier: str


CurrentUser = CurrentUserV20260121 | CurrentUserV20251028

