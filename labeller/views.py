from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.urls import reverse

from .models import Region
from .forms import RegionForm

def index(request):
	"""The home page for labeller"""
	return render(request, 'labeller/index.html')

def regions(request):
	"""Show all regions."""
	regions = Region.objects.order_by('rid')
#	region_images = Region.image
	context = {'regions': regions}
	return render(request, 'labeller/regions.html', context)

def label_region(request, region_id):
	"""label cells on a region"""
	region = Region.objects.get(id=region_id)
	context = {'region': region}
	return render(request, 'labeller/label_region.html', context)


def new_region(request):
	"""Add a new cell"""
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