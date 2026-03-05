from __future__ import annotations

from dataclasses import dataclass
from typing import Generic, TypeVar

T = TypeVar("T")


@dataclass(slots=True)
class SafeResult(Generic[T]):
    ok: bool
    data: T | None = None
    error: Exception | None = None

    def unwrap(self) -> T:
        if self.ok and self.data is not None:
            return self.data
        if self.error is not None:
            raise self.error
        raise RuntimeError("Invalid SafeResult state")
