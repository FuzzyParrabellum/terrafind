from django.contrib import admin

from .models import VenteParcelle


@admin.register(VenteParcelle)
class VenteParcelleAdmin(admin.ModelAdmin):
    list_display = (
        "commune",
        "code_postal",
        "date_mutation",
        "nature_mutation",
        "types_locaux",
        "valeur_fonciere",
        "surface_bien_principal",
        "surface_totale",
        "nombre_pieces_principales",
    )
    list_filter = ("nature_mutation", "nature_culture", "commune")
    search_fields = ("commune__nom", "commune__code_insee", "code_postal")
    ordering = ("-date_mutation",)
    readonly_fields = ("public_id",)
    date_hierarchy = "date_mutation"
