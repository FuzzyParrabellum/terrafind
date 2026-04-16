from rest_framework.routers import DefaultRouter

from .views import CommuneViewSet

router = DefaultRouter()
# Enregistre le ViewSet sous le préfixe "communes".
# Génère automatiquement :
#   GET /api/communes/          → CommuneViewSet.list
#   GET /api/communes/<code_insee>/  → CommuneViewSet.retrieve
router.register(r"communes", CommuneViewSet, basename="commune")

urlpatterns = router.urls
