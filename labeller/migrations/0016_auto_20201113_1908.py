# Generated by Django 3.1.3 on 2020-11-13 19:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('labeller', '0015_auto_20201113_1908'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='cell',
            options={'verbose_name_plural': models.BooleanField(default=False)},
        ),
        migrations.AlterModelOptions(
            name='patient',
            options={'verbose_name_plural': models.BooleanField(default=False)},
        ),
        migrations.AlterModelOptions(
            name='region',
            options={'verbose_name_plural': models.BooleanField(default=False)},
        ),
        migrations.AlterModelOptions(
            name='slide',
            options={'verbose_name_plural': models.BooleanField(default=False)},
        ),
    ]