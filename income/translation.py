from modeltranslation.translator import translator, TranslationOptions
from .models import Source, Income

class IncomeTranslationOptions(TranslationOptions):
    fields = ('source',)

class SourceTranslationOptions(TranslationOptions):
    fields = ('name',)

translator.register(Income, IncomeTranslationOptions)
translator.register(Source, SourceTranslationOptions)


