from django.db import models
from django.conf import settings
from math import ceil
from math import floor

from django.contrib.auth.models import User 


User._meta.get_field('email')._unique = True 

class Diagnosis(models.Model):
	name = models.CharField(max_length=64, blank=True, null=True)
	abbreviation = models.CharField(max_length=8, blank=True, null=True)

# This is not currently in use
class CellFeature(models.Model):
	featureName = models.CharField(max_length=64, blank=True, null=True)
	featureAbbreviation = models.CharField(max_length=64, blank=True, null=True)
	def __str__(self):
		return self.featureName
	

class Patient (models.Model):
	"""An individual patient, who can have many slides"""
	created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
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



class Slide (models.Model):
	"""A slide comes from a single patient, but can have many regions"""
	created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
	sid = models.IntegerField(unique=True)
	patient = models.ForeignKey('Patient', on_delete=models.RESTRICT, blank=True, null=True)
	date_added = models.DateTimeField(auto_now_add=True)
	dzi_path = models.FileField(upload_to="slides", max_length=300, blank=True, null=True)
	svs_path = models.FileField(upload_to="slides", max_length=300, blank=True, null=True)
	diagnosis = models.ManyToManyField('Diagnosis', related_name='slides')

	# Store filename as name
	name = models.CharField(max_length=200, blank=True, null=True)
	primary_diagnosis = models.CharField(max_length=200, blank=True, null=True)
	notes = models.CharField(max_length=3000, blank=True, null=True)


	fDx = models.CharField(max_length=1000, blank=True, null=True)
	dxCom =models.CharField(max_length=3000, blank=True, null=True)
	clinDx = models.CharField(max_length=3000, blank=True, null=True)	
	addCom = models.CharField(max_length=10000, blank=True, null=True)	
	micro = models.CharField(max_length=10000, blank=True, null=True)
	scanner	= models.CharField(max_length=100, blank=True, null=True)
	magnification = models.IntegerField(blank=True, null=True)

	# https://stackoverflow.com/questions/27440861/django-model-multiplechoice
	TISSUE_CHOICES = (
		('a', 'Bone Marrow Aspirate'),
        ('b', 'Peripheral Blood'),
        ('c', 'Bone Marrow Biopsy'),
        ('d', 'Bone Marrow IHC or Special Stain'),
        ('e', 'Touch Prep'),
        ('f', 'Bone Marrow Clot'),
        ('g', 'Body Fluid'),
    )

	tissue = models.CharField(max_length=1, choices=TISSUE_CHOICES, blank=True, null=True)

	userNotes = models.CharField(max_length=10000, blank=True, null=True)
	
	# Likely a UUID, but since not guaraneed, deglared as a CharField
	fakeCaseNumber = models.CharField(max_length=32, blank=True, null=True)

	class Meta:
		verbose_name_plural = 'Slides'

	def __str__(self):
		"""Return a string representation of the model."""
		# if (self.name == None):
		# 	return str(str(self.id) + " " + str(self.sid))
		# else:
		# 	return str(str(self.id) + " " + self.name + " " + str(self.sid))
		try:
			return str(str(self.id) + " " + str(self.sid) + " " + self.name)
		except:
			return str(str(self.id) + " " + str(self.sid))

class Region(models.Model):
	"""A region comes from a slide and can have multiple cells"""
	created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
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
	notes = models.CharField(max_length=10000, blank=True, null=True)


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


class Project(models.Model):
	created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
	name = models.CharField(max_length=200, default="No Name")
	date_added = models.DateTimeField(auto_now_add=True)
	notes = models.CharField(max_length=10000, blank=True, null=True)

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


# Each Cell Classification has one classification, one reviewer and one associated NewCell object.
class CellType(models.Model):
	cell_type = models.CharField(max_length=50, default = 'UL')
	cell = models.ForeignKey('Cell', on_delete=models.CASCADE)
	user = models.ForeignKey(User, on_delete=models.CASCADE)
	notes = models.CharField(max_length=10000, blank=True, null=True)

	def __str__(self):
		"""Return a string representation of the model."""
		return str(str(self.id) + " " + self.cell_type + " " + str(self.cell.cid) + " " + str(self.user))


class Cell(models.Model):

	"""A cell comes from a region and has a label"""
	readonly_fields=('id','cell_type') # I don't think this line of code does anything
	created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
	cid = models.IntegerField(unique=True)
	name = models.CharField(max_length=200, blank=True, null=True)
	date_added = models.DateTimeField(auto_now_add=True)	
	region = models.ForeignKey('Region', on_delete=models.RESTRICT, blank=True, null=True)
	project = models.ForeignKey('Project', on_delete=models.RESTRICT, blank=True, null=True)
	image = models.ImageField(upload_to='cells')
	notes = models.CharField(max_length=10000, blank=True, null=True)

	"""centers are relative to region if there is a region, if not they are relative to the slide"""
	center_x = models.FloatField(default=-1)
	center_y = models.FloatField(default=-1)

	center_x_slide = models.FloatField(default=-1)
	center_y_slide = models.FloatField(default=-1)

	def getCellFeatureForm(self):
		cellFeatureForm = CellFeatureForm(instance=self)
		return cellFeatureForm

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

	### THIS IS OLD AN NO LONGER IN USE *** WARNING ***
	cell_type = models.CharField(max_length=50, default = 'UL')

 	
	cellFeatures = models.ManyToManyField('CellFeature', blank=True)

	
	class Meta:
		verbose_name_plural = 'Cells'

		
	def asdict(self):
		return {'pk': self.pk, 'cid': str(self.cid), 'cell_type (OLD NO LONGER IN USE)': self.cell_type, 'cell_name': self.name, 'region': self.region, 'project': self.project, 'center_x': self.center_x, 'center_y': self.center_y, 'width': self.width, 'height': self.height}

	def __str__(self):
		"""Return a string representation of the model."""
		return str(str(self.id) + " " + str(self.cid))


