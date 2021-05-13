from django.db import models
from django.conf import settings
from math import ceil
from math import floor
from django.contrib.auth.models import User 



class Patient (models.Model):
	"""An individual patient, who can have many slides"""
	pid = models.IntegerField(unique=True)
#	slides = models.ForeignKey('Slide', on_delete=models.RESTRICT)
	date_added = models.DateTimeField(auto_now_add=True)
	name = models.CharField(max_length=200, default="default")

	class Meta:
		verbose_name_plural = 'Patients'

	def __str__(self):
		"""Return a string representation of the model."""
		return self.name


class Slide (models.Model):
	"""A slide comes from a single patient, but can have many regions"""
	sid = models.IntegerField(unique=True)
	patient = models.ForeignKey('Patient', on_delete=models.RESTRICT)
	date_added = models.DateTimeField(auto_now_add=True)
	dzi_path = models.FileField(upload_to="slides", max_length=300)
	svs_path = models.FileField(upload_to="slides", max_length=300)


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
class NewCell(models.Model):
	# cell_id are randomly generated randomUUIDs generated before inport. They are 36 characters long. 
	cell_id = models.CharField(max_length=36)
	
	slide_name = models.CharField(max_length=100)
	image = models.ImageField(upload_to='new_cells')


	class Meta:
		verbose_name_plural = 'NewCells'

	def __str__(self):
		"""Return a string representation of the model."""
		return str(self.cell_id)

# Each Cell Classification has one classification, one reviewer and one associated NewCell object.
class CellClassification(models.Model):
	cell_class = models.CharField(max_length=50, default = 'UL')
	additional_review = models.CharField(max_length=50, default = 'No')
	reviewer = models.ForeignKey(User, on_delete=models.RESTRICT)
	#newCell = models.ForeignKey('NewCell', on_delete=models.RESTRICT)

# class Reviewer(models.Model):
# 	name = models.CharField(max_length=50)
# 	classifications = models.ForeignKey('CellClassification', on_delete=models.RESTRICT)

class Project(models.Model):
	name = models.CharField(max_length=200)

	# How to use many to many fields
	# https://docs.djangoproject.com/en/3.1/topics/db/examples/many_to_many/
	#regions = models.ManyToManyField('Region')
	#reviewers = models.ManyToManyField('Reviewer')
	#newCells = models.ManyToManyField('NewCell')


class Cell(models.Model):

	"""A cell comes from a region and has a label"""
	readonly_fields=('id',)
	cid = models.IntegerField(unique=True)
	date_added = models.DateTimeField(auto_now_add=True)	
	region = models.ForeignKey('Region', on_delete=models.RESTRICT)
	image = models.ImageField(upload_to='cells')

	center_x = models.FloatField(default=-1)
	center_y = models.FloatField(default=-1)

	width = models.FloatField(default=-1)
	height = models.FloatField(default=-1)

	cell_type = models.CharField(max_length=50, default = 'UL')
	

	# def getCellTypeName(self):
	# 	classLabelDict = {
	# 		"M1": "Blast",
	# 		"M2": "Myelocyte",
	# 		"M3": "Promyelocyte",
	# 		"M4": "Metamyelocyte",
	# 		"M5": "Band neutrophil",
	# 		"M6": "Segmented netrophil",

	# 		"E1": "Immature Eosinophil",
	# 		"E2": "Mature Eosinophil",
	# 		"B1": "Immature Basophil",
	# 		"B2": "Mature Basophil",
	# 		"M1": "Monoblast",
	# 		"M2": "Monocyte",

	# 		"L0": "Lymphoblast",
	# 		"L1": "Hematagone",
	# 		"L2": "Small Mature Lymphocyte",
	# 		"L3": "Large Grancular lymphocyte",
	# 		"L4": "Plasma Cell",

	# 		"ER1": "Pronormoblast",
	# 		"ER2": "Basophilic normoblast",
	# 		"ER3": "Polychromatophilic",
	# 		"ER4": "Orthochromic (nuc red)",
	# 		"ER5": "Reticulocyte",
	# 		"ER6": "Mature RBC",

	# 		"U1": "Artifact",
	# 		"U2": "Unknown",
	# 		"U3": "Other",
	# 		"U4": "Histiocyte",
	# 	}
	# 	return classLabelDict[self.cell_type]	
	


	class Meta:
		verbose_name_plural = 'Cells'

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
