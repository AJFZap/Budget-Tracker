from django.utils import translation
from preferences.models import UserPreferences

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
