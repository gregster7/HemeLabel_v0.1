# Generated by Django 3.1.3 on 2021-02-18 21:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('labeller', '0034_auto_20210109_2014'),
    ]

    operations = [
        migrations.AddField(
            model_name='region',
            name='all_wc_located',
            field=models.BooleanField(default=False),
        ),
    ]