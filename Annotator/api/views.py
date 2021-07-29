from collections import namedtuple
import re
from django.db.models import query
from django.shortcuts import render
from django.http import HttpResponse
from django.db.models import Q
from rest_framework import generics, serializers, status, filters
from rest_framework.exceptions import bad_request
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import BlacklistEntrySerializer, ChineseEntrySerializer, EntrySerializer, CreateEntrySerializer, AnnotationSerializer, FragmentSerializer, MemoryCreateSerializer, MemorySerializer, ReloadEntrySerializer, UpdateEntrySerializer, PhraseEntrySerializer
from .models import BlacklistEntry, Entry, ChineseEntry, Memory, Fragment, PhraseEntry
from .utils import NBSP, OwnerOrDefault, loadDefaultDictionary, loadDefaultBlacklist, isChinese, parsePinyin, SESSIONS
from .Trie import Trie
import os
import json
from pprint import pprint

# Create your views here.


# def main(request):
#     return HttpResponse("<h1>Hellos!</h1>")
# class MultipleFieldLookupMixin:
#     """
#     Apply this mixin to any view or viewset to get multiple field filtering
#     based on a `lookup_fields` attribute, instead of the default single field filtering.
#     """
#     def get_object(self):
#         queryset = self.get_queryset()             # Get the base queryset
#         queryset = self.filter_queryset(queryset)  # Apply any filter backends
#         filter = {}
#         for field in self.lookup_fields:
#             print(self.kwargs)
#             if self.kwargs[field]: # Ignore empty fields.
#                 filter[field] = self.kwargs[field]
#         obj = generics.get_object_or_404(queryset, **filter)  # Lookup the object
#         # self.check_object_permissions(self.request, obj)
#         return obj
class DynamicSearchFilter(filters.SearchFilter):
    def get_search_fields(self, view, request):
        return request.GET.getlist('search_fields', ['simplified', 'traditional'])


class BlacklistEntryView(generics.ListCreateAPIView):
    # search_fields = ['simplified', 'traditional']
    # filter_backends = (filters.SearchFilter, )
    # filter_backends = (DynamicSearchFilter, )
    queryset = BlacklistEntry.objects.all()
    serializer_class = BlacklistEntrySerializer


class EntryView(generics.ListAPIView):
    # search_fields = ['simplified', 'traditional']
    # filter_backends = (filters.SearchFilter, )
    filter_backends = (DynamicSearchFilter, )
    # queryset =
    serializer_class = EntrySerializer

    def get_queryset(self):
        """
        Restricts the entries fetched by the user
        by filtering against a `phrase` query parameter in the URL.

        Ex. http://127.0.0.1:8000/api/home?phrase=您

        If no phrase is specified, then an empty list is returned.
        """
        queryset = Entry.objects.all()
        phrase = self.request.query_params.get('phrase')
        if phrase is not None:
            queryset = queryset.filter(
                Q(simplified=phrase) | Q(traditional=phrase))
            return queryset
        if self.request.query_params.get('search') is not None:
            return queryset

        return Entry.objects.filter(id=0)

    # def post(self, request, format=None):
    #     if not self.request.session.exists(self.request.session.session_key):
    #         self.request.session.create()

    #     serializer = self.serializer_class(data=request.data)
    #     if serializer.is_valid():
    #         traditional = serializer.data.get('traditional')
    #         simplified = serializer.data.get('simplified')
    #         pinyin = serializer.data.get('pinyin')
    #         english = serializer.data.get('english')
    #         owner = "default"
    # if SESSIONS:
    # owner = self.request.session.session_key

    #         queryset = Entry.objects.filter(owner=owner)
    #         if not queryset.exists():
    #             loadDefaultDictionary(owner)

    #         if(traditional == ""):
    #             # TODO: fetch traditional from dictionary
    #             # traditional = ...
    #             pass

    #         subqueryset = Entry.objects.filter(owner=owner, traditional=traditional,
    #                                            simplified=simplified, pinyin=pinyin)
    #         if(subqueryset.exists()):
    #             entry = subqueryset[0]
    #             entry.english = english
    #             entry.save(update_fields=['english'])
    #         else:
    #             entry = Entry(owner=owner, traditional=traditional,
    #                           simplified=simplified, pinyin=pinyin, english=english)
    #             entry.save()

    #         return Response(EntrySerializer(entry).data, status=status.HTTP_200_OK)

    #     return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)


class CreateEntryView(APIView):
    # queryset = Entry.objects.all()
    serializer_class = CreateEntrySerializer

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data, partial=True)
        if serializer.is_valid():
            traditional = serializer.data.get('traditional')
            simplified = serializer.data.get('simplified')
            pinyin = serializer.data.get('pinyin')
            english = serializer.data.get('english')
            owner = serializer.data.get('owner')
            priority = serializer.data.get('priority')
            if priority is None:
                priority = 999
            # owner = "default"
            # if SESSIONS:
            # owner = self.request.session.session_key

            # Fetch/Create owner's dictionary
            # queryset = Entry.objects.filter(owner=owner)
            # if not queryset.exists():
            #     # loadDefaultDictionary()
            #     queryset = Entry.objects.filter(owner=owner)
            #     if not queryset.exists():
            #         return Response({'Bad Request': 'New user session, but unable to create default dictionary entries'}, status=status.HTTP_400_BAD_REQUEST)

            # if(traditional == ""):
            #     # TODO: fetch traditional from dictionary
            #     # traditional = ...
            #     pass

            queryset = Entry.objects.filter(owner=owner, traditional=traditional,
                                            simplified=simplified, pinyin=pinyin)
            if(queryset.exists()):
                res = EntrySerializer(queryset, many=True).data
                res['Bad Request'] = 'Entry already exists'
                Response(res, status=status.HTTP_400_BAD_REQUEST)
            else:
                entry = Entry(owner=owner, traditional=traditional,
                              simplified=simplified, pinyin=pinyin, english=english, priority=priority)
                entry.save()

            return Response(EntrySerializer(entry).data, status=status.HTTP_200_OK)

        return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)


class UpdateEntryView(generics.RetrieveUpdateDestroyAPIView):
    # queryset = Entry.objects.all()
    queryset = Entry.objects.all()
    serializer_class = UpdateEntrySerializer
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
    #         # owner = "default"
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


# class EntryUpdateView():
#     model = Entry
#     fields = ['english', 'priority']
#     # template_name_suffix = '_update_form'

class ReloadEntryView(APIView):

    # serializer_class = ReloadEntrySerializer

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        # serializer = self.serializer_class(data=request.data)
        # if serializer.is_valid():
        owner = "default"
        # if(request.data['owner']):
        #     owner = request.data.owner

        # if SESSIONS:
        #     owner = self.request.session.session_key

        # Fetch/Create owner's dictionary
        queryset = Entry.objects.filter(owner=owner).delete()
        queryset = Entry.objects.filter(owner=owner)
        # print("deleted")
        if queryset.exists():
            return Response({'Bad Request': 'Unable to delete entries for current owner'}, status=status.HTTP_400_BAD_REQUEST)
        # if(owner == "default"):
        loadDefaultDictionary()
        print("created new entries")
        queryset = Entry.objects.filter(owner=owner)
        if not queryset.exists():
            return Response({'Bad Request': 'Deleted entries but unable to create default dictionary entries'}, status=status.HTTP_400_BAD_REQUEST)

        Trie.clearTries()
        return Response({'OK': 'Reloaded default dictionary entries', 'count': len(queryset)}, status=status.HTTP_200_OK)
        # else:
        #     return Response({'Bad Request': 'You must specify the "owner" in the body of your request. If you want to reload the default entries, your body must be {"owner"="defualt"} '}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, format=None):
        EntryView.queryset.delete()

        Trie.clearTries()
        return Response({'OK': 'Deleted everything!!...'}, status=status.HTTP_200_OK)


class ReloadBlacklistEntryView(APIView):

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        owner = "default"

        # Fetch/Create owner's dictionary
        queryset = BlacklistEntry.objects.filter(owner=owner).delete()
        queryset = BlacklistEntry.objects.filter(owner=owner)
        print("deleted")
        if queryset.exists():
            return Response({'Bad Request': 'Unable to delete Blacklist Entries for current owner', 'owner': owner, }, status=status.HTTP_400_BAD_REQUEST)
        # if(owner == "default"):
        loadDefaultBlacklist()
        print("created new Blacklist entries")
        queryset = BlacklistEntry.objects.filter(owner=owner)
        if not queryset.exists():
            return Response({'Bad Request': 'Deleted blacklist entries but unable to create default blacklist entries'}, status=status.HTTP_400_BAD_REQUEST)

        Trie.clearTries()
        return Response({'OK': 'Reloaded default blacklist entries', 'count': len(queryset)}, status=status.HTTP_200_OK)
        # else:
        #     return Response({'Bad Request': 'You must specify the "owner" in the body of your request. If you want to reload the default entries, your body must be {"owner"="defualt"} '}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, format=None):
        EntryView.queryset.delete()

        return Response({'OK': 'Deleted everything!!...'}, status=status.HTTP_200_OK)


class CountEntryView(APIView):

    serializer_class = ReloadEntrySerializer

    def get(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        owner = "default"
        if 'owner' in request.data.keys():
            owner = request.data['owner']

        # if SESSIONS:
        #     owner = self.request.session.session_key

        # Fetch/Create owner's dictionary
        queryset = Entry.objects.filter(owner=owner)

        return Response({'OK': 'able to fetch default dict', 'count': len(queryset)}, status=status.HTTP_200_OK)


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

    def annotate(self, owner: str, ownerQueryset: query.QuerySet, text: str):
        print("===============================")
        print(text)
        # TODO: return only simplified?

        trie = Trie.getTrie(owner)
        if not trie:
            blacklistQuerySet = BlacklistEntry.objects.filter(OwnerOrDefault(owner)).values_list(
                'simplified', 'traditional')
            blacklist = [
                item for sublist in blacklistQuerySet for item in sublist]
            print(blacklist)
            entryQuerySet = ownerQueryset.values_list(
                'simplified', 'traditional')
            words = [
                item for sublist in entryQuerySet for item in sublist if item not in blacklist]
            print(len(words))
            trie = Trie.createTrie(owner, words)

        print(trie)

        fragments = [text]
        separators = ['。', '：', '？', ',', '、',
                      '“', '”', '，', '）', '（', ' ', '\n']
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
                        # print("Unable to find best phrase from '" +
                        #   remaining + "'.")
                        return []  # tentatively return cause error
                    else:
                        # found something in trie, remove phrase from remaining
                        remaining = remaining[len(phrase):]

                        # TODO: fetch pinyin
                        entry = ownerQueryset.filter(
                            Q(simplified=phrase)
                            | Q(traditional=phrase)).order_by("priority").values_list("pinyin", "english").first()
                        # print(pinyins.query)

                        # Note: entry here is a tuple, (pinyin, english)
                        pinyin = entry[0].split(" ")
                        english = entry[1]
                        # print(pinyin)
                        # pinyin = dict.getPinYin(self.phrase).split(" ")
                        if len(phrase) != len(pinyin):
                            print("pinyin and phrase have different lengths O.o")
                            print("phrase: " + phrase)
                            print("pinyin: " + pinyin)
                            return []  # tentatively return cause error

                        # push all phrases
                        phraselst = []
                        for i in range(len(phrase)):
                            phraselst.append(
                                ChineseEntry(parsePinyin(pinyin[i]), phrase[i])
                            )
                        lst.append(PhraseEntry(phraselst, english))
        return lst

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            text = serializer.data.get('text')
            # owner = "default"
            # if SESSIONS:
            owner = self.request.session.session_key

            # Fetch owner's dictionary
            ownerQueryset = Entry.objects.filter(
                OwnerOrDefault(owner))
            if not ownerQueryset.exists():
                loadDefaultDictionary()
                ownerQueryset = Entry.objects.filter(
                    OwnerOrDefault(owner))
                if not ownerQueryset.exists():
                    return Response({'Bad Request': 'New user session, but unable to create default dictionary entries'}, status=status.HTTP_400_BAD_REQUEST)

            # chineseEntries = {
            #     "annotations":
            # }
            # print(chineseEntries)
            data = self.annotate(owner, ownerQueryset, text)
            # pprint(data)
            # [print(namedtuple("PhraseEntry", phrase.keys())(*phrase.values()).english) if isinstance(
            #     phrase, PhraseEntry) else ChineseEntrySerializer(phrase).data for phrase in data]
            tmp = [PhraseEntrySerializer(phrase).data if isinstance(
                phrase, PhraseEntry) else ChineseEntrySerializer(phrase).data for phrase in data]
            return Response(tmp, status=status.HTTP_200_OK)

        return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)


class DictionaryView(APIView):
    queryset = Entry.objects.all()
    serializer_class = EntrySerializer

    def split(self, lines, separator):
        lst = list()
        for line in lines:
            verses = line.split(separator)
            for i in range(len(verses) - 1):
                verses[i] += separator

            lst.extend(verses)

        return lst

    def annotate(self, owner: str, ownerQueryset: query.QuerySet, text: str):
        print("===============================")
        print(text)
        # TODO: return only simplified?

        trie = Trie.getTrie(owner)
        if not trie:
            blacklistQuerySet = BlacklistEntry.objects.filter(OwnerOrDefault(owner)).values_list(
                'simplified', 'traditional')
            blacklist = [
                item for sublist in blacklistQuerySet for item in sublist]
            print(blacklist)
            entryQuerySet = ownerQueryset.values_list(
                'simplified', 'traditional')
            words = [
                item for sublist in entryQuerySet for item in sublist if item not in blacklist]
            print(len(words))
            trie = Trie.createTrie(owner, words)

        print(trie)

        fragments = [text]
        separators = ['。', '：', '？', ',', '、',
                      '“', '”', '，', '）', '（', ' ', '\n']
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
                        # print("Unable to find best phrase from '" +
                        #   remaining + "'.")
                        return []  # tentatively return cause error
                    else:
                        # found something in trie, remove phrase from remaining
                        remaining = remaining[len(phrase):]

                        # TODO: fetch pinyin
                        pinyins = ownerQueryset.filter(
                            Q(simplified=phrase)
                            | Q(traditional=phrase)).order_by("priority").values_list("pinyin", flat=True)
                        # print(pinyins.query)
                        pinyin = pinyins[0].split(" ")
                        # print(pinyin)
                        # pinyin = dict.getPinYin(self.phrase).split(" ")
                        if len(phrase) != len(pinyin):
                            print("pinyin and phrase have different lengths O.o")
                            print("phrase: " + phrase)
                            print("pinyin: " + pinyin)
                            return []  # tentatively return cause error

                        # push all phrases
                        phraselst = []
                        for i in range(len(phrase)):
                            phraselst.append(
                                ChineseEntry(parsePinyin(pinyin[i]), phrase[i])
                            )
                        lst.append(phraselst)
        return lst

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            text = serializer.data.get('text')
            # owner = "default"
            # if SESSIONS:
            owner = self.request.session.session_key

            # Fetch owner's dictionary
            ownerQueryset = Entry.objects.filter(
                OwnerOrDefault(owner))
            if not ownerQueryset.exists():
                loadDefaultDictionary()
                ownerQueryset = Entry.objects.filter(
                    OwnerOrDefault(owner))
                if not ownerQueryset.exists():
                    return Response({'Bad Request': 'New user session, but unable to create default dictionary entries'}, status=status.HTTP_400_BAD_REQUEST)

            # chineseEntries = {
            #     "annotations":
            # }
            # print(chineseEntries)
            data = self.annotate(owner, ownerQueryset, text)
            tmp = [ChineseEntrySerializer(phrase, many=True).data if isinstance(
                phrase, list) else ChineseEntrySerializer(phrase).data for phrase in data]
            return Response(tmp, status=status.HTTP_200_OK)

        return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)


class FragmentView(generics.ListCreateAPIView):
    queryset = Fragment.objects.all()
    serializer_class = FragmentSerializer


class MemoryView(generics.ListCreateAPIView):
    queryset = Memory.objects.all()
    serializer_class = MemorySerializer

    # def get_queryset(self):
    #     """
    #     Restricts the entries fetched by the user
    #     by filtering against a `phrase` query parameter in the URL.

    #     Ex. http://127.0.0.1:8000/api/home?code=1

    #     If no phrase is specified, then an empty list is returned.
    #     """
    #     code = self.request.query_params.get('code')
    #     if code is not None:
    #         queryset = Memory.objects.filter(code=code)
    #         return queryset
    #     else:
    #         pass
    #     return Memory.objects.filter(code=0).first().fragments.all()


class FetchMemoryView(APIView):
    # queryset = Entry.objects.all()
    serializer_class = MemorySerializer

    def get(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        code = self.request.query_params.get('code')
        if code is None:
            code = 0

        # TODO: DNE check
        memory = Memory.objects.get(code=code)
        # data = {
        #     "code": code,
        #     "fragment": FragmentSerializer(Memory.objects.get(code=code).fragments.all(), many=True).data
        # }

        return Response(MemorySerializer(memory).data, status=status.HTTP_200_OK)

        return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)


class CreateMemoryView(APIView):

    serializer_class = MemoryCreateSerializer

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        print(request.data)
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            fragments = serializer.data.get('fragments')
            if 'code' in request.data.keys():
                code = request.data['code']
                # This is for updating the Memories. it shouldn't be used by the frontend.
                memory = Memory.objects.get(code=code)
                memory.fragments.clear()
                for frag in fragments:
                    # TODO: make this atomic
                    fragment, created = Fragment.objects.get_or_create(
                        pinyin=frag['pinyin'],
                        cchar=frag['cchar'])
                    memory.fragments.add(fragment)
                memory.save()
                return Response(MemorySerializer(memory).data, status=status.HTTP_200_OK)
            else:
                latest = Memory.objects.order_by('-code').first()
                code = 0
                if latest is not None:
                    code = latest.code + 1

                memory = Memory(code=code)
                memory.save()
                for frag in fragments:
                    fragment, created = Fragment.objects.get_or_create(
                        pinyin=frag['pinyin'],
                        cchar=frag['cchar'])
                    memory.fragments.add(fragment)
                memory.save()

            # memory.fragments.add(*fragments)

            return Response(MemorySerializer(memory).data, status=status.HTTP_201_CREATED)

        return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)
