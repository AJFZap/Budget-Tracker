from django.urls import path
from . import views 


urlpatterns = [path('',views.index,name="dashboard"),
               path('export_everything',views.export_data,name="export_everything"),
               path('import_everything',views.import_data,name="import_everything"),
               ]