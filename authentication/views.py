from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views import View
from django.contrib.auth.models import User
from django.utils.translation import gettext as _
from django.utils import translation
from django.contrib import messages, auth
from django.core.mail import send_mail
from django.urls import reverse
from validate_email import validate_email
from decouple import config
from .utils import tokenGenerator
from preferences.models import UserPreferences
from django.conf import settings
import json

from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.sites.shortcuts import get_current_site

# Create your views here.

class RegistrationView(View):
    """
    Deal with user registration.
    """
    def get(self, request):
        # If the user is authenticated we send him to the home page.
        if request.user.is_authenticated:
            return redirect('dashboard')

        return render(request, 'authentication/register.html')
    
    def post(self, request):
        """
        Get User Data, Validate and Creates User Account.
        """
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']

        context = {
            "fieldValues": request.POST
        }

        if not User.objects.filter(email=email).exists():
            if not User.objects.filter(username=username).exists():
                if len(password) < 6:
                    messages.error(request, _("Password can't be shorter than six characters!"))
                    return render(request, 'authentication/register.html', context)

                user = User.objects.create_user(username=username, email=email)
                user.set_password(password)
                user.is_active = False
                user.save()

                uid64 = urlsafe_base64_encode(force_bytes(user.pk))
                token = tokenGenerator.make_token(user)
                domain = get_current_site(request).domain
                link = reverse("activate", kwargs={'uid64': uid64,'token': token})

                self.SendVerificationEmail(email, user, link, domain)
                messages.success(request, _("Account successfully created! A verification link has been sent to your email."))
                return render(request, 'authentication/register.html')
            
            else:
                messages.error(request, _("Username already in use, pick another one."))
                return render(request, 'authentication/register.html', context)
        else:
            messages.error(request, _("This Email is already associated with an existing account"))
            return render(request, 'authentication/register.html', context)

        # messages.success(request, 'Registered Successfully')
        # messages.error(request, 'Error While Registering')
        # messages.info(request, 'Information Tag')
        # messages.warning(request, 'Just a Warning')

        return render(request, 'authentication/register.html')
    
    def SendVerificationEmail(self, userEmail, user, link, domain):
        """
        Sends a verification email to the user that just registered.
        """

        activate_url = f'http://{domain}{link}'

        send_mail(
            _("Account Activation"),
            _("Hello {}! \n Please click on the link below to activate your account!\n {}").format(user.username, activate_url),
            config('DEFAULT_FROM_EMAIL'),
            [userEmail],
            fail_silently=False,
        )

class VerificationView(View):
    """
    When the user clicks on the verification link we sended them via email we activate the account.
    """
    def get(self, request, uid64, token):

        # IMAGINE NOT CHECKING IF THE TOKEN IS THE SAME LOL.
        
        try:
            id = force_str(urlsafe_base64_decode(uid64))
            user = User.objects.get(pk=id)

            if user.is_active:
                messages.info(request, _('Account already active'))
                return redirect('login')
            
            user.is_active = True
            user.save()

            messages.success(request, _('Account activated successfully'))

        except Exception as e:
            return e
        
        return redirect('login')

class LoginView(View):
    """
    Logs the user if it exists and set the language to his/her preferences.
    """
    def get(self, request):
        # If the user is authenticated we send him to the home page.
        if request.user.is_authenticated:
            return redirect('dashboard')
            
        return render(request, 'authentication/login.html')

    def post(self, request):
        username = request.POST['username']
        password = request.POST['password']

        if username == '' or password == '':
            messages.error(request, _('Please fill out the fields.'))
            return render(request, 'authentication/login.html')

        if User.objects.filter(username=username).exists():

            user = auth.authenticate(username=username,password=password)

            if user:
                if user.is_active:
                    auth.login(request, user)
                    
                    # Language change to the one the user prefers. If it's the user first log then we create the preferences.
                    if UserPreferences.objects.filter(user=user).exists():
                        pass
                       
                    else:
                        UserPreferences.objects.create(user=user)

                    language = UserPreferences.objects.get(user=user).language
                    request.session[settings.LANGUAGE_COOKIE_NAME] = language
                    translation.activate(language)

                    messages.success(request, _('Welcome Back, {}!').format(user.username))

                    return redirect('dashboard')
                elif not user.is_active:
                    messages.error(request, _('Activate your account to login, {}!, Check your email and your spam inbox.').format(request.user.username))
                    return render(request, 'authentication/login.html')
            else:
                messages.error(request, _('Wrong Password'))
                return render(request, 'authentication/login.html')
        
        else:
            messages.error(request, _('No account with that username exists'))
            return render(request, 'authentication/login.html')

def LogoutView(request):
    auth.logout(request)
    messages.success(request, _("You've logged out!"))
    return redirect('login')

class EmailValidationView(View):
    """
    Check if the email is valid for registration.
    """
    def post(self, request):
        data = json.loads(request.body)
        email = data['email']

        if not validate_email(email):
            return JsonResponse({'email_Error': _('Need to introduce a valid email.')}, status=400)
        if User.objects.filter(email=email).exists():
            return JsonResponse({'email_Error': _('Email already registered on the database.')}, status=409)
        
        return JsonResponse({'email_valid': True})

class UsernameValidationView(View):
    """
    Check if the username is valid for registration.
    """
    def post(self, request):
        data = json.loads(request.body)
        username = data['username']

        if not str(username).isalnum():
            return JsonResponse({'username_Error': _('Username should only contain alphanumerical characters.')}, status=400)
        if User.objects.filter(username=username).exists():
            return JsonResponse({'username_Error': _('Username already exists.')}, status=409)
        
        return JsonResponse({'username_valid': True})
