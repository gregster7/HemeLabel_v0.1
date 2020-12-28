from django.db import models
from django.conf import settings

# Create your models here.

class Patient (models.Model):
	"""An individual patient, who can have many slides"""
	pid = models.IntegerField(unique=True)
#	slides = models.ForeignKey('Slide', on_delete=models.RESTRICT)
	date_added = models.DateTimeField(auto_now_add=True)
	name = models.CharField(max_length=200)

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
	dzi_path = models.CharField(max_length=300, default='')

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
	image = models.ImageField(upload_to='regions')
	x = models.IntegerField(default=-1)
	y = models.IntegerField(default=-1)

	class Meta:
		verbose_name_plural = 'Regions'

	def __str__(self):
		"""Return a string representation of the model."""
		return str(self.rid)

class Cell(models.Model):
	"""A cell comes from a region and has a label"""
	readonly_fields=('id',)
	cid = models.IntegerField(unique=True)
	date_added = models.DateTimeField(auto_now_add=True)	
	region = models.ForeignKey('Region', on_delete=models.RESTRICT)
	image = models.ImageField(upload_to='cells')

	cell_type = models.CharField(max_length=50, default = 'UL')

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
