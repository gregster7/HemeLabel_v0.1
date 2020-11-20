from django import forms

from .models import Region, Cell

class RegionForm(forms.ModelForm):
	class Meta:
		model = Region
		fields = ['rid', 'slide', 'image']
		labels = {'rid': '', 'slide': '', 'image': ''}


class CellLabelForm(forms.ModelForm):
	class Meta:
		model = Cell
		fields = ['labelled', 'BLAST', 'MYELOCYTE', 'PROMYELOCYTE', 'METAMYELOCYTE', 'BAND', 'SEG', 'IMM_EO', 'EO', 'IMM_BASO', 'BASO', 'HEMATOGONE', 'LYMPHOBLAST', 'LYMPHOCYTE', 'LGL', 'PLASMA', 'ER_PRONORM', 'ER_BASO_NORMO', 'ER_POLYCHROM', 'ER_ORTHO', 'ER_RETIC', 'ER_MATURE', 'MONOBLAST', 'MONOCYTE', 'HISTIOCYTE', 'UNKNOWN', 'ARTIFACT', 'OTHER']

#		fields = ['labelled', 'label']
#		labels = {'labelled': 'Labelled', 'label':'Classification'}


class CellLabelForm2(forms.ModelForm):
	class Meta:
		model = Cell
		fields = ['image', 'cid', 'cell_type', ]