from django.db.models import Avg, Count, Q
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
            # Q() permet un filtre OU : on accepte un code INSEE ("56260")
            # ou un nom de commune ("Vannes"), insensible à la casse.
            # Sans Q(), filter() enchaîné produirait un AND qui retournerait toujours 0.
            qs = qs.filter(
                Q(commune__code_insee=commune) |
                Q(commune__nom__icontains=commune)
            )

        code_postal = self.request.query_params.get("code_postal")
        if code_postal:
            qs = qs.filter(code_postal=code_postal)

        # __contains sur ArrayField vérifie que la liste contient cette valeur.
        # Ex : types_locaux__contains=["Maison"] filtre les ventes avec au moins une Maison.
        type_local = self.request.query_params.get("type_local")
        if type_local:
            qs = qs.filter(types_locaux__contains=[type_local])

        prix_min = self.request.query_params.get("prix_min")
        if prix_min:
            qs = qs.filter(valeur_fonciere__gte=prix_min)

        prix_max = self.request.query_params.get("prix_max")
        if prix_max:
            qs = qs.filter(valeur_fonciere__lte=prix_max)

        surface_min = self.request.query_params.get("surface_min")
        if surface_min:
            qs = qs.filter(surface_bien_principal__gte=surface_min)

        surface_max = self.request.query_params.get("surface_max")
        if surface_max:
            qs = qs.filter(surface_bien_principal__lte=surface_max)

        pieces_min = self.request.query_params.get("pieces_min")
        if pieces_min:
            qs = qs.filter(nombre_pieces_principales__gte=pieces_min)

        annee_debut = self.request.query_params.get("annee_debut")
        if annee_debut:
            qs = qs.filter(date_mutation__year__gte=annee_debut)

        annee_fin = self.request.query_params.get("annee_fin")
        if annee_fin:
            qs = qs.filter(date_mutation__year__lte=annee_fin)

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
