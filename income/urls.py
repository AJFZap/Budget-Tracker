from django.urls import path
from . import views

urlpatterns = [path('',views.income,name="income"), 
               path('add-income', views.add_income, name="add-income"),
               path('edit-income/<int:pk>', views.edit_income, name="edit-income"),
               path('delete/<int:pk>', views.delete_income, name='delete_income'),
               path('search-income', views.search_income, name="search-income"),
               path('income_summary', views.income_summary, name="income_summary"),
               path('income_data', views.income_data, name="income_data"),
               ]