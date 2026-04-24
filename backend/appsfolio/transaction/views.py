from django.db.models import Avg, Case, Count, ExpressionWrapper, F, FloatField, IntegerField, Q, Value, When
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

        Retourne des statistiques agrégées sur les ventes, par semestre.

        Filtres optionnels :
          ?commune=56260   → limiter aux ventes d'une commune
          ?type_local=...  → limiter à un type de bien
        """
        qs = self.get_queryset()

        # Prix au m² — null quand surface absente ou nulle pour éviter la division par zéro.
        prix_m2_expr = Case(
            When(
                surface_bien_principal__isnull=False,
                surface_bien_principal__gt=0,
                then=ExpressionWrapper(
                    F("valeur_fonciere") / F("surface_bien_principal"),
                    output_field=FloatField(),
                ),
            ),
            default=Value(None),
            output_field=FloatField(),
        )

        # Semestre (1 = jan–juin, 2 = juil–déc)
        semestre_expr = Case(
            When(date_mutation__month__lte=6, then=Value(1)),
            default=Value(2),
            output_field=IntegerField(),
        )

        # Agrégats globaux ------------------------------------------------
        global_agg = qs.annotate(prix_m2=prix_m2_expr).aggregate(
            total_ventes=Count("id"),
            prix_median=Median("valeur_fonciere"),
            prix_m2_median=Median("prix_m2"),
            surface_moyenne=Avg("surface_bien_principal"),
        )

        # Agrégats par semestre -------------------------------------------
        # On annote chaque ligne avec (annee, semestre, prix_m2),
        # puis on regroupe et on agrège.
        par_periode = (
            qs
            .annotate(
                annee=ExtractYear("date_mutation"),
                semestre=semestre_expr,
                prix_m2=prix_m2_expr,
            )
            .values("annee", "semestre")
            .annotate(
                nb_ventes=Count("id"),
                prix_median=Median("valeur_fonciere"),
                prix_m2_median=Median("prix_m2"),
                surface_moyenne=Avg("surface_bien_principal"),
            )
            .order_by("annee", "semestre")
        )

        payload = {
            "total_ventes": global_agg["total_ventes"],
            "prix_median": global_agg["prix_median"],
            "prix_m2_median": global_agg["prix_m2_median"],
            "surface_moyenne": global_agg["surface_moyenne"],
            "par_periode": list(par_periode),
        }

        serializer = StatsSerializer(payload)
        return Response(serializer.data)
