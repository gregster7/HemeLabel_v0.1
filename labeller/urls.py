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


from django.urls import path, include, re_path


from . import views 

#cells = Cell.objects.all()

urlpatterns = [
	# Home page
	re_path(r'^$', views.index, name='index'),

	# Show all regions
	re_path(r'^regions/$', views.regions, name='regions'),

	# Show all cells
	re_path(r'^cells/$', views.cells, name='cells'),

	# Show all cells
	re_path(r'^cells2/$', views.cells2, name='cells2'),

	# Show all slides
	re_path(r'^slides/$', views.slides, name='slides'),

	# Add new region
	re_path(r'^new_region/$', views.new_region, name='new_region'),

	# Page for labelling a slide
	re_path(r'^label_slide/(?P<slide_id>\d+)/$', views.label_slide, name='label_slide'),
	#re_path(r'^label_slide2/(?P<slide_id>\d+)/$', views.label_slide2, name='label_slide2'),

	# Page for labelling a slide
	re_path(r'^label_slide_overlay/(?P<slide_id>\d+)/$', views.label_slide_overlay, name='label_slide_overlay'),


	# Page for labelling a region of interest
	#re_path(r'^label_region/(?P<region_id>\d+)/$', views.label_region, name='label_region'),


	# Page for labelling a region of interest
	re_path(r'^label_region_fabric/(?P<region_id>\d+)/$', views.label_region_fabric, name='label_region_fabric'),

	# # Page for exporting data
	# re_path(r'^data_export/$', views.data_export, name='data_export'),

  # Page for exporting Project Data
  re_path(r'^export_project_data/$', views.export_project_data, name='export_project_data'),

	# Page for viewing labelling stats/progress
	re_path(r'^stats/$', views.stats, name='stats'),


	# Label next region
	re_path(r'^next_region/', views.next_region, name='next_region'),

	# Add new region (AJAX)
	re_path(r'^add_new_region/', views.add_new_region, name='add_new_region'),

	# Change cell location (AJAX)
	re_path(r'^change_cell_location/', views.change_cell_location, name='change_cell_location'),

	re_path(r'^get_cell_feature_form/', views.get_cell_feature_form, name='get_cell_feature_form'),

	# Change cell location (AJAX)
	re_path(r'^get_cell_center_relative_to_slide/', views.get_cell_center_relative_to_slide, name='get_cell_center_relative_to_slide'),

	# Get cell information (AJAX)
	re_path(r'^get_cell_json/', views.get_cell_json, name='get_cell_json'),

	# Get cell information (AJAX)
	re_path(r'^get_all_cells_generic/', views.get_all_cells_generic, name='get_all_cells_generic'),

	re_path(r'^get_all_cells_in_region/', views.get_all_cells_in_region, name='get_all_cells_in_region'),

  	re_path(r'^get_all_cells_in_project/', views.get_all_cells_in_project, name='get_all_cells_in_project'),

  	re_path(r'^blank_request/', views.blank_request, name='blank_request'),
  
	# Get cell information (AJAX)
	re_path(r'^get_all_cells_in_slide/', views.get_all_cells_in_slide, name='get_all_cells_in_slide'),

	# toggle_region_complete_seg (AJAX)
	re_path(r'^toggle_region_complete_seg/', views.toggle_region_complete_seg, name='toggle_region_complete_seg'),

	# toggle_region_complete_seg (AJAX)
	re_path(r'^toggle_region_complete_class/', views.toggle_region_complete_class, name='toggle_region_complete_class'),

	# Add new cell (AJAX)
	re_path(r'^add_new_cell/', views.add_new_cell, name='add_new_cell'),

	# Add new cell with box (AJAX)
	re_path(r'^add_new_cell_box/', views.add_new_cell_box, name='add_new_cell_box'),

	# Delete region (AJAX)
	re_path(r'^delete_region/', views.delete_region, name='delete_region'),

	# Delete cell (AJAX)
	re_path(r'^delete_cell/', views.delete_cell, name='delete_cell'),

	# Page for labelling individual cell
	## No longer in use - was for non-existed label_cell individual html page
	#re_path(r'^label_cell/(?P<cell_id>\d+)/$', views.label_cell, name='label_cell'),

	# Page for labelling individual cell (used with AJAX)
	re_path(r'^update_cell_class/', views.update_cell_class, name='update_cell_class'),

	# Page for viewing Whole Slide IMages
	re_path(r'^slide_viewer/$', views.slide_viewer, name= 'slide_viewer'),

	# Page for viewing Whole Slide IMages
	re_path(r'^normal_cell_labeller/$', views.normal_cell_labeller, name= 'normal_cell_labeller'),

  # Add Django site authentication URLS (login, logout, password management...)
	path('accounts/', include('django.contrib.auth.urls'), name='accounts'),
	
	# Add user registration page
	path('register/', views.register, name='register'),

  # Page for viewing all projects created when uploading cells
  re_path(r'^projects/$', views.projects, name='projects'),

  # Page for directly uploading cells enmasse.
  # re_path(r'^upload_cells/$', views.upload_cells, name='upload_cells'),

  # Handles uploaded cell images
  #path('dropzone_image', views.dropzone_image, name='dropzone_image'),
  #re_path(r'^label_cell_fabric/(?P<project_id>\d+)/dropzone_image', views.dropzone_image_w_projectID, name='dropzone_image_w_projectID'),
  re_path(r'^label_cells_in_project/(?P<project_id>\d+)/dropzone_image', views.dropzone_image_w_projectID, name='dropzone_image_w_projectID'),

  # Handles dropzone uploaded slides or slide spreadsheets
#   re_path(r'^label_cells_in_project/dropzone_slide', views.dropzone_slide, name='dropzone_slide_upload'),
	re_path(r'^slides/dropzone_slide', views.dropzone_slide, name='dropzone_slide_upload'),

  path('create_project', views.create_project, name="create_project"),

  # Page for labelling a cell in given project
	re_path(r'^label_cells_in_project/(?P<project_id>\d+)/$', views.label_cells_in_project, name='label_cells_in_project'),


	# # Page for AJAX updates to cell
	# re_path(r'^ajax/update_cell_class/$', views.update_cell_class.as_view(), name='update_cell_class'),

]