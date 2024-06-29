from django.contrib import admin
from modeltranslation.admin import TranslationAdmin
from .models import Source

# Register your models here.

class SourceAdmin(TranslationAdmin):
    list_display = ('name',)
    fields = ('name',)

admin.site.register(Source, SourceAdmin)