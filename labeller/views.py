from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.urls import reverse

from .models import Region, Cell, Patient, Slide
from .forms import RegionForm, CellLabelForm, CellLabelForm2

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

def label_cell(request, cell_id):
	"""label inidivudal cell"""
	cell = Cell.objects.get(id=cell_id)
	if request.method != 'POST':
		form = CellLabelForm(instance=cell)
	else:
		# Post data submitted; process data
		form = CellLabelForm(request.POST, instance=cell)
		if form.is_valid():
			form.save(update_fields['label', ''])
	region = cell.region
	other_cells = region.cell_set.all()
	context = {'region': region, 'cell':cell, 'form':form, 'other_cells': other_cells}
	return render(request, 'labeller/label_cell.html', context)


def label_region(request, region_id):
	"""label cells on a region"""
	if request.method != 'POST':
		form = CellLabelForm()

	region = Region.objects.get(id=region_id)
	cells = region.cell_set.all()
	forms = []
	for cell in cells:
		forms += CellLabelForm2(instance=cell)
	current_cell = cells[0]
	context = {'region': region, 'cells':cells, 'form':form, 'forms':forms,}
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

# def region_images(request):
# 	"""show all region images"""
# 	region_images = Region.image.order_by('rid')
# 	context = {'region_images': region_images}
# 	return render(request, 'labeller/regions.html, context')