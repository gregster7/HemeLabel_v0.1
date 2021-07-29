from django.shortcuts import render, resolve_url
from django.http import HttpResponse, HttpResponseRedirect
from django.urls import reverse
from django.core import serializers
from django.http import JsonResponse
import json
import os
from datetime import datetime
from django.db import models
from django.contrib.auth.decorators import login_required

from .models import Region, Cell, Patient, Slide
from .models import User
from .forms import RegionForm, UserForm 

from django.conf import settings
from django.conf.urls.static import static
from django.core.files import File
from django.core.files.images import ImageFile

from django.contrib.auth.decorators import login_required
from django.contrib import messages 
from django.contrib.auth import login, authenticate 
from django.contrib.auth.forms import UserCreationForm 
from django.shortcuts import render, redirect 


def index(request):
	"""The home page for labeller"""
	return render(request, 'labeller/index.html')



@login_required
def regions(request):
	"""Show all regions."""
	regions = Region.objects.order_by('rid')
	context = {'regions': regions}
	return render(request, 'labeller/regions.html', context)

@login_required
def cells(request):
	"""Show all regions."""
	cells = Cell.objects.order_by('cid')
	context = {'cells': cells}
	return render(request, 'labeller/cells.html', context)	

@login_required 
def slides(request):
	"""Show all regions."""
	slides = Slide.objects.order_by('sid')
	context = {'slides': slides}
	return render(request, 'labeller/slides.html', context)	

@login_required 
def slide_viewer(request):
	return render(request, 'labeller/slide_viewer.html')

@login_required 
def label_cell(request, cell_id):
	"""label inidivudal cell"""
	cell = Cell.objects.get(cid=cell_id)
	# if request.method != 'POST':
	# 	form = CellLabelForm(instance=cell)
		
	# else:
	# 	# Post data submitted; process data
	# 	form = CellLabelForm(request.POST, instance=cell)
	# 	if form.is_valid():
	# 		form.save(update_fields['label', ''])
	region = cell.region
	other_cells = region.cell_set.all()
	context = {'region': region, 'cell':cell, 'other_cells': other_cells}
	return render(request, 'labeller/label_cell.html', context)

@login_required 

# New page started on May 7, 2021
# Rapid labeller for normal cells without associated regions
def normal_cell_labeller(request):
	"""label all unlabelledd cells for a project"""


	# Need to only get cells for the current user and for the current project
	# For now only one user and project
	#NewCells = project.cell_set.all() 
	#newCells = NewCell.objects.get()
	cells = NewCell.objects.all()

	#region = Region.objects.get(rid=region_id)
	#cells = region.cell_set.all()
	if (cells.count() == 0):
		cells = "none"
		cells_json = "none"
	else:
		cells_json = serializers.serialize("json", cells)
	
	context = {'cells':cells, 'cells_json': cells_json}
	print(context)
	return render(request, 'labeller/normal_cell_labeller.html', context)

def label_slide_overlay(request, slide_id):
	slide = Slide.objects.get(sid=slide_id)
	regions = slide.region_set.all()
	print(regions)
	cells = Cell.objects.filter(region__slide__sid=slide_id)
	#cells = Cell.objects.all()
	if (cells.count() == 0):
		cells_json = "none"
	else:	
		cells_json = serializers.serialize("json", cells)
		print("cell count", cells.count())

	context = {'slide': slide, 'regions': regions, 'cells': cells, 'cells_json': cells_json}
	return render(request, 'labeller/label_slide_overlay.html', context)


def label_slide(request, slide_id):
	slide = Slide.objects.get(sid=slide_id)
	regions = slide.region_set.all()
	context = {'slide': slide, 'regions': regions}
	return render(request, 'labeller/label_slide.html', context)

@login_required 
def get_all_cells_json(region):
	cells_json = serializers.serialize("json", region.cell_set.all())
#	print(region, cells_json)
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

@login_required 
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

@login_required 
def get_cell_center_relative_to_slide(request): 
	GET = request.GET
	cid = GET['cid']
	cell = Cell.objects.get(cid=cid)
	results = {'success':True, 'x':cell.GetCenter_x_slide(), 'y':cell.GetCenter_y_slide()}
	print('get_cell_center_relative_to_slide', cell.GetCenter_x_slide(), cell.center_x,cell.GetCenter_y_slide(), cell.center_y)
	cell.center_x_slide = cell.GetCenter_x_slide();
	cell.center_y_slide = cell.GetCenter_y_slide();
	cell.save()
	print('get_cell_center_relative_to_slide', cell.GetCenter_x_slide(), cell.center_x, cell.center_x_slide, cell.GetCenter_y_slide(), cell.center_y, cell.center_y_slide)

	return JsonResponse(results);

def get_all_cells_in_region(request):
	GET = request.GET
	rid = GET['rid']
	region = Region.objects.get(rid=rid)
	all_cells_json = serializers.serialize("json", region.cell_set.all())
	results = {'success':True, 'all_cells_json':all_cells_json}
	return JsonResponse(results);

@login_required 
def get_all_cells_in_slide(request):
	GET = request.GET
	sid = GET['sid']
	cells = Cell.objects.filter(region__slide__sid=sid)
	all_cells_json = serializers.serialize("json", cells)
	results = {'success':True, 'all_cells_json':all_cells_json}
	return JsonResponse(results);


def get_cell_json(request):
	GET = request.GET
	cid = GET['cid']
	cell = Cell.objects.get(cid=cid)
	cell_json = serializers.serialize("json", [cell])
	results = {'success':True, 'cell_json':cell_json}
	return JsonResponse(results);

@login_required 

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
@login_required 
def create_new_cid():
	now = datetime.now()
	date_time = now.strftime("%m%d%Y%H%M%S")
	return "1"+date_time

@login_required 
def create_new_cell(rid, left, top, width, height):
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

		new_cell = Cell.objects.create(region = region, image=cell_path, cid=cid, \
			center_x=left + width/2, center_y=top + height/2, width=width, height=height)
		new_cell.center_x_slide = new_cell.center_x + region.x;
		new_cell.center_y_slide = new_cell.center_y + region.y;
		new_cell.save()
		# cells = region.cell_set.all()
		new_cell_json = serializers.serialize("json", [new_cell])
		all_cells_json = get_all_cells_json(region)

		results = {'success':True, 'new_cell_json':new_cell_json, 'all_cells_json':all_cells_json}
		return results
	

@login_required 
def add_new_cell_box(request):
	POST = request.POST
	rid = int(POST['rid'])

	top = float(POST['top'])
	height = float(POST['height'])

	left = float(POST['left'])
	width = float(POST['width'])

	results = create_new_cell(rid, left, top, width, height);
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
def add_new_cell(request):
	POST = request.POST
	rid = POST['rid']
	center_x = float(POST['center_x'])
	center_y = float(POST['center_y'])
	box_dim = 90 # Box dimension (it is a square)
	left = center_x - box_dim/2
	top = center_y - box_dim/2
	return JsonResponse(create_new_cell(rid, left, top, box_dim, box_dim))

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
	date_time = now.strftime("%m%d%Y%H%M%S")
	region_path = settings.MEDIA_ROOT + '/regions/' + date_time + '.jpg'
	command = "vips crop "+ svs_path + " " + region_path + " " + str(x) + " " + str(y) + " " + \
		str(width) + " " + str(height) 
	print(command)
	os.system(command)
#	image =	image_model.image_field(region_path, File().read())

	region_path = '/regions/' + date_time + '.jpg'
	new_region = Region.objects.create(slide = slide, image=region_path, rid=date_time, x=x, y=y, width=width, height=height)
	new_region.save()
#	new_region.image.save(os.path.basename(.url))

#	new_region.image.url = region_path

#	file = open(region_path)
#	myfile = File(f)
#	new_region.image.
##	print(MEDIA_ROOT)

	results = {'success':True}
	return JsonResponse(results)


# Needs to be udpated to support changing slide and patient as well
@login_required 
def next_region(request):
	POST = request.POST
	rid = POST['rid']
	direction = int(POST['direction'])
	region = Region.objects.get(rid=rid)
	results = {'rid': rid, 'success':False}

	print(direction)
	print(rid)
	print(region)
	print(region.slide)
	# #regions = Region.objects.filter(slide=region.slide)

	if (direction == 1):
		next_region = Region.objects.filter(slide=region.slide, rid__gt=rid).order_by('rid').first()
	elif (direction == -1):
		next_region = Region.objects.filter(slide=region.slide, rid__lt=rid).order_by('rid').last()

	if (next_region != None):
		results = {'rid': next_region.rid, 'success':True}

	# else :
	# 	print(next_region)

	return JsonResponse(results)

@login_required 
def update_cell_class(request):
	POST = request.POST
	cell = Cell.objects.get(cid=POST['cid'])
	cell.cell_type = POST['cell_label']
	cell.save()
	results = {'success':True, 'all_cells_json':get_all_cells_json(cell.region)}
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

	context = {'regions': regions, 'regions_json': regions_json, 'cells':cells, 'cells_json': cells_json}
	return render(request, 'labeller/stats.html', context)

@login_required 
def label_region_fabric(request, region_id):
	"""label cells on a region"""
	region = Region.objects.get(rid=region_id)
	slide = region.slide
	cells = region.cell_set.all()
	if (cells.count() == 0):
		cells = "none"
		cells_json = "none"
	else:
		cells_json = serializers.serialize("json", region.cell_set.all())
	
	context = {'region': region, 'cells':cells, 'cells_json': cells_json, 'slide': slide}
	print("slide is", slide)
#	print(context)
	return render(request, 'labeller/label_region_fabric.html', context)

@login_required 
def label_region(request, region_id):
	"""label cells on a region"""
	region = Region.objects.get(rid=region_id)
	cells = region.cell_set.all()
	if (cells.count() == 0):
		cells = "none"
		cells_json = "none"
	else:
		cells_json = serializers.serialize("json", region.cell_set.all())
	
	context = {'region': region, 'cells':cells, 'cells_json': cells_json}
	print(context)
	return render(request, 'labeller/label_region.html', context)
	
@login_required 
def new_region(request):
	"""Add a new region"""
	if request.method != 'POST':
		# No data submitted; create a blank form
		form = RegionForm()
	else:
		# POST data submitted; process data
		form = RegionForm(request.POST)
		if form.is_valid():
			form.save()
			return HttpResponseRedirect(reverse('labeller:regions'))

	context = {'form': form}
	return render(request, 'labeller/new_region.html', context)

@login_required 
def get_all_cells_in_project(project):
	regions = region.project_set.all()
	cells = Cell.objects.filter(regions__in=regions)


# UserForm View
def register(request):
  if request.method == 'POST':
    form = UserForm(request.POST)
    if form.is_valid():
      new_user = form.save()
      messages.info(request, "Thank you for registering. You are now logged in.")
      new_user = authenticate(username=form.cleaned_data['username'], password=form.cleaned_data['password1'])
      login(request, new_user)
      return HttpResponseRedirect('/')

      # form.save()
      # messages.success(request, 'Account successfully created.')
      # if user is not None:
      #   user.is_authenticated
      #   login(request, user)
      # return redirect('/')
      # # return redirect('/')

  else:
    form = UserForm()

  return render(request, 'labeller/register.html', {'form': form})

# def signup(request):
#   if request.method == "POST":
#     form = UserCreationForm(request.post)
#     if form.is_valid():
#       form.save
#       username = form.cleaned_data.get('username')
#       raw_password = form.cleaned_data.get('password1')
#       user = authenticate(username=username, password=raw_password)
#       return redirect('labeller:index')
#   else:
#     form = UserCreationForm()
#   return render(request, 'signup.html', {'form':form})


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