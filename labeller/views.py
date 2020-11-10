from django.shortcuts import render

def index(request):
	"""The home page for labeller"""
	return render(request, 'labeller/index.html')