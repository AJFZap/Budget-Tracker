from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import now
from django.utils.translation import gettext_lazy as _
from django.utils import translation

# Create your models here.

class Income(models.Model):
    user = models.ForeignKey(to=User, on_delete=models.CASCADE)
    name = models.CharField(_("name"), max_length=255, blank=True)
    date = models.DateField(_("date"), default=now)
    description = models.TextField(_("description"))
    amount = models.DecimalField(_("amount"), decimal_places=2, max_digits=12)
    source = models.CharField(_("source"), max_length=255)

    def __str__(self) -> str:
        return self.source

    @property
    def entry_type(self):
        language = translation.get_language()
        if language == 'es':
            return "Ingresos"
        elif language == 'ja':
            return "所得"
        return "Income"

    @property
    def category_or_source(self):
        return self.source
    
    class Meta:
        ordering = ['-pk']

class Source(models.Model):
    name=models.CharField(max_length=255)

    def __str__(self) -> str:
        return self.name
    
    class Meta:
        verbose_name_plural = _('Sources')
        ordering = ['name']