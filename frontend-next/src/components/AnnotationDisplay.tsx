"use client";

import { useState, useRef, useEffect } from "react";
import type { AnnotationToken, PhraseEntry, ChineseEntry, Fragment } from "@/types";
import { isPhraseEntry } from "@/types";
import { parsePinyin } from "@/lib/pinyin";
import { lookupPhrase } from "@/lib/api";
import type { Entry } from "@/types";
import { parsePinyinString } from "@/lib/pinyin";

const NBSP = "\u00a0";

interface AnnotationDisplayProps {
  tokens: AnnotationToken[];
  onMemoryUpdate?: (fragments: Fragment[]) => void;
  getMemoryFragments?: () => Fragment[];
}

// Inline HelperCard rendered next to a clicked phrase
interface InlineHelperProps {
  phrase: string;
  onClose: () => void;
}

function InlineHelper({ phrase, onClose }: InlineHelperProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    setStep(0);
    lookupPhrase(phrase)
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [phrase]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const entry = entries[step];

  return (
    <div
      ref={ref}
      className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-1 w-64 bg-amber-50 border border-gray-400 rounded shadow-xl text-sm"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-300">
        <span className="font-semibold text-base text-gray-700">{phrase}</span>
        <button onClick={onClose} className="text-gray-400 hover:text-red-500 text-xs">
          ✕
        </button>
      </div>
      <div className="px-3 py-2 min-h-[100px]">
        {loading && <p className="text-gray-400 text-center mt-4">Loading…</p>}
        {!loading && !entry && <p className="text-gray-400 text-center mt-4">No entries found.</p>}
        {entry && (
          <>
            <div className="flex gap-2 items-baseline mb-1">
              <span className="text-xl font-bold">{entry.simplified}</span>
              {entry.traditional && entry.traditional !== entry.simplified && (
                <span className="text-gray-500 text-sm">({entry.traditional})</span>
              )}
              <span className="text-indigo-600">{parsePinyinString(entry.pinyin)}</span>
            </div>
            <ol className="list-decimal list-inside text-gray-700 text-xs space-y-0.5">
              {entry.english.split("/").map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ol>
          </>
        )}
      </div>
      <div className="flex justify-between items-center px-3 py-1 border-t border-gray-300">
        <button
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
          className="px-2 py-0.5 text-xs border rounded disabled:opacity-30 hover:bg-gray-100"
        >
          ‹
        </button>
        <span className="text-xs text-gray-500">
          {entries.length > 0 ? `${step + 1}/${entries.length}` : "—"}
        </span>
        <button
          disabled={step >= entries.length - 1}
          onClick={() => setStep((s) => s + 1)}
          className="px-2 py-0.5 text-xs border rounded disabled:opacity-30 hover:bg-gray-100"
        >
          ›
        </button>
      </div>
    </div>
  );
}

// A clickable phrase token
function PhraseToken({
  token,
  onAddToMemory,
}: {
  token: PhraseEntry;
  onAddToMemory?: (frags: Fragment[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const phrase = token.cchars.map((c) => c.cchar).join("");

  const handleClick = () => {
    setOpen((o) => !o);
    onAddToMemory?.(token.cchars);
  };

  return (
    <span className="relative inline-flex flex-row mx-0.5 cursor-pointer group">
      {token.cchars.map((ce, i) => (
        <span
          key={i}
          onClick={handleClick}
          className="inline-flex flex-col items-center leading-none select-none"
        >
          <span className="text-[0.6rem] text-indigo-500 h-4 leading-none">
            {parsePinyin(ce.pinyin) !== NBSP ? parsePinyin(ce.pinyin) : ""}
          </span>
          <span className="text-xl group-hover:bg-indigo-50 rounded px-px transition-colors">
            {ce.cchar}
          </span>
        </span>
      ))}
      {open && (
        <InlineHelper phrase={phrase} onClose={() => setOpen(false)} />
      )}
    </span>
  );
}

// A non-Chinese separator / punctuation token
function SeparatorToken({ token }: { token: ChineseEntry }) {
  const text = token.cchar;
  if (!text || text === NBSP || text === " ") {
    return <span className="inline-block w-2" />;
  }
  if (text === "\n") {
    return <br />;
  }
  return (
    <span className="inline-flex flex-col items-center mx-0.5 leading-none">
      <span className="text-[0.6rem] h-4" />
      <span className="text-xl text-gray-600">{text}</span>
    </span>
  );
}

export default function AnnotationDisplay({
  tokens,
  onMemoryUpdate,
}: AnnotationDisplayProps) {
  const [memFragments, setMemFragments] = useState<Fragment[]>([]);

  const handleAddToMemory = (frags: Fragment[]) => {
    setMemFragments((prev) => {
      const merged = [...prev, ...frags];
      // Deduplicate by cchar+pinyin
      const seen = new Set<string>();
      const deduped = merged.filter((f) => {
        const key = `${f.cchar}:${f.pinyin}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      onMemoryUpdate?.(deduped);
      return deduped;
    });
  };

  if (!tokens.length) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
        Annotated text will appear here.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-y-3 px-4 py-3 leading-relaxed">
      {tokens.map((token, i) =>
        isPhraseEntry(token) ? (
          <PhraseToken
            key={i}
            token={token}
            onAddToMemory={handleAddToMemory}
          />
        ) : (
          <SeparatorToken key={i} token={token as ChineseEntry} />
        )
      )}
    </div>
  );
}
