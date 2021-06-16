"""HL_site URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls import url 
from django.conf.urls.static import static

from labeller import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('django.contrib.auth.urls')),
    re_path(r'', include(('labeller.urls', 'labeller'), namespace='labeller')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

<<<<<<< HEAD

# # Add Django site authentication URLS (login, logout, password management...)
urlpatterns += [ 
  path('register/', views.register, name='labeller:register'),
  path('accounts/', include('django.contrib.auth.urls'), name='labeller:accounts'),
  # path('password_reset/done', auth_views.PasswordResetDoneView.as_view(template_name='labeller/templates/registration/password_reset_done.htlm'), name='password_reset_done'),
  # path('reset/<uidb64>/<token>', auth_views.PasswordResetConfirmView.as_view(template_name='labeller/templates/registration/password_reset_confirm.html'), name='password_reset_confirm'),
  # path('reset/done', auth_views.PasswordResetCompleteView.as_view(template_name='labeller/templates/registration/password_reset_complete.html'), name='password_reset_complete'),
]
=======
>>>>>>> 7e27c93b13dd045af2575eb0a1cff74310e188e4
