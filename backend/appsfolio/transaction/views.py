from rest_framework import viewsets, filters

from .models import VenteParcelle
from .serializers import VenteParcelleSerializer


class VenteParcelleViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Liste et détail des transactions immobilières du Morbihan.

    Filtres disponibles :
      ?commune=56260     → filtrer par code INSEE de la commune
      ?code_postal=56000 → filtrer par code postal
    """
    serializer_class = VenteParcelleSerializer
    # Utilise public_id (UUID) comme lookup au lieu de l'id interne.
    # Ainsi /api/ventes/550e8400-.../ ne révèle pas la séquence interne.
    lookup_field = "public_id"
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["date_mutation", "valeur_fonciere"]
    ordering = ["-date_mutation"]

    def get_queryset(self):
        # select_related("commune") évite le problème N+1 :
        # sans ça, chaque vente ferait une requête SQL séparée pour sa commune.
        qs = VenteParcelle.objects.select_related("commune")

        commune = self.request.query_params.get("commune")
        if commune:
            qs = qs.filter(commune__code_insee=commune)

        code_postal = self.request.query_params.get("code_postal")
        if code_postal:
            qs = qs.filter(code_postal=code_postal)

        return qs
