
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


import json
import os

from api.utils import DATA_DIR, TRAD, CUSTOM, BLACKLIST

class Trie(object):
    _TrieCache = dict()
    END = "_end_"
    NAME = "_name_"

    def __init__(self, owner):
        self.root = {
            Trie.NAME: 'root'
        }
        self.owner = owner

    def insert(self, word):
        current_dict = self.root
        for letter in word:
            current_dict = current_dict.setdefault(
                letter, {Trie.NAME: letter}
            )
        if Trie.END in current_dict:
            current_dict[Trie.END] += 1
        else:
            current_dict[Trie.END] = 1
        pass

    def insertMany(self, words):
        for word in words:
            self.insert(word)

    def removeMany(self, words):
        for word in words:
            self.remove(word)

    def remove(self, word):
        seen = list()
        node = self.root
        for letter in word:
            seen.insert(0, node)
            if letter not in node:
                return False
            node = node[letter]
            char = node[Trie.NAME]

        if Trie.END in node and node[Trie.END] > 1:
            node[Trie.END] -= 1
        elif Trie.END in node and node[Trie.END] == 1:
            del node[Trie.END]

            # Ex.
            # insert("can")
            # insert("cat")
            # remove("cat")
            # then at this point, seen is ['a', 'c', 'root'], where it corresponds to the name of the dictionaries
            # we check to see if the child only has a name
            #
            # root = {                           <- seen[2] = {'_name_': 'root', ...}
            #     '_name_': 'root',
            #     'c': {                         <- seen[1] = {'_name_': 'c', ...}
            #         '_name_': 'c',
            #         'a': {                     <- seen[0] = {'_name_': 'a', ...}
            #             '_name_': 'a',
            #             'n': {
            #                 '_name_': 'n'
            #                 '_end_': True
            #             }
            #             't': {``
            #                 '_name_': 't'      <- char = 't'
            #             }
            #         }
            #     }
            # }
            #
            # parent = seen[0]              <--  {'_name_': 'a', ...}
            # parent[char] = {'_name_': 't'}
            # len(parent[char])             <-- this is 1, so we know it's empty and we can delete it!
            # del parent[char]
            # char = parent['_name_']       <-- char = 'a'
            #
            # root = {                           <- seen[2] = {'_name_': 'root', ...}
            #     '_name_': 'root',
            #     'c': {                         <- seen[1] = {'_name_': 'c', ...}
            #         '_name_': 'c',
            #         'a': {                     <- seen[0] = {'_name_': 'a', ...}
            #             '_name_': 'a',
            #             'n': {
            #                 '_name_': 'n'
            #                 '_end_': True
            #             }
            #         }
            #     }
            # }
            #
            # parent = seen[1]              <--  {'_name_': 'c', ...}
            # parent[char] = {'_name_': 'a'}
            # len(parent[char])             <-- this is 2, so we know it's not empty and we can stop
            #
            # :D

            for parent in seen:
                # each node has a name, might have END and other chars
                # if child only has name, then we delete it
                if char in parent:
                    if len(parent[char]) == 1:
                        # delete the child if it only has it's name
                        del parent[char]
                        char = parent[Trie.NAME]
                    else:
                        break
                else:
                    raise "child isn't in parent O.o"

    def contains(self, word):
        node = self.root
        for letter in word:
            if letter not in node:
                return False
            node = node[letter]
        return Trie.END in node

    def findBest(self, text):
        node = self.root
        seen = list()
        for letter in text:
            # print(f"letter: {letter}")
            # print(f"node: {node.keys()}")
            if letter not in node:
                break
            node = node[letter]
            seen.insert(0, node)

        # print(f"seen: {seen}")
        found = False
        output = list()
        for nnode in seen:
            if not found:
                if Trie.END in nnode:
                    found = True
                    output.insert(0, nnode[Trie.NAME])
            else:
                output.insert(0, nnode[Trie.NAME])

        return "".join(output)

    @staticmethod
    def getTrie(owner):
        print(f"trying to get trie for owner:{owner}")
        print("currentTries:")

        for key in Trie._TrieCache.keys():
            print(f" {key}")

        if owner not in Trie._TrieCache:
            return Trie.createTrie(owner,[])
        return Trie._TrieCache[owner]
    
    @staticmethod
    def loadTrie(owner):
        trie: Trie = Trie.getTrie(owner)
        filename = f"keylistA.json"
        with open(os.path.join(DATA_DIR, filename)) as f:
            data = json.load(f)
            trie.insertMany(data)
            
        filename = f"keylistB.json"
        with open(os.path.join(DATA_DIR, filename)) as f:
            data = json.load(f)
            trie.insertMany(data)
            
        with open(os.path.join(DATA_DIR, f"keylist{CUSTOM}.json")) as f:
            data = json.load(f)
            trie.insertMany(data)

        with open(os.path.join(DATA_DIR, f"keylist{BLACKLIST}.json")) as f:
            data = json.load(f)
            trie.removeMany(data)

    @staticmethod
    def createTrie(owner, words):
        if owner not in Trie._TrieCache:
            print("owner not in cache")
            newTrie = Trie(owner)
            newTrie.insertMany(words)
            Trie._TrieCache[owner] = newTrie
        return Trie._TrieCache[owner]

    @staticmethod
    def clearTries():
        print("clearing all tries")
        Trie._TrieCache = dict()
        print([trie for trie in Trie._TrieCache])

    def __str__(self):
        return f"Trie({self.owner})"


# // check if it contains a whole word.
# // time complexity: O(k), k = word length
# Trie.prototype.findBest = function (word) {
#     var node = this.root;
#     var output = [];
#     // for every character in the word
#     for (var i = 0; i < word.length; i++) {
#         // check to see if character node exists in children.
#         if (node.children[word[i]]) {
#             // if it exists, proceed to the next depth of the trie.
#             node = node.children[word[i]];
#         } else {
#             // node = node.parent;
#             // //back track until the first valid 'word'
#             // while(node !== null && !node.end){
#             //     node = node.parent;
#             // }
#             break
#         }
#     }

#     //back track until the first valid 'word'
#     while(node !== null && !node.end){
#         node = node.parent;
#     }

#     while (node !== null) {
#         output.unshift(node.key);
#         node = node.parent;
#     }

#     return output.join('');
#     // we finished going through all the words, but is it a whole word?
#     return node.end;
# };

    # def add(self, word: str):
    #     """
    #     Adding a word in the trie structure
    #     """
    #     node = self.root
    #     for char in word:
    #         found_in_child = False
    #         # Search for the character in the children of the present `node`
    #         for child in node.children:
    #             if child.char == char:
    #                 # We found it, increase the counter by 1 to keep track that another
    #                 # word has it as well
    #                 child.counter += 1
    #                 # And point the node to the child that contains this char
    #                 node = child
    #                 found_in_child = True
    #                 break
    #         # We did not find it so add a new chlid
    #         if not found_in_child:
    #             new_node = TrieNode(char)
    #             node.children.append(new_node)
    #             # And then point node to the new child
    #             node = new_node
    #     # Everything finished. Mark it as the end of a word.
    #     node.word_finished = True

    # def find_prefix(self, prefix: str):
    #     """
    #     Check and return
    #     1. If the prefix exsists in any of the words we added so far
    #     2. If yes then how may words actually have the prefix
    #     """
    #     node = self.root
    #     # If the root node has no children, then return False.
    #     # Because it means we are trying to search in an empty trie
    #     if not node.children:
    #         return False, 0
    #     for char in prefix:
    #         char_not_found = True
    #         # Search through all the children of the present `node`
    #         for child in node.children:
    #             if child.char == char:
    #                 # We found the char existing in the child.
    #                 char_not_found = False
    #                 # Assign node as the child containing the char and break
    #                 node = child
    #                 break
    #         # Return False anyway when we did not find a char.
    #         if char_not_found:
    #             return False, 0
    #     # Well, we are here means we have found the prefix. Return true to indicate that
    #     # And also the counter of the last node. This indicates how many words have this
    #     # prefix
    #     return True, node.counter


class TradTrie(Trie):
    _TradTrieCache = dict()
    
    def __init__(self, owner):
        super().__init__(owner)
        
    @staticmethod
    def getTrie(owner):
        print(f"trying to get trie for owner:{owner}")
        print("currentTries:")

        for key in TradTrie._TradTrieCache.keys():
            print(f" {key}")

        if owner not in TradTrie._TradTrieCache:
            return TradTrie.createTrie(owner,[])
        return TradTrie._TradTrieCache[owner]

    @staticmethod
    def loadTrie(owner):
        trie: TradTrie = TradTrie.getTrie(owner)
        filename = f"{TRAD}keylistA.json"
        with open(os.path.join(DATA_DIR, filename)) as f:
            data = json.load(f)
            trie.insertMany(data)
            
        filename = f"{TRAD}keylistB.json"
        with open(os.path.join(DATA_DIR, filename)) as f:
            data = json.load(f)
            trie.insertMany(data)
            
        with open(os.path.join(DATA_DIR, f"{TRAD}keylist{CUSTOM}.json")) as f:
            data = json.load(f)
            trie.insertMany(data)

        with open(os.path.join(DATA_DIR, f"{TRAD}keylist{BLACKLIST}.json")) as f:
            data = json.load(f)
            trie.removeMany(data)
    
    @staticmethod
    def createTrie(owner, words):
        if owner not in TradTrie._TradTrieCache:
            print("owner not in cache")
            newTrie = TradTrie(owner)
            newTrie.insertMany(words)
            TradTrie._TradTrieCache[owner] = newTrie
        return TradTrie._TradTrieCache[owner]

    @staticmethod
    def clearTries():
        print("clearing all tradTries")
        TradTrie._TradTrieCache = dict()
        print([trie for trie in TradTrie._TradTrieCache])
                
    def __str__(self):
        return f"TradTrie({self.owner})"
