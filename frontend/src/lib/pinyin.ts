const vowels: Record<string, Record<string, string>> = {
  a: { "1": "ā", "2": "á", "3": "ǎ", "4": "à", "5": "a" },
  A: { "1": "Ā", "2": "Á", "3": "Ǎ", "4": "À", "5": "A" },
  e: { "1": "ē", "2": "é", "3": "ě", "4": "è", "5": "e" },
  E: { "1": "Ē", "2": "É", "3": "Ě", "4": "È", "5": "E" },
  i: { "1": "ī", "2": "í", "3": "ǐ", "4": "ì", "5": "i" },
  I: { "1": "Ī", "2": "Í", "3": "Ǐ", "4": "Ì", "5": "I" },
  o: { "1": "ō", "2": "ó", "3": "ǒ", "4": "ò", "5": "o" },
  O: { "1": "Ō", "2": "Ó", "3": "Ǒ", "4": "Ò", "5": "O" },
  u: { "1": "ū", "2": "ú", "3": "ǔ", "4": "ù", "5": "u" },
  U: { "1": "Ū", "2": "Ú", "3": "Ǔ", "4": "Ù", "5": "U" },
  "u:": { "1": "ǖ", "2": "ǘ", "3": "ǚ", "4": "ǜ", "5": "ü" },
  "U:": { "1": "Ǖ", "2": "Ǘ", "3": "Ǚ", "4": "Ǜ", "5": "Ü" },
};

export function parsePinyin(pinyin: string) {
  // console.log(pinyin)
  if (!pinyin) {
    return "";
  }

  if (pinyin === "r5") {
    return "r";
  }

  const accent = pinyin[pinyin.length - 1];

  // No accent or invalid accent, return the original pinyin
  if (!["1", "2", "3", "4", "5"].includes(accent)) {
    return pinyin;
  }

  const word = pinyin.slice(0, -1);

  if (accent === "5") {
    return word.replace("u:", "ü").replace("U:", "Ü");
  }

  let target = "";

  if (word.includes("a")) target = "a";
  else if (word.includes("A")) target = "A";
  else if (word.includes("o")) target = "o";
  else if (word.includes("O")) target = "O";
  else if (word.includes("e")) target = "e";
  else if (word.includes("E")) target = "E";
  else if (word.includes("iu") || word.includes("Iu")) target = "u";
  else if (word.includes("ui") || word.includes("Ui")) target = "i";
  else if (word.includes("i")) target = "i";
  else if (word.includes("I")) target = "I";
  else if (word.includes("u:")) target = "u:";
  else if (word.includes("U:")) target = "U:";
  else if (word.includes("u")) target = "u";
  else if (word.includes("U")) target = "U";

  if (!target || !vowels[target]?.[accent]) {
    return word.replace("u:", "ü").replace("U:", "Ü");
  }

  return word
    .replace(target, vowels[target][accent])
    .replace("u:", vowels["u:"]["5"])
    .replace("U:", vowels["U:"]["5"]);
}
