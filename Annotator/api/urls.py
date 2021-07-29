from django.urls import path, include
from .views import AnnotationView, BlacklistEntryView, CountEntryView, CreateMemoryView, ReloadBlacklistEntryView, UpdateEntryView, EntryView, CreateEntryView, FragmentView, MemoryView, ReloadEntryView, FetchMemoryView

urlpatterns = [
    path('home', EntryView.as_view()),
    path('create', CreateEntryView.as_view()),
    path('annotate', AnnotationView.as_view()),
    path('reload', ReloadEntryView.as_view()),
    path('count', CountEntryView.as_view()),
    path('memory', MemoryView.as_view()),
    path('memory/fetch', FetchMemoryView.as_view()),
    path('memory/save', CreateMemoryView.as_view()),
    path('fragments', FragmentView.as_view()),
    path('update/<pk>', UpdateEntryView.as_view()),
    path('blacklist', BlacklistEntryView.as_view()),
    path('blacklist/reload', ReloadBlacklistEntryView.as_view()),
]
