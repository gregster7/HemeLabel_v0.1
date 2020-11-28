# Generated by Django 3.1.3 on 2020-11-19 23:43

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('labeller', '0023_auto_20201117_1937'),
    ]

    operations = [
        migrations.AddField(
            model_name='cell',
            name='cell_type',
            field=models.CharField(choices=[('M1', 'blast (1)'), ('M2', 'myelocyte (2)'), ('M3', 'promyelocyte (3)'), ('M4', 'm'), ('M5', 'b'), ('M6', 's'), ('E1', ''), ('E2', ''), ('B1', ''), ('B2', ''), ('M1', ''), ('M2', ''), ('L0', ''), ('L1', ''), ('L2', ''), ('L3', ''), ('L4', ''), ('E1', ''), ('E2', ''), ('E3', ''), ('E4', ''), ('E5', ''), ('E6', ''), ('U1', ''), ('U2', ''), ('U3', ''), ('U4', ''), ('UL', '')], default='UL', max_length=2),
        ),
        migrations.AlterField(
            model_name='cell',
            name='cid',
            field=models.IntegerField(unique=True),
        ),
        migrations.AlterField(
            model_name='cell',
            name='image',
            field=models.ImageField(upload_to='cells'),
        ),
        migrations.AlterField(
            model_name='cell',
            name='region',
            field=models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, to='labeller.region'),
        ),
    ]