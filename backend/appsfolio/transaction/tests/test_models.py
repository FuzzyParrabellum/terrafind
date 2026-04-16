import pytest
from decimal import Decimal

from appsfolio.place.models import Commune
from appsfolio.transaction.models import VenteParcelle


@pytest.fixture
def commune():
    return Commune.objects.create(
        nom="Vannes",
        code_departement="56",
        code_commune="260",
    )


@pytest.fixture
def vente(commune):
    return VenteParcelle.objects.create(
        commune=commune,
        code_postal="56000",
        date_mutation="2024-03-12",
        nature_mutation=VenteParcelle.NatureMutation.VENTE,
        valeur_fonciere=Decimal("387000.00"),
        types_locaux=[VenteParcelle.TypeLocal.APPARTEMENT],
        surface_bien_principal=42,
        surface_totale=42,
        nombre_pieces_principales=2,
    )


@pytest.mark.django_db
class TestVenteParcelleModel:
    def test_creation_with_required_fields(self, vente):
        assert vente.pk is not None

    def test_public_id_is_generated_automatically(self, vente):
        assert vente.public_id is not None

    def test_two_ventes_have_different_public_ids(self, commune):
        v1 = VenteParcelle.objects.create(
            commune=commune, code_postal="56000",
            date_mutation="2024-01-01",
            nature_mutation=VenteParcelle.NatureMutation.VENTE,
            valeur_fonciere=Decimal("100000.00"),
        )
        v2 = VenteParcelle.objects.create(
            commune=commune, code_postal="56000",
            date_mutation="2024-01-01",
            nature_mutation=VenteParcelle.NatureMutation.VENTE,
            valeur_fonciere=Decimal("200000.00"),
        )
        assert v1.public_id != v2.public_id

    def test_valeur_fonciere_is_decimal(self, vente):
        assert isinstance(vente.valeur_fonciere, Decimal)

    def test_types_locaux_stores_list(self, vente):
        assert isinstance(vente.types_locaux, list)
        assert VenteParcelle.TypeLocal.APPARTEMENT in vente.types_locaux

    def test_types_locaux_can_hold_multiple_types(self, commune):
        vente = VenteParcelle.objects.create(
            commune=commune,
            code_postal="56000",
            date_mutation="2024-01-01",
            nature_mutation=VenteParcelle.NatureMutation.VENTE,
            valeur_fonciere=Decimal("500000.00"),
            types_locaux=[VenteParcelle.TypeLocal.MAISON, VenteParcelle.TypeLocal.DEPENDANCE],
            surface_bien_principal=118,
            surface_totale=133,
        )
        assert len(vente.types_locaux) == 2

    def test_optional_fields_can_be_null(self, commune):
        vente = VenteParcelle.objects.create(
            commune=commune,
            code_postal="56000",
            date_mutation="2024-01-01",
            nature_mutation=VenteParcelle.NatureMutation.VENTE,
            valeur_fonciere=Decimal("50000.00"),
        )
        assert vente.surface_bien_principal is None
        assert vente.surface_totale is None
        assert vente.nombre_pieces_principales is None
        assert vente.surface_terrain is None

    def test_deleting_commune_is_blocked(self, commune, vente):
        from django.db.models import ProtectedError
        with pytest.raises(ProtectedError):
            commune.delete()

    def test_ordering_is_by_date_descending(self, commune):
        VenteParcelle.objects.create(
            commune=commune, code_postal="56000",
            date_mutation="2023-01-01",
            nature_mutation=VenteParcelle.NatureMutation.VENTE,
            valeur_fonciere=Decimal("100000.00"),
        )
        VenteParcelle.objects.create(
            commune=commune, code_postal="56000",
            date_mutation="2024-06-01",
            nature_mutation=VenteParcelle.NatureMutation.VENTE,
            valeur_fonciere=Decimal("200000.00"),
        )
        dates = list(VenteParcelle.objects.values_list("date_mutation", flat=True))
        assert dates == sorted(dates, reverse=True)

    def test_str(self, vente):
        assert "Appartement" in str(vente)
        assert "Vannes" in str(vente)
        assert "387000" in str(vente)
