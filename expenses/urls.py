from django.urls import path
from . import views 


urlpatterns = [path('',views.index,name="expenses"), 
               path('add-expense', views.add_expense, name="add-expenses"),
               path('edit-expense/<int:pk>', views.edit_expense, name="edit-expenses"),
               path('delete/<int:pk>', views.delete_expense, name='delete_expense'),
               path('search-expense', views.search_expense, name="search-expense"),
               path('expenses_summary', views.expenses_summary, name="expenses_summary"),
               path('expenses_data', views.expenses_data, name="expenses_data"),
               path('export_expenses', views.export_data, name="export_expenses"),
               path('import_expenses', views.import_data, name="import_expenses"),
               path('categories/', views.get_categories, name='get_categories'),
               ]