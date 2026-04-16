from rest_framework import viewsets, filters

from .models import Commune
from .serializers import CommuneSerializer


class CommuneViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Liste et détail des communes du Morbihan.
    Supporte la recherche par nom ou code INSEE via ?search=
    """
    serializer_class = CommuneSerializer
    # Utilise code_insee comme lookup au lieu de l'id numérique interne.
    # Ainsi /api/communes/56260/ retourne Vannes.
    lookup_field = "code_insee"
    filter_backends = [filters.SearchFilter]
    search_fields = ["nom", "code_insee"]

    def get_queryset(self):
        return Commune.objects.all()
