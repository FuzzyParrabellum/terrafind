from rest_framework import serializers

from appsfolio.place.serializers import CommuneSerializer
from .models import VenteParcelle


class VenteParcelleSerializer(serializers.ModelSerializer):
    # Imbrique le serializer de Commune pour exposer nom et code_insee
    # directement dans la réponse, plutôt qu'un simple id numérique interne.
    commune = CommuneSerializer(read_only=True)

    class Meta:
        model = VenteParcelle
        fields = [
            "public_id",
            "commune",
            "code_postal",
            "date_mutation",
            "nature_mutation",
            "valeur_fonciere",
            "types_locaux",
            "surface_bien_principal",
            "surface_totale",
            "nombre_pieces_principales",
            "nature_culture",
            "surface_terrain",
        ]
        # public_id est en lecture seule : généré automatiquement, jamais écrit par l'API
        read_only_fields = ["public_id"]
