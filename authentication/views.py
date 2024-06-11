from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views import View
from django.contrib.auth.models import User
from django.contrib import messages, auth
from django.core.mail import send_mail
from django.urls import reverse
from validate_email import validate_email
from django.conf import settings
from decouple import config
from .utils import tokenGenerator
import json

from django.utils.encoding import force_bytes, force_str, DjangoUnicodeDecodeError
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.sites.shortcuts import get_current_site

# Create your views here.

class RegistrationView(View):
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
                    messages.error(request, "Password can't be shorther than six characters!")
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
                messages.success(request, "Account succesfully created! A verification link has been sent to your email.")
                return render(request, 'authentication/register.html')
            
            else:
                messages.error(request, "Username already in use, pick another one.")
                return render(request, 'authentication/register.html', context)
        else:
            messages.error(request, "This Email is already associated with an existing account")
            return render(request, 'authentication/register.html', context)

        messages.success(request, 'Registered Successfully')
        messages.error(request, 'Error While Registering')
        messages.info(request, 'Information Tag')
        messages.warning(request, 'Just a Warning')

        return render(request, 'authentication/register.html')
    
    def SendVerificationEmail(self, userEmail, user, link, domain):
        """
        Sends a verification email to the user that just registered.
        """

        activate_url = f'http://{domain}{link}'

        send_mail(
            "Account Activation",
            f"Hello {user.username}! \n Please click on the link below to activate your account!\n {activate_url}",
            config('DEFAULT_FROM_EMAIL'),
            [userEmail],
            fail_silently=False,
        )

class VerificationView(View):
    def get(self, request, uid64, token):

        # IMAGINE NOT CHECKING IF THE TOKEN IS THE SAME LOL.
        
        try:
            id = force_str(urlsafe_base64_decode(uid64))
            user = User.objects.get(pk=id)

            if user.is_active:
                messages.info(request, 'Account already active')
                return redirect('login')
            
            user.is_active = True
            user.save()

            messages.success(request, 'Account activated successfully')

        except Exception as e:
            return e
        
        return redirect('login')

class LoginView(View):
    def get(self, request):
        # If the user is authenticated we send him to the home page.
        if request.user.is_authenticated:
            return redirect('dashboard')
            
        return render(request, 'authentication/login.html')

    def post(self, request):
        username = request.POST['username']
        password = request.POST['password']

        if username == '' or password == '':
            messages.error(request, 'Please fill out the fields.')
            return render(request, 'authentication/login.html')

        if User.objects.filter(username=username).exists():

            user = auth.authenticate(username=username,password=password)

            if user:
                if user.is_active:
                    auth.login(request, user)
                    messages.success(request, f'Welcome Back, {user.username}!')
                    return redirect('dashboard')
                elif not user.is_active:
                    messages.error(request, f'Activate your account to login, {user.username}!, Check your email and your spam inbox.')
                    return render(request, 'authentication/login.html')
            else:
                messages.error(request, 'Wrong Password')
                return render(request, 'authentication/login.html')
        
        else:
            messages.error(request, 'No account with that username exists')
            return render(request, 'authentication/login.html')

def LogoutView(request):
    auth.logout(request)
    messages.success(request, "You've logged out!")
    return redirect('login')

class EmailValidationView(View):
    """
    Check if the email is valid for registration.
    """
    def post(self, request):
        data = json.loads(request.body)
        email = data['email']

        if not validate_email(email):
            return JsonResponse({'email_Error': 'Need to introduce a valid email.'}, status=400)
        if User.objects.filter(email=email).exists():
            return JsonResponse({'email_Error': 'Email already registered on the database.'}, status=409)
        
        return JsonResponse({'email_valid': True})

class UsernameValidationView(View):
    """
    Check if the username is valid for registration.
    """
    def post(self, request):
        data = json.loads(request.body)
        username = data['username']

        if not str(username).isalnum():
            return JsonResponse({'username_Error': 'Username should only contain alphanumerical characters.'}, status=400)
        if User.objects.filter(username=username).exists():
            return JsonResponse({'username_Error': 'Username already exists.'}, status=409)
        
        return JsonResponse({'username_valid': True})
