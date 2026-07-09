// Represents a single Chinese character with its pinyin
export interface ChineseEntry {
  pinyin: string;
  cchar: string;
}

// Represents a phrase (word) with its characters and English definition
export interface PhraseEntry {
  cchars: ChineseEntry[];
  english: string;
}

// Either a PhraseEntry or a ChineseEntry (non-Chinese separator)
export type AnnotationToken = PhraseEntry | ChineseEntry;

// Dictionary entry from the backend
export interface Entry {
  id: number;
  owner: string;
  traditional: string;
  simplified: string;
  pinyin: string;
  english: string;
  priority: number;
}

// Fragment used in memory save/load
export interface Fragment {
  pinyin: string;
  cchar: string;
}

// Memory object returned from fetch
export interface MemoryResponse {
  code: number;
  fragments: Fragment[];
}

// Type guard: is the token a PhraseEntry?
export function isPhraseEntry(token: AnnotationToken): token is PhraseEntry {
  return "cchars" in token;
}
