import json
# from typing_extensions import Required
from django.db import models
import string

# Create your models here.


# def isUnique(traditional, simplified, pinyin, english):
#     return Entry.objects.filter(traditional=traditional, simplified=simplified, pinyin=pinyin, english=english).count() == 0


class Entry(models.Model):
    owner = models.CharField(max_length=50)
    traditional = models.CharField(max_length=20, default="")
    simplified = models.CharField(max_length=20, null=False)
    pinyin = models.CharField(max_length=100, null=False)
    english = models.CharField(max_length=200, default="")
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    priority = models.IntegerField(default=999)


class BlacklistEntry(models.Model):
    owner = models.CharField(max_length=50)
    traditional = models.CharField(max_length=20, default="")
    simplified = models.CharField(max_length=20, null=False)
    pinyin = models.CharField(max_length=100, null=False)
    english = models.CharField(max_length=200, default="")
    reason = models.CharField(max_length=250, default="")
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)


class Fragment(models.Model):
    pinyin = models.CharField(max_length=10)
    cchar = models.CharField(max_length=10)
    createdAt = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'app_version'
        constraints = [
            models.UniqueConstraint(
                fields=['pinyin', 'cchar'], name='unique pair')
        ]


class Memory(models.Model):
    code = models.IntegerField(unique=True)
    fragments = models.ManyToManyField(Fragment)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)


# class PhraseEntry():
#     cchars = models.ManyToManyField(Fragment)
#     english = models.CharField(max_length=200, default="")

class ChineseEntry(dict):
    def __init__(self, pinyin, cchar):
        dict.__init__(self, pinyin=pinyin, cchar=cchar)

    def __str__(self):
        return f"ChineseEntry({self['pinyin']},{self['cchar']},{self['english']})"

    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__)

class PhraseEntry(dict):
    def __init__(self, cchars, english=""):
        dict.__init__(self, cchars=cchars, english=english)

    def __str__(self):
        return f"PhraseEntry({self['cchars']},{self['english']})"

    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__)
