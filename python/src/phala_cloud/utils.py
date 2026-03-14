from __future__ import annotations

from typing import Any


def parse_env_vars(content: str) -> list[dict[str, str]]:
    """Parse dotenv content into [{"key": ..., "value": ...}]."""
    result: list[dict[str, str]] = []
    for raw_line in content.splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        key, value = line.split("=", 1)
        result.append({"key": key.strip(), "value": value.strip()})
    return result


def parse_env(path: str) -> list[dict[str, str]]:
    with open(path, "r", encoding="utf-8") as f:
        return parse_env_vars(f.read())


def encrypt_env_vars(*args: Any, **kwargs: Any) -> Any:
    try:
        from dstack_sdk import encrypt_env_vars as _impl  # type: ignore

        return _impl(*args, **kwargs)
    except Exception as exc:  # pragma: no cover
        raise RuntimeError(
            "encrypt_env_vars requires dstack-sdk in Python environment"
        ) from exc


def get_compose_hash(*args: Any, **kwargs: Any) -> Any:
    try:
        from dstack_sdk import get_compose_hash as _impl  # type: ignore

        return _impl(*args, **kwargs)
    except Exception as exc:  # pragma: no cover
        raise RuntimeError("get_compose_hash requires dstack-sdk in Python environment") from exc


def verify_env_encrypt_public_key(*args: Any, **kwargs: Any) -> Any:
    try:
        from dstack_sdk import verify_env_encrypt_public_key as _impl  # type: ignore

        return _impl(*args, **kwargs)
    except Exception as exc:  # pragma: no cover
        raise RuntimeError(
            "verify_env_encrypt_public_key requires dstack-sdk in Python environment"
        ) from exc
