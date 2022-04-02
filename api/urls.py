from django.urls import path, include
from .views import AnnotationView, BlacklistEntryView, CleanMemoryView, CountEntryView, CreateMemoryView, DestroyMemoryView, PriorityView, ReloadAllView, ReloadBlacklistEntryView, ReloadCustomEntryView, TestView, UpdateEntryView, EntryView, CreateEntryView, FragmentView, MemoryView, ReloadEntryView, FetchMemoryView

urlpatterns = [
    path('entry', EntryView.as_view()),
    path('entry/create', CreateEntryView.as_view()),
    path('entry/reload', ReloadEntryView.as_view()),
    path('count', CountEntryView.as_view()),
    path('annotate', AnnotationView.as_view()),
    path('memory', MemoryView.as_view()),
    path('memory/fetch', FetchMemoryView.as_view()),
    path('memory/save', CreateMemoryView.as_view()),
    path('memory/clean', CleanMemoryView.as_view()),
    path('memory/<code>', DestroyMemoryView.as_view()),
    path('fragments', FragmentView.as_view()),
    path('update/<pk>', UpdateEntryView.as_view()),
    path('blacklist', BlacklistEntryView.as_view()),
    path('blacklist/reload', ReloadBlacklistEntryView.as_view()),
    path('custom/reload', ReloadCustomEntryView.as_view()),
    path('reload', ReloadAllView.as_view()),
    path('test', TestView.as_view()),
    path('priority', PriorityView.as_view()),
]
