from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.urls import reverse
from django.core import serializers
from django.http import JsonResponse
import json
import os
from datetime import datetime
from django.db import models

from .models import Region, Cell, Patient, Slide
from .forms import RegionForm

from django.conf import settings
from django.conf.urls.static import static
from django.core.files import File
from django.core.files.images import ImageFile


def index(request):
	"""The home page for labeller"""
	return render(request, 'labeller/index.html')

def regions(request):
	"""Show all regions."""
	regions = Region.objects.order_by('rid')
	context = {'regions': regions}
	return render(request, 'labeller/regions.html', context)

def cells(request):
	"""Show all regions."""
	cells = Cell.objects.order_by('cid')
	context = {'cells': cells}
	return render(request, 'labeller/cells.html', context)	

def slides(request):
	"""Show all regions."""
	slides = Slide.objects.order_by('sid')
	context = {'slides': slides}
	return render(request, 'labeller/slides.html', context)	

def slide_viewer(request):
	return render(request, 'labeller/slide_viewer.html')

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

def label_slide(request, slide_id):
	slide = Slide.objects.get(sid=slide_id)
	regions = slide.region_set.all()
	context = {'slide': slide, 'regions': regions}
	return render(request, 'labeller/label_slide.html', context)


def add_new_cell(request):
	POST = request.POST
	rid = int(POST['rid'])
	center_x = float(POST['center_x'])
	center_y = float(POST['center_y'])
	box_dim = 90 # Box dimension (it is a square)

	region = Region.objects.get(rid=rid)


	region_path = settings.MEDIA_ROOT + region.image.url
	print(region_path)

	# Make sure not too lose to edge
	if (center_x-box_dim/2 > 0 and center_y-box_dim/2 > 0 and \
		center_x+box_dim/2 < region.width and center_y+box_dim/2 < region.height):
		now = datetime.now()
		date_time = now.strftime("%m%d%Y%H%M%S")
		cell_path = settings.MEDIA_ROOT + '/cells/' + date_time + '.jpg'
		command = "vips crop "+ region_path + " " + cell_path + " " + \
			str(center_x-box_dim/2) + " " + str(center_y-box_dim/2) + " " + \
			str(box_dim) + " " + str(box_dim) 
		os.system(command)

		cell_path = '/cells/' + date_time + '.jpg'
		new_cell = Cell.objects.create(region = region, image=cell_path, cid=date_time, \
			center_x=center_x, center_y=center_y, width=box_dim, height=box_dim)
		new_cell.save()
		# cells = region.cell_set.all()
		new_cell_json = serializers.serialize("json", [new_cell])
		results = {'success':True, 'new_cell_json':new_cell_json}
	else:
		results = {'success':False, 'error':'too close to boundary'}
	
	return JsonResponse(results)


def delete_cell(request):
	POST = request.POST
	cid = int(POST['cid'])
	print('deleting cell %s' %cid)
	cell = Cell.objects.filter(cid=cid).delete()
	results = {'success':True}
	return JsonResponse(results)


def add_new_region(request):
	POST = request.POST
	sid = int(POST['sid'])
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
def next_region(request):
	POST = request.POST
	rid = int(POST['rid'])
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

def update_cell_class(request):
	POST = request.POST
	cell = Cell.objects.get(cid=int(POST['cid']))
	cell.cell_type = POST['cell_label']
	cell.save()
	results = {'success':True}
	return JsonResponse(results)



def label_region(request, region_id):
	"""label cells on a region"""
	region = Region.objects.get(rid=region_id)
	cells = region.cell_set.all()
	cells_json = serializers.serialize("json", region.cell_set.all())
#	print(cells_json)
	context = {'region': region, 'cells':cells, 'cells_json': cells_json}
#	print(context['cells_json'])
	return render(request, 'labeller/label_region.html', context)
	

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