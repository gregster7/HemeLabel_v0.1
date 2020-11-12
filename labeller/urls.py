"""Defines URL patterns for labeller"""
"""
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

from django.conf.urls import re_path

from . import views 

urlpatterns = [
	# Home page
	re_path(r'^$', views.index, name='index'),

	# Show all regions
	re_path(r'^regions/$', views.regions, name='regions'),

	re_path(r'^new_region/$', views.new_region, name='new_region'),

	# Page for labelling a region of interest
	re_path(r'^label_region/(?P<region_id>\d+)/$', views.label_region, name='label_region'),

]