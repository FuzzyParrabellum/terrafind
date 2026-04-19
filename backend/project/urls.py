from django.contrib import admin
from django.urls import path, include

from appsfolio.core.views import robots_txt

urlpatterns = [
    path("robots.txt", robots_txt),
    path("admin/", admin.site.urls),
    path("api/", include("appsfolio.place.urls")),
    path("api/", include("appsfolio.transaction.urls")),
]
