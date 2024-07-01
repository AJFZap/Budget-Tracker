from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views import View
from django.contrib.auth.models import User
from django.utils import translation
from django.utils.translation import gettext as _
from django.contrib import messages, auth
from django.urls import reverse
from django.conf import settings
from .models import UserPreferences
import os, json

# Create your views here.

def Preferences(request):
    """
    Returns the preferences/index with a dictionary called currencies that holds
    a good amount of currencies from all over the world.
    """ 
    currencies = []
    file_path = os.path.join(settings.BASE_DIR, 'currencies.json') # Get the Json file with all the currencies.

    with open(file_path, 'r') as json_file:
        data = json.load(json_file)
        for i,j in data.items():
            currencies.append({'name':i, 'value':j})

    # WHEN A USER IS AUTHENTICATED.
    if request.user.is_authenticated:

        user_preferences = UserPreferences.objects.get(user=request.user)
        savedCurrency = user_preferences.currency
        savedLanguage = user_preferences.language
        savedPreferences = [savedCurrency, savedLanguage]

        if request.method == 'GET':

            return render(request, 'preferences/index.html', {'currencies': currencies, 'saved': savedPreferences})

        elif request.method == 'POST':
            currency = request.POST['currency']
            language = request.POST['language']

            # Save the currency and language.
            user_preferences.currency, user_preferences.language = currency, language
            user_preferences.save()

            # We change the language of the page to the one the user selected.
            request.session[settings.LANGUAGE_COOKIE_NAME] = language
            translation.activate(language)

            # We save them so on the page reload we can see the changes take place.
            savedPreferences = [currency, language]

            messages.success(request, _("Changes have been saved successfully!"))
            return render(request, 'preferences/index.html', {'currencies': currencies, 'saved': savedPreferences})
    
    # WHEN IT IS A GUEST WE DON'T SAVE A SINGLE THING.
    else:
        if request.method == 'GET':

            return render(request, 'preferences/index.html', {'currencies': currencies})
        
        elif request.method == 'POST':

            messages.success(request, _("Changes have been saved successfully!"))
            return render(request, 'preferences/index.html', {'currencies': currencies})

def delete_user(request, pk):
    """
    Given an ID it deletes the user.
    """
    if request.method == 'POST':
        user = User.objects.get(id=pk)
        name = user.username
        user.delete()
        messages.success(request, _("{} account has been deleted successfully!").format(name))
        return JsonResponse({'success': True})
    
    return JsonResponse({'success': False})