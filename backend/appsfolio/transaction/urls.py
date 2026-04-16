from rest_framework.routers import DefaultRouter

from .views import VenteParcelleViewSet

router = DefaultRouter()
# Enregistre le ViewSet sous le préfixe "ventes".
# Génère automatiquement :
#   GET /api/ventes/                  → VenteParcelleViewSet.list
#   GET /api/ventes/<public_id>/      → VenteParcelleViewSet.retrieve
router.register(r"ventes", VenteParcelleViewSet, basename="venteparcelle")

urlpatterns = router.urls
