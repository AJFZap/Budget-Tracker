from django.contrib import admin
from modeltranslation.admin import TranslationAdmin
from .models import Category

# Register your models here.

class CategoryAdmin(TranslationAdmin):
    list_display = ('name',)
    fields = ('name',)

admin.site.register(Category, CategoryAdmin)
