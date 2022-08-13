from distutils.log import error
from nis import match
from multiprocessing.spawn import old_main_modules
from pdb import post_mortem
import re
from urllib import request
from wsgiref.util import request_uri
from HL_site.settings import DATA_EXPORT_ROOT
from django.shortcuts import get_object_or_404, render, redirect
from django.http import HttpResponse, HttpResponseRedirect
from django.urls import reverse, reverse_lazy
from django.core import serializers
from django.http import JsonResponse
import json
import os
from datetime import datetime
from django.db import models
from django.db.models import Q
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
from django.contrib.auth import login, authenticate

from django.contrib.auth.models import User
from django.views.generic import CreateView

from labeller.models import Collaborator, Region, Cell, Slide, Project, CellType, Diagnosis
from labeller.forms import UserForm, CellFeatureForm

from django.conf import settings
from django.conf.urls.static import static
from django.core.files import File
from django.core.files.images import ImageFile

import pandas as pd
import csv

from labeller.views import getCellTypeNameFromStringCode, classLabelDict
from labeller.models import Collaborator, Region, Cell, Slide, Project, CellType, Diagnosis


def export_cell_image(cell, cell_path, size):
    svs_path = settings.MEDIA_ROOT + cell.region.slide.svs_path.url
    left = cell.region.x + cell.center_x - size/2
    top = cell.region.y + cell.center_y - size/2
    command = "vips crop " + svs_path + " " + cell_path + " " + \
        str(left) + " " + str(top) + " " + \
        str(size) + " " + str(size)
    os.system(command)


def format_col_width(ws, workbook):
    wrap_format = workbook.add_format({'text_wrap': True, 'align': 'center'})
    ws.set_column('A:A', 20, cell_format=wrap_format)

    ws.set_column('B:D', 20, cell_format=wrap_format)
    ws.set_column('E:E', 25, cell_format=wrap_format)


@login_required
def export_msk_normal_excel(request):
    if (request.user.username != 'admin'):
        print('user access denied')
        return JsonResponse({'success': False})

    print('export_msk_normal_excel')
    diagnosis = Diagnosis.objects.get(name='Normal MSK')
    slides = diagnosis.slides_with_diagnosis.all()

    slide_list = []
    i = 0
    for slide in slides:
        i += 1
        # print(i, slide)
        if (slide.id not in [197, 195, 191]):
            slide_list.append(slide)

    image_label_include_list = ['B1',
                                'B2',
                                'E1',
                                # 'E2',
                                # 'E3',
                                'E4',
                                'ER1',
                                'ER2',
                                'ER3',
                                'ER4',
                                'ER5',
                                'ER6',
                                'L2',
                                'L4',
                                'M1',
                                'M2',
                                'M3',
                                'M4',
                                'M5',
                                'M6',
                                # 'MO1',
                                'MO2',
                                'PL2',
                                'PL3',
                                # 'PL4',
                                'U1',
                                'U4', ]
    image_label_include_list.sort(reverse=False)

    export_path = settings.MEDIA_ROOT + '/export/'
    filename = export_path+datetime.now().strftime("%Y%m%d%H%M%S") + \
        '_msk_normal.xlsx'

    with pd.ExcelWriter(filename, engine='xlsxwriter') as writer:
        workbook = writer.book
        columns_list = ['filename', 'IsCorrect [1 or 0]', 'IsCentered [1 or 0]',
                        'Correct and Centered [computed]', 'alternative label', ]
        condense_eos = True

        for cell_type in image_label_include_list:
            if (condense_eos and (cell_type in ['E1'])):
                cellTypes = CellType.objects.filter(
                    user=request.user, is_most_recent=True, cell__region__slide__in=slide_list, cell_type__in=['E1', 'E2'])
            else:
                cellTypes = CellType.objects.filter(
                    user=request.user, is_most_recent=True, cell__region__slide__in=slide_list, cell_type=cell_type)

            print("\tCell_Type="+cell_type)
            print("\t\tcount="+str(cellTypes.count()))

            counter = 2
            df = pd.DataFrame(columns=columns_list)
            for ct in cellTypes:
                counter += 1

                formula = '=FLOOR(SUM(B'+str(counter) + \
                    ':C'+str(counter)+')/2, 1)'
                df2 = pd.DataFrame(
                    [[str(ct.cell.id)+'.png', 1, 1, formula, '', ]], columns=columns_list)
                df = pd.concat([df, df2])
            n = str(counter)
            n2 = str(counter-2)
            df2 = pd.DataFrame([['% correct', '=SUM(B3:B'+n+')/'+n2+'*100', '=SUM(C3:C'+n+')/'+n2+'*100',
                               '=SUM(D3:D'+n+')/'+n2+'*100', '']], columns=columns_list)
            df = pd.concat([df, df2])

            if (condense_eos and cell_type == 'E1'):
                sheet_name = 'E0'
            else:
                sheet_name = cell_type

            df.to_excel(writer, sheet_name=sheet_name,
                        startrow=1, index=False, )

            # Insert extra text at beginning that translates the label into medical language
            if (condense_eos and cell_type == 'E1'):
                extra_text = cell_type + \
                    ' (Eosinophil promyelocyte - metamyelocyte)'
            else:
                extra_text = cell_type+' ('+classLabelDict[cell_type]+')'
            df_extra_text = pd.DataFrame(columns=[extra_text])
            df_extra_text.to_excel(writer, sheet_name=sheet_name, index=False)

            worksheet = writer.sheets[sheet_name]
            format_col_width(worksheet, workbook)


# Exports images


@login_required
def export_msk_normal(request):
    if (request.user.username != 'admin'):
        print('user access denied')
        return JsonResponse({'success': False})

    print('export_msk_normal')

    diagnosis = Diagnosis.objects.get(name='Normal MSK')
    slides = diagnosis.slides_with_diagnosis.all()

    slide_list = []

    i = 0
    for slide in slides:
        i += 1
        print(i, slide)
        if (slide.id not in [197, 195, 191]):
            slide_list.append(slide)

    i = 0
    for slide in slide_list:
        i += 1
        print(i, slide)

    sizes = [96]

    image_label_include_list = ['B1',
                                'B2',
                                'E1',
                                'E2',
                                # 'E3',
                                'E4',
                                'ER1',
                                'ER2',
                                'ER3',
                                'ER4',
                                'ER5',
                                'ER6',
                                'L2',
                                'L4',
                                'M1',
                                'M2',
                                'M3',
                                'M4',
                                'M5',
                                'M6',
                                # 'MO1',
                                'MO2',
                                'PL2',
                                'PL3',
                                # 'PL4',
                                'U1',
                                'U4', ]
    image_label_include_list.sort(reverse=True)

    export_path = settings.MEDIA_ROOT + '/export/'
    export_path = export_path+datetime.now().strftime("%Y%m%d%H%M%S") + \
        '_msk_normal/'

    size = 96
    for cell_type in image_label_include_list:

        condense_eos = True
        if (condense_eos and cell_type == 'E1'):
            cell_folder = export_path + \
                str(size)+'/E0/'
        else:
            cell_folder = export_path + \
                str(size)+'/'+cell_type+'/'
        os.system('mkdir -p '+cell_folder)

        # cellTypes = CellType.objects.filter(
        #     user=request.user, is_most_recent=True, cell__region__slide__name__in=final_slide_list, cell_type=cell_type)
        # if (condense_eos and (cell_type in ['E1', 'E2'])):
        #     cellTypes = CellType.objects.filter(
        #         user=request.user, is_most_recent=True, cell__region__slide__in=slide_list, cell_type__in=['E1', 'E2'])
        # else:
        cellTypes = CellType.objects.filter(
            user=request.user, is_most_recent=True, cell__region__slide__in=slide_list, cell_type=cell_type)

        # E2 is included in E1 list so without this if they would all be printed twice
        # if (cell_type != 'E2'):
        print("\tCell_Type="+cell_type)
        print("\t\tcount="+str(cellTypes.count()))
        for ct in cellTypes:
            cell_path = cell_folder + str(ct.cell.id)+'.png'
            # export_cell_image(ct.cell, cell_path, size)


@login_required
def export_all_cell_images_for_slide_list_limited_types(request):
    if (request.user.username != 'admin'):
        print('user access denied')
        return JsonResponse({'success': False})

    print('export_all_cell_images_for_slide_list_limited_types')
    export_path = settings.MEDIA_ROOT + '/export/'
    export_path = export_path+datetime.now().strftime("%Y%m%d%H%M%S") + \
        '_export_all_cell_images_for_slide_list_limited_types/'
    # sizes = [48, 64, 96]
    sizes = [96]
    for size in sizes:
        for slide_name in final_slide_list:
            print('Size=' + str(size) + ", Slide="+slide_name)
            for cell_type in image_label_include_list:
                print("\tCell_Type="+cell_type)

                condense_eos = False
                if (condense_eos and (cell_type in ['E1', 'E2'])):
                    cell_folder = export_path + \
                        str(size)+'/'+slide_name.split('.')[0]+'/E0/'

                    # if cell_type in ['E1', 'E2', 'E3']:
                    #     cell_folder = export_path + \
                    #         str(size)+'/'+slide_name.split('.')[0]+'/E0/'
                else:
                    cell_folder = export_path + \
                        str(size)+'/' + \
                        slide_name.split('.')[0]+'/'+cell_type+'/'
                os.system('mkdir -p '+cell_folder)

                # cellTypes = CellType.objects.filter(
                #     user=request.user, is_most_recent=True, cell__region__slide__name__in=final_slide_list, cell_type=cell_type)
                cellTypes = CellType.objects.filter(
                    user=request.user, is_most_recent=True, cell__region__slide__name=slide_name, cell_type=cell_type)
                print("\t\tcount="+str(cellTypes.count()))

                for ct in cellTypes:
                    cell_path = cell_folder + str(ct.cell.id)+'.png'
                    export_cell_image(ct.cell, cell_path, size)

    return JsonResponse({'success': True})


def export_all_cell_annotations_summary_user(request):

    if (request.user.username != 'admin'):
        print('user access denied in export_all_cell_annotations_summary_user')
        return JsonResponse({'success': False})

    export_path = settings.MEDIA_ROOT + '/export/'
    # export_path += datetime.now().strftime("%Y%m%d%H%M%S") + '/'
    # os.system('mkdir '+export_path)
    export_path = export_path+datetime.now().strftime("%Y%m%d%H%M%S")+'_cellTypes.csv'

    cellTypes = CellType.objects.filter(user=request.user, is_most_recent=True)

    ct_names = cellTypes.values('cell_type').distinct()
    distinct_cell_types = CellType.objects.values_list(
        'cell_type', flat=True).distinct().order_by('cell_type')
    with open(export_path, 'w', newline='') as f:
        writer = csv.writer(f)
        outputRow = ['user', 'slides', 'regions', 'cells']
        for ct_name in distinct_cell_types:
            outputRow = outputRow + [getCellTypeNameFromStringCode(ct_name)]
        writer.writerow(outputRow)

        outputRow = [request.user.username,  Slide.objects.all().count(
        ), Region.objects.all().count(), Cell.objects.all().count()]
        for ct_name in distinct_cell_types:
            count = CellType.objects.filter(
                user=request.user, cell_type=ct_name).count()
            outputRow = outputRow + [count]
        writer.writerow(outputRow)

    return JsonResponse({'success': True})


@login_required
def export_page(request):
    return render(request, 'labeller/export_page.html')


# final_slide_list = ['s1.svs']
final_slide_list = ['19.svs',
                    'nlbx2-5.svs',
                    '40.svs',
                    '21.svs',
                    '25.svs',
                    '29.svs',
                    '23.svs',
                    '31-001.svs',
                    '35.svs',
                    'nlbx3-17.svs',
                    'nlbx3-4.svs',
                    'nlbx1-4.svs',
                    'nlbx3-2.svs',
                    '8.svs',
                    'nlbx2-8.svs',
                    's8.svs',
                    'nlbx1-2.svs',
                    '5.svs',
                    'nlbx2-11.svs',
                    'nlbx2-7.svs',
                    'nlbx2-2.svs',
                    'nlbx1-15.svs',
                    'nlbx1-14.svs',
                    'nlbx2-9.svs',
                    'nlbx2-17.svs',
                    'nlbx1-17.svs',
                    'nlbx1-18.svs',
                    's7.svs',
                    'nlbx2-3.svs',
                    'nlbx2-6.svs',
                    'nlbx3-3.svs',
                    'nlbx3-10.svs',
                    'nlbx1-11.svs',
                    'nlbx1-24.svs',
                    'nlbx3-8.svs',
                    's2.svs',
                    'nlbx1-9.svs',
                    'nlbx3-1.svs',
                    'nlbx3-9.svs',
                    'nlbx1-13.svs',
                    'nlbx2-20.svs',
                    'nlbx3-7.svs',
                    'nlbx1-3.svs',
                    'nlbx2-19.svs',
                    'nlbx2-18.svs',
                    's1.svs',
                    'nlbx3-5.svs',
                    'nlbx1-12.svs',
                    'nlbx2-4.svs',
                    's4.svs', ]

no_include_list = ['L0', 'L1', 'L3', 'U2', 'U3', 'UL', 'PL1']


image_label_include_list = ['B1',
                            'B2',
                            'E1',
                            'E2',
                            'E3',
                            'E4',
                            'ER1',
                            'ER2',
                            'ER3',
                            'ER4',
                            'ER5',
                            'ER6',
                            'L2',
                            'L4',
                            'M1',
                            'M2',
                            'M3',
                            'M4',
                            'M5',
                            'M6',
                            # 'MO1',
                            'MO2',
                            'PL2',
                            'PL3',
                            # 'PL4',
                            'U1',
                            'U4', ]
image_label_include_list.sort()
final_slide_list.sort()


@login_required
def export_all_cell_annotations_for_slide_list_limited_types(request):
    if (request.user.username != 'admin'):
        print('user access denied')
        return JsonResponse({'success': False})

    print('export_all_cell_annotations_for_slide_list_limited_types')
    print(final_slide_list)

    cellTypes = CellType.objects.filter(
        user=request.user, is_most_recent=True, cell__region__slide__name__in=final_slide_list, ).order_by('cell_type')

    print(slides)
    print(cellTypes.count())

    cellTypes = CellType.objects.filter(
        user=request.user, is_most_recent=True, cell__region__slide__name__in=final_slide_list).exclude(cell_type__in=no_include_list).order_by('cell_type')
    print(cellTypes.count())

    # return JsonResponse({'success': True})

    export_path = settings.MEDIA_ROOT + '/export/'
    export_path = export_path+datetime.now().strftime("%Y%m%d%H%M%S") + \
        '_all_cell_annotations_for_final_50_limited_with_region_info.csv'

    with open(export_path, 'w', newline='') as f:
        writer = csv.writer(f)
        outputRow = ['cell_id', 'annotation_code', 'annotation_name', 'region', 'center_x', 'center_y', 'region_width', 'region_height'
                     'slide', 'slide_diagnoses', 'annotator', 'time_labelled', 'label_id', 'is_most_recent']
        writer.writerow(outputRow)

        counter = 0
        for ct in cellTypes:
            counter += 1
            # if counter > 1001:
            #     break
            if (counter % 1000) == 0:
                print('outputing celltype...'+str(counter))
            dx_str = ''

            for dx in ct.cell.region.slide.diagnoses.all().order_by('name'):
                dx_str += str(dx) + ", "

            if ct.cell_type in ['E1', 'E2', 'E3']:
                outputRow = [ct.cell.id, 'E0', 'Immature eosinophil', ct.cell.region.id, ct.cell.center_x, ct.cell.center_y, ct.cell.region.width, ct.cell.region.height,
                             ct.cell.region.slide.name, dx_str, request.user.username, ct.date_created, ct.id, ct.is_most_recent]
            elif ct.cell_type == 'E4':
                outputRow = [ct.cell.id, ct.cell_type, 'Segmented eosinophil', ct.cell.region.id, ct.cell.center_x, ct.cell.center_y, ct.cell.region.width, ct.cell.region.height,
                             ct.cell.region.slide.name, dx_str, request.user.username, ct.date_created, ct.id, ct.is_most_recent]

            else:
                outputRow = [ct.cell.id, ct.cell_type, getCellTypeName(ct), ct.cell.region.id, ct.cell.center_x, ct.cell.center_y, ct.cell.region.width, ct.cell.region.height,
                             ct.cell.region.slide.name, dx_str, request.user.username, ct.date_created, ct.id, ct.is_most_recent]
            writer.writerow(outputRow)

    print(slides)
    print(cellTypes.count())
    print('exiting export_all_cell_annotations_for_slide_list_limited_types')
    return JsonResponse({'success': True})


# Copies region images for regions in slide list to new export folder
@login_required
def export_all_regions_for_slide_list_limited_types(request):
    if (request.user.username != 'admin'):
        print('user access denied')
        return JsonResponse({'success': False})

    print('entering export_all_regions_for_slide_list_limited_types')
    regions = Region.objects.filter(
        created_by=request.user, slide__name__in=final_slide_list)

    export_path = settings.MEDIA_ROOT + '/export/'
    export_path = export_path+datetime.now().strftime("%Y%m%d%H%M%S") + \
        '_export_all_regions_for_final_50/'

    os.system('mkdir -p '+export_path)

    counter = 0
    print('Number of regions for export = ' + str(len(regions)))
    for region in regions:
        command = 'cp ./media'+region.image.url + ' ' + export_path
        os.system(command)
        if counter % 100 == 0:
            print('copying region #: ', str(counter+1))
        counter += 1

    return JsonResponse({'success': True})


@ login_required
def export_all_cell_annotations_for_slide_list(request):
    if (request.user.username != 'admin'):
        print('user access denied')
        return JsonResponse({'success': False})

    print(final_slide_list)

    # slides = Slide.objects.filter(name__in=final_slide_list)

    cellTypes = CellType.objects.filter(
        user=request.user, is_most_recent=True, cell__region__slide__name__in=final_slide_list).order_by('cell_type')

    export_path = settings.MEDIA_ROOT + '/export/'
    export_path = export_path+datetime.now().strftime("%Y%m%d%H%M%S") + \
        '_all_cell_annotations_for_final_50.csv'

    with open(export_path, 'w', newline='') as f:
        writer = csv.writer(f)
        outputRow = ['cell_id', 'annotation_code', 'annotation_name', 'region',
                     'slide', 'slide_diagnoses', 'annotator', 'time_labelled', 'label_id', 'is_most_recent']
        writer.writerow(outputRow)

        counter = 0
        for ct in cellTypes:
            counter += 1
            if (counter % 1000) == 0:
                print('outputing celltype...'+str(counter))
            dx_str = ''
            for dx in ct.cell.region.slide.diagnoses.all().order_by('name'):
                dx_str += str(dx) + ", "

            outputRow = [ct.cell.id, ct.cell_type, getCellTypeName(ct), ct.cell.region.id,
                         ct.cell.region.slide.name, dx_str, request.user.username, ct.date_created, ct.id, ct.is_most_recent]
            writer.writerow(outputRow)

    print(slides)
    print(cellTypes.count())
    return JsonResponse({'success': True})


@ login_required
def export_all_cell_annotations_for_user(request):
    if (request.user.username != 'admin'):
        print('user access denied')
        return JsonResponse({'success': False})

    cellTypes = CellType.objects.filter(
        user=request.user, is_most_recent=True).order_by('cell_type')

    export_path = settings.MEDIA_ROOT + '/export/'
    export_path = export_path+datetime.now().strftime("%Y%m%d%H%M%S") + \
        '_all_cell_annotations_'+request.user.username+'.csv'

    with open(export_path, 'w', newline='') as f:
        writer = csv.writer(f)
        outputRow = ['cell_id', 'annotation_code', 'annotation_name', 'region',
                     'slide', 'slide_diagnoses', 'annotator']
        writer.writerow(outputRow)
        # print(outputRow)

        # counter = 0

        for ct in cellTypes:
            dx_str = ''
            for dx in ct.cell.region.slide.diagnoses.all().order_by('name'):
                dx_str += str(dx) + ", "

            outputRow = [ct.cell.id, ct.cell_type, getCellTypeName(ct), ct.cell.region.id,
                         ct.cell.region.slide.name, dx_str, request.user.username]
            writer.writerow(outputRow)
            # print(outputRow)
            # counter += 1
            # if (counter > 500):
            #     break

    return JsonResponse({'success': True})


@ login_required
def export_csv_user_slides(user, slides, export_path):
    if (request.user.username != 'admin'):
        print('user access denied')
        return JsonResponse({'success': False})

    # If we later want to output it as a HttpResponse
    #	https://stackoverflow.com/questions/29672477/django-export-current-queryset-to-csv-by-button-click-in-browser
    cells = Cell.objects.filter(region__slide__in=slides.all())
    cellTypes = CellType.objects.filter(user=user, cell__in=cells)
    with open(export_path, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['labeller_username', 'Cell_pk', 'cell_class',
                        'cell_class_long', 'region_pk', 'slide_pk', 'slide_dx', 'slide_dx_abbrev'])
        for ct in cellTypes:
            writer.writerow([user.username, ct.cell.id, ct.cell_type, getCellTypeName(
                ct), ct.cell.region.id, ct.cell.region.slide.id, diagnosis.name, diagnosis.abbreviation])


@ login_required
def export_each_slide_csv_cellTypes_slides(user, slides, export_path):
    if (request.user.username != 'admin'):
        print('user access denied')
        return JsonResponse({'success': False})

    cells = Cell.objects.filter(region__slide__in=slides.all())
    cellTypes = CellType.objects.filter(user=user, cell__in=cells)
    ct_names = cellTypes.values('cell_type').distinct()
    distinct_cell_types = CellType.objects.values_list(
        'cell_type', flat=True).distinct().order_by('cell_type')
    with open(export_path, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['slide_id', 'slide_name', 'diagnoses',
                        'total']+list(distinct_cell_types))

        # for ct_name in distinct_cell_types:

        for slide in slides:
            print("####" + str(slide))
            dx_str = ''
            for dx in slide.diagnoses.all().order_by('name'):
                dx_str += " " + str(dx)
            cells = Cell.objects.filter(region__slide=slide)
            outputRow = [slide.id, slide.name, dx_str, len(cells)]
            for ct_name in distinct_cell_types:
                count = CellType.objects.filter(
                    user=user, cell__in=cells, cell_type=ct_name).count()
                outputRow = outputRow + [count]
                # print (ct_name + ": "+ str(count))
            writer.writerow(outputRow)

    return

    with open(export_path, 'w', newline='') as f:
        # add header
        writer = csv.writer(f)
        for slide in slides:
            cells = Cell.objects.filter(slide=slide)
            # cellTypes = CellType.objects.filter(user=user, cell__in=cells).values('cell_type').distinct().count()

        writer.writerow(['labeller_username', 'Cell_pk', 'cell_class',
                        'cell_class_long', 'region_pk', 'slide_pk', 'slide_dx', 'slide_dx_abbrev'])
        for ct in cellTypes:
            writer.writerow([user.username, ct.cell.id, ct.cell_type, getCellTypeName(
                ct), ct.cell.region.id, ct.cell.region.slide.id, diagnosis.name, diagnosis.abbreviation])


@ login_required
def export_cell_images_flat(cells, export_path, sizes):
    if (request.user.username != 'admin'):
        print('user access denied')
        return JsonResponse({'success': False})

    sizes = [48, 64, 96]
    for size in sizes:
        cell_folder = export_path+str(size)+'/'
        os.system('mkdir '+cell_folder)
        counter = 0
        for cell in cells:
            counter += 1
            if (counter > 10):
                break
            cell_path = cell_folder + str(cell.id) + '.jpg'
            export_cell_image(cell, cell_path, size)


@ login_required
def export_cell_images_celltype_folders(cellTypes, export_path, sizes):
    if (request.user.username != 'admin'):
        print('user access denied')
        return JsonResponse({'success': False})

    distinct_cell_types = CellType.objects.values_list(
        'cell_type', flat=True).distinct()
    # print(cellTypes.values('cell_type').distinct())
    # print(len(cellTypes.values('cell_type').distinct()))
    sizes = [48, 64, 96]
    for size in sizes:
        cell_folder_outer = export_path+str(size)+'_sorted/'
        os.system('mkdir '+cell_folder_outer)
        for ctlabel in distinct_cell_types:
            cell_folder = cell_folder_outer + ctlabel + '/'
            os.system('mkdir '+cell_folder)

            # counter = 0
            for ct in cellTypes.filter(cell_type=ctlabel):
                # counter += 1
                # if (counter > 10):
                #     break

                cell = ct.cell
                cell_path = cell_folder + str(cell.id) + '.jpg'
                export_cell_image(cell, cell_path, size)


# Currently just exports for normal diagnosis
@ login_required
def export_cell_data(request):
    if (request.user.username != 'admin'):
        print('user access denied in export_cell_data')
        return JsonResponse({'success': False})

    export_path = settings.MEDIA_ROOT + '/export/'
    export_path += datetime.now().strftime("%Y%m%d%H%M%S") + '/'
    os.system('mkdir '+export_path)

    diagnosis = Diagnosis.objects.get(abbreviation='nl')
    slides = Slide.objects.filter(diagnoses=diagnosis)
    # export_csv_user_slides(request.user, slides, export_path+'classes.csv')
    export_each_slide_csv_cellTypes_slides(
        request.user, slides, export_path+'slides_with_cellTypes.csv')
    sizes = [48, 64, 96]
    # cells = Cell.objects.filter(region__slide__in=slides.all()) <-- to delete after testing
    cells = Cell.objects.filter(region__slide__in=slides)
    # export_cell_images_flat(cells, export_path, sizes)

    cellTypes = CellType.objects.filter(user=request.user, cell__in=cells)
    export_cell_images_celltype_folders(cellTypes, export_path, sizes)

    return JsonResponse({'success': True})


# Needs updating with celltypes
@ login_required
def export_project_data(request):
    GET = request.GET
    project_id = GET['project_id']
    print(request, project_id)
    project = Project.objects.get(id=project_id)
    all_cells = project.cell_set.all()
    list_of_cell_dicts = []
    for cell in all_cells:
        print(cell)
        list_of_cell_dicts.append(cell.asdict())
    print(list_of_cell_dicts)
    df = pd.DataFrame(list_of_cell_dicts)
    print(df)

    now = datetime.now()
    date_time = now.strftime("%Y%m%d%H%M%S")
    filename = project_id + '_' + date_time + '.xlsx'
    df.to_excel(DATA_EXPORT_ROOT + '/' + filename, index=False)

    results = {'success': True, 'filename': '/data_export/' + filename}
    return JsonResponse(results)


@login_required
def export_regions_random(request):
    if (request.user.username != 'admin'):
        print('user access denied')
        return JsonResponse({'success': False})

    print('export_regions_random')

    for slide in final_slide_list:
        slide_obj = Slide.objects.get(name=slide)
        print(slide, slide_obj.svs_path)
