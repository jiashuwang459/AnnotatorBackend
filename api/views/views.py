import json
import os
import re
from collections import namedtuple
from pprint import pprint
import timeit

from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT

from django.db.models import Q, query
from django.db.models.manager import BaseManager
from django.http import HttpResponse
from django.shortcuts import render
from rest_framework import filters, generics, serializers, status
from rest_framework.exceptions import bad_request
from rest_framework.response import Response
from rest_framework.views import APIView
from api.EntryManager import BLACKLIST, CUSTOM, DICT, PRIORITY, EntryManager


from api.models import (BlacklistEntry, ChineseEntry, Entry, Fragment, Memory,
                        PhraseEntry)
from api.serializers import (AnnotationSerializer, BlacklistEntrySerializer,
                             ChineseEntrySerializer, CleanMemorySerializer, CreateEntrySerializer,
                             EntrySerializer, FragmentSerializer,
                             MemoryCreateSerializer, MemorySerializer,
                             PhraseEntrySerializer, ReloadEntrySerializer,
                             UpdateEntrySerializer)
from api.Trie import Trie
from api.utils import (DEFAULT_OWNER, DEFAULT_PRIORITY, MAIN_PRIORITY, MAX_PRIORITY, NBSP, SESSIONS,
                       OwnerOrDefault, USER_PRIORITY, isChinese, loadCustomEntries,
                       loadDefaultBlacklist, loadDefaultDictionary, parsePinyin,
                       reloadCEDict, updateBlacklistPriorities,
                       updateCustomPriorities, updateDefaultPriorities)

# CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

# import redis
import json
from django.conf import settings
# import redis
from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response
from django.core.cache import cache

# cache = redis.StrictRedis(host=settings.REDIS_HOST,
#                                   port=settings.REDIS_PORT, db=0)

# @api_view(['POST'])
# def manage_item(request, *args, **kwargs):
#     # if request.method == 'GET':
#     data = request.data
#     if data['key']:
#         value = cache.get(data['key'])
#         if value:
#             response = {
#                 'key': data['key'],
#                 'value': value,
#                 'msg': 'success'
#             }
#             return Response(response, status=200)
#         else:
#             response = {
#                 'key': data['key'],
#                 'value': None,
#                 'msg': 'Not found'
#             }
#             return Response(response, status=404)
#     # return Response(response, status=405)


class BlacklistEntryView(generics.ListCreateAPIView):
    queryset = BlacklistEntry.objects.all()
    serializer_class = BlacklistEntrySerializer


# class EntryView(generics.ListAPIView):
#     # class DynamicSearchFilter(filters.SearchFilter):
#     #     def get_search_fields(self, view, request):
#     #         return request.GET.getlist('search_fields', ['simplified', 'traditional', 'english'])

#     # search_fields = ['simplified', 'traditional']
#     # filter_backends = (filters.SearchFilter, )
#     # filter_backends = (DynamicSearchFilter, )
#     serializer_class = EntrySerializer

@api_view(['GET'])
def getEntry(request):
    if not request.session.exists(request.session.session_key):
        request.session.create()

    phrase = request.query_params.get('phrase')
    if phrase is None:
        return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)

    # TODO: DNE check
    # memory = Memory.objects.get(code=code)
    # data = {
    #     "code": code,
    #     "fragment": FragmentSerializer(Memory.objects.get(code=code).fragments.all(), many=True).data
    # }

    entries = EntryManager.getDict(phrase)

    if entries is None:
        return Response({'Not Found': f'phrase {phrase} not found'}, status=status.HTTP_404_NOT_FOUND)

    responseData = [EntrySerializer(
        entry).data for entry in entries if entry['priority'] < MAX_PRIORITY]
    return Response(responseData, status=status.HTTP_200_OK)

    # def get_queryset(self):
    #     """
    #     Restricts the entries fetched by the user
    #     by filtering against a `phrase` query parameter in the URL.

    #     Ex. http://127.0.0.1:8000/api/home?phrase=您

    #     If no phrase is specified, then an empty list is returned.
    #     """
    #     queryset = Entry.objects.all()
    #     phrase = self.request.query_params.get('phrase')
    #     # individualChars = self.request.query_params.get('individualChars')
    #     if phrase is not None:
    #         queryset = queryset.filter(
    #             Q(simplified=phrase) | Q(traditional=phrase)).order_by("priority")
    #         # if individualChars is not None:
    #         #     # queryset = None
    #         #     unionset = None
    #         #     item = queryset.first()
    #         #     for cchar in phrase:
    #         #         subset = queryset.filter(
    #         #             Q(simplified=cchar) | Q(traditional=cchar)).order_by("priority")
    #         #     unionset = subset if unionset is None else unionset.union(subset)
    #         #     return unionset

    #         return queryset
    #     if self.request.query_params.get('search') is not None:
    #         return queryset

    #     return Entry.objects.filter(id=0)


# class CreateEntryView(APIView):
#     serializer_class = CreateEntrySerializer

#     def post(self, request, format=None):
#         if not self.request.session.exists(self.request.session.session_key):
#             self.request.session.create()

#         serializer = self.serializer_class(data=request.data, partial=True)
#         if serializer.is_valid():
#             traditional = serializer.data.get('traditional')
#             simplified = serializer.data.get('simplified')
#             pinyin = serializer.data.get('pinyin')
#             english = serializer.data.get('english')
#             owner = serializer.data.get('owner')
#             priority = serializer.data.get('priority')
#             if priority is None:
#                 priority = USER_PRIORITY
#             # owner = DEFAULT_OWNER
#             # if SESSIONS:
#             # owner = self.request.session.session_key

#             # Fetch/Create owner's dictionary
#             # queryset = Entry.objects.filter(owner=owner)
#             # if not queryset.exists():
#             #     # loadDefaultDictionary()
#             #     queryset = Entry.objects.filter(owner=owner)
#             #     if not queryset.exists():
#             #         return Response({'Bad Request': 'New user session, but unable to create default dictionary entries'}, status=status.HTTP_400_BAD_REQUEST)

#             # if(traditional == ""):
#             #     # TODO: fetch traditional from dictionary
#             #     # traditional = ...
#             #     pass

#             queryset = Entry.objects.filter(traditional=traditional,
#                                             simplified=simplified, pinyin=pinyin)
#             if(queryset.exists()):
#                 return Response({'Bad Request': 'Entry already exists', 'data': EntrySerializer(queryset, many=True).data}, status=status.HTTP_400_BAD_REQUEST)

#             else:
#                 entry = Entry(owner=owner, traditional=traditional,
#                               simplified=simplified, pinyin=pinyin, english=english, priority=priority)
#                 entry.save()

#             return Response(EntrySerializer(entry).data, status=status.HTTP_200_OK)

#         return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)


# class UpdateEntryView(generics.RetrieveUpdateDestroyAPIView):
#     # queryset = Entry.objects.all()
#     queryset = Entry.objects.all()
#     serializer_class = UpdateEntrySerializer
    # lookup_field = 'simplified'

    # def put(self, request, format=None):
    #     if not self.request.session.exists(self.request.session.session_key):
    #         self.request.session.create()

    #     serializer = self.serializer_class(data=request.data, partial=True)
    #     if serializer.is_valid():
    #         traditional = serializer.data.get('traditional')
    #         simplified = serializer.data.get('simplified')
    #         pinyin = serializer.data.get('pinyin')
    #         english = serializer.data.get('english')
    #         owner = serializer.data.get('owner')
    #         priority = serializer.data.get('priority')
    #         if priority is None:
    #             priority = 999
    #         # owner = DEFAULT_OWNER
    #         # if SESSIONS:
    #         # owner = self.request.session.session_key

    #         # Fetch/Create owner's dictionary
    #         # queryset = Entry.objects.filter(owner=owner)
    #         # if not queryset.exists():
    #         #     # loadDefaultDictionary()
    #         #     queryset = Entry.objects.filter(owner=owner)
    #         #     if not queryset.exists():
    #         #         return Response({'Bad Request': 'New user session, but unable to create default dictionary entries'}, status=status.HTTP_400_BAD_REQUEST)

    #         # if(traditional == ""):
    #         #     # TODO: fetch traditional from dictionary
    #         #     # traditional = ...
    #         #     pass

    #         queryset = Entry.objects.filter(owner=owner, traditional=traditional,
    #                                         simplified=simplified, pinyin=pinyin)
    #         if(queryset.exists()):
    #             res = EntrySerializer(queryset, many=True).data
    #             res['Bad Request'] = 'Entry already exists'
    #             Response(res, status=status.HTTP_400_BAD_REQUEST)
    #         else:
    #             entry = Entry(owner=owner, traditional=traditional,
    #                           simplified=simplified, pinyin=pinyin, english=english, priority=priority)
    #             entry.save()

    #         return Response(EntrySerializer(entry).data, status=status.HTTP_200_OK)

    #     return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)

# @api_view(['DELETE'])
# def clearCache(request):
#     # EntryView.queryset.delete()
#     cache.clear()
#     Trie.clearTries()
#     return Response({'OK': 'Deleted everything!!...', 'count': len([key for key in cache.iter_keys("*")])}, status=status.HTTP_200_OK)

# class ReloadEntryView(APIView):

#     def post(self, request, format=None):
#         if not self.request.session.exists(self.request.session.session_key):
#             self.request.session.create()

#         # serializer = self.serializer_class(data=request.data)
#         # if serializer.is_valid():
#         owner = DEFAULT_OWNER
#         # if(request.data['owner']):
#         #     owner = request.data.owner

#         # if SESSIONS:
#         #     owner = self.request.session.session_key

#         # Fetch/Create owner's dictionary
#         # queryset = Entry.objects.filter(owner=owner).delete()
#         # queryset = Entry.objects.filter(owner=owner)
#         print("deleted")
#         # if queryset.exists():
#         #     return Response({'Bad Request': 'Unable to delete entries for current owner'}, status=status.HTTP_400_BAD_REQUEST)
#         cache.clear()
#         loadDefaultDictionary()
#         print("created new entries")
#         # queryset = Entry.objects.filter(owner=owner)
#         # if not queryset.exists():
#         #     return Response({'Bad Request': 'Deleted entries but unable to create default dictionary entries'}, status=status.HTTP_400_BAD_REQUEST)

#         Trie.clearTries()
#         return Response({'OK': 'Reloaded default dictionary entries', 'count': len(cache.iter_keys("*"))}, status=status.HTTP_200_OK)

#     def delete(self, request, format=None):
#         # EntryView.queryset.delete()

#         cache.clear()

#         Trie.clearTries()
#         return Response({'OK': 'Deleted everything!!...'}, status=status.HTTP_200_OK)


# class ReloadBlacklistEntryView(APIView):

#     def post(self, request, format=None):
#         if not self.request.session.exists(self.request.session.session_key):
#             self.request.session.create()

#         owner = DEFAULT_OWNER

#         # Fetch/Create owner's dictionary
#         queryset = BlacklistEntry.objects.filter(owner=owner).delete()
#         queryset = BlacklistEntry.objects.filter(owner=owner)
#         print("deleted")
#         if queryset.exists():
#             return Response({'Bad Request': 'Unable to delete Blacklist Entries for current owner', 'owner': owner, }, status=status.HTTP_400_BAD_REQUEST)
#         # if(owner == DEFAULT_OWNER):
#         loadDefaultBlacklist()
#         updateBlacklistPriorities()
#         print("created new Blacklist entries")
#         queryset = BlacklistEntry.objects.filter(owner=owner)
#         if not queryset.exists():
#             return Response({'Bad Request': 'Deleted blacklist entries but unable to create default blacklist entries'}, status=status.HTTP_400_BAD_REQUEST)

#         Trie.clearTries()
#         return Response({'OK': 'Reloaded default blacklist entries', 'count': len(queryset)}, status=status.HTTP_200_OK)
#         # else:
#         #     return Response({'Bad Request': 'You must specify the "owner" in the body of your request. If you want to reload the default entries, your body must be {"owner"="defualt"} '}, status=status.HTTP_400_BAD_REQUEST)

#     def delete(self, request, format=None):
#         EntryView.queryset.delete()

#         return Response({'OK': 'Deleted everything!!...'}, status=status.HTTP_200_OK)


# class CountEntryView(APIView):

#     serializer_class = ReloadEntrySerializer

#     def get(self, request, format=None):
#         if not self.request.session.exists(self.request.session.session_key):
#             self.request.session.create()

#         owner = DEFAULT_OWNER
#         if 'owner' in request.data.keys():
#             owner = request.data['owner']

#         # if SESSIONS:
#         #     owner = self.request.session.session_key

#         # Fetch/Create owner's dictionary
#         queryset = Entry.objects.filter(owner=owner)

#         return Response({'OK': 'able to fetch default dict', 'count': len(queryset)}, status=status.HTTP_200_OK)


class AnnotationView(APIView):
    queryset = Entry.objects.all()
    serializer_class = AnnotationSerializer

    def split(self, lines, separator):
        lst = list()
        for line in lines:
            verses = line.split(separator)
            for i in range(len(verses) - 1):
                verses[i] += separator

            lst.extend(verses)

        return lst

    def annotate(self, owner: str, text: str):
        print("===============================")
        print(text)
        # TODO: return only simplified?
        owner = "default"
        trie = Trie.getTrie(owner)
        if not trie.contains('你'):
            # blacklistQuerySet = BlacklistEntry.objects.filter(OwnerOrDefault(owner)).values_list(
            #     'simplified', 'traditional')
            # blacklist = [
            #     item for sublist in blacklistQuerySet for item in sublist]
            # print(blacklist)
            # entryQuerySet = Entry.objects.filter(OwnerOrDefault(owner), Q(priority__lt=MAX_PRIORITY)).values_list(
            #     'simplified', 'traditional')

            test = EntryManager.get("你")

            if not test:
                # print("Annotate, but no cache, so reload cache")

                # loadDefaultDictionary()
                # updateDefaultPriorities()

                # print("created new default")

                # loadCustomEntries()
                # updateCustomPriorities()

                # print("created new custom")

                # loadDefaultBlacklist()
                # updateBlacklistPriorities()

                # print("created new blacklist")
                EntryManager.reload()

            Trie.loadTrie()
            # words = EntryManager.getValidKeyList()

            # print(len(words))
            # trie = Trie.createTrie(owner, words)

        print(trie)

        fragments = [text]
        separators = "。：？,、“”，）（ )(?:.,\"\'\n"
        for separator in separators:
            fragments = self.split(fragments, separator)

        print(fragments)

        lst = list()
        for fragment in fragments:
            remaining = fragment
            # print(remaining)
            while remaining:
                firstCChar = 0
                # print("remaininglength: " + str(len(remaining)))
                # print(f"remaininglength: {firstCChar < len(remaining)}")
                # print(f"remaininglength: {firstCChar}<{len(remaining)}")
                while firstCChar < len(remaining) and not isChinese(remaining[firstCChar]):
                    firstCChar += 1
                # print("++++++++++++++++++++++++")
                # print("remainingStart: " + remaining)
                # print("index of first chinese: " + str(firstCChar))

                if firstCChar != 0:
                    # print("adding:" + remaining[:firstCChar])
                    lst.append(
                        ChineseEntry(NBSP, remaining[:firstCChar])
                    )

                    # remove non chinese cahrs
                    remaining = remaining[firstCChar:]
                    # print("remainingAfterRemoval: '" + remaining + "'")
                else:
                    # findBest is simply greedy algo, find the longest
                    phrase = trie.findBest(remaining)
                    # print("phrase: '" + phrase + "'")
                    if not phrase:
                        # print("Unable to find best phrase from '" + remaining + "'.")
                        return []  # tentatively return cause error
                    else:
                        # found something in trie, remove phrase from remaining
                        remaining = remaining[len(phrase):]

                        # TODO: fetch pinyin
                        # entry = ownerQueryset.filter(
                        #     Q(simplified=phrase)
                        #     | Q(traditional=phrase), Q(priority__lte=MAX_PRIORITY)).order_by("priority").values_list("pinyin", "english").first()
                        entries = EntryManager.get(phrase)
                        if(entries):
                            entry = entries[0]
                            # print("entry: '" +  + "'")
                            # pprint(entry)

                            # print(pinyins.query)

                            # Note: entry here is a tuple, (pinyin, english)
                            # pinyin = entry[0].split(" ")
                            # english = entry[1]

                            pinyin = entry['pinyin'].split(" ")
                            # english = entry['english']

                            # print(pinyin)
                            # pinyin = dict.getPinYin(self.phrase).split(" ")
                            if len(phrase) != len(pinyin):
                                print(
                                    "pinyin and phrase have different lengths O.o")
                                print(f"phrase: {phrase}")
                                print(f"pinyin: {pinyin}")
                                raise "pinyin and phrase have different lengths O.o"

                            # push all phrases
                            phraselst = []
                            for i in range(len(phrase)):
                                phraselst.append(
                                    ChineseEntry(parsePinyin(
                                        pinyin[i]), phrase[i])
                                )
                            lst.append(PhraseEntry(phraselst))
                        else:
                            print(f"Unable to find entry {phrase}")
        return lst

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            text = serializer.data.get('text')
            # owner = DEFAULT_OWNER
            # if SESSIONS:
            owner = self.request.session.session_key

            # Fetch owner's dictionary
            # ownerQueryset = Entry.objects.filter(
            #     OwnerOrDefault(owner))
            # if not ownerQueryset.exists():
            #     return Response({'Bad Request': 'Dictionary is unavailable at the moment. Please contact an administrator'}, status=status.HTTP_400_BAD_REQUEST)

            # chineseEntries = {
            #     "annotations":
            # }
            # print(chineseEntries)
            data = self.annotate(owner, text)
            # pprint(data)

            # pprint(data)
            # [print(namedtuple("PhraseEntry", phrase.keys())(*phrase.values()).english) if isinstance(
            #     phrase, PhraseEntry) else ChineseEntrySerializer(phrase).data for phrase in data]
            responseData = [PhraseEntrySerializer(phrase).data if isinstance(phrase, PhraseEntry)
                            else ChineseEntrySerializer(phrase).data for phrase in data]
            # responseData = [[ChineseEntrySerializer(entry).data] if isinstance(entry,ChineseEntry) else [PhraseEntrySerializer(phrase).data for phrase in entry] for entry in data]

            return Response(responseData, status=status.HTTP_200_OK)

        return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)


# class FragmentView(generics.ListCreateAPIView):
#     queryset = Fragment.objects.all()
#     serializer_class = FragmentSerializer


# class MemoryView(generics.ListCreateAPIView):
#     queryset = Memory.objects.all()
#     serializer_class = MemorySerializer


# class FetchMemoryView(APIView):
#     # queryset = Entry.objects.all()
#     serializer_class = MemorySerializer

#     def get(self, request, format=None):
#         if not self.request.session.exists(self.request.session.session_key):
#             self.request.session.create()

#         code = self.request.query_params.get('code')
#         if code is None:
#             code = 0

#         # TODO: DNE check
#         memory = Memory.objects.get(code=code)
#         # data = {
#         #     "code": code,
#         #     "fragment": FragmentSerializer(Memory.objects.get(code=code).fragments.all(), many=True).data
#         # }

#         return Response(MemorySerializer(memory).data, status=status.HTTP_200_OK)

#         # return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)


# class CreateMemoryView(APIView):

#     serializer_class = MemoryCreateSerializer

#     def post(self, request, format=None):
#         if not self.request.session.exists(self.request.session.session_key):
#             self.request.session.create()
#         print(request.data)
#         serializer = self.serializer_class(data=request.data)
#         if serializer.is_valid():
#             fragments = serializer.data.get('fragments')
#             if 'code' in request.data.keys():
#                 code = request.data['code']
#                 # This is for updating the Memories. it shouldn't be used by the frontend.
#                 memory = Memory.objects.get(code=code)
#                 memory.fragments.clear()
#                 for frag in fragments:
#                     # TODO: make this atomic
#                     fragment, created = Fragment.objects.get_or_create(
#                         pinyin=frag['pinyin'],
#                         cchar=frag['cchar'])
#                     memory.f.add(fragment)
#                 memory.save()
#                 return Response(MemorySerializer(memory).data, status=status.HTTP_200_OK)
#             else:
#                 latest = Memory.objects.order_by('-code').first()
#                 code = 0
#                 if latest is not None:
#                     code = latest.code + 1

#                 memory = Memory(code=code)
#                 memory.save()
#                 for frag in fragments:
#                     fragment, created = Fragment.objects.get_or_create(
#                         pinyin=frag['pinyin'],
#                         cchar=frag['cchar'])
#                     memory.fragments.add(fragment)
#                 memory.save()

#             # memory.fragments.add(*fragments)

#             return Response(MemorySerializer(memory).data, status=status.HTTP_201_CREATED)

#         return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)


# class DestroyMemoryView(generics.RetrieveDestroyAPIView):
#     queryset = Memory.objects.all()
#     serializer_class = MemorySerializer
#     lookup_field = "code"


# class CleanMemoryView(APIView):

#     serializer_class = CleanMemorySerializer

#     def get(self, request, format=None):
#         if not self.request.session.exists(self.request.session.session_key):
#             self.request.session.create()
#         print(request.data)

#         memoryCodes = Memory.objects.values_list("code", flat=True)
#         countCodes = memoryCodes.count()
#         # return Response({"OK": "counted and list current memory codes", "count": count, "data": memory}, status=status.HTTP_200_OK)

#         # memory = Memory.objects.filter(code__in=codes)
#         memoryEmpty = Memory.objects.filter(fragments=None).exclude(
#             code=0).values_list("code", flat=True)
#         countEmpty = memoryEmpty.count()
#         # memory.delete()
#         return Response({
#             "OK": "Previewing memory status",
#             "empty memories": {
#                 "count": countEmpty,
#                 "codes": memoryEmpty
#             },
#             "total": {
#                 "count": countCodes,
#                 "codes": memoryCodes
#             }
#         }, status=status.HTTP_200_OK)

#     def post(self, request, format=None):
#         if not self.request.session.exists(self.request.session.session_key):
#             self.request.session.create()
#         print(request.data)

#         serializer = self.serializer_class(data=request.data)
#         if serializer.is_valid():
#             codes = serializer.data.get('codes')
#             memory = Memory.objects.filter(code__in=codes)
#             count = memory.count()
#             memory.delete()
#             return Response({"OK": "Successfully cleaned up memories",
#                              "memories recycled": count}, status=status.HTTP_200_OK)

#         # memory = Memory.objects.filter(code__in=codes)
#         memory = Memory.objects.filter(fragments=None).exclude(code=0)
#         count = memory.count()
#         memory.delete()
#         return Response({"OK": "Successfully cleaned up empty memories", "count": count}, status=status.HTTP_200_OK)

#     # NOTE: this isn't proper convention... but it's here just to help debug
#     # def delete(self, request, format=None):
#     #     if not self.request.session.exists(self.request.session.session_key):
#     #         self.request.session.create()
#     #     # codes = [17, 18, 19, 20, 21, 22, 23, 24, 25,
#     #     #          26, 27, 28, 29, 30, 31, 32, 33, 34, 35]
#     #     codes = []
#     #     if codes:
#     #         memory = Memory.objects.filter(code__in=codes)
#     #         memory.delete()
#     #         return Response({"OK": "cleaned up specified memories", "data": MemorySerializer(memory, many=True).data}, status=status.HTTP_200_OK)

#     #     memory = Memory.objects.filter(fragments=None).exclude(code=0)
#     #     memory.delete()
#     #     return Response({"OK": "cleaned up empty memories", "data": MemorySerializer(memory, many=True).data}, status=status.HTTP_200_OK)


class ReloadCEDictView(APIView):

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        # print(request.data)

        lenA, lenB = reloadCEDict()
        return Response({"OK": "Done reloaded CEDict", "lenA": lenA, "lenB": lenB}, status=status.HTTP_200_OK)


class CacheView(APIView):

    # def get(self, request, format=None):
    # count = len([x for x in cache.iter_keys("*")])
    # dictCount = len([x for x in cache.iter_keys("dict::*")])
    # blacklistCount = len([x for x in cache.iter_keys("black::*")])
    # customCount = len([x for x in cache.iter_keys("custom::*")])
    # priorityCount = len([x for x in cache.iter_keys("priority::*")])

    # return Response({"OK": "Fetched count", "count": count, "dictCount": dictCount,
    #  "blacklistCount": blacklistCount,
    #  "customCount": customCount,
    #  "priorityCount": priorityCount, }, status=status.HTTP_200_OK)

    def post(self, request, format=None):

        rType = None
        method = None
        id = None

        if 'type' in request.data:
            rType = request.data['type']

        if 'id' in request.data:
            id = request.data['id']

        if 'method' in request.data:
            method = request.data['method']

        if method == 'reload':
            if(rType):
                if(rType == DICT):
                    EntryManager.reloadDictionary()
                elif(rType == CUSTOM):
                    EntryManager.reloadCustom()
                elif(rType == PRIORITY):
                    EntryManager.reloadPriorities()
                elif(rType == BLACKLIST):
                    EntryManager.reloadBlacklist()
                else:
                    return Response({"Bad Request": "Invalid Type", "type": rType, "method": method, "id": id}, status=status.HTTP_400_BAD_REQUEST)
            else:
                EntryManager.reload()
            Trie.clearTries()
        else:
            if(rType):
                if(rType == DICT):
                    EntryManager.loadDictionary(id)
                    # Trie.loadTrie(id)
                elif(rType == CUSTOM):
                    EntryManager.loadCustom()
                elif(rType == PRIORITY):
                    EntryManager.loadPriorities()
                elif(rType == BLACKLIST):
                    EntryManager.loadBlacklist()
                else:
                    return Response({"Bad Request": "Invalid Type", "type": rType, "method": method, "id": id}, status=status.HTTP_400_BAD_REQUEST)
            else:
                EntryManager.load()

        return Response({"OK": "Reloaded Entries", "type": rType, "method": method, "id": id}, status=status.HTTP_200_OK)

    def delete(self, request, format=None):

        rType = None

        if 'type' in request.data:
            rType = request.data['type']

        if(rType):
            if(rType == DICT):
                EntryManager.clearDictionary()
            elif(rType == CUSTOM):
                EntryManager.clearCustom()
            elif(rType == PRIORITY):
                EntryManager.clearPriorities()
            elif(rType == BLACKLIST):
                EntryManager.clearBlacklist()
            else:
                return Response({"Bad Request": "Invalid Type", "type": rType, "method": method, "id": id}, status=status.HTTP_400_BAD_REQUEST)
        else:
            EntryManager.clear()

        Trie.clearTries()
        return Response({"OK": "Deleted Entries", "type": rType}, status=status.HTTP_200_OK)


# class PriorityView(APIView):

#     def post(self, request, format=None):
#         if not self.request.session.exists(self.request.session.session_key):
#             self.request.session.create()
#         print(request.data)

#         countBefore = Entry.objects.filter(priority=MAIN_PRIORITY).count()

#         (success, message, data) = updateDefaultPriorities()

#         countUpdated = Entry.objects.filter(priority=MAIN_PRIORITY).count()

#         if success:
#             return Response({"OK": message, "countBefore": countBefore, "countUpdated": countUpdated}, status=status.HTTP_200_OK)
#         else:
#             return Response({"Service Unavailable": message, "data": data}, status=status.HTTP_503_SERVICE_UNAVAILABLE)


# class ReloadCustomEntryView(APIView):

#     # serializer_class = ReloadEntrySerializer

#     def post(self, request, format=None):
#         if not self.request.session.exists(self.request.session.session_key):
#             self.request.session.create()

#         # serializer = self.serializer_class(data=request.data)
#         # if serializer.is_valid():
#         owner = "custom"
#         # if(request.data['owner']):
#         #     owner = request.data.owner

#         # if SESSIONS:
#         #     owner = self.request.session.session_key

#         # Fetch/Create owner's dictionary
#         queryset = Entry.objects.filter(owner=owner).delete()
#         queryset = Entry.objects.filter(owner=owner)
#         print("deleted")
#         if queryset.exists():
#             return Response({'Bad Request': 'Unable to delete custom entries'}, status=status.HTTP_400_BAD_REQUEST)

#         loadCustomEntries()
#         updateCustomPriorities()

#         print("created new custom entries")
#         queryset = Entry.objects.filter(owner=owner)
#         if not queryset.exists():
#             return Response({'Bad Request': 'Deleted entries but unable to create custom dictionary entries'}, status=status.HTTP_400_BAD_REQUEST)

#         Trie.clearTries()
#         return Response({'OK': 'Reloaded custom dictionary entries', 'count': len(queryset)}, status=status.HTTP_200_OK)

#     def delete(self, request, format=None):
#         owner = "custom"
#         queryset = Entry.objects.filter(owner=owner).delete()
#         Trie.clearTries()
#         return Response({'OK': 'Deleted everything!!...'}, status=status.HTTP_200_OK)


# class ReloadAllView(APIView):

#     def post(self, request, format=None):
#         if not self.request.session.exists(self.request.session.session_key):
#             self.request.session.create()

#         # Entry.objects.filter(
#         #     Q(owner=DEFAULT_OWNER) | Q(owner="custom")).delete()
#         # queryset = Entry.objects.filter(
#         #     Q(owner=DEFAULT_OWNER) | Q(owner="custom"))
#         print("deleted default and custom")
#         # if queryset.exists():
#         #     return Response({'Bad Request': 'Unable to delete default and custom entries'}, status=status.HTTP_400_BAD_REQUEST)
#         cache.clear()

#         loadDefaultDictionary()
#         updateDefaultPriorities()

#         print("created new default")

#         # queryset = Entry.objects.filter(owner=DEFAULT_OWNER)
#         # if not queryset.exists():
#         #     return Response({'Bad Request': 'Deleted default and custom entries but unable to create default entries'}, status=status.HTTP_400_BAD_REQUEST)

#         # defaultcount = queryset.count()

#         loadCustomEntries()
#         updateCustomPriorities()

#         print("created new custom")

#         # queryset = Entry.objects.filter(owner="custom")
#         # if not queryset.exists():
#         #     return Response({'Bad Request': 'Deleted default and custom entries but unable to create custom entries'}, status=status.HTTP_400_BAD_REQUEST)

#         # customcount = queryset.count()

#         # Fetch/Create owner's dictionary
#         # BlacklistEntry.objects.filter(owner=DEFAULT_OWNER).delete()
#         # queryset = BlacklistEntry.objects.filter(owner=DEFAULT_OWNER)
#         # if queryset.exists():
#         #     return Response({'Bad Request': 'Unable to delete default blacklist entries'}, status=status.HTTP_400_BAD_REQUEST)

#         loadDefaultBlacklist()
#         updateBlacklistPriorities()

#         print("created new blacklist")
#         # queryset = BlacklistEntry.objects.filter(owner=DEFAULT_OWNER)
#         # if not queryset.exists():
#         #     return Response({'Bad Request': 'Deleted blacklist entries but unable to create default blacklist entries'}, status=status.HTTP_400_BAD_REQUEST)

#         # blacklistcount = queryset.count()

#         Trie.clearTries()
#         return Response({'OK': 'Reloaded all dictionary entries', 'counts': {
#             # "default": defaultcount,
#             # "custom": customcount,
#             # "blacklist": blacklistcount
#         }}, status=status.HTTP_200_OK)

# @api_view(['GET', 'POST'])
# def manage_items(request, *args, **kwargs):
#     if request.method == 'GET':
#         items = {}
#         count = 0
#         for key in cache.keys("*"):
#             items[key.decode("utf-8")] = cache.get(key)
#             count += 1
#         response = {
#             'count': count,
#             'msg': f"Found {count} items.",
#             'items': items
#         }
#         return Response(response, status=200)
#     elif request.method == 'POST':
#         item = json.loads(request.body)
#         key = list(item.keys())[0]
#         value = item[key]
#         cache.set(key, value)
#         response = {
#             'msg': f"{key} successfully set to {value}"
#         }
#         return Response(response, 201)
