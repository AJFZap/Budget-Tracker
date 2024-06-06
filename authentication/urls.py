from .views import RegistrationView, UsernameValidationView, EmailValidationView, VerificationView, LoginView, LogoutView
from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import views as auth_views

urlpatterns = [path('register', RegistrationView.as_view(), name="register"),
               path('validate-username',  csrf_exempt(UsernameValidationView.as_view()), name="validate-username"),
               path('validate-email',  csrf_exempt(EmailValidationView.as_view()), name="validate-email"),
               path('activate/<uid64>/<token>', VerificationView.as_view(), name="activate"),
               path('login', LoginView.as_view(), name="login"),
               path('logout', LogoutView, name="logout"),

               path('reset_password', auth_views.PasswordResetView.as_view(template_name="authentication/password_reset.html"), name='reset_password'),
               path('reset_password_sent/', auth_views.PasswordResetDoneView.as_view(template_name="authentication/password_reset_done.html"), name='password_reset_done'),
               path('reset/<uidb64>/<token>', auth_views.PasswordResetConfirmView.as_view(template_name="authentication/password_reset_confirm.html"), name='password_reset_confirm'),
               path('reset_password_success/', auth_views.PasswordResetCompleteView.as_view(template_name="authentication/password_reset_complete.html"), name='password_reset_complete'),
               ]