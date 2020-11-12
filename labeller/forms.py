from django import forms

from .models import Region

class RegionForm(forms.ModelForm):
	class Meta:
		model = Region
		fields = ['rid', 'slide', 'image']
		labels = {'rid': '', 'slide': '', 'image': ''}
