# Generated by Django 3.0.8 on 2020-10-16 10:20

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('costasiella', '0042_scheduleevent'),
    ]

    operations = [
        migrations.AddField(
            model_name='scheduleitem',
            name='schedule_event',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='costasiella.ScheduleEvent'),
        ),
    ]
