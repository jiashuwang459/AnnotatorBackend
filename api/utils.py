import json
import os
import re
from django.conf import settings
from django.db import transaction

from .models import BlacklistEntry, Entry
from django.db.models import Q
from django.core.cache import cache

DATA_DIR = settings.BASE_DIR / 'data/'

NBSP = '\u00a0'
SESSIONS = False


DICT = "dict"
BLACKLIST = "black"
PRIORITY = "priority"
CUSTOM = "custom"

# TODO: find a better term for priority... cause 'low priority' should be bad ^_^"
# Priority is lower the better, anything over MAX_PRIORITY will be skipped and has been blacklisted
MAIN_PRIORITY = 100
CUSTOM_PRIORITY = 200
USER_PRIORITY = 300
DEFAULT_PRIORITY = 500
SURNAME_PRIORITY = 800
VARIANT_PRIORITY = 900
MAX_PRIORITY = 1000
INVALID_PRIORITY = MAX_PRIORITY + 100


DEFAULT_OWNER = "default"


# @transaction.atomic
def loadDefaultDictionary():
    # f = open('./data/data.json', 'r')
    with open(os.path.join(DATA_DIR, 'data2.json')) as f:
        data = json.load(f)
        # print(data)
        for item in data:
            if("surname" in item['english']):
                item['priority'] = SURNAME_PRIORITY
            elif("variant of" in item['english']):
                item['priority'] = VARIANT_PRIORITY
            else:
                item['priority'] = DEFAULT_PRIORITY

            values = cache.get(item['simplified'])
            if(values):
                values.append(item)
                values.sort(key=lambda x: x['priority'])
                cache.set(item['simplified'], values)
            else:
                cache.set(item['simplified'], [item])
            # entry = Entry(owner=DEFAULT_OWNER, traditional=item['traditional'],
            #               simplified=item['simplified'], pinyin=item['pinyin'], english=item['english'], priority=priority)
            # entry.save()


# @transaction.atomic
def loadCustomEntries():
    # f = open('./data/data.json', 'r')
    with open(os.path.join(DATA_DIR, 'custom.json')) as f:
        data = json.load(f)
        # print(data)
        for item in data:
            item['priority'] = CUSTOM_PRIORITY
            
            values = cache.get(item['simplified'])
            if(values):
                values.append(item)
                values.sort(key=lambda x: x['priority'])
                cache.set(item['simplified'], values)
            else:
                cache.set(item['simplified'], [item])
            # entry = Entry(owner="custom", traditional=item['traditional'],
            #               simplified=item['simplified'], pinyin=item['pinyin'], english=item['english'], priority=CUSTOM_PRIORITY)
            # entry.save()
            

@transaction.atomic
def loadDefaultBlacklist():
    # f = open('./data/data.json', 'r')
    with open(os.path.join(DATA_DIR, 'blacklist.json')) as f:
        data = json.load(f)
        # print(data)
        for item in data:
            entry = BlacklistEntry(owner=DEFAULT_OWNER, traditional=item['traditional'],
                                   simplified=item['simplified'], pinyin=item['pinyin'], english=item['english'], reason=item['reason'])
            entry.save()


# @transaction.atomic
def updatePriorities(data, priority):
    for item in data:
        # queryset = Entry.objects.filter(traditional=item['traditional'],
        #                                 simplified=item['simplified'], pinyin=item['pinyin'])

        values = cache.get(item['simplified'])
        
        if not values:
            return (False, "Unable to find matching item", item)
            
        
        found = False
        for value in values:
            if(value['traditional'] == item['traditional'] and value['pinyin'] == item['pinyin']):
                value['priority'] = priority
                found = True
            
        
        if found:
            # values.sort(key=priorityKey)
            values.sort(key=lambda x: x['priority'])
            cache.set(item['simplified'], values)
        else:
            return (False, "Found key, but unable to find matching traditional and pinyin", item)
        # cache.set(item['simplified'], values)
        # else:
            # cache.set(item['simplified'], [item])
        
        # if not queryset.exists():

        # if not queryset.count() == 1:
            # return (False, "multiple matching items for", item)

        # entry = queryset.first()
        # entry.priority = priority
        # entry.save()
    return (True, "All Priorities loaded", None)


def entryKey(type, entry):
    return cacheKey(type, f"{entry['traditional']}::{entry['simplified']}::{entry['pinyin']}")

def updateDefaultPriorities():
    with open(os.path.join(DATA_DIR, 'priority.json')) as f:
        data = json.load(f)
        return updatePriorities(data, MAIN_PRIORITY)


def updateBlacklistPriorities():
    with open(os.path.join(DATA_DIR, 'blacklist.json')) as f:
        data = json.load(f)
        return updatePriorities(data, INVALID_PRIORITY)


def updateCustomPriorities():
    with open(os.path.join(DATA_DIR, 'custom.json')) as f:
        data = json.load(f)
        return updatePriorities(data, CUSTOM_PRIORITY)


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
    keys = set()
    cnt = 0;
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
            
            entry = {
                'traditional': traditional,
                'simplified': simplified,
                'pinyin': pinyin,
                'english': english
            }
            # entries.append(entry)
            
            priority = INVALID_PRIORITY
            if("surname" in english):
                priority = SURNAME_PRIORITY
            elif("variant of" in english):
                priority = VARIANT_PRIORITY
            else:
                priority = DEFAULT_PRIORITY

            entry['priority'] = priority
            key = cacheKey("dict", simplified)
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
            else:
                if cnt < 60000:
                    keys.add(simplified)
                    halfmapA[key] = [entry]
                else:
                    if key in halfmapB:
                        halfmapB[key].append(entry)
                        halfmapB[key].sort(key=lambda x: x['priority'])
                    else:
                        halfmapB[key] = [entry]
            cnt += 1;
                

    print('Done!')
    # writeDataToFile(hashmap, "datamap.json")
    print('Done!Done!')
    writeDataToFile(list(keys), "keylistA.json")
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
    hashmap = {}
    with open(os.path.join(DATA_DIR, 'custom.json')) as f:
        data = json.load(f)
        # print(data)
        for entry in data:
            entry['priority'] = CUSTOM_PRIORITY
            
            simplified = entry['simplified']
            
            key = cacheKey(CUSTOM, simplified)
            
            if key in hashmap:
                hashmap[key].append(entry)
                hashmap[key].sort(key=lambda x: x['priority'])
            else:
                keys.add(simplified)
                hashmap[key] = [entry]
                
    print('Done!')
    writeDataToFile(list(keys), f"keylist{CUSTOM}.json")
    print('Done!Done!')
    writeDataToFile(hashmap, f"datamap{CUSTOM}.json")
    print('Done!Done!Done!')

def setupBlacklistEntries():
    # f = open('./data/data.json', 'r')
    
    keys = set()
    hashmap = {}
    with open(os.path.join(DATA_DIR, 'blacklist.json')) as f:
        data = json.load(f)
        # print(data)
        for entry in data:
            entry['priority'] = CUSTOM_PRIORITY
            
            simplified = entry['simplified']
            
            key = cacheKey(BLACKLIST, simplified)
            
            if key in hashmap:
                hashmap[key].append(entry)
                hashmap[key].sort(key=lambda x: x['priority'])
            else:
                keys.add(simplified)
                hashmap[key] = [entry]
                
    print('Done!')
    writeDataToFile(list(keys), f"keylist{BLACKLIST}.json")
    print('Done!Done!')
    writeDataToFile(hashmap, f"datamap{BLACKLIST}.json")
    print('Done!Done!Done!')

def setupPriorityEntries():
    # f = open('./data/data.json', 'r')
    
    keys = set()
    hashmap = {}
    with open(os.path.join(DATA_DIR, 'priority.json')) as f:
        data = json.load(f)
        # print(data)
        for entry in data:
            entry['priority'] = CUSTOM_PRIORITY
            
            simplified = entry['simplified']
            
            key = cacheKey(PRIORITY, simplified)
            
            if key in hashmap:
                hashmap[key].append(entry)
                hashmap[key].sort(key=lambda x: x['priority'])
            else:
                keys.add(simplified)
                hashmap[key] = [entry]
                
    print('Done!')
    writeDataToFile(list(keys), f"keylist{PRIORITY}.json")
    print('Done!Done!')
    writeDataToFile(hashmap, f"datamap{PRIORITY}.json")
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
