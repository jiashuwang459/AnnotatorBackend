"use client";

import { useState, useEffect } from "react";
import type { Entry } from "@/types";
import { lookupPhrase } from "@/lib/api";
import { parsePinyinString } from "@/lib/pinyin";

interface HelperCardProps {
  phrase: string;
  onClose?: () => void;
  onPin?: (pinned: boolean) => void;
}

export default function HelperCard({ phrase, onClose, onPin }: HelperCardProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (!phrase) return;
    setLoading(true);
    setError(null);
    setStep(0);
    lookupPhrase(phrase)
      .then(setEntries)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [phrase]);

  const entry = entries[step];
  const maxSteps = entries.length;

  const handlePin = () => {
    const next = !pinned;
    setPinned(next);
    onPin?.(next);
  };

  return (
    <div className="w-64 bg-amber-50 border border-gray-400 rounded shadow-lg flex flex-col text-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-300">
        <span className="font-semibold text-base text-gray-700">{phrase}</span>
        <div className="flex gap-1">
          <button
            onClick={handlePin}
            title={pinned ? "Unpin" : "Pin"}
            className={`p-1 rounded text-xs ${pinned ? "text-indigo-600" : "text-gray-400"} hover:text-indigo-600`}
          >
            {pinned ? "📌" : "📍"}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded text-gray-400 hover:text-red-500 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-3 py-2 min-h-[120px]">
        {loading && (
          <p className="text-gray-400 text-center mt-4">Loading…</p>
        )}
        {error && (
          <p className="text-red-500 text-center mt-4">{error}</p>
        )}
        {!loading && !error && !entry && (
          <p className="text-gray-400 text-center mt-4">No entries found.</p>
        )}
        {entry && (
          <>
            <div className="flex gap-2 items-baseline mb-2">
              <span className="text-xl font-bold text-gray-800">
                {entry.simplified}
              </span>
              {entry.traditional && entry.traditional !== entry.simplified && (
                <span className="text-gray-500">({entry.traditional})</span>
              )}
              <span className="text-indigo-600 font-medium">
                {parsePinyinString(entry.pinyin)}
              </span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              {entry.english.split("/").map((def, i) => (
                <li key={i}>{def}</li>
              ))}
            </ol>
          </>
        )}
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-gray-300">
        <button
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
          className="px-2 py-1 text-xs border border-gray-400 rounded disabled:opacity-30 hover:bg-gray-100"
        >
          ‹
        </button>
        <span className="text-xs text-gray-500">
          {maxSteps > 0 ? `${step + 1} / ${maxSteps}` : "—"}
        </span>
        <button
          disabled={step >= maxSteps - 1}
          onClick={() => setStep((s) => s + 1)}
          className="px-2 py-1 text-xs border border-gray-400 rounded disabled:opacity-30 hover:bg-gray-100"
        >
          ›
        </button>
      </div>
    </div>
  );
}
