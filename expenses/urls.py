from django.urls import path
from . import views 


urlpatterns = [path('',views.index,name="expenses"), 
               path('add-expense', views.add_expense, name="add-expenses"),
               path('edit-expense/<int:pk>', views.edit_expense, name="edit-expenses"),
               path('delete/<int:pk>', views.delete_expense, name='delete_expense'),
               path('search-expense', views.search_expense, name="search-expense"),
               ]