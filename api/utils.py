import json
import os
import re
from django.conf import settings
from django.db import transaction

from .models import BlacklistEntry, Entry
from django.db.models import Q
from django.core.cache import cache

DATA_DIR = settings.BASE_DIR / 'data/'
NOVEL_DIR = settings.BASE_DIR / 'novels/'

# NOVEL_MAP:
# "cywlznrbhd": {
#   "name": "穿越未来之男人不好当",
#   "folder": "cywlznrbhd",
#   "sumamry": "It good."
# }

# NOVEL_MAP_REV:
# "穿越未来之男人不好当": {
#   "name": "穿越未来之男人不好当",
#   "folder": "cywlznrbhd",
#   "sumamry": "It good."
# }

NOVEL_MAP = {}
NOVEL_MAP_REV = {}
with open(os.path.join(DATA_DIR, 'novelmap.json')) as f:
    data = json.load(f)
    # print(data)
    for entry in data:
        # print(entry)
        NOVEL_MAP[entry["folder"]] = entry
        NOVEL_MAP_REV[entry["name"]] = entry

NBSP = '\u00a0'
SESSIONS = False


DICT = "dict"
BLACKLIST = "black"
PRIORITY = "priority"
CUSTOM = "custom"


TRAD = "trad"
TRADDICT = f"{TRAD}{DICT}"
TRADBLACKLIST = f"{TRAD}{BLACKLIST}"
TRADPRIORITY = f"{TRAD}{PRIORITY}"
TRADCUSTOM = f"{TRAD}{CUSTOM}"

# TODO: find a better term for priority... cause 'low priority' should be bad ^_^"
# Priority is lower the better, anything over MAX_PRIORITY will be skipped and has been blacklisted
MAIN_PRIORITY = 100
CUSTOM_PRIORITY = 200
USER_PRIORITY = 300
DEFAULT_PRIORITY = 500
LOANWORD_PRIORITY = 600
PRONOUN_PRIORITY = 700
USED_IN_PRIORITY = 750
SURNAME_PRIORITY = 800
OLD_PRIORITY = 850
VARIANT_PRIORITY = 900
OLD_VARIANT_PRIORITY = 950
MAX_PRIORITY = 1000
INVALID_PRIORITY = MAX_PRIORITY + 100


DEFAULT_OWNER = "default"


# @transaction.atomic
# def loadDefaultDictionary():
#     # f = open('./data/data.json', 'r')
#     with open(os.path.join(DATA_DIR, 'data2.json')) as f:
#         data = json.load(f)
#         # print(data)
#         for item in data:
#             if("surname" in item['english']):
#                 item['priority'] = SURNAME_PRIORITY
#             elif(item['pinyin'][0].isupper()):
#                 item['priority'] = PRONOUN_PRIORITY
#             elif("(archaic)" in item['english']):
#                 item['priority'] = OLD_PRIORITY
#             elif("(loanword)" in item['english']):
#                 item['priority'] = LOANWORD_PRIORITY
#             elif("oldvariant of" in item['english']):
#                 item['priority'] = OLD_VARIANT_PRIORITY
#             elif("variant of" in item['english']):
#                 item['priority'] = VARIANT_PRIORITY
#             else:
#                 item['priority'] = DEFAULT_PRIORITY

#             values = cache.get(item['simplified'])
#             if(values):
#                 values.append(item)
#                 values.sort(key=lambda x: x['priority'])
#                 cache.set(item['simplified'], values)
#             else:
#                 cache.set(item['simplified'], [item])
#             # entry = Entry(owner=DEFAULT_OWNER, traditional=item['traditional'],
#             #               simplified=item['simplified'], pinyin=item['pinyin'], english=item['english'], priority=priority)
#             # entry.save()


# # @transaction.atomic
# def loadCustomEntries():
#     # f = open('./data/data.json', 'r')
#     with open(os.path.join(DATA_DIR, 'custom.json')) as f:
#         data = json.load(f)
#         # print(data)
#         for item in data:
#             item['priority'] = CUSTOM_PRIORITY
            
#             values = cache.get(item['simplified'])
#             if(values):
#                 values.append(item)
#                 values.sort(key=lambda x: x['priority'])
#                 cache.set(item['simplified'], values)
#             else:
#                 cache.set(item['simplified'], [item])
#             # entry = Entry(owner="custom", traditional=item['traditional'],
#             #               simplified=item['simplified'], pinyin=item['pinyin'], english=item['english'], priority=CUSTOM_PRIORITY)
#             # entry.save()
            

# @transaction.atomic
# def loadDefaultBlacklist():
#     # f = open('./data/data.json', 'r')
#     with open(os.path.join(DATA_DIR, 'blacklist.json')) as f:
#         data = json.load(f)
#         # print(data)
#         for item in data:
#             entry = BlacklistEntry(owner=DEFAULT_OWNER, traditional=item['traditional'],
#                                    simplified=item['simplified'], pinyin=item['pinyin'], english=item['english'], reason=item['reason'])
#             entry.save()


# # @transaction.atomic
# def updatePriorities(data, priority):
#     for item in data:
#         # queryset = Entry.objects.filter(traditional=item['traditional'],
#         #                                 simplified=item['simplified'], pinyin=item['pinyin'])

#         values = cache.get(item['simplified'])
        
#         if not values:
#             return (False, "Unable to find matching item", item)
            
        
#         found = False
#         for value in values:
#             if(value['traditional'] == item['traditional'] and value['pinyin'] == item['pinyin']):
#                 value['priority'] = priority
#                 found = True
            
        
#         if found:
#             # values.sort(key=priorityKey)
#             values.sort(key=lambda x: x['priority'])
#             cache.set(item['simplified'], values)
#         else:
#             return (False, "Found key, but unable to find matching traditional and pinyin", item)
#         # cache.set(item['simplified'], values)
#         # else:
#             # cache.set(item['simplified'], [item])
        
#         # if not queryset.exists():

#         # if not queryset.count() == 1:
#             # return (False, "multiple matching items for", item)

#         # entry = queryset.first()
#         # entry.priority = priority
#         # entry.save()
#     return (True, "All Priorities loaded", None)

# TODO: revisit using this as comparisons
def entryKey(type, entry):
    return cacheKey(type, f"{entry['traditional']}::{entry['simplified']}::{entry['pinyin']}")

# def updateDefaultPriorities():
#     with open(os.path.join(DATA_DIR, 'priority.json')) as f:
#         data = json.load(f)
#         return updatePriorities(data, MAIN_PRIORITY)


# def updateBlacklistPriorities():
#     with open(os.path.join(DATA_DIR, 'blacklist.json')) as f:
#         data = json.load(f)
#         return updatePriorities(data, INVALID_PRIORITY)


# def updateCustomPriorities():
#     with open(os.path.join(DATA_DIR, 'custom.json')) as f:
#         data = json.load(f)
#         return updatePriorities(data, CUSTOM_PRIORITY)


def OwnerOrDefault(owner):
    return Q(owner=DEFAULT_OWNER) | Q(owner="custom") | Q(owner=owner)


def isChinese(char):
    # print("checking if it's chinese~")
    # Taken from:
    # https://www.unicode.org/versions/Unicode15.0.0/ch18.pdf Table 18-1, Table 18-2
    #
    # CJK Unified Ideographs 4E00–9FFF Common
    # CJK Unified Ideographs Extension A 3400–4DBF Rare
    # CJK Unified Ideographs Extension B 20000–2A6DF Rare, historic
    # CJK Unified Ideographs Extension C 2A700–2B73F Rare, historic
    # CJK Unified Ideographs Extension D 2B740–2B81F Uncommon, some in current use
    # CJK Unified Ideographs Extension E 2B820–2CEAF Rare, historic
    # CJK Unified Ideographs Extension F 2CEB0–2EBEF Rare, historic
    # CJK Unified Ideographs Extension G 30000–3134F Rare, historic
    # CJK Compatibility Ideographs F900–FAFF Duplicates, unifiable variants, corporate characters
    # CJK Compatibility Ideographs Supplement 2F800–2FA1F Unifiable variants
    #
    # Extensions
    #
    # 9FA6–9FB3 4.1 Interoperability with HKSCS standard
    # 9FB4–9FBB 4.1 Interoperability with GB 18030 standard
    # 9FBC–9FC2 5.1 Interoperability with commercial implementations
    # 9FC3 5.1 Correction of mistaken unification
    # 9FC4–9FC6 5.2 Interoperability with ARIB standard
    # 9FC7–9FCB 5.2 Interoperability with HKSCS standard
    # 9FCC 6.1 Interoperability with commercial implementations
    # 9FCD–9FCF 8.0 Interoperability with TGH 2013 standard
    # 9FD0 8.0 Correction of mistaken unification
    # 9FD1–9FD5 8.0 Miscellaneous urgently needed characters
    # 9FD6–9FE9 10.0 Ideographs for Slavonic transcription
    # 9FEA 10.0 Correction of mistaken unification
    # 9FEB–9FED 11.0 Ideographs for chemical elements
    # 9FEE–9FEF 11.0 Interoperability with government implementations
    # 9FF0–9FFC 13.0 Zoological, chemical, and geological terms
    # 4DB6-4DBF 13.0 Corrections of mistaken unifications
    # 2A6D7-2A6DD 13.0 Gongche characters for Kunqu Opera
    #  2A6DE–2A6DF 14.0 Interoperability with government implementations
    #  2B735–2B736 14.0 Corrections of mistaken unifications
    #  2B737 14.0 Urgently needed character
    #  2B738 14.0 Correction of mistaken unification
    #  2B739 15.0 Urgently needed character

    REGEX_CHINESE = '|'.join([r"[\u4E00-\u9FFF]",
                              r"[\u3400-\u4DBF]",
                              r"[\U00020000–\U0002A6DF]",
                              r"[\U0002A700–\U0002B73F]",
                              r"[\U0002B740–\U0002B81F]",
                              r"[\U0002B820–\U0002CEAF]",
                              r"[\U0002CEB0–\U0002EBEF]",
                              r"[\U00030000–\U0003134F]",
                              r"[\uF900-\uFAFF]",
                              r"[\U0002F800–\U0002FA1F]",
                              r"[\u9FA6-\u9FB3]",
                              r"[\u9FB4-\u9FBB]",
                              r"[\u9FBC-\u9FC2]",
                              r"[\u9FC3]",
                              r"[\u9FC4-\u9FC6]",
                              r"[\u9FC7-\u9FCB]",
                              r"[\u9FCC]",
                              r"[\u9FCD-\u9FCF]",
                              r"[\u9FD0]",
                              r"[\u9FD1-\u9FD5]",
                              r"[\u9FD6-\u9FE9]",
                              r"[\u9FEA]",
                              r"[\u9FEB-\u9FED]",
                              r"[\u9FEE-\u9FEF]",
                              r"[\u9FF0-\u9FFC]",
                              r"[\u4DB6-\u4DBF]",
                              r"[\U0002A6D7-\U0002A6DD]",
                              r"[\U0002A6DE-\U0002A6DF]",
                              r"[\U0002B735-\U0002B736]",
                              r"[\U0002B737]",
                              r"[\U0002B738]",
                              r"[\U0002B739]",])

    # REGEX_CHINESE = ''.join(['[\\u4e00-\\u9fff]',
    #                         '|[\\u3400-\\u4dbf]',
    #                          '|[\\u20000-\\u2a6df]',
    #                          '|[\\u2a700-\\u2b73f]',
    #                          '|[\\u2b740-\\u2b81f]',
    #                          '|[\\u2b820-\\u2ceaf]',
    #                          '|[\\uf900-\\ufaff]',
    #                          '|[\\u3300-\\u33ff]',
    #                          '|[\\ufe30-\\ufe4f]',
    #                          '|[\\uf900-\\ufaff]',
    #                          '|[\\u2f800-\\u2fa1f]'])
    # if r'\u4e00' <= char <= r'\u9fa5':
    #     print(f"char '{char}' is chinese!")
    #     return True;
    # print(f"char '{char}' is not chinese!")
    # return False
    # return r'\u4e00' <= char <= r'\u9fa5'
    return re.search(REGEX_CHINESE, char)


# Parses pinyin from ascii to utf-8
#  i.e. from 'san1' into 'sān'
# @param {*} pinyin in ascii
# @returns the proper pinyin, ready to display
def parsePinyin(pinyin):
    #   vowels = require('../../data/vowels.json');
    f = open(os.path.join(DATA_DIR, 'vowels.json'))
    vowels = json.load(f)
    # print(vowels)

    if pinyin is None or pinyin == "":
        return ""

    if pinyin == "r5":
        return "r"
    
    if pinyin == "R5":
        return "R"

    word = pinyin[:-1]
    accent = pinyin[-1]

    # print(f"word: {word}")
    # print(f"accent: {accent}")

    # 5 should be 轻声, so no changes needed
    if accent == "5":
        return word

    # Note: accent priority should be in the order aoeiuü
    # Note: in the case of 'iu' or 'ui', accent goes onto the terminal
    # Ex. liú or guǐ
    # source: http://www.ichineselearning.com/learn/pinyin-tones.html

    char = ""
    if "a" in word:
        char = "a"
    elif "A" in word:
        char = "A"
    elif "o" in word:
        char = "o"
    elif "O" in word:
        char = "O"
    elif "e" in word:
        char = "e"
    elif "E" in word:
        char = "E"
    elif "iu" in word:
        char = "u"
    elif "Iu" in word:
        char = "u"
    elif "ui" in word:
        char = "i"
    elif "Ui" in word:
        char = "i"
    elif "i" in word:
        char = "i"
    elif "I" in word:
        char = "I"
    elif "u:" in word:
        # confirmed that u and u: don't appear in the same word, so this ordering is fine
        char = "u:"
    elif "U:" in word:
        # confirmed that u and u: don't appear in the same word, so this ordering is fine
        char = "U:"
    elif "u" in word:
        char = "u"
    elif "U" in word:
        char = "U"
    else:
        print("ERROR: found pinyin with no vowel: " + pinyin)
        char = "?"

    # print(f"char: {char}")
    if vowels[char]:
        return word.replace(char, vowels[char][accent], 1).replace('u:', vowels['u:']["5"], 1).replace('U:', vowels['U:']["5"], 1)

    return word


def cacheKey(type, key):
    return f"{type}::{key}"

def reloadCEDict():

    # hashmap = {}
    halfmapA = {}
    halfmapB = {}
    tradhalfmapA = {}
    tradhalfmapB = {}
    keylistA = set()
    keylistB = set()
    tradkeylistA = set()
    tradkeylistB = set()
    cnt = 0
    with open(os.path.join(DATA_DIR, 'cedict_ts.u8')) as f:
        text = f.read()
        lines = text.split('\n')
        # make each line into a dictionary
        print("Parsing dictionary...")
        for line in lines:
            if line == '' or line.startswith("#") or line.startswith("%"):
                continue
            # traditional simplified [pinyin] /english.../
            split = line.split(' ', 2)

            traditional = split[0]
            simplified = split[1]
            rest = split[2].split(']', 1)
            pinyin = rest[0].lstrip('[')
            english = rest[1].strip().strip('/')
            
            # entry = {
            #     'traditional': traditional,
            #     'simplified': simplified,
            #     'pinyin': pinyin,
            #     'english': english
            # }
            # entries.append(entry)
            
            priority = INVALID_PRIORITY
            if("surname" in english):
                priority = SURNAME_PRIORITY
            elif(english.startswith("used in")):
                priority = USED_IN_PRIORITY
            elif("(loanword)" in english):
                priority = LOANWORD_PRIORITY
            elif("(archaic)" in english):
                priority = OLD_PRIORITY
            elif(pinyin[0].isupper()):
                priority = PRONOUN_PRIORITY
            elif("old variant of" in english):
                priority = OLD_VARIANT_PRIORITY
            elif("variant of" in english):
                priority = VARIANT_PRIORITY
            else:
                priority = DEFAULT_PRIORITY

            # entry['priority'] = priority
            
            entry = {
                'traditional': traditional,
                'simplified': simplified,
                'pinyin': pinyin,
                'english': english,
                'priority': priority
            }
            key = cacheKey(DICT, simplified)
            tradkey = cacheKey(TRADDICT, traditional)
            # if key in hashmap:
            #     try:
            #         hashmap[key].append(entry)
            #         hashmap[key].sort(key=lambda x: x['priority'])
            #     except:
            #         pass
            # else:
            #     hashmap[key] = [entry]
            
            if key in halfmapA:
                halfmapA[key].append(entry)
                halfmapA[key].sort(key=lambda x: x['priority'])
            elif key in halfmapB:
                halfmapB[key].append(entry)
                halfmapB[key].sort(key=lambda x: x['priority'])
            else:
                # Normally, we would simply do dict.keys(), but here, 'key' isn't the actual key we want
                if cnt < 60000:
                    keylistA.add(simplified)
                    halfmapA[key] = [entry]
                else:
                    keylistB.add(simplified)
                    halfmapB[key] = [entry]
            
            if tradkey in tradhalfmapA:
                tradhalfmapA[tradkey].append(entry)
                tradhalfmapA[tradkey].sort(key=lambda x: x['priority'])
            elif tradkey in tradhalfmapB:
                tradhalfmapB[tradkey].append(entry)
                tradhalfmapB[tradkey].sort(key=lambda x: x['priority'])
            else:
                # Normally, we would simply do dict.keys(), but here, 'key' isn't the actual key we want
                if cnt < 60000:
                    tradkeylistA.add(traditional)
                    tradhalfmapA[tradkey] = [entry]
                else:
                    tradkeylistB.add(traditional)
                    tradhalfmapB[tradkey] = [entry]
            cnt += 1
                


    print('Done!')
    # writeDataToFile(hashmap, "datamap.json")
    print('Done!Done!')
    writeDataToFile(list(keylistA), "keylistA.json")
    writeDataToFile(list(keylistB), "keylistB.json")
    writeDataToFile(list(tradkeylistA), f"{TRAD}keylistA.json")
    writeDataToFile(list(tradkeylistB), f"{TRAD}keylistB.json")
    print('Done!Done!Done!')
    

    # cnt = 0;
    # for key, value in hashmap:
    #     if cnt < 50000:
    #         halfmapA[key] = value
    #         cnt +=1;
    #     else:
    #         halfmapB[key] = value
    
    writeDataToFile(halfmapA, "datamapA.json")
    writeDataToFile(halfmapB, "datamapB.json")
    writeDataToFile(tradhalfmapA, f"{TRAD}datamapA.json")
    writeDataToFile(tradhalfmapB, f"{TRAD}datamapB.json")
    
    print('Done!Done!Done!Done!')
    setupCustomEntries()
    setupBlacklistEntries()
    setupPriorityEntries()
    print('Done!Done!Done!Done!Done!')
    
    return len(halfmapA), len(halfmapB)
    # remove entries for surnames from the data (optional):

def setupCustomEntries():
    # f = open('./data/data.json', 'r')
    
    keys = set()
    tradkeys = set()
    hashmap = {}
    tradhashmap = {}
    with open(os.path.join(DATA_DIR, 'custom.json')) as f:
        data = json.load(f)
        # print(data)
        for entry in data:
            entry['priority'] = CUSTOM_PRIORITY
            
            simplified = entry['simplified']
            traditional = entry['traditional']
            
            key = cacheKey(CUSTOM, simplified)
            tradkey = cacheKey(TRADCUSTOM, traditional)
            
            if key in hashmap:
                hashmap[key].append(entry)
                hashmap[key].sort(key=lambda x: x['priority'])
            else:
                keys.add(simplified)
                hashmap[key] = [entry]
            
            if tradkey in tradhashmap:
                tradhashmap[tradkey].append(entry)
                tradhashmap[tradkey].sort(key=lambda x: x['priority'])
            else:
                tradkeys.add(traditional)
                tradhashmap[tradkey] = [entry]
                
    print('Done!')
    writeDataToFile(list(keys), f"keylist{CUSTOM}.json")
    writeDataToFile(list(tradkeys), f"{TRAD}keylist{CUSTOM}.json")
    print('Done!Done!')
    writeDataToFile(hashmap, f"datamap{CUSTOM}.json")
    writeDataToFile(tradhashmap, f"{TRAD}datamap{CUSTOM}.json")
    print('Done!Done!Done!')

def setupBlacklistEntries():
    # f = open('./data/data.json', 'r')
    
    keys = set()
    tradkeys = set()
    hashmap = {}
    tradhashmap = {}
    with open(os.path.join(DATA_DIR, 'blacklist.json')) as f:
        data = json.load(f)
        # print(data)
        for entry in data:
            entry['priority'] = CUSTOM_PRIORITY
            
            simplified = entry['simplified']
            traditional = entry['traditional']
            
            key = cacheKey(BLACKLIST, simplified)
            tradkey = cacheKey(TRADBLACKLIST, traditional)
            
            if key in hashmap:
                hashmap[key].append(entry)
                hashmap[key].sort(key=lambda x: x['priority'])
            else:
                keys.add(simplified)
                hashmap[key] = [entry]
            
            if tradkey in tradhashmap:
                tradhashmap[tradkey].append(entry)
                tradhashmap[tradkey].sort(key=lambda x: x['priority'])
            else:
                tradkeys.add(traditional)
                tradhashmap[tradkey] = [entry]
                
    print('Done!')
    writeDataToFile(list(keys), f"keylist{BLACKLIST}.json")
    writeDataToFile(list(tradkeys), f"{TRAD}keylist{BLACKLIST}.json")
    print('Done!Done!')
    writeDataToFile(hashmap, f"datamap{BLACKLIST}.json")
    writeDataToFile(tradhashmap, f"{TRAD}datamap{BLACKLIST}.json")
    print('Done!Done!Done!')

def setupPriorityEntries():
    # f = open('./data/data.json', 'r')
    
    keys = set()
    tradkeys = set()
    hashmap = {}
    tradhashmap = {}
    with open(os.path.join(DATA_DIR, 'priority.json')) as f:
        data = json.load(f)
        # print(data)
        for entry in data:
            entry['priority'] = USER_PRIORITY
            
            simplified = entry['simplified']
            traditional = entry['traditional']
            
            key = cacheKey(PRIORITY, simplified)
            tradkey = cacheKey(TRADPRIORITY, traditional)
            
            if key in hashmap:
                hashmap[key].append(entry)
                hashmap[key].sort(key=lambda x: x['priority'])
            else:
                keys.add(simplified)
                hashmap[key] = [entry]
            
            if tradkey in tradhashmap:
                tradhashmap[tradkey].append(entry)
                tradhashmap[tradkey].sort(key=lambda x: x['priority'])
            else:
                tradkeys.add(traditional)
                tradhashmap[tradkey] = [entry]
                
    print('Done!')
    writeDataToFile(list(keys), f"keylist{PRIORITY}.json")
    writeDataToFile(list(tradkeys), f"{TRAD}keylist{PRIORITY}.json")
    print('Done!Done!')
    writeDataToFile(hashmap, f"datamap{PRIORITY}.json")
    writeDataToFile(tradhashmap, f"{TRAD}datamap{PRIORITY}.json")
    print('Done!Done!Done!')
    
    # writeDataToFile(hashmap, "datamap.json")
            # values = cache.get(entry['simplified'])
            # if(values):
            #     values.append(item)
            #     values.sort(key=lambda x: x['priority'])
            #     cache.set(item['simplified'], values)
            # else:
            #     cache.set(item['simplified'], [item])
            #     keys.append()



def writeDataToFile(data, filename):
    with open(os.path.join(DATA_DIR, filename), 'w') as out_file:
        json.dump(data, out_file, ensure_ascii=False, indent=2)

    # print("Removing Surnames . . .")
    # remove_surnames()

    # return list_of_dicts

    # If you want to save to a database as JSON objects, create a class Word in the Models file of your Django project:

    # print("Saving to database (this may take a few minutes) . . .")
    # for one_dict in list_of_dicts:
    #     new_word = Word(traditional = one_dict["traditional"], simplified = one_dict["simplified"], english = one_dict["english"], pinyin = one_dict["pinyin"], hsk = one_dict["hsk"])
    #     new_word.save()

    # define functions

    # def remove_surnames():
    #     for x in range(len(list_of_dicts)-1, -1, -1):
    #         if "surname " in list_of_dicts[x]['english']:
    #             if list_of_dicts[x]['traditional'] == list_of_dicts[x+1]['traditional']:
    #                 list_of_dicts.pop(x)

    # def main():

    # list_of_dicts = []
    # parsed_dict = main()


def listNovels():
    novels = os.listdir(NOVEL_DIR)
    obj = {}
    # TODO: march 22, 2024 maybe add some other order rather than just basic sort to the book list. maybe allow favorites?
    for novel in sorted(novels):
        chapters = os.listdir(os.path.join(NOVEL_DIR, novel))
        name = NOVEL_MAP.get(novel, {"name": novel})["name"]
        print(name)
        obj[name] = sorted(chapters)
    return obj
        

def openChapterText(novelName, chapter):
    lines = ""
    name = NOVEL_MAP_REV.get(novelName, {"folder": novelName})["folder"]
    with open(os.path.join(NOVEL_DIR, name, chapter), 'r') as f:        
        lines = "".join(f.readlines())
    return lines
