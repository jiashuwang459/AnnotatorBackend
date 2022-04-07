
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
from django.core.cache import cache
from api.models import BlacklistEntry

from api.utils import CUSTOM_PRIORITY, DATA_DIR, DEFAULT_PRIORITY, INVALID_PRIORITY, MAIN_PRIORITY, SURNAME_PRIORITY, VARIANT_PRIORITY, cacheKey, entryKey, loadCustomEntries, loadDefaultBlacklist, loadDefaultDictionary, updateBlacklistPriorities, updateCustomPriorities, updateDefaultPriorities

DICT = "dict"
BLACKLIST = "black"
PRIORITY = "priority"
CUSTOM = "custom"


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

    def getValidKeyList(self):
        dictList = cache.get("keylist::dict")
        customList = cache.get("keylist::custom")

        dictList = dictList if dictList else []
        customList = customList if customList else []

        return dictList + customList

    def loadDictionary(self):
        print("load dictionary")
        # loadDefaultDictionary()

        # hashmap = {}

        keys = []
        for i in range(11):
            print(f"loading {i}")
            filename = f"datamap{i}.json"
            with open(os.path.join(DATA_DIR, filename)) as f:
                data = json.load(f)
                cache.set_many(data)
                keys += data.keys()
        print("loading keylist")
        cache.set("keylist::dict", keys)

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
        with open(os.path.join(DATA_DIR, 'custom.json')) as f:
            data = json.load(f)
            # print(data)
            for item in data:
                item['priority'] = CUSTOM_PRIORITY

                key = cacheKey(CUSTOM, item['simplified'])
                values = cache.get(key)
                if(values):
                    values.append(item)
                    values.sort(key=lambda x: x['priority'])
                    cache.set(key, values)
                else:
                    cache.set(key, [item])

        cache.set("keylist::custom", [key.split("::")[1]
                  for key in cache.iter_keys(cacheKey(CUSTOM, "*"))])
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
                values = cache.get(key)
                if(values):
                    values.append(item)
                    values.sort(key=lambda x: x['priority'])
                    cache.set(key, values)
                else:
                    cache.set(key, [item])

                cache.set(entryKey(BLACKLIST, item), True)

    def loadPriorities(self):
        print("load priorities")
        with open(os.path.join(DATA_DIR, 'priority.json')) as f:
            data = json.load(f)
            # print(data)
            for item in data:
                item['priority'] = MAIN_PRIORITY

                key = cacheKey(PRIORITY, item['simplified'])
                values = cache.get(key)
                if(values):
                    values.append(item)
                    values.sort(key=lambda x: x['priority'])
                    cache.set(key, values)
                else:
                    cache.set(key, [item])

                cache.set(entryKey(PRIORITY, item), True)
        # updateDefaultPriorities()

    def clearDictionary(self):
        print("clearing dictionary")
        cache.delete_pattern(cacheKey(DICT, "*"))
        cache.delete("keylist::dict")

    def clearCustom(self):
        print("clearing custom")
        cache.delete_pattern(cacheKey(CUSTOM, "*"))
        cache.delete("keylist::custom")

    def clearBlacklist(self):
        print("clearing blacklist")
        cache.delete_pattern(cacheKey(BLACKLIST, "*"))

    def clearPriorities(self):
        print("clearing priorities")
        cache.delete_pattern(cacheKey(PRIORITY, "*"))

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
        cache.clear()

    def getDict(self, phrase):
        return cache.get(cacheKey(DICT, phrase))

    def get(self, phrase):

        # defaultEntries = self.dictCache.get(f"default::{phrase}")
        # surnameEntries = self.dictCache.get(f"surname::{phrase}")
        # variantEntries = self.dictCache.get(f"variant::{phrase}")
        # userEntries = self.dictCache.get(f"user::{phrase}")

        dictEntries = cache.get(cacheKey(DICT, phrase))
        customEntries = cache.get(cacheKey(CUSTOM, phrase))
        priorityEntries = cache.get(cacheKey(PRIORITY, phrase))
        blacklistEntries = cache.get(cacheKey(BLACKLIST, phrase))

        dictEntries = dictEntries if dictEntries else []
        customEntries = customEntries if customEntries else []
        priorityEntries = priorityEntries if priorityEntries else []
        blacklistEntries = blacklistEntries if blacklistEntries else []

        # if not entries:
        # not in regular dictionary, check if it's in custom
        # customEntries = self.customCache.get(phrase)

        # priorityEntries = self.priorityCache.get(phrase)

        # blacklistEntries = self.priorityCache.get(phrase)

        # entries = priorityEntries + customEntries + userEntries + defaultEntries + surnameEntries + variantEntries

        entries = customEntries + dictEntries

        def inPriority(entry):
            return cache.get(entryKey(PRIORITY, entry)) is not None

        def inBlacklist(entry):
            return cache.get(entryKey(BLACKLIST, entry)) is not None

        if blacklistEntries:
            entries = [entry for entry in entries if not inBlacklist(entry)]

        if priorityEntries:
            entries = [entry for entry in entries if not inPriority(entry)]
            entries.extend(priorityEntries)

        if not entries:
            return None

        entries.sort(key=lambda x: x['priority'])

        return entries


EntryManager = EntryManagerSingleton("me")
