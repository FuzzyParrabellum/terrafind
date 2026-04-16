import pytest

from appsfolio.place.models import Commune


@pytest.fixture
def commune():
    return Commune.objects.create(
        nom="Vannes",
        code_departement="56",
        code_commune="260",
    )


@pytest.mark.django_db
class TestCommuneModel:
    def test_code_insee_is_computed_on_save(self, commune):
        assert commune.code_insee == "56260"

    def test_code_insee_updates_when_fields_change(self, commune):
        commune.code_departement = "56"
        commune.code_commune = "019"
        commune.save()
        assert commune.code_insee == "56019"

    def test_code_insee_is_unique(self, commune):
        from django.db import IntegrityError
        with pytest.raises(IntegrityError):
            Commune.objects.create(
                nom="Vannes Doublon",
                code_departement="56",
                code_commune="260",
            )

    def test_str(self, commune):
        assert str(commune) == "Vannes (56260)"

    def test_ordering_is_by_nom(self):
        Commune.objects.create(nom="Lorient", code_departement="56", code_commune="121")
        Commune.objects.create(nom="Auray", code_departement="56", code_commune="007")
        Commune.objects.create(nom="Vannes", code_departement="56", code_commune="260")
        noms = list(Commune.objects.values_list("nom", flat=True))
        assert noms == sorted(noms)
