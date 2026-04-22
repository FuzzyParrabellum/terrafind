from django.contrib import admin

from .models import VenteParcelle


class TypeLocalFilter(admin.SimpleListFilter):
    """
    Filtre admin pour types_locaux (ArrayField PostgreSQL).

    list_filter standard génère WHERE types_locaux = 'Maison', ce qui ne
    fonctionne pas sur un tableau. On surcharge queryset() pour utiliser
    __contains, qui génère WHERE types_locaux @> ARRAY['Maison'].
    """
    title = "type de bien"       # libellé affiché dans le panneau de droite
    parameter_name = "type_local"  # nom du paramètre dans l'URL de l'admin

    def lookups(self, _request, _model_admin):
        # Chaque tuple : (valeur utilisée dans l'URL, libellé affiché).
        # On utilise les choix définis sur le modèle pour rester cohérent.
        return [
            (choice.value, choice.label)
            for choice in VenteParcelle.TypeLocal
        ]

    def queryset(self, request, queryset):
        if self.value():
            # __contains sur ArrayField vérifie que le tableau inclut cette valeur.
            return queryset.filter(types_locaux__contains=[self.value()])
        return queryset


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
    list_filter = ("nature_mutation", "nature_culture", TypeLocalFilter, "commune")
    search_fields = ("commune__nom", "commune__code_insee", "code_postal")
    ordering = ("-date_mutation",)
    readonly_fields = ("public_id",)
    date_hierarchy = "date_mutation"
