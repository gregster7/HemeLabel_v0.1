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
		verbose_name_plural = 'patients'

	def __str__(self):
		"""Return a string representation of the model."""
		return self.name


class Slide (models.Model):
	"""A slide comes from a single patient, but can have many regions"""
	sid = models.IntegerField(unique=True)
	patient = models.ForeignKey('Patient', on_delete=models.RESTRICT)
	date_added = models.DateTimeField(auto_now_add=True)

	class Meta:
		verbose_name_plural = 'slides'

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
		verbose_name_plural = 'regions'

	def __str__(self):
		"""Return a string representation of the model."""
		return str(self.rid)

class Cell(models.Model):
	"""A cell comes from a region and has a label"""
	cid = models.IntegerField(unique=True)
	date_added = models.DateTimeField(auto_now_add=True)	
	region = models.ForeignKey('Region', on_delete=models.RESTRICT)
	image = models.ImageField(upload_to='cells')
	label = models.CharField(max_length=200, default='unlabelled')

	class Meta:
		verbose_name_plural = 'cells'

	def __str__(self):
		"""Return a string representation of the model."""
		return str(self.cid) + ':' + self.label

	def show_image(self):
		"""Return image of cell"""
		if self.image:
			return mark_safe('<img src="{}"/>'.format(self.image.url))
		return ""

# class CellImage (model.Model):
# 	"""An image of a single cell with annotation"""
# 	cid = models.IntegerField()
# 	cell_label = models.CharField(max_length=200)
# 	image = models.ImageField()
