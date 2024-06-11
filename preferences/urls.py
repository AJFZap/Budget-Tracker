from .views import Preferences, delete_user
from django.urls import path
from django.views.decorators.csrf import csrf_exempt

urlpatterns = [path('preferences', Preferences, name="preferences"),
               path('delete_user/<int:pk>', delete_user, name="delete_user"),
               ]