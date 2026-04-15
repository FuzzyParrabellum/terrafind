from django.contrib import admin

from .models import Commune


@admin.register(Commune)
class CommuneAdmin(admin.ModelAdmin):
    list_display = ("nom", "code_insee", "code_departement", "code_commune")
    search_fields = ("nom", "code_insee")
    ordering = ("nom",)
    readonly_fields = ("code_insee",)
