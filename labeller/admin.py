from django.contrib import admin

# Register your models here.
from labeller.models import Patient, Slide, Region, Cell, Project, CellFeature

admin.site.register(Patient)
admin.site.register(Slide)
admin.site.register(Region)
admin.site.register(Cell)
admin.site.register(Project)
admin.site.register(CellFeature)