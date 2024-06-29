from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import now
from django.utils.translation import gettext_lazy as _

# Create your models here.

class Expense(models.Model):
    user = models.ForeignKey(to=User, on_delete=models.CASCADE)
    name = models.CharField(_("name"), max_length=255, blank=True)
    date = models.DateField(_("date"), default=now)
    description = models.TextField(_("description"))
    amount = models.FloatField(_("amount"), max_length=255, blank=True)
    category = models.CharField(_("category"), max_length=255)

    def __str__(self) -> str:
        return self.category

    @property
    def entry_type(self):
        return "Expense"

    @property
    def category_or_source(self):
        return self.category
    
    class Meta:
        ordering = ['-pk']

class Category(models.Model):
    name=models.CharField(max_length=255)

    def __str__(self) -> str:
        return self.name
    
    class Meta:
        verbose_name_plural = _('Categories')
        ordering = ['name']