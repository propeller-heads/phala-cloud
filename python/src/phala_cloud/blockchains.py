from __future__ import annotations

from typing import Any


def add_compose_hash(*args: Any, **kwargs: Any) -> Any:
    """On-chain helper parity with JS SDK.

    Requires external blockchain integration package in Python environment.
    """
    try:
        from dstack_sdk import add_compose_hash as _impl  # type: ignore

        return _impl(*args, **kwargs)
    except Exception as exc:  # pragma: no cover
        raise RuntimeError(
            "add_compose_hash requires optional blockchain dependencies. "
            "Install dstack-sdk or provide your own web3 integration."
        ) from exc


def deploy_app_auth(*args: Any, **kwargs: Any) -> Any:
    """On-chain helper parity with JS SDK."""
    try:
        from dstack_sdk import deploy_app_auth as _impl  # type: ignore

        return _impl(*args, **kwargs)
    except Exception as exc:  # pragma: no cover
        raise RuntimeError(
            "deploy_app_auth requires optional blockchain dependencies. "
            "Install dstack-sdk or provide your own web3 integration."
        ) from exc
