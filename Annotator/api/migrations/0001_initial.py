# Generated by Django 3.2.5 on 2021-07-23 05:54

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Entry',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('owner', models.CharField(max_length=50)),
                ('traditional', models.CharField(default='', max_length=20)),
                ('simplified', models.CharField(max_length=20)),
                ('pinyin', models.CharField(max_length=100)),
                ('english', models.CharField(default='', max_length=200)),
                ('createdAt', models.DateTimeField(auto_now_add=True)),
                ('updatedAt', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='Memory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.IntegerField(unique=True)),
                ('createdAt', models.DateTimeField(auto_now_add=True)),
                ('updatedAt', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='MemoryFragment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('pinyin', models.CharField(max_length=10)),
                ('cchar', models.CharField(max_length=10)),
                ('createdAt', models.DateTimeField(auto_now_add=True)),
                ('updatedAt', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'app_version',
            },
        ),
        migrations.AddConstraint(
            model_name='memoryfragment',
            constraint=models.UniqueConstraint(fields=('pinyin', 'cchar'), name='unique pair'),
        ),
        migrations.AddField(
            model_name='memory',
            name='fragments',
            field=models.ManyToManyField(to='api.MemoryFragment'),
        ),
    ]
