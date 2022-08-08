from django.shortcuts import render

# Create your views here.


def classifier_demo(request):
    return render(request, 'demo/classifier_demo.html')
