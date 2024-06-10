from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import now

# Create your models here.

class Expense(models.Model):
    user = models.ForeignKey(to=User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255, blank=True)
    date = models.DateField(default=now)
    description = models.TextField()
    amount = models.FloatField(max_length=255, blank=True)
    category = models.CharField(max_length=255)

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
        verbose_name_plural = 'Categories'
        ordering = ['name']