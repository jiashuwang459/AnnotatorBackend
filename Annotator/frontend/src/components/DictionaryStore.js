export function DictionaryStore() {
    this.data = {};
}


DictionaryStore.prototype.add = function (key, entry) {
    if (!this.data[key]) {
        this.data[key] = []
    }
    this.data[key].push(entry)

}

DictionaryStore.prototype.get = function (key) {
    if (this.data[key]) {
        return this.data[key][0]
    } else {
        console.error("Unable to find key '" + key + "'")
    }
}

DictionaryStore.prototype.getPinYin = function (key) {
    return this.get(key)["pinyin"]
}


DictionaryStore.prototype.contains = function (key, entry) {
    if (this.data[key]) {
        for (let c of this.data[key]) {
            // console.log("comparing")
            // console.log(c)
            // console.log(entry)
            if (entry["simplified"] == c["simplified"]
                && entry["traditional"] == c["traditional"]
                && entry["pinyin"] == c["pinyin"]
                && entry["english"] == c["english"]) {
                return true;
            }
        }
    }
    return false
}

//returns a boolean indicating whether or not the entire key is gone
DictionaryStore.prototype.remove = function (key, entry) {
    if (this.data[key]) {
        this.data[key] = this.data[key].filter(function (v, index, arr) {
            return entry["simplified"] != v["simplified"]
                || entry["traditional"] != v["traditional"]
                || entry["pinyin"] != v["pinyin"]
                || entry["english"] != v["english"]
        });

        if (this.data[key].length == 0) {
            delete this.data[key]
            return true;
        }
    }
    return false
}