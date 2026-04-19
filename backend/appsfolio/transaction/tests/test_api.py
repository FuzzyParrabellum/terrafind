import pytest
from decimal import Decimal

from django.urls import reverse

from appsfolio.place.models import Commune
from appsfolio.transaction.models import VenteParcelle


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


@pytest.fixture
def vente_vannes(commune_vannes):
    return VenteParcelle.objects.create(
        commune=commune_vannes,
        code_postal="56000",
        date_mutation="2024-03-12",
        nature_mutation=VenteParcelle.NatureMutation.VENTE,
        valeur_fonciere=Decimal("387000.00"),
        types_locaux=[VenteParcelle.TypeLocal.APPARTEMENT],
        surface_bien_principal=42,
        surface_totale=42,
        nombre_pieces_principales=2,
    )


@pytest.fixture
def vente_lorient(commune_lorient):
    return VenteParcelle.objects.create(
        commune=commune_lorient,
        code_postal="56100",
        date_mutation="2024-01-15",
        nature_mutation=VenteParcelle.NatureMutation.VENTE,
        valeur_fonciere=Decimal("220000.00"),
        types_locaux=[VenteParcelle.TypeLocal.MAISON],
        surface_bien_principal=85,
        surface_totale=85,
        nombre_pieces_principales=4,
    )


@pytest.mark.django_db
class TestVenteListAPI:
    def test_list_returns_200(self, client, vente_vannes):
        response = client.get(reverse("venteparcelle-list"))
        assert response.status_code == 200

    def test_list_is_paginated(self, client, vente_vannes):
        data = response = client.get(reverse("venteparcelle-list")).json()
        assert "results" in data
        assert "count" in data

    def test_list_returns_all_ventes(self, client, vente_vannes, vente_lorient):
        response = client.get(reverse("venteparcelle-list"))
        assert response.json()["count"] == 2

    def test_filter_by_code_insee(self, client, vente_vannes, vente_lorient):
        response = client.get(reverse("venteparcelle-list"), {"commune": "56260"})
        assert response.status_code == 200
        assert response.json()["count"] == 1
        assert response.json()["results"][0]["commune"]["code_insee"] == "56260"

    def test_filter_by_code_postal(self, client, vente_vannes, vente_lorient):
        response = client.get(reverse("venteparcelle-list"), {"code_postal": "56100"})
        assert response.status_code == 200
        assert response.json()["count"] == 1

    def test_response_does_not_contain_address(self, client, vente_vannes):
        data = client.get(reverse("venteparcelle-list")).json()
        result = data["results"][0]
        # Vérification RGPD : aucun champ d'adresse identifiante ne doit être exposé
        assert "voie" not in result
        assert "adresse" not in result
        assert "no_voie" not in result

    def test_response_contains_expected_fields(self, client, vente_vannes):
        result = client.get(reverse("venteparcelle-list")).json()["results"][0]
        assert "public_id" in result
        assert "commune" in result
        assert "date_mutation" in result
        assert "valeur_fonciere" in result
        assert "types_locaux" in result
        assert "surface_bien_principal" in result
        assert "surface_totale" in result


@pytest.mark.django_db
class TestVenteDetailAPI:
    def test_detail_returns_200(self, client, vente_vannes):
        response = client.get(
            reverse("venteparcelle-detail", kwargs={"public_id": vente_vannes.public_id})
        )
        assert response.status_code == 200

    def test_detail_returns_correct_vente(self, client, vente_vannes):
        response = client.get(
            reverse("venteparcelle-detail", kwargs={"public_id": vente_vannes.public_id})
        )
        assert str(response.json()["public_id"]) == str(vente_vannes.public_id)

    def test_detail_unknown_id_returns_404(self, client):
        import uuid
        response = client.get(
            reverse("venteparcelle-detail", kwargs={"public_id": uuid.uuid4()})
        )
        assert response.status_code == 404


# ---------------------------------------------------------------------------
# Fixtures supplémentaires pour les tests de stats
# ---------------------------------------------------------------------------

@pytest.fixture
def vente_vannes_2022(commune_vannes):
    return VenteParcelle.objects.create(
        commune=commune_vannes,
        code_postal="56000",
        date_mutation="2022-06-10",
        nature_mutation=VenteParcelle.NatureMutation.VENTE,
        valeur_fonciere=Decimal("300000.00"),
        types_locaux=[VenteParcelle.TypeLocal.MAISON],
        surface_bien_principal=90,
        surface_totale=90,
        nombre_pieces_principales=4,
    )


@pytest.fixture
def vente_vannes_2023(commune_vannes):
    return VenteParcelle.objects.create(
        commune=commune_vannes,
        code_postal="56000",
        date_mutation="2023-09-20",
        nature_mutation=VenteParcelle.NatureMutation.VENTE,
        valeur_fonciere=Decimal("350000.00"),
        types_locaux=[VenteParcelle.TypeLocal.MAISON],
        surface_bien_principal=100,
        surface_totale=100,
        nombre_pieces_principales=5,
    )


@pytest.mark.django_db
class TestVenteStatsAPI:
    def test_stats_returns_200(self, client, vente_vannes):
        response = client.get(reverse("venteparcelle-stats"))
        assert response.status_code == 200

    def test_stats_contains_expected_top_level_fields(self, client, vente_vannes):
        data = client.get(reverse("venteparcelle-stats")).json()
        assert "total_ventes" in data
        assert "prix_median" in data
        assert "surface_moyenne" in data
        assert "par_annee" in data

    def test_stats_total_ventes(self, client, vente_vannes, vente_lorient):
        data = client.get(reverse("venteparcelle-stats")).json()
        assert data["total_ventes"] == 2

    def test_stats_par_annee_contains_expected_fields(self, client, vente_vannes):
        data = client.get(reverse("venteparcelle-stats")).json()
        annee = data["par_annee"][0]
        assert "annee" in annee
        assert "nb_ventes" in annee
        assert "prix_median" in annee
        assert "surface_moyenne" in annee

    def test_stats_par_annee_groups_by_year(
        self, client, vente_vannes, vente_vannes_2022, vente_vannes_2023
    ):
        # 3 ventes sur 3 années différentes → 3 entrées dans par_annee
        data = client.get(reverse("venteparcelle-stats")).json()
        assert data["total_ventes"] == 3
        assert len(data["par_annee"]) == 3

    def test_stats_filter_by_commune(self, client, vente_vannes, vente_lorient):
        # Filtrer sur Vannes uniquement → 1 vente
        data = client.get(
            reverse("venteparcelle-stats"), {"commune": "56260"}
        ).json()
        assert data["total_ventes"] == 1

    def test_stats_filter_commune_unknown_returns_zeros(self, client, vente_vannes):
        data = client.get(
            reverse("venteparcelle-stats"), {"commune": "99999"}
        ).json()
        assert data["total_ventes"] == 0
        assert data["prix_median"] is None
        assert data["surface_moyenne"] is None
        assert data["par_annee"] == []
