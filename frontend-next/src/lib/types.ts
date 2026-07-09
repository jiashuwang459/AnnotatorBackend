export type Fragment = {
  pinyin: string;
  cchar: string;
};

export type PhraseAnnotation = {
  cchars: Fragment[];
  english: string;
};

export type AnnotationItem = Fragment | PhraseAnnotation;

export type NovelMap = Record<string, string[]>;

export type DictionaryEntry = {
  id: number;
  owner: string;
  traditional: string;
  simplified: string;
  pinyin: string;
  english: string;
  priority: number;
};

export type MemoryRecord = {
  code: number;
  fragments: Fragment[];
};

export type EditEntryType = "custom" | "priority" | "blacklist" | "other";

export type EditEntryRecord = {
  id: number;
  owner: string;
  traditional: string;
  simplified: string;
  pinyin: string;
  english: string;
  priority: number;
  reason: string;
  notes: string;
  type: EditEntryType;
};

export function isPhraseAnnotation(item: AnnotationItem): item is PhraseAnnotation {
  return "cchars" in item;
}
