from django.db import models

# Create your models here.

class Patient (model.Model):
	"""An individual patient, who can have many slides"""
	pid = models.IntegerField()
	slides = model.ForeignKey('Patient')[]
	date_added = models.DateTimeField(auto_now_add=True)

class Slide (model.Model):
	"""A slide comes from a single patient, but can have many regions"""
	sid = models.IntegerField()
	patient = model.ForeignKey('Patient')
	date_added = models.DateTimeField(auto_now_add=True)
	


# class CellImage (model.Model):
# 	"""An image of a single cell with annotation"""
# 	cid = models.IntegerField()
# 	cell_label = models.CharField(max_length=200)
# 	image = models.ImageField()
