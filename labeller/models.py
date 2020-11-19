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

	class Meta:
		verbose_name_plural = 'Regions'

	def __str__(self):
		"""Return a string representation of the model."""
		return str(self.rid)

class Cell(models.Model):
	"""A cell comes from a region and has a label"""
	cid = models.IntegerField(unique=True)
	date_added = models.DateTimeField(auto_now_add=True)	
	region = models.ForeignKey('Region', on_delete=models.RESTRICT)
	image = models.ImageField(upload_to='cells')

	labelled = models.BooleanField(default=False)
	BLAST = models.BooleanField(default=False)
	MYELOCYTE = models.BooleanField(default=False)
	PROMYELOCYTE = models.BooleanField(default=False)
	METAMYELOCYTE = models.BooleanField(default=False)
	BAND = models.BooleanField(default=False)
	SEG = models.BooleanField(default=False)
	IMM_EO = models.BooleanField(default=False)
	EO = models.BooleanField(default=False)
	IMM_BASO = models.BooleanField(default=False)
	BASO = models.BooleanField(default=False)
	MONOBLAST = models.BooleanField(default=False)
	MONOCYTE = models.BooleanField(default=False)
	HEMATOGONE = models.BooleanField(default=False)
	LYMPHOBLAST = models.BooleanField(default=False)
	LYMPHOCYTE = models.BooleanField(default=False)
	LGL = models.BooleanField(default=False)
	PLASMA = models.BooleanField(default=False)
	ER_PRONORM = models.BooleanField(default=False)
	ER_BASO_NORMO = models.BooleanField(default=False)
	ER_POLYCHROM = models.BooleanField(default=False)
	ER_ORTHO = models.BooleanField(default=False)
	ER_RETIC = models.BooleanField(default=False)
	ER_MATURE = models.BooleanField(default=False)
	HISTIOCYTE = models.BooleanField(default=False)
	UNKNOWN = models.BooleanField(default=False)
	ARTIFACT = models.BooleanField(default=False)
	OTHER = models.BooleanField(default=False)


	# BLAST = 'BL'
	# MYELOCYTE = 'M1'
	# PROMYELOCYTE = 'M2'
	# METAMYELOCYTE = 'M3'
	# BAND = 'N1'
	# SEG = 'N2'
	# IMM_EO = 'E1'
	# EO = 'E2'
	# IMM_BASO = 'B1'
	# BASO = 'B2'
	# HEMATOGONE = 'L1'
	# LYMPHOBLAST = 'L0'
	# LYMPHOCYTE = 'L2'
	# LGL = 'LGL'
	# PLASMA = 'PC'
	# ER_PRONORM = 'E1'
	# ER_BASO_NORMO = 'E2'
	# ER_POLYCHROM = 'E3'
	# ER_ORTHO = 'E4'
	# ER_RETIC = 'E5'
	# ER_MATURE = 'E6'
	# MONOBLAST = 'M1'
	# MONOCYTE = 'M2'
	# HISTIOCYTE = 'H1'
	# UNKNOWN = 'U1'
	# ARTIFACT = 'ART'



	# cell_label_choices = [
	# 	(UNLABELLED, 'unlabelled'),
	# 	(BLAST, 'blast'),
	# 	(MYELOCYTE, 'M1: myelocyte'),
	# 	(PROMYELOCYTE, 'M2: promyelocyte'),
	# 	(METAMYELOCYTE, 'M3: metamyelocyte'),
	# 	(BAND, 'M4: band'),
	# 	(SEG, 'M5: seg'),
	# 	(IMM_EO, 'E1: immature eosinophil'),
	# 	(EO, 'E2: eosinophil'),
	# 	(IMM_BASO, 'B1: immature basophil'),
	# 	(BASO, 'B2: basophil'),
	# 	(LYMPHOBLAST, 'L0: lymphoblast'),
	# 	(HEMATOGONE, 'L1: hematogone'),
	# 	(LYMPHOCYTE, 'L2: mature lymphocyte'),
	# 	(LGL, 'L3: LGL'),
	# 	(PLASMA, 'L4: plasma cell'),
	# 	(ER_PRONORM, 'E1: pronormoblast'),
	# 	(ER_BASO_NORMO, 'E2: basophilic normoblsat'),
	# 	(ER_POLYCHROM, 'E3: polychrmoatic normoblast'),
	# 	(ER_ORTHO, 'E4: orthocrhomic normoblast (nucleated red)'),
	# 	(ER_RETIC, 'E5: polychromatic erythrocyte (reticulocyte)'),
	# 	(ER_MATURE, 'E6: mature erythrocyte'),
	# 	(MONOBLAST, 'M1: monoblast equivalent'),
	# 	(MONOCYTE, 'M2: mature monocyte'),
	# 	(HISTIOCYTE, 'H1: histiocyte'),
	# 	(UNKNOWN, 'Unknown intact cell'),
	# 	(ARTIFACT, 'Artifact (crush or other)')
	# ]

	class Meta:
		verbose_name_plural = 'Cells'

	def __str__(self):
		"""Return a string representation of the model."""
		return str(self.cid)

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
