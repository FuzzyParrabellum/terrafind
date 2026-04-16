from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("appsfolio.place.urls")),
    path("api/", include("appsfolio.transaction.urls")),
]
