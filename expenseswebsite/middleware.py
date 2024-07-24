from django.utils import translation
from preferences.models import UserPreferences
from django.shortcuts import redirect

"""
Ensures the language of the page changes to the one the user prefers.
"""

class SetUserLanguageMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            try:
                user_preferences = UserPreferences.objects.get(user=request.user)
                language = user_preferences.language
                translation.activate(language)
            except UserPreferences.DoesNotExist:
                pass

        response = self.get_response(request)
        return response

class LanguagePrefixMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        language = translation.get_language_from_request(request, check_path=True)
        
        if not request.path.startswith(f'/{language}/'):
            # Redirect to the same path with the language prefix
            return redirect(f'/{language}{request.path}')
        
        response = self.get_response(request)
        return response
