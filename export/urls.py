from django.urls import path, include, re_path
from . import views
urlpatterns = [
    re_path(r'export_all_cell_images_for_slide_list_limited_types/$',
            views.export_all_cell_images_for_slide_list_limited_types, name='export_all_cell_images_for_slide_list_limited_types'),

    # Page for exporting Project Data
    re_path(r'^export_project_data/$', views.export_project_data,
            name='export_project_data'),


    # 5/18/22 Exports all annotations for 50 normal list
    re_path(r'export_all_cell_annotations_for_slide_list/$',
            views.export_all_cell_annotations_for_slide_list, name='export_all_cell_annotations_for_slide_list'),
    re_path(r'export_all_cell_annotations_for_slide_list_limited_types/$',
            views.export_all_cell_annotations_for_slide_list_limited_types, name='export_all_cell_annotations_for_slide_list_limited_types'),
    #     re_path(r'export_all_cell_images_for_slide_list_limited_types/$',
    #             views.export_all_cell_images_for_slide_list_limited_types, name='export_all_cell_images_for_slide_list_limited_types'),
    re_path(r'export_all_regions_for_slide_list_limited_types/$',
            views.export_all_regions_for_slide_list_limited_types, name='export_all_cell_images_for_slide_list_limited_types'),


#################### For region selection AI project ####################
    re_path(r'sort_regions_random_into_folders_by_label/$',
            views.sort_regions_random_into_folders_by_label, name='sort_regions_random_into_folders_by_label'),
    re_path(r'sort_regions_random_into_folders_by_slide_and_label/$',
            views.sort_regions_random_into_folders_by_slide_and_label, name='sort_regions_random_into_folders_by_slide_and_label'),

    re_path(r'export_regions_random/$',
            views.export_regions_random, name='export_regions_random'),

    re_path(r'export_msk_normal/$',
            views.export_msk_normal, name='export_msk_normal'),
    re_path(r'export_msk_normal_excel/$',
            views.export_msk_normal_excel, name='export_msk_normal_excel'),

    re_path(r'export_all_cell_annotations_for_user/$',
            views.export_all_cell_annotations_for_user, name='export_all_cell_annotations_for_user'),

    re_path(r'export_all_cell_annotations_summary_user/$',
            views.export_all_cell_annotations_summary_user, name='export_all_cell_annotations_summary_user'),

    # Experimental
    # Page for exporting Project Data
    re_path(r'^export/', views.export_cell_data, name='export_cell_data'),

    re_path(r'^export_page.html', views.export_page, name='export_page'),

]
