from modeltranslation.translator import translator, TranslationOptions
from .models import Category, Expense

class ExpenseTranslationOptions(TranslationOptions):
    fields = ('category',)

class CategoryTranslationOptions(TranslationOptions):
    fields = ('name',)

translator.register(Expense, ExpenseTranslationOptions)
translator.register(Category, CategoryTranslationOptions)
