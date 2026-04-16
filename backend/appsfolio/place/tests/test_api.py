import pytest
from django.urls import reverse

from appsfolio.place.models import Commune


@pytest.fixture
def commune_vannes():
    return Commune.objects.create(
        nom="Vannes",
        code_departement="56",
        code_commune="260",
    )


@pytest.fixture
def commune_lorient():
    return Commune.objects.create(
        nom="Lorient",
        code_departement="56",
        code_commune="121",
    )


@pytest.mark.django_db
class TestCommuneListAPI:
    def test_list_returns_200(self, client, commune_vannes):
        response = client.get(reverse("commune-list"))
        assert response.status_code == 200

    def test_list_returns_all_communes(self, client, commune_vannes, commune_lorient):
        response = client.get(reverse("commune-list"))
        assert response.json()["count"] == 2

    def test_search_by_nom(self, client, commune_vannes, commune_lorient):
        response = client.get(reverse("commune-list"), {"search": "Vannes"})
        assert response.status_code == 200
        assert response.json()["count"] == 1
        assert response.json()["results"][0]["nom"] == "Vannes"

    def test_search_by_code_insee(self, client, commune_vannes, commune_lorient):
        response = client.get(reverse("commune-list"), {"search": "56121"})
        assert response.status_code == 200
        assert response.json()["count"] == 1
        assert response.json()["results"][0]["code_insee"] == "56121"

    def test_response_contains_expected_fields(self, client, commune_vannes):
        result = client.get(reverse("commune-list")).json()["results"][0]
        assert "code_insee" in result
        assert "nom" in result
        assert "code_departement" in result


@pytest.mark.django_db
class TestCommuneDetailAPI:
    def test_detail_returns_200(self, client, commune_vannes):
        response = client.get(
            reverse("commune-detail", kwargs={"code_insee": commune_vannes.code_insee})
        )
        assert response.status_code == 200

    def test_detail_unknown_returns_404(self, client):
        response = client.get(
            reverse("commune-detail", kwargs={"code_insee": "99999"})
        )
        assert response.status_code == 404
