from .views import Preferences
from django.urls import path
from django.views.decorators.csrf import csrf_exempt

urlpatterns = [path('preferences', Preferences, name="preferences"),
               ]