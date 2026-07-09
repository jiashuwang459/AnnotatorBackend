"use client";

import { useState } from "react";
import type { Entry } from "@/types";
import { lookupPhrase } from "@/lib/api";
import EntryCard from "@/components/EntryCard";

export default function DictionaryPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Entry[]>([]);
  const [individual, setIndividual] = useState<Entry[][]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(false);
    setResults([]);
    setIndividual([]);

    try {
      // Look up the full phrase
      const phraseResults = await lookupPhrase(query.trim());
      setResults(phraseResults);

      // Also look up each individual character
      if (query.trim().length > 1) {
        const chars = Array.from(query.trim());
        const charResults = await Promise.all(
          chars.map((ch) => lookupPhrase(ch))
        );
        setIndividual(charResults);
      }

      setSearched(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-800">Dictionary Lookup</h1>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter Chinese characters…"
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Full phrase results */}
      {searched && (
        <>
          <section>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              Results for &ldquo;{query}&rdquo;
            </h2>
            {results.length === 0 ? (
              <p className="text-gray-400 text-sm">No entries found for this phrase.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {results.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </section>

          {/* Individual character breakdown */}
          {individual.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                Individual Characters
              </h2>
              <div className="flex flex-col gap-4">
                {individual.map((charEntries, idx) => (
                  <div key={idx}>
                    <h3 className="text-base font-medium text-gray-600 mb-2">
                      Character {idx + 1}: &ldquo;{Array.from(query)[idx]}&rdquo;
                    </h3>
                    {charEntries.length === 0 ? (
                      <p className="text-gray-400 text-sm ml-2">Not found.</p>
                    ) : (
                      <div className="flex flex-col gap-2 ml-2">
                        {charEntries.map((entry) => (
                          <EntryCard key={entry.id} entry={entry} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {!searched && !loading && (
        <div className="text-center text-gray-400 py-12">
          <p className="text-4xl mb-3">🔍</p>
          <p>Enter Chinese characters above to look them up in the dictionary.</p>
        </div>
      )}
    </div>
  );
}
