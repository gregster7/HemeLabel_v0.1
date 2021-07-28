# Generated by Django 3.1.3 on 2020-12-29 22:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('labeller', '0031_auto_20201229_1906'),
    ]

    operations = [
        migrations.AddField(
            model_name='region',
            name='height',
            field=models.FloatField(default=-1),
        ),
        migrations.AddField(
            model_name='region',
            name='width',
            field=models.FloatField(default=-1),
        ),
        migrations.AlterField(
            model_name='region',
            name='x',
            field=models.FloatField(default=-1),
        ),
        migrations.AlterField(
            model_name='region',
            name='y',
            field=models.FloatField(default=-1),
        ),
        migrations.AlterField(
            model_name='slide',
            name='dzi_path',
            field=models.FileField(max_length=300, upload_to='slides'),
        ),
        migrations.AlterField(
            model_name='slide',
            name='svs_path',
            field=models.FileField(max_length=300, upload_to='slides'),
        ),
    ]