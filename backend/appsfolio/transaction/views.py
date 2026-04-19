from django.db.models import Avg, Count
from django.db.models.functions import ExtractYear
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response

from .aggregates import Median
from .models import VenteParcelle
from .serializers import VenteParcelleSerializer, StatsSerializer


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

    @action(detail=False, methods=["get"], url_path="stats")
    def stats(self, request):
        """
        GET /api/ventes/stats/

        Retourne des statistiques agrégées sur les ventes.

        Filtres optionnels :
          ?commune=56260 → limiter aux ventes d'une commune
        """
        # On réutilise get_queryset() pour appliquer les mêmes filtres
        # (?commune, ?code_postal) sans dupliquer la logique.
        qs = self.get_queryset()

        # Agrégats globaux ------------------------------------------------
        global_agg = qs.aggregate(
            total_ventes=Count("id"),
            prix_median=Median("valeur_fonciere"),
            surface_moyenne=Avg("surface_bien_principal"),
        )

        # Agrégats par année -----------------------------------------------
        # ExtractYear annote chaque ligne avec l'année de date_mutation,
        # puis on group by cette annotation via values("annee").
        par_annee = (
            qs.annotate(annee=ExtractYear("date_mutation"))
            .values("annee")
            .annotate(
                nb_ventes=Count("id"),
                prix_median=Median("valeur_fonciere"),
                surface_moyenne=Avg("surface_bien_principal"),
            )
            .order_by("annee")
        )

        payload = {
            "total_ventes": global_agg["total_ventes"],
            "prix_median": global_agg["prix_median"],
            "surface_moyenne": global_agg["surface_moyenne"],
            "par_annee": list(par_annee),
        }

        serializer = StatsSerializer(payload)
        return Response(serializer.data)
