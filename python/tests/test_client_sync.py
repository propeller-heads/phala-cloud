import httpx

from phala_cloud import PhalaCloud


def test_get_current_user_sync() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/api/v1/auth/me"
        return httpx.Response(
            200,
            json={
                "user": {
                    "username": "alice",
                    "email": "alice@example.com",
                    "role": "user",
                    "avatar": "",
                    "email_verified": True,
                    "totp_enabled": False,
                    "has_backup_codes": False,
                    "flag_has_password": True,
                },
                "workspace": {
                    "id": "w_1",
                    "name": "Demo",
                    "slug": "demo",
                    "tier": "free",
                    "role": "owner",
                },
                "credits": {
                    "balance": "100",
                    "granted_balance": "0",
                    "is_post_paid": False,
                    "outstanding_amount": None,
                },
            },
        )

    transport = httpx.MockTransport(handler)
    with httpx.Client(transport=transport, base_url="https://cloud-api.phala.com/api/v1") as raw:
        client = PhalaCloud(http_client=raw)
        me = client.get_current_user()
        assert me.user.username == "alice"
