# Generated by Django 3.1.3 on 2020-11-10 19:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('labeller', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='patient',
            name='name',
            field=models.CharField(default='', max_length=200),
            preserve_default=False,
        ),
    ]