# Generated by Django 3.1.3 on 2020-11-10 19:14

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Slide',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('sid', models.IntegerField()),
                ('date_added', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='Patient',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('pid', models.IntegerField()),
                ('date_added', models.DateTimeField(auto_now_add=True)),
                ('slides', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, to='labeller.slide')),
            ],
        ),
    ]