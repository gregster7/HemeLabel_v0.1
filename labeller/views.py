from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.urls import reverse
from django.core import serializers
from django.http import JsonResponse
import json

from .models import Region, Cell, Patient, Slide
from .forms import RegionForm

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

def slide_viewer(request):
	return render(request, 'labeller/slide_viewer.html')

def label_cell(request, cell_cid):
	"""label inidivudal cell"""
	cell = Cell.objects.get(cid=cell_cid)
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
	cells_json = serializers.serialize("json", cells)

	context = {'region': region, 'cells':cells, 'cells_json': cells_json}
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