from django import forms
from django.forms import ModelForm
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from labeller.models import CellFeature

from .models import Project, Region, Cell

class RegionForm(forms.ModelForm):
	class Meta:
		model = Region
		fields = ['rid', 'slide', 'image']
		labels = {'rid': '', 'slide': '', 'image': ''}

# Form for cell upload
class CellForm(forms.ModelForm):
  class Meta:
    model = Cell
    fields = {'image'}

# Form for creating a new project
class ProjectForm(forms.ModelForm):
  class Meta:
    model = Project
    fields = {'name'}


# Create user sign up form
class UserForm(UserCreationForm):
  first_name = forms.CharField()
  last_name  = forms.CharField()
  email      = forms.EmailField()

  class Meta:
    model = User
    fields = ('first_name', 'last_name', 'username', 'email', 'password1', 'password2')


class CellFeatureForm(forms.ModelForm): 
  
  class Meta:
    model = Cell
    fields = ['cellFeatures']

  cellFeatures = forms.ModelMultipleChoiceField(
      queryset=CellFeature.objects.all(),
      widget=forms.CheckboxSelectMultiple
  )    
