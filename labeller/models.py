from django.db import models
from django.conf import settings
from math import ceil
from math import floor

from django.contrib.auth.models import User 


User._meta.get_field('email')._unique = True 

class Patient (models.Model):
	"""An individual patient, who can have many slides"""
	pid = models.IntegerField(unique=True, blank=True, null=True)
	# Likely a UUID, but since not guaraneed, deglared as a CharField
	fakeMRN = models.CharField(max_length=32, blank=True, null=True)
	age = models.IntegerField(blank=True, null=True)
	race = models.CharField(max_length=16, blank=True, null=True)
	gender = models.CharField(max_length=16, blank=True, null=True)

#	slides = models.ForeignKey('Slide', on_delete=models.RESTRICT)
	date_added = models.DateTimeField(auto_now_add=True)
	name = models.CharField(max_length=200, default="default")

	class Meta:
		verbose_name_plural = 'Patients'

	def __str__(self):
		"""Return a string representation of the model."""
		return self.name

class CellFeature(models.Model):
	featureName = models.CharField(max_length=64, blank=True, null=True)
	featureAbbreviation = models.CharField(max_length=64, blank=True, null=True)
	

class Slide (models.Model):
	"""A slide comes from a single patient, but can have many regions"""
	sid = models.IntegerField(unique=True)
	patient = models.ForeignKey('Patient', on_delete=models.RESTRICT, blank=True, null=True)
	date_added = models.DateTimeField(auto_now_add=True)
	dzi_path = models.FileField(upload_to="slides", max_length=300, blank=True, null=True)
	svs_path = models.FileField(upload_to="slides", max_length=300, blank=True, null=True)

	# Store filename as name
	name = models.CharField(max_length=200, blank=True, null=True)
	primary_diagnosis = models.CharField(max_length=200, blank=True, null=True)

	fDx = models.CharField(max_length=1000, blank=True, null=True)
	dxCom =models.CharField(max_length=3000, blank=True, null=True)
	clinDx = models.CharField(max_length=3000, blank=True, null=True)	
	addCom = models.CharField(max_length=10000, blank=True, null=True)	
	micro = models.CharField(max_length=10000, blank=True, null=True)
	notes = models.CharField(max_length=3000, blank=True, null=True)
	scanner	= models.CharField(max_length=100, blank=True, null=True)
	magnification = models.IntegerField(blank=True, null=True)
	tissue = models.CharField(max_length=100, blank=True, null=True)
	
	# Likely a UUID, but since not guaraneed, deglared as a CharField
	fakeCaseNumber = models.CharField(max_length=32, blank=True, null=True)

	class Meta:
		verbose_name_plural = 'Slides'

	def __str__(self):
		"""Return a string representation of the model."""
		return str(self.sid)

class Region(models.Model):
	"""A region comes from a slide and can have multiple cells"""
	rid = models.IntegerField(unique=True)
	date_added = models.DateTimeField(auto_now_add=True)	
	slide = models.ForeignKey('Slide', on_delete=models.RESTRICT)

	# Projects
	# projects can be accessed by 'region_variable_name.project_set.all()''
	# https://docs.djangoproject.com/en/3.1/topics/db/examples/many_to_many/

	image = models.ImageField(upload_to='regions')
	x = models.FloatField(default=-1)
	y = models.FloatField(default=-1)
	width = models.FloatField(default=-1)
	height = models.FloatField(default=-1)
	all_wc_located = models.BooleanField(default=False)
	all_wc_classified = models.BooleanField(default=False)
	

	def floor_width(self):
		return floor(self.width)

	def floor_height(self):
		return floor(self.height)

	def ceil_width (self):
		return ceil(self.width)
	
	def ceil_height (self):
		return ceil(self.height)
	
	class Meta:
		verbose_name_plural = 'Regions'

	def __str__(self):
		"""Return a string representation of the model."""
		return str(self.rid)

# class FixedRegion(models.model):
# 	"""All FixedRegions are 416x416 pixels"""
# 	image = models.ImageField(upload_to='FixedRegions')
# 	slide = models.ForeignKey('Slide', on_delete=models.RESTRICT)
# 	x = models.FloatField(default=-1)
# 	y = models.FloatField(default=-1)

	
# Simlar to Cell model, but not associated with a region. Designed for normal cell classification task. 	
# class NewCell(models.Model):
# 	# cell_id are randomly generated randomUUIDs generated before inport. They are 36 characters long. 
# 	cell_id = models.CharField(max_length=36)
	
# 	slide_name = models.CharField(max_length=100, blank=True, null=True)
# #	slide = models.ForeignKey()
# 	image = models.ImageField(upload_to='new_cells')


# 	class Meta:
# 		verbose_name_plural = 'NewCells'

# 	def __str__(self):
# 		"""Return a string representation of the model."""
# 		return str(self.cell_id)

# Each Cell Classification has one classification, one reviewer and one associated NewCell object.
# class CellClassification(models.Model):
# 	cell_class = models.CharField(max_length=50, default = 'UL')
# 	additional_review = models.CharField(max_length=50, default = 'No')
# 	reviewer = models.ForeignKey(User, on_delete=models.RESTRICT)
	#newCell = models.ForeignKey('NewCell', on_delete=models.RESTRICT)

# class Reviewer(models.Model):
# 	name = models.CharField(max_length=50)
# 	classifications = models.ForeignKey('CellClassification', on_delete=models.RESTRICT)

class Project(models.Model):
	name = models.CharField(max_length=200, default="No Name")
	date_added = models.DateTimeField(auto_now_add=True)

	# How to use many to many fields
	# https://docs.djangoproject.com/en/3.1/topics/db/examples/many_to_many/
	#regions = models.ManyToManyField('Region')
	#reviewers = models.ManyToManyField('Reviewer')
	#newCells = models.ManyToManyField('NewCell')

	class Meta:
		verbose_name_plural = 'Projects'

	def __str__(self):
		"""Return a string representation of the model."""
		return str(self.name)


class Cell(models.Model):

	"""A cell comes from a region and has a label"""
	readonly_fields=('id',)
	cid = models.IntegerField(unique=True)
	name = models.CharField(max_length=200, blank=True, null=True)
	date_added = models.DateTimeField(auto_now_add=True)	
	region = models.ForeignKey('Region', on_delete=models.RESTRICT, blank=True, null=True)
	project = models.ForeignKey('Project', on_delete=models.RESTRICT, blank=True, null=True)
	image = models.ImageField(upload_to='cells')

	"""centers are relative to region if there is a region, if not they are relative to the slide"""
	center_x = models.FloatField(default=-1)
	center_y = models.FloatField(default=-1)

	center_x_slide = models.FloatField(default=-1)
	center_y_slide = models.FloatField(default=-1)

	def GetCenter_x_slide(self):
		"return center_x relative to slide instead of region"
		if (self.region is None):
			return self.center_x
		else:
			return self.region.x+self.center_x

	def GetCenter_y_slide(self):
		"return center_x relative to slide instead of region"
		if (self.region is None):
			return self.center_y
		else:
			return self.region.y+self.center_y		

#	center_x_slide = property(GetCenter_x_slide)
#	center_y_slide = region.y+center_y;

	width = models.FloatField(default=-1)
	height = models.FloatField(default=-1)

	cell_type = models.CharField(max_length=50, default = 'UL')
	
	cellFeatures = models.ManyToManyField('CellFeature', blank=True)

	def getCellTypeName(self):
		classLabelDict = {
			"M1": "Blast",
			"M2": "Promyelocyte",
			"M3": "Myelocyte",
			"M4": "Metamyelocyte",
			"M5": "Band neutrophil",
			"M6": "Segmented netrophil",

			"E1": "Immature Eosinophil",
			"E2": "Mature Eosinophil",
			"B1": "Immature Basophil",
			"B2": "Mature Basophil",
			"MO1": "Monoblast",
			"MO2": "Monocyte",

			"L0": "Lymphoblast",
			"L1": "Hematagone",
			"L2": "Small Mature Lymphocyte",
			"L3": "Large Grancular lymphocyte",
			"L4": "Plasma Cell",

			"ER1": "Pronormoblast",
			"ER2": "Basophilic normoblast",
			"ER3": "Polychromatophilic",
			"ER4": "Orthochromic (nuc red)",
			"ER5": "Reticulocyte",
			"ER6": "Mature RBC",

			"U1": "Artifact",
			"U2": "Unknown",
			"U3": "Other",
			"U4": "Histiocyte",
			"UL": "Unlabelled", 
			
		}
		return classLabelDict[self.cell_type]	
	


	class Meta:
		verbose_name_plural = 'Cells'

	def CellLineage(self):
		if (self.cell_type == 'M1' or self.cell_type == 'M2' or self.cell_type == 'M3' or self.cell_type == 'M4' or self.cell_type == 'M5' or self.cell_type == 'M6'):
			return 'myeloid'
		
		elif (self.cell_type == 'E1' or self.cell_type == 'E2' or self.cell_type == 'B1' or self.cell_type == 'MO1' or self.cell_type == 'MO2'):
			return 'myeloid'

		elif (self.cell_type == 'ER1' or self.cell_type == 'ER2' or self.cell_type == 'ER3' or self.cell_type == 'ER4' or self.cell_type == 'ER5'):
			return 'erythroid'

		elif (self.cell_type == 'ER6'):
			return 'misc'

		elif (self.cell_type == 'L0' or self.cell_type == 'L1' or self.cell_type == 'L2' or self.cell_type == 'L3' or self.cell_type == 'L4'):
			return 'lymphoid'

		elif (self.cell_type == 'U1' or self.cell_type == 'U2' or self.cell_type == 'U3' or self.cell_type == 'U4'):
			return 'misc'
		
		elif (self.cell_type == 'UL'):
			return 'unlabelled'
			
		# match self.cell_type:
		# 	case ['M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6']:
		# 		return 'myeloid'
		# 	case ['']
		


	def asdict(self):
		return {'pk': self.pk, 'cid': str(self.cid), 'lineage': self.CellLineage(), 'cell_type': self.cell_type, 'cell_type_name': self.getCellTypeName(), 'cell_name': self.name, 'region': self.region, 'project': self.project, 'center_x': self.center_x, 'center_y': self.center_y, 'width': self.width, 'height': self.height}

	def __str__(self):
		"""Return a string representation of the model."""
		return str(self.cid)

	# def image_tag(self):
	#     return u'<img src="%s" />' % self.image.url

	# image_tag.short_description = 'Image'
	# image_tag.allow_tags = True

	# labelled = models.BooleanField(default=False)
	# BLAST = models.BooleanField(default=False)
	# MYELOCYTE = models.BooleanField(default=False)
	# PROMYELOCYTE = models.BooleanField(default=False)
	# METAMYELOCYTE = models.BooleanField(default=False)
	# BAND = models.BooleanField(default=False)
	# SEG = models.BooleanField(default=False)
	# IMM_EO = models.BooleanField(default=False)
	# EO = models.BooleanField(default=False)
	# IMM_BASO = models.BooleanField(default=False)
	# BASO = models.BooleanField(default=False)
	# MONOBLAST = models.BooleanField(default=False)
	# MONOCYTE = models.BooleanField(default=False)
	# HEMATOGONE = models.BooleanField(default=False)
	# LYMPHOBLAST = models.BooleanField(default=False)
	# LYMPHOCYTE = models.BooleanField(default=False)
	# LGL = models.BooleanField(default=False)
	# PLASMA = models.BooleanField(default=False)
	# ER_PRONORM = models.BooleanField(default=False)
	# ER_BASO_NORMO = models.BooleanField(default=False)
	# ER_POLYCHROM = models.BooleanField(default=False)
	# ER_ORTHO = models.BooleanField(default=False)
	# ER_RETIC = models.BooleanField(default=False)
	# ER_MATURE = models.BooleanField(default=False)
	# HISTIOCYTE = models.BooleanField(default=False)
	# UNKNOWN = models.BooleanField(default=False)
	# ARTIFACT = models.BooleanField(default=False)
	# OTHER = models.BooleanField(default=False)



	# M1_BLAST = 'M1'
	# M2_MYELOCYTE = 'M2'
	# M3_PROMYELOCYTE = 'M3'
	# M4_METAMYELOCYTE = 'M4'
	# M5_BAND = 'M5'
	# M6_SEG = 'M6'
	# E1_IMM_EO = 'E1'
	# E2_EO = 'E2'
	# B1_IMM_BASO = 'B1'
	# B2_BASO = 'B2'
	# M1_MONOBLAST = 'M1'
	# M2_MONOCYTE = 'M2'
	# L0_LYMPHOBLAST = 'L0'
	# L1_HEMATOGONE = 'L1'
	# L2_LYMPHOCYTE = 'L2'
	# L3_LGL = 'L3'
	# L4_PLASMA = 'L4'
	# E1_PRONORM = 'E1'
	# E2_BASO_NORMO = 'E2'
	# E3_POLYCHROM = 'E3'
	# E4_ORTHO = 'E4'
	# E5_RETIC = 'E5'
	# E6_RBC = 'E6'
	# U1_ARTIFACT = 'U1'
	# U2_UKNOWN = 'U2'
	# U3_OTHER = 'U3'
	# U4_HISTIOCYTE = 'U4'
	# UL_UNLABELLED = 'UL'

	# cell_label_choices = [
	# 	(M1_BLAST, 'blast (1)'),
	# 	(M2_MYELOCYTE, 'myelocyte (2)'),
	# 	(M3_PROMYELOCYTE, 'promyelocyte (3)'),
	# 	(M4_METAMYELOCYTE, 'metamyelocyte (4)'),
	# 	(M5_BAND, 'band (5)'),
	# 	(M6_SEG, 'seg (6)'),
	# 	(E1_IMM_EO, 'immature eo (q)'),
	# 	(E2_EO, 'eo (w)'),
	# 	(B1_IMM_BASO, 'imm base (e)'),
	# 	(B2_BASO, 'baso (r)'),
	# 	(M1_MONOBLAST, 'monoblast (t)'),
	# 	(M2_MONOCYTE, 'monocyte'),
	# 	(L0_LYMPHOBLAST, 'lymphoblast'),
	# 	(L1_HEMATOGONE, 'hematogone'),
	# 	(L2_LYMPHOCYTE, 'lymphocyte'),
	# 	(L3_LGL, 'lgl'),
	# 	(L4_PLASMA, 'plasma cell'),
	# 	(E1_PRONORM, 'pronormoblast'),
	# 	(E2_BASO_NORMO, 'basophilic normoblast'),
	# 	(E3_POLYCHROM, 'polychromatic'),
	# 	(E4_ORTHO, 'orthochromic'),
	# 	(E5_RETIC, 'retic'),
	# 	(E6_RBC, 'rbc'),
	# 	(U1_ARTIFACT, 'artifact'),
	# 	(U2_UKNOWN, 'unknown'),
	# 	(U3_OTHER, 'other'),
	# 	(U4_HISTIOCYTE, 'histiocyte'),	
	# 	(UL_UNLABELLED, 'unlabelled')
	# ]

	# cell_type = models.CharField(
	# 	max_length=2,
	# 	choices=cell_label_choices,
	# 	default = UL_UNLABELLED,
	# )


	# def update_cell_type (self, cell_type): 
	# 	self.cell_type = cell_type
	




# 	def show_image(self):
# 		"""Return image of cell"""
# 		if self.image:
# 			return mark_safe('<img src="{}"/>'.format(self.image.url))
# 		return ""

# # class CellImage (model.Model):
# 	"""An image of a single cell with annotation"""
# 	cid = models.IntegerField()
# 	cell_label = models.CharField(max_length=200)
# 	image = models.ImageField()
