from rest_framework import serializers

from .models import Commune


class CommuneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Commune
        fields = ["code_insee", "nom", "code_departement"]
        # code_commune n'est pas exposé : code_insee suffit et est plus lisible
