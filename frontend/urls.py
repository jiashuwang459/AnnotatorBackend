
from django.urls import path
from .views import index

urlpatterns = [
    path('', index),
    path('annotator', index),
    path('dictionary', index)
]
