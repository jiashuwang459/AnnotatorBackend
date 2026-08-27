"use client";

import { FormEvent, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { api, getErrorMessage } from "@/lib/api";
import { parsePinyin } from "@/lib/pinyin";
import type { DictionaryEntry } from "@/lib/types";

type CharacterResult = {
  character: string;
  entries: DictionaryEntry[];
};

function EntryCard({ entry }: { entry: DictionaryEntry }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-xl font-semibold text-slate-950">
          {entry.simplified}
        </h3>
        {entry.traditional && entry.traditional !== entry.simplified ? (
          <span className="rounded-full bg-white px-3 py-1 text-sm text-slate-600">
            {entry.traditional}
          </span>
        ) : null}
        <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-medium text-sky-800">
          {entry.pinyin
            .split(" ")
            .map((part) => parsePinyin(part))
            .join(" ")}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{entry.english}</p>
    </article>
  );
}

export default function DictionaryPage() {
  const [query, setQuery] = useState("");
  const [definitions, setDefinitions] = useState<DictionaryEntry[]>([]);
  const [characterResults, setCharacterResults] = useState<CharacterResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const phrase = query.trim();

    if (!phrase) {
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setHasSearched(true);

    try {
      const params = new URLSearchParams({ phrase });
      const entryResults = await api.get<DictionaryEntry[]>(
        `/entry?${params.toString()}`,
      );
      setDefinitions(entryResults);

      const settled = await Promise.allSettled(
        [...phrase].map(async (character) => {
          const characterParams = new URLSearchParams({ phrase: character });
          const entries = await api.get<DictionaryEntry[]>(
            `/entry?${characterParams.toString()}`,
          );

          return { character, entries };
        }),
      );

      setCharacterResults(
        settled.map((result, index) =>
          result.status === "fulfilled"
            ? result.value
            : { character: [...phrase][index], entries: [] },
        ),
      );
    } catch (error) {
      setDefinitions([]);
      setCharacterResults([]);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteShell
      title="Dictionary lookup"
      description="Search the existing dictionary endpoint, then expand into individual character lookups with clearer Tailwind presentation."
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="dictionary-query"
                className="text-sm font-semibold uppercase tracking-wide text-slate-500"
              >
                Chinese phrase
              </label>
              <textarea
                id="dictionary-query"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search for a phrase or a single character…"
                className="mt-2 min-h-36 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:bg-white"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="submit"
                disabled={loading || query.trim().length === 0}
                className="w-full rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
              >
                {loading ? "Searching…" : "Search dictionary"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setDefinitions([]);
                  setCharacterResults([]);
                  setErrorMessage(null);
                  setHasSearched(false);
                }}
                className="w-full rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
              >
                Reset
              </button>
            </div>
          </form>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            The lookup keeps using
            <code className="mx-1 rounded bg-white px-1 py-0.5 text-xs text-slate-900">
              /api/entry?phrase=...
            </code>
            and shows both direct results and per-character fallbacks.
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950">Results</h2>
            <p className="text-sm leading-6 text-slate-600">
              Loading, empty, and error states are explicit to make lookup
              behavior easier to follow.
            </p>
          </div>

          {errorMessage ? (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </div>
          ) : null}

          {loading ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              Searching dictionary…
            </div>
          ) : !hasSearched ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              Enter a phrase to search the dictionary.
            </div>
          ) : definitions.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              No dictionary entries were returned for this query.
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Primary matches
                </h3>
                <div className="space-y-3">
                  {definitions.map((entry) => (
                    <EntryCard key={entry.id} entry={entry} />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Individual characters
                </h3>
                <div className="space-y-3">
                  {characterResults.map((result) => (
                    <details
                      key={result.character}
                      open
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900">
                        {result.character}
                      </summary>
                      <div className="mt-4 space-y-3">
                        {result.entries.length === 0 ? (
                          <p className="text-sm text-slate-500">
                            No individual entry found.
                          </p>
                        ) : (
                          result.entries.map((entry) => (
                            <EntryCard key={`${result.character}-${entry.id}`} entry={entry} />
                          ))
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </SiteShell>
  );
}
