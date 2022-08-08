from django.urls import include, re_path
from . import views
urlpatterns = [
    re_path(r'^classifier_demo/$', views.classifier_demo,
            name='classifier_demo'),
]
