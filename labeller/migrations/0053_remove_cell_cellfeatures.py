# Generated by Django 3.1.3 on 2021-10-26 22:21

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('labeller', '0052_auto_20211026_2216'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='cell',
            name='cellFeatures',
        ),
    ]