PYTHONPATH ?= src
PYTEST ?= python -m pytest

.PHONY: test e2e lint fmt check

lint:
	ruff check .

fmt:
	ruff format .

check: fmt lint test

test:
	PYTHONDONTWRITEBYTECODE=1 PYTHONPATH=$(PYTHONPATH) $(PYTEST) -q -p no:cacheprovider

e2e:
	@bash -lc 'set -a; [ -f .env.test ] && source .env.test; set +a; \
	if [ -z "$$PHALA_CLOUD_E2E_BASE_URL" ] || [ -z "$$PHALA_CLOUD_E2E_API_KEY" ]; then \
		echo "Missing env: PHALA_CLOUD_E2E_BASE_URL / PHALA_CLOUD_E2E_API_KEY"; \
		exit 1; \
	fi; \
	PYTHONDONTWRITEBYTECODE=1 PYTHONPATH=$(PYTHONPATH) $(PYTEST) -m e2e -q'
