from modeltranslation.translator import translator, TranslationOptions
from .models import Source

class SourceTranslationOptions(TranslationOptions):
    fields = ('name',)

translator.register(Source, SourceTranslationOptions)


