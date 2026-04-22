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


# ---------------------------------------------------------------------------
# Tests des filtres de la liste /api/ventes/
# Chaque test vérifie un filtre isolément pour que les échecs soient précis.
# On réutilise les fixtures déjà définies :
#   vente_vannes      → Appartement, 42 m², 2 pièces, 387 000 €, 2024, Vannes  (56260)
#   vente_lorient     → Maison,       85 m², 4 pièces, 220 000 €, 2024, Lorient (56121)
#   vente_vannes_2022 → Maison,       90 m², 4 pièces, 300 000 €, 2022, Vannes  (56260)
#   vente_vannes_2023 → Maison,      100 m², 5 pièces, 350 000 €, 2023, Vannes  (56260)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestVenteFiltersAPI:
    # --- commune : code INSEE -----------------------------------------------

    def test_filter_commune_by_code_insee_exact(self, client, vente_vannes, vente_lorient):
        # Le code INSEE de Vannes est "56260" → seule la vente à Vannes revient.
        response = client.get(reverse("venteparcelle-list"), {"commune": "56260"})
        assert response.json()["count"] == 1
        assert response.json()["results"][0]["commune"]["code_insee"] == "56260"

    def test_filter_commune_by_code_insee_returns_only_matching_commune(
        self, client, vente_vannes, vente_lorient
    ):
        # Vérification que le filtre code INSEE n'inclut pas d'autres communes
        # (la logique OR avec icontains ne doit pas créer de faux positifs).
        response = client.get(reverse("venteparcelle-list"), {"commune": "56121"})
        assert response.json()["count"] == 1
        assert response.json()["results"][0]["commune"]["code_insee"] == "56121"

    def test_filter_commune_code_insee_unknown_returns_empty(self, client, vente_vannes):
        response = client.get(reverse("venteparcelle-list"), {"commune": "99999"})
        assert response.json()["count"] == 0

    # --- commune : nom (icontains) ------------------------------------------

    def test_filter_commune_by_name(self, client, vente_vannes, vente_lorient):
        # Recherche par nom (icontains) → seule la vente à Vannes doit revenir.
        response = client.get(reverse("venteparcelle-list"), {"commune": "Vannes"})
        assert response.json()["count"] == 1
        assert response.json()["results"][0]["commune"]["nom"] == "Vannes"

    def test_filter_commune_by_name_case_insensitive(self, client, vente_vannes, vente_lorient):
        # La correspondance est insensible à la casse grâce à icontains.
        response = client.get(reverse("venteparcelle-list"), {"commune": "vannes"})
        assert response.json()["count"] == 1

    def test_filter_commune_by_partial_name(self, client, vente_vannes, vente_lorient):
        # Un préfixe partiel doit fonctionner : "Lor" → Lorient.
        response = client.get(reverse("venteparcelle-list"), {"commune": "Lor"})
        assert response.json()["count"] == 1
        assert response.json()["results"][0]["commune"]["nom"] == "Lorient"

    def test_filter_commune_unknown_name_returns_empty(self, client, vente_vannes):
        response = client.get(reverse("venteparcelle-list"), {"commune": "InexistantVille"})
        assert response.json()["count"] == 0

    # --- type_local ---------------------------------------------------------

    def test_filter_type_local_maison(self, client, vente_vannes, vente_lorient):
        # types_locaux est un ArrayField → le filtre __contains=["Maison"] inclut
        # toutes les ventes dont la liste contient au moins "Maison".
        response = client.get(reverse("venteparcelle-list"), {"type_local": "Maison"})
        assert response.json()["count"] == 1
        result = response.json()["results"][0]
        assert "Maison" in result["types_locaux"]

    def test_filter_type_local_appartement(self, client, vente_vannes, vente_lorient):
        response = client.get(reverse("venteparcelle-list"), {"type_local": "Appartement"})
        assert response.json()["count"] == 1
        result = response.json()["results"][0]
        assert "Appartement" in result["types_locaux"]

    def test_filter_type_local_unknown_returns_empty(self, client, vente_vannes):
        response = client.get(reverse("venteparcelle-list"), {"type_local": "TypeInexistant"})
        assert response.json()["count"] == 0

    # --- prix_min / prix_max ------------------------------------------------

    def test_filter_prix_min(self, client, vente_vannes, vente_lorient):
        # prix_min=300000 → vente_vannes (387 000 €) seulement,
        # vente_lorient (220 000 €) est exclu.
        response = client.get(reverse("venteparcelle-list"), {"prix_min": 300000})
        assert response.json()["count"] == 1
        assert float(response.json()["results"][0]["valeur_fonciere"]) >= 300000

    def test_filter_prix_max(self, client, vente_vannes, vente_lorient):
        # prix_max=250000 → vente_lorient (220 000 €) seulement.
        response = client.get(reverse("venteparcelle-list"), {"prix_max": 250000})
        assert response.json()["count"] == 1
        assert float(response.json()["results"][0]["valeur_fonciere"]) <= 250000

    def test_filter_prix_min_and_max(self, client, vente_vannes, vente_lorient):
        # Fourchette [200 000, 250 000] → vente_lorient uniquement.
        response = client.get(
            reverse("venteparcelle-list"), {"prix_min": 200000, "prix_max": 250000}
        )
        assert response.json()["count"] == 1

    def test_filter_prix_no_match_returns_empty(self, client, vente_vannes, vente_lorient):
        # Fourchette impossible → 0 résultats.
        response = client.get(
            reverse("venteparcelle-list"), {"prix_min": 500000, "prix_max": 600000}
        )
        assert response.json()["count"] == 0

    # --- surface_min / surface_max ------------------------------------------

    def test_filter_surface_min(self, client, vente_vannes, vente_lorient):
        # surface_min=80 → vente_lorient (85 m²) seulement,
        # vente_vannes (42 m²) est exclu.
        response = client.get(reverse("venteparcelle-list"), {"surface_min": 80})
        assert response.json()["count"] == 1
        assert float(response.json()["results"][0]["surface_bien_principal"]) >= 80

    def test_filter_surface_max(self, client, vente_vannes, vente_lorient):
        # surface_max=50 → vente_vannes (42 m²) seulement.
        response = client.get(reverse("venteparcelle-list"), {"surface_max": 50})
        assert response.json()["count"] == 1
        assert float(response.json()["results"][0]["surface_bien_principal"]) <= 50

    def test_filter_surface_min_and_max(self, client, vente_vannes, vente_lorient):
        # Fourchette [40, 50] → vente_vannes (42 m²) uniquement.
        response = client.get(
            reverse("venteparcelle-list"), {"surface_min": 40, "surface_max": 50}
        )
        assert response.json()["count"] == 1

    # --- pieces_min ---------------------------------------------------------

    def test_filter_pieces_min(self, client, vente_vannes, vente_lorient):
        # pieces_min=4 → vente_lorient (4 pièces), vente_vannes (2 pièces) exclu.
        response = client.get(reverse("venteparcelle-list"), {"pieces_min": 4})
        assert response.json()["count"] == 1
        result = response.json()["results"][0]
        assert result["nombre_pieces_principales"] >= 4

    def test_filter_pieces_min_includes_exact_match(self, client, vente_vannes, vente_lorient):
        # pieces_min=2 → les deux ventes (2 et 4 pièces) sont incluses.
        response = client.get(reverse("venteparcelle-list"), {"pieces_min": 2})
        assert response.json()["count"] == 2

    # --- annee_debut / annee_fin --------------------------------------------

    def test_filter_annee_debut(
        self, client, vente_vannes, vente_lorient, vente_vannes_2022, vente_vannes_2023
    ):
        # annee_debut=2023 → ventes de 2023 et 2024 (vente_vannes, vente_lorient,
        # vente_vannes_2023) ; vente_vannes_2022 est exclue.
        response = client.get(reverse("venteparcelle-list"), {"annee_debut": 2023})
        assert response.json()["count"] == 3

    def test_filter_annee_fin(
        self, client, vente_vannes, vente_lorient, vente_vannes_2022, vente_vannes_2023
    ):
        # annee_fin=2022 → seule vente_vannes_2022 ; les ventes 2023 et 2024 exclues.
        response = client.get(reverse("venteparcelle-list"), {"annee_fin": 2022})
        assert response.json()["count"] == 1

    def test_filter_annee_debut_and_fin(
        self, client, vente_vannes, vente_lorient, vente_vannes_2022, vente_vannes_2023
    ):
        # Fourchette [2022, 2023] → vente_vannes_2022 et vente_vannes_2023 ;
        # les deux ventes de 2024 sont exclues.
        response = client.get(
            reverse("venteparcelle-list"), {"annee_debut": 2022, "annee_fin": 2023}
        )
        assert response.json()["count"] == 2

    # --- combinaisons -------------------------------------------------------

    def test_filter_commune_and_type(
        self, client, vente_vannes, vente_lorient, vente_vannes_2022
    ):
        # Commune=Vannes + type=Appartement → uniquement vente_vannes.
        # vente_vannes_2022 est une Maison à Vannes, donc exclue.
        response = client.get(
            reverse("venteparcelle-list"),
            {"commune": "Vannes", "type_local": "Appartement"},
        )
        assert response.json()["count"] == 1
        result = response.json()["results"][0]
        assert result["commune"]["nom"] == "Vannes"
        assert "Appartement" in result["types_locaux"]

    def test_filter_type_and_prix_max(
        self, client, vente_vannes, vente_lorient, vente_vannes_2022, vente_vannes_2023
    ):
        # Maisons avec prix ≤ 310 000 € → vente_lorient (220k) et vente_vannes_2022 (300k).
        response = client.get(
            reverse("venteparcelle-list"),
            {"type_local": "Maison", "prix_max": 310000},
        )
        assert response.json()["count"] == 2


# ---------------------------------------------------------------------------
# Tests de la pagination
#
# Django REST Framework utilise PageNumberPagination avec PAGE_SIZE=20.
# On crée 21 ventes pour franchir la frontière entre la page 1 et la page 2.
# ---------------------------------------------------------------------------

PAGE_SIZE = 20  # doit correspondre à REST_FRAMEWORK['PAGE_SIZE'] dans settings.py


@pytest.fixture
def vingt_et_une_ventes(commune_vannes):
    """Crée PAGE_SIZE + 1 ventes pour pouvoir tester la pagination."""
    ventes = []
    for i in range(PAGE_SIZE + 1):
        ventes.append(
            VenteParcelle.objects.create(
                commune=commune_vannes,
                code_postal="56000",
                # Dates différentes pour que le tri par défaut (-date_mutation)
                # soit déterministe et reproductible.
                date_mutation=f"2024-{(i % 12) + 1:02d}-01",
                nature_mutation=VenteParcelle.NatureMutation.VENTE,
                valeur_fonciere=Decimal(f"{100000 + i * 1000}.00"),
                types_locaux=[VenteParcelle.TypeLocal.APPARTEMENT],
                surface_bien_principal=30 + i,
                surface_totale=30 + i,
                nombre_pieces_principales=2,
            )
        )
    return ventes


@pytest.mark.django_db
class TestVentePaginationAPI:
    def test_response_has_pagination_envelope(self, client, vente_vannes):
        # La réponse doit toujours contenir les quatre clés de pagination DRF,
        # même quand le résultat tient sur une seule page.
        data = client.get(reverse("venteparcelle-list")).json()
        assert "count"    in data
        assert "next"     in data
        assert "previous" in data
        assert "results"  in data

    def test_page_1_returns_page_size_items(self, client, vingt_et_une_ventes):
        # Avec 21 ventes, la page 1 doit en contenir exactement 20.
        data = client.get(reverse("venteparcelle-list")).json()
        assert data["count"] == PAGE_SIZE + 1
        assert len(data["results"]) == PAGE_SIZE

    def test_page_1_has_next_and_no_previous(self, client, vingt_et_une_ventes):
        # Sur la première page, next pointe vers la page 2 et previous est null.
        data = client.get(reverse("venteparcelle-list")).json()
        assert data["next"]     is not None
        assert data["previous"] is None

    def test_page_2_returns_remaining_items(self, client, vingt_et_une_ventes):
        # La page 2 contient la seule vente restante (21 - 20 = 1).
        data = client.get(reverse("venteparcelle-list"), {"page": 2}).json()
        assert len(data["results"]) == 1

    def test_page_2_has_previous_and_no_next(self, client, vingt_et_une_ventes):
        # Sur la dernière page, previous pointe vers la page 1 et next est null.
        data = client.get(reverse("venteparcelle-list"), {"page": 2}).json()
        assert data["previous"] is not None
        assert data["next"]     is None

    def test_count_reflects_total_not_page(self, client, vingt_et_une_ventes):
        # count doit toujours refléter le total global, peu importe la page demandée.
        data_p1 = client.get(reverse("venteparcelle-list")).json()
        data_p2 = client.get(reverse("venteparcelle-list"), {"page": 2}).json()
        assert data_p1["count"] == PAGE_SIZE + 1
        assert data_p2["count"] == PAGE_SIZE + 1

    def test_invalid_page_returns_404(self, client, vingt_et_une_ventes):
        # Demander une page qui n'existe pas doit renvoyer 404, pas une liste vide.
        response = client.get(reverse("venteparcelle-list"), {"page": 999})
        assert response.status_code == 404

    def test_pagination_combined_with_filter(self, client, vingt_et_une_ventes, vente_lorient):
        # S'assurer que la pagination s'applique après le filtrage, pas avant.
        # Filtrer sur Lorient → 1 seule vente → une seule page, next=null.
        data = client.get(
            reverse("venteparcelle-list"), {"commune": "Lorient"}
        ).json()
        assert data["count"]  == 1
        assert data["next"]   is None
        assert len(data["results"]) == 1


# ---------------------------------------------------------------------------
# Tests du tri (?ordering=)
#
# ordering_fields autorisés dans VenteParcelleViewSet : ["date_mutation", "valeur_fonciere"]
# Tri par défaut : ["-date_mutation"] (le plus récent en premier).
#
# Fixtures utilisées :
#   vente_vannes  → 387 000 €, date 2024-03-12  (plus cher, plus récent)
#   vente_lorient → 220 000 €, date 2024-01-15  (moins cher, plus ancien)
#
# L'ordre des prix et des dates est inversé : cela permet de vérifier chaque
# tri sans ambiguïté (si les deux grandeurs allaient dans le même sens,
# on ne saurait pas laquelle est responsable de l'ordre observé).
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestVenteOrderingAPI:
    def test_default_ordering_is_date_descending(self, client, vente_vannes, vente_lorient):
        # Sans paramètre ?ordering=, le tri par défaut est -date_mutation :
        # la vente la plus récente doit apparaître en premier.
        results = client.get(reverse("venteparcelle-list")).json()["results"]
        assert results[0]["date_mutation"] == "2024-03-12"  # vente_vannes (mars)
        assert results[1]["date_mutation"] == "2024-01-15"  # vente_lorient (janvier)

    def test_ordering_date_ascending(self, client, vente_vannes, vente_lorient):
        # ?ordering=date_mutation → la plus ancienne en premier.
        results = client.get(
            reverse("venteparcelle-list"), {"ordering": "date_mutation"}
        ).json()["results"]
        assert results[0]["date_mutation"] == "2024-01-15"  # vente_lorient
        assert results[1]["date_mutation"] == "2024-03-12"  # vente_vannes

    def test_ordering_price_ascending(self, client, vente_vannes, vente_lorient):
        # ?ordering=valeur_fonciere → la moins chère en premier.
        results = client.get(
            reverse("venteparcelle-list"), {"ordering": "valeur_fonciere"}
        ).json()["results"]
        assert float(results[0]["valeur_fonciere"]) == 220000  # vente_lorient
        assert float(results[1]["valeur_fonciere"]) == 387000  # vente_vannes

    def test_ordering_price_descending(self, client, vente_vannes, vente_lorient):
        # ?ordering=-valeur_fonciere → la plus chère en premier.
        results = client.get(
            reverse("venteparcelle-list"), {"ordering": "-valeur_fonciere"}
        ).json()["results"]
        assert float(results[0]["valeur_fonciere"]) == 387000  # vente_vannes
        assert float(results[1]["valeur_fonciere"]) == 220000  # vente_lorient

    def test_invalid_ordering_field_is_ignored(self, client, vente_vannes, vente_lorient):
        # Un champ non autorisé dans ordering_fields doit être ignoré par DRF,
        # qui retombe alors sur le tri par défaut. On vérifie qu'on obtient
        # quand même un 200 avec des résultats (pas d'erreur 400).
        response = client.get(reverse("venteparcelle-list"), {"ordering": "champ_inexistant"})
        assert response.status_code == 200
        assert response.json()["count"] == 2
