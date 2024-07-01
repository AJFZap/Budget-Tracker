from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _

# Create your models here.

class UserPreferences(models.Model):
    user = models.OneToOneField(to=User, on_delete=models.CASCADE)
    currency = models.CharField(max_length=255, blank=True, default='USD - United States Dollar')
    language = models.CharField(max_length=10, choices=[
        ('en', _('English')),
        ('es', _('Spanish')),
        ('ja', _('Japanese')),
    ], default='en')

    def __str__(self) -> str:
        return str(self.user) + 's' + 'preferences'