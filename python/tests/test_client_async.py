import httpx

from phala_cloud import AsyncPhalaCloud


async def test_get_kms_list_async() -> None:
    async def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/api/v1/kms"
        return httpx.Response(
            200,
            json={
                "items": [
                    {
                        "id": "kms-1",
                        "slug": "phala",
                        "url": "https://example-kms",
                        "version": "1.0.0",
                        "chain_id": None,
                        "kms_contract_address": None,
                        "gateway_app_id": None,
                    }
                ],
                "total": 1,
                "page": 1,
                "page_size": 10,
                "pages": 1,
            },
        )

    transport = httpx.MockTransport(handler)
    async with httpx.AsyncClient(
        transport=transport,
        base_url="https://cloud-api.phala.com/api/v1",
    ) as raw:
        client = AsyncPhalaCloud(http_client=raw)
        result = await client.get_kms_list()
        assert result.items[0].slug == "phala"
