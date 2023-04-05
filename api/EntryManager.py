
# class TrieNode(object):
#     """
#     Our trie node implementation. Very basic. but does the job
#     """

#     def __init__(self, key: str):
#         self.char = char
#         self.children = []
#         # Is it the last character of the word.`
#         self.word_finished = False
#         # How many times this character appeared in the addition process
#         self.counter = 1

#         # the "key" value will be the character in sequence
#         self.key = key

#         # we keep a reference to parent
#         self.parent = None

#         # we have hash of children
#         self.children = dict()

#         # check to see if the node is at the end
#         self.end = False

#     def getWord(self):
#         output = list()
#         node = self

#         while node:
#             output.insert(0, node.key)
#             node = node.parent

#         return ''.join(output)

from bisect import bisect
import json
import os
import timeit
from django.core.cache import caches
from api.Trie import Trie
from api.models import BlacklistEntry

from api.utils import CUSTOM_PRIORITY, DATA_DIR, DEFAULT_PRIORITY, INVALID_PRIORITY, MAIN_PRIORITY, SURNAME_PRIORITY, VARIANT_PRIORITY, DICT, CUSTOM, BLACKLIST, PRIORITY, cacheKey, entryKey, loadCustomEntries, loadDefaultBlacklist, loadDefaultDictionary, updateBlacklistPriorities, updateCustomPriorities, updateDefaultPriorities


class EntryManagerSingleton(object):
    # dictCache = caches['dict']
    # customCache = caches['custom']
    # blacklistCache = caches['blacklist']
    # priorityCache = caches['priority']

    def __init__(self, owner):
        # self.root = {
        #     Trie.NAME: 'root'
        # }
        self.owner = owner

        self.keylistA = []
        self.customkeylist = []
        self.blacklistkeylist = []
        self.prioritykeylist = []
        
        self.dictA = {}
        self.dictB = {}
        
        with open(os.path.join(DATA_DIR, "datamapA.json")) as f:
            data = json.load(f)
            self.dictA = data
            
        with open(os.path.join(DATA_DIR, "datamapB.json")) as f:
            data = json.load(f)
            self.dictB = data
            
        with open(os.path.join(DATA_DIR, "keylistA.json")) as f:
            data = json.load(f)
            self.keylistA = set(data)

        with open(os.path.join(DATA_DIR, f"keylist{CUSTOM}.json")) as f:
            data = json.load(f)
            self.customkeylist = set(data)
            
        with open(os.path.join(DATA_DIR, f"keylist{BLACKLIST}.json")) as f:
            data = json.load(f)
            self.blacklistkeylist = set(data)
            
        with open(os.path.join(DATA_DIR, f"keylist{PRIORITY}.json")) as f:
            data = json.load(f)
            self.prioritykeylist = set(data)

    # def getValidKeyList(self):
        # dictList = cache.get("keylist::dict")
        # customList = cache.get("keylist::custom")

        # dictList = dictList if dictList else []
        # customList = customList if customList else []

        # return dictList + customList

    def loadDictionary(self, specific=None):
        print("load dictionary")
        # loadDefaultDictionary()

        # hashmap = {}

        # if specific is None:
        # keys = []

        # for i in range(11):
        print("loading A")
        filename = f"datamapA.json"
        with open(os.path.join(DATA_DIR, filename)) as f:
            data = json.load(f)
            caches['default'].set_many(data)
            # keys += data.keys()
            # print("loading keylist")
            # cache.set("keylist::dict", keys)
        # else:
            # keys = []
        # print(f"loading {specific}")
        print("loading B")
        filename = f"datamapB.json"
        with open(os.path.join(DATA_DIR, filename)) as f:
            data = json.load(f)
            caches['extra'].set_many(data)

            # keys += data.keys()

            # print("loading keylist")
            # curKeys = cache.get("keylist::dict")
            # curKeys = curKeys if curKeys else []
            # cache.set("keylist::dict", keys + curKeys)

    # def loadDictionary(self, i):
    #     print("load dictionary")
        # loadDefaultDictionary()

        # hashmap = {}

        # print(data)
        # for item in data:
        #     if("surname" in item['english']):
        #         item['priority'] = SURNAME_PRIORITY
        #     elif("variant of" in item['english']):
        #         item['priority'] = VARIANT_PRIORITY
        #     else:
        #         item['priority'] = DEFAULT_PRIORITY

        #     key = item['simplified']
        #     if key in hashmap:
        #         hashmap[key].append(item)
        #         hashmap[key].sort(key=lambda x: x['priority'])
        #     else:
        #         hashmap[key] = [item]

        # values = self.dictCache.get(key)
        # if(values):
        #     # values.append(item)
        #     # values.sort(key=lambda x: x['priority'])
        #     bisect.insort(values, item, key=lambda x: x['priority'])
        #     self.dictCache.set(item['simplified'], values)
        # else:
        #     self.dictCache.set(item['simplified'], [item])

    def loadCustom(self):
        print("load custom")
        keys = []
        with open(os.path.join(DATA_DIR, 'custom.json')) as f:
            data = json.load(f)
            # print(data)
            for item in data:
                item['priority'] = CUSTOM_PRIORITY

                keys.append(item['simplified'])
                key = cacheKey(CUSTOM, item['simplified'])
                values = caches['default'].get(key)
                if(values):
                    values.append(item)
                    values.sort(key=lambda x: x['priority'])
                    caches['default'].set(key, values)
                else:
                    caches['default'].set(key, [item])

        caches['default'].set("keylist::custom", keys)
        # updateCustomPriorities()

    def loadBlacklist(self):
        print("load blacklist")
        # loadDefaultBlacklist()
        # updateBlacklistPriorities()
        with open(os.path.join(DATA_DIR, 'blacklist.json')) as f:
            data = json.load(f)
            # print(data)
            for item in data:
                item['priority'] = INVALID_PRIORITY

                key = cacheKey(BLACKLIST, item['simplified'])
                values = caches['default'].get(key)
                if(values):
                    values.append(item)
                    values.sort(key=lambda x: x['priority'])
                    caches['default'].set(key, values)
                else:
                    caches['default'].set(key, [item])

                caches['default'].set(entryKey(BLACKLIST, item), True)

    def loadPriorities(self):
        print("load priorities")
        with open(os.path.join(DATA_DIR, 'priority.json')) as f:
            data = json.load(f)
            # print(data)
            for item in data:
                item['priority'] = MAIN_PRIORITY

                key = cacheKey(PRIORITY, item['simplified'])
                values = caches['default'].get(key)
                if(values):
                    values.append(item)
                    values.sort(key=lambda x: x['priority'])
                    caches['default'].set(key, values)
                else:
                    caches['default'].set(key, [item])

                caches['default'].set(entryKey(PRIORITY, item), True)
        # updateDefaultPriorities()

    def clearDictionary(self):
        print("clearing dictionary")
        caches['default'].delete_pattern(cacheKey(DICT, "*"))
        caches['extra'].clear()

    def clearCustom(self):
        print("clearing custom")
        caches['default'].delete_pattern(cacheKey(CUSTOM, "*"))
        caches['default'].delete("keylist::custom")

    def clearBlacklist(self):
        print("clearing blacklist")
        caches['default'].delete_pattern(cacheKey(BLACKLIST, "*"))

    def clearPriorities(self):
        print("clearing priorities")
        caches['default'].delete_pattern(cacheKey(PRIORITY, "*"))

    def reloadDictionary(self):
        self.clearDictionary()
        self.loadDictionary()

    def reloadCustom(self):
        self.clearCustom()
        self.loadCustom()

    def reloadBlacklist(self):
        self.clearBlacklist()
        self.loadBlacklist()

    def reloadPriorities(self):
        self.clearPriorities()
        self.loadPriorities()

    def reload(self):
        self.clear()
        self.load()

    def load(self):
        self.loadDictionary()
        self.loadCustom()
        self.loadBlacklist()
        self.loadPriorities()

    def clear(self):
        caches['default'].clear()
        caches['extra'].clear()

    def getDict(self, phrase):
        # start_time = timeit.default_timer()
        
        key = cacheKey(DICT, phrase)
        
        if phrase in self.keylistA:
            # return caches['default'].get(key)
            return self.dictA[key]
        else:
            if key in self.dictB:
                return self.dictB[key]
            return None
            # return caches['extra'].get(key)

        # print(f"A:{timeit.default_timer() - start_time}")
        # return dict1

    def get(self, phrase):

        # defaultEntries = self.dictCache.get(f"default::{phrase}")
        # surnameEntries = self.dictCache.get(f"surname::{phrase}")
        # variantEntries = self.dictCache.get(f"variant::{phrase}")
        # userEntries = self.dictCache.get(f"user::{phrase}")
        
        # start_time = timeit.default_timer()
        dictEntries = self.getDict(phrase)
        dictEntries = dictEntries if dictEntries else []
        # print(f"dict:{timeit.default_timer() - start_time}")
        
        # start_time = timeit.default_timer()
        if phrase in self.customkeylist:
            customEntries = caches['default'].get(cacheKey(CUSTOM, phrase))
        else:
            customEntries = []
        # print(f"custom:{timeit.default_timer() - start_time}")

        # start_time = timeit.default_timer()
        if phrase in self.prioritykeylist:
            priorityEntries = caches['default'].get(cacheKey(PRIORITY, phrase))
        else:
            priorityEntries = []
        # print(f"priority:{timeit.default_timer() - start_time}")


        # start_time = timeit.default_timer()
        if phrase in self.blacklistkeylist:
            blacklistEntries = caches['default'].get(cacheKey(BLACKLIST, phrase))
        else:
            blacklistEntries = []
        # print(f"blacklist:{timeit.default_timer() - start_time}")

        
        customEntries = customEntries if customEntries else []

        # if not entries:
        # not in regular dictionary, check if it's in custom
        # customEntries = self.customCache.get(phrase)

        # priorityEntries = self.priorityCache.get(phrase)

        # blacklistEntries = self.priorityCache.get(phrase)

        # entries = priorityEntries + customEntries + userEntries + defaultEntries + surnameEntries + variantEntries

        # start_time = timeit.default_timer()
        entries = customEntries + dictEntries


        def inPriority(entry):
            return caches['default'].get(entryKey(PRIORITY, entry)) is not None

        def inBlacklist(entry):
            return caches['default'].get(entryKey(BLACKLIST, entry)) is not None

        if blacklistEntries:
            entries = [entry for entry in entries if not inBlacklist(entry)]

        if priorityEntries:
            entries = [entry for entry in entries if not inPriority(entry)]
            entries.extend(priorityEntries)

        if not entries:
            return None

        entries.sort(key=lambda x: x['priority'])
        # print(f"other:{timeit.default_timer() - start_time}")

        return entries


EntryManager = EntryManagerSingleton("me")
