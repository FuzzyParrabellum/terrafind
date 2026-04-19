import pytest
from django.urls import reverse


@pytest.mark.django_db
class TestRobotsTxt:
    def test_robots_txt_returns_200(self, client):
        response = client.get("/robots.txt")
        assert response.status_code == 200

    def test_robots_txt_content_type_is_plain_text(self, client):
        response = client.get("/robots.txt")
        assert "text/plain" in response["Content-Type"]

    def test_robots_txt_disallows_api(self, client):
        content = client.get("/robots.txt").content.decode()
        assert "Disallow: /api/" in content

    def test_robots_txt_disallows_admin(self, client):
        content = client.get("/robots.txt").content.decode()
        assert "Disallow: /admin/" in content

    def test_robots_txt_allows_root(self, client):
        content = client.get("/robots.txt").content.decode()
        assert "Allow: /" in content
