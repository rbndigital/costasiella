# Generated by Django 3.0.8 on 2020-11-09 16:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('costasiella', '0046_auto_20201105_2211'),
    ]

    operations = [
        migrations.AlterField(
            model_name='scheduleeventticket',
            name='deletable',
            field=models.BooleanField(default=True),
        ),
    ]
