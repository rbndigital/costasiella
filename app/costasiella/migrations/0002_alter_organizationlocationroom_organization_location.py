# Generated by Django 3.2.12 on 2022-02-28 15:21

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('costasiella', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='organizationlocationroom',
            name='organization_location',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='rooms', to='costasiella.organizationlocation'),
        ),
    ]
