"""
URL configuration for expenseswebsite project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.static import serve
from django.conf import settings
from django.conf.urls.i18n import i18n_patterns
from django.conf.urls.static import static

urlpatterns = i18n_patterns(
    re_path(r'^media/(?P<path>.*)$', serve,{'document_root': settings.MEDIA_ROOT}),
    re_path(r'^templates/(?P<path>.*)$', serve,{'document_root': settings.STATIC_ROOT}),

    path('', include('dashboard.urls')),
    path('expenses/', include('expenses.urls')),
    path('income/', include('income.urls')),
    path('authentication/', include('authentication.urls')),
    path('settings/', include('preferences.urls')),
    path('admin/', admin.site.urls),
    path('rosetta/', include('rosetta.urls')),
)

if settings.DEBUG is False:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

handler404 = 'dashboard.views.error_404_view'