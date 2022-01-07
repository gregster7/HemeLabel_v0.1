from HL_site.settings import DATA_EXPORT_ROOT
from django.shortcuts import render, redirect 
from django.http import HttpResponse, HttpResponseRedirect
from django.urls import reverse
from django.core import serializers
from django.http import JsonResponse
import json
import os
from datetime import datetime
from django.db import models
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth import login, authenticate

from django.contrib.auth.models import User

from .models import Region, Cell, Patient, Slide, Project, CellType, Diagnosis
from .forms import RegionForm, UserForm, CellForm, CellFeatureForm, DiagnosisForm

from django.conf import settings
from django.conf.urls.static import static
from django.core.files import File
from django.core.files.images import ImageFile

import pandas as pd
import openpyxl


def index(request):
	"""The home page for labeller"""
	return render(request, 'labeller/index.html')

@login_required
def regions(request):
	"""Show all regions."""
	regions = Region.objects.order_by('rid')
	regions_json = serializers.serialize("json", regions)

	print('regions_json', regions_json)
	context = {'regions': regions, 'regions_json': regions_json}
	return render(request, 'labeller/regions.html', context)

@login_required
def get_cell_feature_form(request):
	print('entering get_cell_feature_form', request)
	GET = request.GET
	cid = GET['cid']
	cell = Cell.objects.get(cid=cid)
	form = CellFeatureForm(instance=cell)
	#context = {'cellForm': cellForm}
	return HttpResponse(form.as_p())

@login_required
def slides(request):
	"""Show all regions."""
	slides = Slide.objects.order_by('sid')
	slides_json = serializers.serialize("json", slides)
	if (len(slides) > 0):
		slides_json = serializers.serialize("json", slides)
	else:
		slides_json = 'none'

	context = {'slides': slides, 'slides_json': slides_json}
	return render(request, 'labeller/slides.html', context)	


def getAllCellTypesUserRegionHelper(user, region):
	return CellType.objects.filter(cell__region=region, user=user)

def getAllCellTypesUserRegionJSON(user, region):
#	print('getAllCellTypesUserRegionJSON(user, region)', user, region)
	return serializers.serialize("json", getAllCellTypesUserRegionHelper(user, region))

def getAllCellTypesUserHelper(user):
	return CellType.objects.filter(user=user)

def getAllCellTypesUserJSON(user):
#	print('getAllCellTypesUserJSON(user)', user)
	return serializers.serialize("json", getAllCellTypesUserHelper(user))

def getAllCellTypesUserSlideHelper(user, slide):
	return CellType.objects.filter(cell__region__slide=slide, user=user)

def getAllCellTypesSlideUserJSON(user, slide):
#	print('getAllCellTypesSlideUserJSON(user, slide)', user, slide)
	return serializers.serialize("json", getAllCellTypesUserSlideHelper(user, slide))

# Under construction - used for testing bootstrap
@login_required
def bootstrap_test(request):
	return render(request, 'labeller/bootstrap_test.html')

# Under construction - used for testing bootstrap
@login_required
def label_slide_bootstrap(request, slide_id):
	slide = Slide.objects.get(sid=slide_id)
	diagnoses = slide.diagnosis
	regions = slide.region_set.all()
	context = {'slide': slide, 'dx_options': Diagnosis.objects.all()}
	return render(request, 'labeller/label_slide.html', context)


@login_required
def label_slide(request, slide_id):
	print('label_slide', request, slide_id)
	slide = Slide.objects.get(sid=slide_id)

	diagnoses = slide.diagnosis
	print('diagnosis', diagnoses)
	regions = slide.region_set.all()
	context = {'slide': slide, 'dx_options': Diagnosis.objects.all()}
	return render(request, 'labeller/label_slide.html', context)

def get_all_cells_json(region):
	cells_json = serializers.serialize("json", region.cell_set.all())
#	print(region, cells_json)
	return cells_json

def get_all_cells_json_project(project):
	cells_json = serializers.serialize("json", project.cells_set.all())
	return cells_json

def get_all_celltypes_json_project(project):
	cells_json = serializers.serialize("json", project.cells_set.all())
	return cells_json


@login_required
def change_cell_location(request):
	POST = request.POST
	cid = POST['cid']
	left = float(POST['left'])
	top = float(POST['top'])
	width = float(POST['width'])
	height = float(POST['height'])
	results = change_cell_location_helper(cid, left, top, width, height)
	return JsonResponse(results)

def change_cell_location_helper(cid, left, top, width, height):
	cell = Cell.objects.get(cid=cid);
	region = cell.region;
	if ((top < 0) | (top + height > region.height) | (left < 0) | (left + width > region.width)):
		return {'success':False, 'error':'box outside boundary'}
	else:
		#This should overwrite the old image
		generate_cell_image_with_vips(region, cid, left, top, width, height)
		cell_path = '/cells/' + str(cid) + '.jpg'
		Cell.objects.filter(cid=cid).update(center_x=left + width/2, center_y=top + height/2, width=width, height=height, image=cell_path)
		cell = Cell.objects.get(cid=cid);
		cell.center_x_slide = cell.center_x + region.x;
		cell.center_y_slide = cell.center_y + region.y;
		cell.save()
#		cell = Cell.objects.get(cid=cid);
		cell_json = serializers.serialize("json", [cell])
		results = {'success':True, 'cell_json':cell_json}
		return results


# Used by slide_summary.html
@login_required
def get_all_cells_generic(request):
	GET = request.GET
	id_type = GET['id_type']
	id_val = GET['id_val']
	print(id_type, id_val)
	if (id_type == 'sid'):
		cells = Cell.objects.filter(region__slide__sid=id_val)
		celltypes_json = getAllCellTypesSlideUserJSON(request.user, Slide.objects.get(sid=id_val))
	elif (id_type == 'rid'):
		cells = Cell.objects.filter(region__rid=id_val)
		celltypes_json = getAllCellTypesUserRegionJSON(request.user, Region.objects.get(rid=id_val))
	else:
		results = {'success':False}
		return JsonResponse(results);

	results = {'success':True, 'all_cells_json':serializers.serialize("json", cells), 'celltypes_json': celltypes_json}
	return JsonResponse(results);

# Used by CellCounter.js
@login_required
def get_all_cells_in_region(request):
#	print("get_all_cells_in_region", request)
	GET = request.GET
	rid = GET['rid']
	region = Region.objects.get(rid=rid)
	print(region)

	all_cells_json = serializers.serialize("json", region.cell_set.all())
	results = {'success':True, 'all_cells_json':all_cells_json, 'celltypes_json': getAllCellTypesUserRegionJSON(request.user, region)}
#	print(all_cells_json)
#	print(getAllCellTypesUserRegionJSON(request.user, region))
	return JsonResponse(results)

# Used by slides.html
@login_required
def get_all_cells_in_slide(request):
	print('get_all_cells_in_slide(request)', request)
	GET = request.GET
	sid = GET['sid']
	cells = Cell.objects.filter(region__slide__sid=sid)
	print('length of cells', len(cells))
	slide = Slide.objects.get(sid=sid)
	all_cells_json = serializers.serialize("json", cells)
	results = {'success':True, 'all_cells_json':all_cells_json, 'celltypes_json': getAllCellTypesSlideUserJSON(request.user, slide)}
	print('exiting get_all_cells_in_slide')
	return JsonResponse(results);

# Currently only used by returnObjectToOlDCoordinates(canvas, obj) in Cell.js, which is why celltype is not sent
@login_required
def get_cell_json(request):
	GET = request.GET
	cid = GET['cid']
	cell = Cell.objects.get(cid=cid)
	cell_json = serializers.serialize("json", [cell])
	results = {'success':True, 'cell_json':cell_json}
	return JsonResponse(results);


# vips crop
# extract an area from an image
# usage:
#    extract_area input out left top width height [--option-name option-value ...]
# where:
#    input        - Input image, input VipsImage
#    out          - Output image, output VipsImage
#    left         - Left edge of extract area, input gint
# 			default: 0
# 			min: -10000000, max: 10000000
#    top          - Top edge of extract area, input gint
# 			default: 0
# 			min: -10000000, max: 10000000
#    width        - Width of extract area, input gint
# 			default: 1
# 			min: 1, max: 10000000
#    height       - Height of extract area, input gint
# 			default: 1
# 			min: 1, max: 10000000

def generate_cell_image_with_vips(region, cid, left, top, width, height):
	cid = str(cid)
	region_path = settings.MEDIA_ROOT + region.image.url
	cell_path = settings.MEDIA_ROOT + '/cells/' + cid + '.jpg'
	command = "vips crop "+ region_path + " " + cell_path + " " + \
		str(left) + " " + str(top) + " " + \
		str(width) + " " + str(height) 
	os.system(command)

# need to make sure CIDs do not start with trailing 0s as this causes problems

def create_new_cid():
	now = datetime.now()
	date_time = now.strftime("%m%d%Y%H%M%S")
	return "1"+date_time

def create_new_cell(rid, left, top, width, height, user):
	left = int(left)
	top = int(top)
	width = int(width)
	height = int(height)
	print(rid, left, top, width, height);	
	print(type(rid), type(left), type(top), type(width), type(height));	
	region = Region.objects.get(rid=rid)
	if ((top < 0) | (top + height > region.height) | (left < 0) | (left + width > region.width)):
		return {'success':False, 'error':'box outside boundary'}

	else:
		#region = Region.objects.get(rid=rid)
		cid = create_new_cid()
		generate_cell_image_with_vips(region, cid, left, top, width, height)
		cell_path = '/cells/' + cid + '.jpg'

		new_cell = Cell.objects.create(created_by=user, region = region, image=cell_path, cid=cid, \
			center_x=left + width/2, center_y=top + height/2, width=width, height=height)
		new_cell.center_x_slide = new_cell.center_x + region.x;
		new_cell.center_y_slide = new_cell.center_y + region.y;
		new_cell.save()
		new_cell_type = CellType.objects.create(cell=new_cell, user = user)
		# cells = region.cell_set.all()
		new_cell_json = serializers.serialize("json", [new_cell])
		new_cell_type_json = serializers.serialize("json", [new_cell_type])
#		all_cells_json = get_all_cells_json(region)
#		celltypes_in_region = getAllCellTypesUserRegionJSON(user, region)
#		celltypes_in_region = serializers.serialize("json", celltypes_in_region)

#		results = {'success':True, 'new_cell_json':new_cell_json, 'all_cells_json':all_cells_json, 'new_cell_type_json': new_cell_type_json, 'celltypes_json': getAllCellTypesUserRegionJSON(request.user, region)}
		results = {'success':True, 'new_cell_json':new_cell_json}
		return results

@login_required	
def add_new_cell_box(request):
	POST = request.POST
	rid = int(POST['rid'])

	top = float(POST['top'])
	height = float(POST['height'])

	left = float(POST['left'])
	width = float(POST['width'])

	# Note: the return for create_new_cell is:
		#results = {'success':True, 'new_cell_json':new_cell_json, 'all_cells_json':all_cells_json, 'new_cell_type_json': new_cell_type_json, 'celltypes_json': all_cell_types_json, 'celltypes': celltypes_in_region}
	results = create_new_cell(rid, left, top, width, height, request.user);

	return JsonResponse(results)

@login_required
def toggle_region_complete_class(request):
	POST = request.POST
	rid = int(POST['rid'])
	if (POST['value'] == 'true'):
		value = True
	else:
		value = False
	#print('toggle_region_complete_seg', POST['value'], value)
	success = Region.objects.filter(rid=rid).update(all_wc_classified=value)
	results = {'success':(success == 1)}	
	return JsonResponse(results)

@login_required
def toggle_region_complete_seg(request):
	POST = request.POST
	rid = int(POST['rid'])
	if (POST['value'] == 'true'):
		value = True
	else:
		value = False
	#print('toggle_region_complete_seg', POST['value'], value)
	success = Region.objects.filter(rid=rid).update(all_wc_located=value)
	results = {'success':(success == 1)}	
	return JsonResponse(results)

@login_required
def add_diagnosis_to_slide(request):
	try:
		POST = request.POST
		diagnosis = Diagnosis.objects.get(name=POST['diagnosisName'])
		slide = Slide.objects.get(sid=POST['sid'])
		slide.diagnosis.add(diagnosis)
		slide.save()
		return JsonResponse({'success':True})

	except Exception as e: 
		print(e)
		return JsonResponse({'success':False})

def remove_diagnosis_from_slide(request):
	try:
		POST = request.POST
		diagnosis = Diagnosis.objects.get(name=POST['diagnosisName'])
		slide = Slide.objects.get(sid=POST['sid'])
		slide.diagnosis.remove(diagnosis)
		slide.save()
		return JsonResponse({'success':True})

	except Exception as e: 
		print(e)
		return JsonResponse({'success':False})

# @login_required
# def add_new_cell(request):
# 	POST = request.POST
# 	rid = POST['rid']
# 	center_x = float(POST['center_x'])
# 	center_y = float(POST['center_y'])
# 	box_dim = 90 # Box dimension (it is a square)
# 	left = center_x - box_dim/2
# 	top = center_y - box_dim/2
# 	return JsonResponse(create_new_cell(rid, left, top, box_dim, box_dim, request.user))

@login_required
def delete_region(request):
	rid = request.POST['rid']
	print('deleting region %s' %rid)
	region = Region.objects.filter(rid=rid).delete()
	results = {'success':True}
	return JsonResponse(results)

# Needs updating with celltypes
@login_required
def delete_cell(request):
	POST = request.POST
	cid = POST['cid']
	print('deleting cell %s' %cid)
	cell = Cell.objects.filter(cid=cid).delete()
	print('deleting', cell)
#	results = {'success':True, 'all_cells_json':get_all_cells_json(cell.region)}
	results = {'success':True}
	return JsonResponse(results)

@login_required
def add_new_region(request):
	POST = request.POST
	sid = POST['sid']
	x1 = float(POST['x1'])
	y1 = float(POST['y1'])
	x2 = float(POST['x2'])
	y2 = float(POST['y2'])


	x = min(x1, x2)
	y = min(y1, y2)
	width = abs(x1-x2)
	height = abs(y1-y2)

	slide = Slide.objects.get(sid=sid)
	svs_path = settings.MEDIA_ROOT + slide.svs_path.url
	now = datetime.now()
	date_time = now.strftime("%Y%m%d%H%M%S")
	region_path = settings.MEDIA_ROOT + '/regions/' + date_time + '.jpg'
	command = "vips crop "+ svs_path + " " + region_path + " " + str(x) + " " + str(y) + " " + \
		str(width) + " " + str(height) 
	print(command)
	os.system(command)
#	image =	image_model.image_field(region_path, File().read())

	region_path = '/regions/' + date_time + '.jpg'
	new_region = Region.objects.create(created_by = request.user, slide = slide, image=region_path, rid=date_time, x=x, y=y, width=width, height=height)
	new_region.save()
#	new_region.image.save(os.path.basename(.url))

#	new_region.image.url = region_path

#	file = open(region_path)
#	myfile = File(f)
#	new_region.image.
##	print(MEDIA_ROOT)

	results = {'success':True, 'rid': date_time, 'region_path':region_path}
	return JsonResponse(results)


# Will attempt to assign a new cellType. If one does not exist, it will be created. 
def update_cellType_helper(user, cell, cell_type):
	try:
		print("changing cellType")
		cellType = CellType.objects.get(user=user, cell=cell)
		cellType.cell_type = cell_type
		cellType.save()
		print(cellType)
	except CellType.DoesNotExist:
		print("did not exist")
		cellType = CellType.objects.create(user=user, cell_type = cell_type, cell=cell)
	return cellType

# Will attempt to assign a new cellType. If one does not exist, it will be created. 
def get_cellType_helper(user, cell):
	try:
		print("getting cellType")
		cellType = CellType.objects.get(user=user, cell=cell)
		print(cellType)
	except CellType.DoesNotExist:
		print("did not exist. creating one")
		CellType.objects.create(user=user, cell=cell)
	return cellType


def getCellTypeName(cellType):

	classLabelDict = {
		"M1": "Blast",
		"M2": "Promyelocyte",
		"M3": "Myelocyte",
		"M4": "Metamyelocyte",
		"M5": "Band neutrophil",
		"M6": "Segmented netrophil",

		"E1": "Immature Eosinophil",
		"E2": "Mature Eosinophil",
		"B1": "Immature Basophil",
		"B2": "Mature Basophil",
		"MO1": "Monoblast",
		"MO2": "Monocyte",

		"L0": "Lymphoblast",
		"L1": "Hematagone",
		"L2": "Small Mature Lymphocyte",
		"L3": "Large Grancular lymphocyte",
		"L4": "Plasma Cell",

		"ER1": "Pronormoblast",
		"ER2": "Basophilic normoblast",
		"ER3": "Polychromatophilic",
		"ER4": "Orthochromic (nuc red)",
		"ER5": "Reticulocyte",
		"ER6": "Mature RBC",

		"U1": "Artifact",
		"U2": "Unknown",
		"U3": "Other",
		"U4": "Mitotic Body",
		"UL": "Unlabelled", 
		
		"PL1": "Immature Megakaryocyte",
		"PL2": "Mature Megakaryocyte",
		"PL3": "Platelet Clump",
		"PL4": "Giant Platelet",
	}
	return classLabelDict[cellType.cell_type]	


@login_required
def update_cell_class(request):
#	user = request.user
	POST = request.POST
	#cell = Cell.objects.get(cid=POST['cid'])
	#cell.cell_type = POST['cell_label']
	#cell.save()
	cellType = update_cellType_helper(request.user, Cell.objects.get(cid=POST['cid']), POST['cell_label'])

	print('update_cell_class(request) Cell class CID:'+str(POST['cid'])+' new_class: '+cellType.cell_type + " - " + getCellTypeName(cellType))
	results = {'success':True}
	return JsonResponse(results)

@login_required
def update_cell_class_in_project(request):
	POST = request.POST
	# cell = Cell.objects.get(cid=POST['cid'])
	# cell.cell_type = POST['cell_label']
	# cell.save()
	update_cellType_helper(request.user, Cell.objects.get(cid=POST['cid']), POST['cell_label'])

	results = {'success':True, 'all_cells_json':get_all_cells_json_project(cell.project)}
	return JsonResponse(results)

@login_required
def data_export(request):
	regions = Region.objects.all()
	regions_json = serializers.serialize("json", Region.objects.all())
	cells = Cell.objects.all()
	cells_json = serializers.serialize("json", Cell.objects.all())

	context = {'regions': regions, 'regions_json': regions_json, 'cells':cells, 'cells_json': cells_json}
	return render(request, 'labeller/data_export.html', context)

@login_required
def stats(request):
	regions = Region.objects.all()
	regions_json = serializers.serialize("json", Region.objects.all())
	cells = Cell.objects.all()
	cells_json = serializers.serialize("json", Cell.objects.all())

	context = {'regions': regions, 'regions_json': regions_json, 'cells':cells, 'cells_json': cells_json, 'celltypes_json': getAllCellTypesUserJSON(request.user)}
	return render(request, 'labeller/stats.html', context)

@login_required
def label_region_fabric(request, region_id):
	print('Entering label_region_fabric', request.user)
	if (request.user.username=='admin'):
		print('\thello user admin')
		# cells = Cell.objects.all()
		# print("# cells = ", len(cells))
		# print("# celltypes admin", len(CellType.objects.filter(user=request.user)))
		# print("# celltypes all", len(CellType.objects.all()))
		# for objx in Project.objects.all():
		# 	print(objx, 'created_by:', objx.created_by)
		# 	objx.created_by = User.objects.get(username='admin')
		# 	objx.save()

	# for cell in cells:
	# 	update_cellType_helper(request.user, cell, cell.cell_type)

	"""label cells on a region"""
	region = Region.objects.get(rid=region_id)
	slide = region.slide
	cells = region.cell_set.all()
	if (cells.count() == 0):
		#cells = "none"
		cells_json = "none"
	else:
		cells_json = serializers.serialize("json", region.cell_set.all())

	celltypes_in_region = getAllCellTypesUserRegionJSON(request.user, region)
	context = {'region': region, 'cells':cells, 'cells_json': cells_json, 'slide': slide, 'celltypes_json': celltypes_in_region}
	#print('label_region_fabric context', context)
	return render(request, 'labeller/label_region_fabric.html', context)


@login_required
def get_all_cells_in_project(request):
	GET = request.GET
	project_id = GET['project_id']
	print(project_id)
	project = Project.objects.get(id=project_id)
	all_cells_json = serializers.serialize("json", project.cell_set.all())
	results = {'success':True, 'all_cells_json':all_cells_json, 'celltypes_json': getAllCellTypesUserJSON(request.user)}
	return JsonResponse(results)
	



# UserForm view
def register(request):

	if request.method == 'POST':
		form = UserForm(request.POST)
		if form.is_valid():
			new_user = form.save()
			messages.info(request, "Thank you for registering. You are now logged in.")
			new_user = authenticate(username=form.cleaned_data['username'], password=form.cleaned_data['password1'])
			login(request, new_user)
			return HttpResponseRedirect('/')
		else:
			print('form not valid')
			print(form)

	else:
		form = UserForm()
		
	return render(request, 'labeller/register.html', {'form': form})



# Projects page view
@login_required
def projects(request):
	"""Show all projects"""

	# user_projects = Project.objects.filter(user=request.user.get_username()).order_by('id')
	# context = {'user_projects': user_projects}

	projects = Project.objects.order_by('id')
	context = {'projects': projects}
	print(Project.id)

	return render(request, 'labeller/projects.html', context)

		# def get_queryset(self):
		# user = self.request.user
		# return Project.objects.filter(user)
	
@login_required
def create_project(request):
	if request.method == 'POST':
		if request.POST.get('project') != None:
			proj = request.POST.get('project')
			project = Project.objects.create(name=proj, created_by = request.user)
			print(proj)
			print(project)
		
		else:
			return render(request, 'labeller/projects.html')

			# context = {'project': project}

	# return HttpResponseRedirect(reverse('labeller:label_cells_in_project'))
	return render(request, 'labeller/label_cells_in_project.html')


# Needs updating with celltypes
@login_required
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

	results = {'success':True, 'filename': '/data_export/' + filename}
	return JsonResponse(results)


def create_slide_pyramid_with_vips(sid):
	print("entering create_slide_pyramid_with_vips", sid)
	slide_svs = '/slides/' + sid + '.svs '
	command = "vips dzsave "+ settings.MEDIA_ROOT + slide_svs + \
		settings.MEDIA_ROOT + '/slides/' + sid 
	print(command) 
	os.system(command)
	print('done')
	return('slides/' + sid + '.dzi')


def generate_cell_image_with_vips(region, cid, left, top, width, height):
	cid = str(cid)
	region_path = settings.MEDIA_ROOT + region.image.url
	cell_path = settings.MEDIA_ROOT + '/cells/' + cid + '.jpg'
	command = "vips crop "+ region_path + " " + cell_path + " " + \
		str(left) + " " + str(top) + " " + \
		str(width) + " " + str(height) 
	os.system(command)

# Upload handler for dzi WSIs and also Excel files relating to them
@login_required
def dropzone_slide(request):
	print('entering dropzone_slide')
	if request.method == "POST":
		i = 0

		slide_list = []

		for image in request.FILES.getlist('file'):
			print(image)
			extension = image.name[-4:]
			print(extension)
			
			if extension == ".svs":
				sid = create_new_cid()+str(i)
				i += 1
				print(i)
				name=image.name
				image.name = str(sid) + '.svs'
				slide = Slide.objects.create(created_by = request.user, sid = sid, date_added = str(datetime.now()), name = name, svs_path = image)
				print(slide)
				# print(slide.sid)
				# print(slide.name)
				# print(slide.date_added)
				# print(id)
				slide.dzi_path = create_slide_pyramid_with_vips(sid)
				# print(slide.dzi_path)
				slide.save()
				slide_list.append(slide)
		slides_json = serializers.serialize("json", slide_list)
		print(slides_json)
		results = {'success': True, 'slides_json': slides_json}
		return JsonResponse(results)

	# return HttpResponse()

	# Check if it is a .dzi file or a .xlsx file
	# If .dzi files
		
		# Create new slide object
		# Save slide object
		# get slide sid
		# create_slide_pyramid_with_vips(sid)
	# If .xlsx
		# Do something else to be written
	return

@login_required
def dropzone_image_w_projectID(request, project_id):
	print("entering dropzone_image_w_projectID")
	if request.method == "POST":
		print(request)
		print(request.FILES)
		print(request.FILES.getlist('file'))
		i = 0
		#proj = request.POST.get('project')
		# project_id = Project.name 
		project = Project.objects.get(id=project_id)
		cell_list = []
		for image in request.FILES.getlist('file'):
			print(image)
			print(type(image))
			cid = int(create_new_cid()+str(i))
			i+=1
			name = image.name
			cell_type = request.POST.get('cell_type')
			cells_json = serializers.serialize("json", project.cell_set.all())

			# project = request.POST.get('project')
			# print(proj)
			print(cell_type)
			print(project)
			print(project_id)
			print(name)
			print(image)
			print(cid)
			print(cells_json)
			cell = Cell.objects.create(created_by=request.user, image = image, cid = cid, name = name, project = project, project_id = project_id, cell_type = cell_type)
			new_cell_type = CellType.objects.create(cell=new_cell, user = user)
			cell.save()
			update_cellType_helper(request.user, cell, cell_type)
			cell_list.append(cell)
		cells_json = serializers.serialize("json", cell_list)	
		print('cell list: ' + str(cell_list))
		print('cells json: ' + str(cells_json))
		results = {'success': True,  'cells_json': cells_json, }
		return JsonResponse(results)
		#return HttpResponse()

	return HttpResponse()

# Not currently in use - may require fixing
@login_required
def label_cells_in_project(request, project_id):
	"""label cells in a given project"""
	print(project_id)
	project = Project.objects.get(id=project_id)
	print(project)
	cells = project.cell_set.all()
	name = project.name

	if (cells.count() == 0):
		cells = "none"
		cells_json = "none"
	else:
		cells_json = serializers.serialize("json", project.cell_set.all())

	context = {'project': project, 'name': name, 'cells': cells, 'cells_json': cells_json, 'celltypes_json': getAllCellTypesUserJSON(request.user)}
	print(context)

	return render(request, 'labeller/label_cells_in_project.html', context)

# def update_cell_class(request):
# 	results = {'success':False}
# 	if request.method == 'GET':
# 		GET = request.GET
# 		if 'cid' in GET and 'cell_label' in GET:
# 			cid = int(GET['cid'])
# 			cell_label = GET['cell_label']
# 			cell = Cell.objects.get(cid=cid)
# 			form = CellLabelFormChoices(request.POST, instance=cell)

# 			form.save(update_fields['cell_label', cell_label])
# 			results = {'success': True}
# 	json_response = json.dumps(results)
# 	return HttpResponse(json_response)


#def update_cell_class(request, cell_id):
	# if request.method=='POST': and request.is_ajax():
	# 	try:
	# 		cell = Cell.objects.get(id=cell_id)
	# 		cell.cell_label = request.POST['cell_label']
	# 		cell.save()
	# 		return JsonResponse({'status':'Success', 'msg':'save successfully'})
	# 	except Cell.DoesNotExist:
	# 		return JsonResponse({'status':'Fail', 'msg':'Not a valid request'})


# def region_images(request):
# 	"""show all region images"""
# 	region_images = Region.image.order_by('rid')
# 	context = {'region_images': region_images}
# 	return render(request, 'labeller/regions.html, context')

# Needs updating with celltypes
# @login_required
# def cells(request):
# 	"""Show all regions."""
# 	cells = Cell.objects.order_by('cid')
# 	cells_json = serializers.serialize("json", cells)
# 	cell_forms_dict = {}
# 	cell_forms_array = []
# 	for cell in cells:
# 		cell_forms_dict[cell.cid] = CellFeatureForm(instance=cell)
# 		cell_forms_array.append(CellFeatureForm(instance=cell))

# 	context = {'cells': cells, 'cells_json': cells_json, 'cell_forms_dict': cell_forms_dict, 'cell_forms_array': cell_forms_array, 'celltypes_json': getAllCellTypesUserJSON(request.user) }
# 	return render(request, 'labeller/cells.html', context)	


# class AddCellFeatures(CreateView):
# 	model = Cell
# 	form_class = CreateMyeloidForm
# 	template_name = '/cells/addCellFeatures.html'
# 	success_url = reverse_lazy('index')

# def export_project_data(request):
# 	projects = Project.objects.filter('id')
# 	with open(r'.\\labeller\\{{ project_id }}.json', "w") as out:
# 		mast_point = serializers.serialize("json", projects)
# 		out.write(mast_point)
# 	template = __loader__.get_template('')
# 	project = Project.objects.get('id')
# 	cells_json = serializers.serialize("json", Cell.objects.filter(project.id))
# 	context = {'project': project, 'cells_json': cells_json}

# 	return render(request, 'labeller/data_export.html', context)

# def export_project_data(target_path, target_file, data):
#   data = serializers.serialize("json", Project.objects.GET('id'))
#   print(data)

#   if not os.path.exists(target_path):
#     try:
#       os.makedirs(target_path)
#     except Exception as e:
#       print(e)
#       raise
#   with open(os.path.join(target_path, target_file), 'w') as f:
#     json.dump(data, f)

#   file = export_project_data('/hemelabel/', 'project_data.json', data)
#   print(file)
#   return file 

# def export_project_data(request, project_id):


# Needs to be udpated to support changing slide and patient as well
# @login_required
# def next_region(request):
# 	POST = request.POST
# 	rid = POST['rid']
# 	direction = int(POST['direction'])
# 	region = Region.objects.get(rid=rid)
# 	results = {'rid': rid, 'success':False}

# 	print(direction)
# 	print(rid)
# 	print(region)
# 	print(region.slide)
# 	# #regions = Region.objects.filter(slide=region.slide)

# 	if (direction == 1):
# 		next_region = Region.objects.filter(slide=region.slide, rid__gt=rid).order_by('rid').first()
# 	elif (direction == -1):
# 		next_region = Region.objects.filter(slide=region.slide, rid__lt=rid).order_by('rid').last()

# 	if (next_region != None):
# 		results = {'rid': next_region.rid, 'success':True}

# 	# else :
# 	# 	print(next_region)

# 	return JsonResponse(results)

# @login_required
# def cells2(request):
# 	slide_array = []
# 	slides = Slide.objects.order_by('date_added')
# 	for slide in slides: 
# 		slide_regions = Region.objects.filter(slide=slide)
# 		region_list = []
# 		for region in slide_regions:
# 			cell_tuple_array = []
# 			cells = Cell.objects.filter(region=region)
# 			for cell in cells:
# 				# Append tuple-array of cells and cellfeautureforms and add to array
# 				cell_tuple_array.append([cell, CellFeatureForm(instance=cell)])
# 			#Append tuple-array of region with lists of {cell, cell form} tuples
# 			region_list.append([region, cell_tuple_array])
# 		#Append tuple-array of slide with region list tuples
# 		slide_array.append([slide, region_list])
# 	print(slide_array)
# 	context = {'slide_list': slide_array}
	
# 	return render(request, 'labeller/cells2.html', context)	


# @login_required
# def get_cellType(request):
# 	GET = request.GET
# 	id = GET['id']
# 	cell = Cell.objects.get(id=id)
# 	cellType = get_cellType_helper(request.user, cell)
# 	print('get_cellType ' + cellType.cell_type)
# 	results = {'success':True, 'cell_type':cellType.cell_type}
# 	return JsonResponse(results);

# @login_required
# def get_slide_json(request):
# 	GET = request.GET
# 	sid = GET['sid']
# 	slide = Slide.objects.get(sid=sid)
# 	slide_json = serializers.serialize("json", [slide])
# 	results = {'success': True, 'slide_json': slide_json}
# 	return JsonResponse(results)



	# region = Region.objects.get(rid=rid)


	# region_path = settings.MEDIA_ROOT + region.image.url
	# print(region_path)



	# # Make sure not too close to edge
	# if (center_x-box_dim/2 > 0 and center_y-box_dim/2 > 0 and \
	# 	center_x+box_dim/2 < region.width and center_y+box_dim/2 < region.height):
	# 	now = datetime.now()
	# 	date_time = now.strftime("%m%d%Y%H%M%S")
	# 	cell_path = settings.MEDIA_ROOT + '/cells/' + date_time + '.jpg'
	# 	command = "vips crop "+ region_path + " " + cell_path + " " + \
	# 		str(center_x-box_dim/2) + " " + str(center_y-box_dim/2) + " " + \
	# 		str(box_dim) + " " + str(box_dim) 
	# 	os.system(command)

	# 	cell_path = '/cells/' + date_time + '.jpg'
	# 	new_cell = Cell.objects.create(region = region, image=cell_path, cid=date_time, \
	# 		center_x=center_x, center_y=center_y, width=box_dim, height=box_dim)
	# 	new_cell.save()
	# 	# cells = region.cell_set.all()
	# 	new_cell_json = serializers.serialize("json", [new_cell])
	# 	results = {'success':True, 'new_cell_json':new_cell_json}
	# else:
	# 	results = {'success':False, 'error':'too close to boundary'}
	
	# return JsonResponse(results)

# For label slide overlay.html which is under production
# @login_required
# def get_cell_center_relative_to_slide(request): 
# 	GET = request.GET
# 	cid = GET['cid']
# 	cell = Cell.objects.get(cid=cid)
# 	results = {'success':True, 'x':cell.GetCenter_x_slide(), 'y':cell.GetCenter_y_slide()}
# 	print('get_cell_center_relative_to_slide', cell.GetCenter_x_slide(), cell.center_x,cell.GetCenter_y_slide(), cell.center_y)
# 	cell.center_x_slide = cell.GetCenter_x_slide();
# 	cell.center_y_slide = cell.GetCenter_y_slide();
# 	cell.save()
# 	print('get_cell_center_relative_to_slide', cell.GetCenter_x_slide(), cell.center_x, cell.center_x_slide, cell.GetCenter_y_slide(), cell.center_y, cell.center_y_slide)

# 	return JsonResponse(results);



# def label_cell(request, cell_id):
# 	"""label inidivudal cell"""
# 	cell = Cell.objects.get(cid=cell_id)
# 	# if request.method != 'POST':
# 	# 	form = CellLabelForm(instance=cell)
		
# 	# else:
# 	# 	# Post data submitted; process data
# 	# 	form = CellLabelForm(request.POST, instance=cell)
# 	# 	if form.is_valid():
# 	# 		form.save(update_fields['label', ''])
# 	region = cell.region
# 	other_cells = region.cell_set.all()
# 	context = {'region': region, 'cell':cell, 'other_cells': other_cells}
# 	return render(request, 'labeller/label_cell.html', context)

# New page started on May 7, 2021
# Rapid labeller for normal cells without associated regions

# @login_required
# def normal_cell_labeller(request):
# 	"""label all unlabelledd cells for a project"""


# 	# Need to only get cells for the current user and for the current project
# 	# For now only one user and project
# 	#NewCells = project.cell_set.all() 
# 	#newCells = NewCell.objects.get()
# 	cells = NewCell.objects.all()

# 	#region = Region.objects.get(rid=region_id)
# 	#cells = region.cell_set.all()
# 	if (cells.count() == 0):
# 		cells = "none"
# 		cells_json = "none"
# 	else:
# 		cells_json = serializers.serialize("json", cells)
	
# 	context = {'cells':cells, 'cells_json': cells_json}
# 	print(context)
# 	return render(request, 'labeller/normal_cell_labeller.html', context)

## Experimental version that was trying to allow direct annotation on slide - big problems trying to get openseadragon to play well with Fabric.js
# @login_required
# def label_slide_overlay(request, slide_id):
# 	slide = Slide.objects.get(sid=slide_id)
# 	regions = slide.region_set.all()
# 	print(regions)
# 	cells = Cell.objects.filter(region__slide__sid=slide_id)
# 	#cells = Cell.objects.all()
# 	if (cells.count() == 0):
# 		cells_json = "none"
# 	else:	
# 		cells_json = serializers.serialize("json", cells)
# 		print("cell count", cells.count())

# 	context = {'slide': slide, 'regions': regions, 'cells': cells, 'cells_json': cells_json}
# 	return render(request, 'labeller/label_slide_overlay.html', context)
	
# @login_required	
# def new_region(request):
# 	"""Add a new region"""
# 	if request.method != 'POST':
# 		# No data submitted; create a blank form
# 		form = RegionForm()
# 	else:
# 		# POST data submitted; process data
# 		form = RegionForm(request.POST)
# 		if form.is_valid():
# 			form.save()
# 			return HttpResponseRedirect(reverse('labeller:regions'))

# 	context = {'form': form}
# 	return render(request, 'labeller/new_region.html', context)

# @login_required
# def blank_request(request):
# 	print(request)
# 	return JsonResponse({'success': True})

# @login_required
# def slide_viewer(request):
# 	return render(request, 'labeller/slide_viewer.html')

	# if (slide_id == '1010220220012190'):
	# 	print('1010220220012190 is being changed')
	# 	slide.dzi_path.name = 'slides/1010220220012190.dzi'
	# 	slide.save()
	# if (slide_id == '1010220220012180'):
	# 	print('1010220220012190 is being changed')
	# 	slide.dzi_path.name = 'slides/1010220220012190.dzi'
	# 	slide.save()

    # if request.method == 'POST':
    #     form = DiagnosisForm(request.POST)
    #     if form.is_valid():
    #         comment = Comment(
    #             author=form.cleaned_data["author"],
    #             body=form.cleaned_data["body"],
    #             post=post

    #         )

    #         comment.save()
