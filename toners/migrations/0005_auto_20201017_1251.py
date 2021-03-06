# Generated by Django 3.0.7 on 2020-10-17 12:51

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('repairs', '0019_auto_20201017_1251'),
        ('toners', '0004_auto_20200902_1004'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='namesoftonercartridge',
            options={'ordering': ['name'], 'verbose_name': 'Тип картриджа', 'verbose_name_plural': 'Типы картриджей'},
        ),
        migrations.AlterModelOptions(
            name='statuses',
            options={'ordering': ['name'], 'verbose_name': 'Статус', 'verbose_name_plural': 'Статусы'},
        ),
        migrations.AlterModelOptions(
            name='tonercartridges',
            options={'ordering': ['prefix', 'number'], 'verbose_name': 'Картридж', 'verbose_name_plural': 'Картриджи'},
        ),
        migrations.AlterModelOptions(
            name='tonercartridgeslog',
            options={'ordering': ['-pk'], 'verbose_name': 'Журнал перемещения картриджей', 'verbose_name_plural': 'Журнал перемещения картриджей'},
        ),
        migrations.AddField(
            model_name='tonercartridgeslog',
            name='equipment',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='repairs.Equipment', verbose_name='Принтер'),
        ),
        migrations.AlterField(
            model_name='namesoftonercartridge',
            name='printers',
            field=models.ManyToManyField(to='repairs.Equipment', verbose_name='Принтеры'),
        ),
        migrations.AlterField(
            model_name='tonercartridges',
            name='names',
            field=models.ManyToManyField(to='toners.NamesOfTonerCartridge', verbose_name='Типы картриджей'),
        ),
        migrations.AlterField(
            model_name='tonercartridges',
            name='owner',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='repairs.Departments', verbose_name='Владелец'),
        ),
        migrations.AlterField(
            model_name='tonercartridgeslog',
            name='date',
            field=models.DateTimeField(verbose_name='Дата'),
        ),
        migrations.AlterField(
            model_name='tonercartridgeslog',
            name='location',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='repairs.Locations', verbose_name='Расположение'),
        ),
        migrations.AlterField(
            model_name='tonercartridgeslog',
            name='note',
            field=models.TextField(blank=True, verbose_name='Примечание'),
        ),
        migrations.AlterField(
            model_name='tonercartridgeslog',
            name='status',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='toners.Statuses', verbose_name='Статус'),
        ),
        migrations.AlterField(
            model_name='tonercartridgeslog',
            name='toner_cartridge',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='toners.TonerCartridges', verbose_name='Картридж'),
        ),
    ]
