from django.urls import path, include

from api.views.memoryView import CleanMemoryView, CreateMemoryView, DestroyMemoryView, FetchMemoryView, FragmentView, MemoryView
from api.views.views import  getEntry, getTradEntry, getNovel, getNovelsAndChapters, AnnotationView, BlacklistEntryView, ReloadCEDictView

urlpatterns = [
    path('entry', getEntry),
    path('tradentry', getTradEntry),
    path('novel', getNovel),
    path('novel/list', getNovelsAndChapters),
    # path('entry/clear', clearCache),
    # path('reload', ReloadAllView.as_view()),
    # path('entry/create', CreateEntryView.as_view()),
    # path('entry/reload', ReloadEntryView.as_view()),
    # path('count', CountEntryView.as_view()),
    path('annotate', AnnotationView.as_view()),
    # path('update/<pk>', UpdateEntryView.as_view()),
    path('blacklist', BlacklistEntryView.as_view()),
    # path('blacklist/reload', ReloadBlacklistEntryView.as_view()),
    # path('custom/reload', ReloadCustomEntryView.as_view()),
    path('memory', MemoryView.as_view()),
    path('memory/fetch', FetchMemoryView.as_view()),
    path('memory/save', CreateMemoryView.as_view()),
    path('memory/clean', CleanMemoryView.as_view()),
    path('memory/<code>', DestroyMemoryView.as_view()),
    path('fragments', FragmentView.as_view()),
    
    path('reloadcedict', ReloadCEDictView.as_view()),
    # path('cache', CacheView.as_view()),
    # path('fetch' , manage_item, name="single_item")
    # path('test', TestView.as_view()),
    # path('priority', PriorityView.as_view()),
]
