"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { ApiError, api, getErrorMessage } from "@/lib/api";
import { parsePinyin } from "@/lib/pinyin";
import {
  type AnnotationItem,
  type DictionaryEntry,
  type Fragment,
  type MemoryRecord,
  type NovelMap,
  type PhraseAnnotation,
  isPhraseAnnotation,
} from "@/lib/types";

const NBSP = "\u00a0";

function segmentText(text: string) {
  const lines = text.split("\n");

  return lines.map((line, index) => ({
    blank: line.length === 0,
    text: index < lines.length - 1 ? `${line}\n` : line,
  }));
}

function fragmentKey(fragment: Fragment) {
  return `${fragment.cchar}::${fragment.pinyin}`;
}

function fragmentLookupKey(fragment: Fragment) {
  return `fragment::${fragmentKey(fragment)}`;
}

function phraseLookupKey(phrase: string) {
  return `phrase::${phrase}`;
}

function getPhraseText(item: PhraseAnnotation) {
  return item.cchars.map((fragment) => fragment.cchar).join("").replaceAll("\n", "");
}

function getPhrasePinyin(item: PhraseAnnotation) {
  return item.cchars
    .map((fragment) => fragment.pinyin.trim())
    .filter((pinyin) => pinyin.length > 0 && pinyin !== NBSP)
    .join(" ");
}

function formatPinyin(pinyin: string) {
  return pinyin
    .split(" ")
    .filter((part) => part.length > 0)
    .map((part) => parsePinyin(part))
    .join(" ");
}

function isSelectableFragment(fragment: Fragment) {
  return (
    fragment.cchar.trim().length === 1 &&
    fragment.pinyin.trim().length > 0 &&
    fragment.pinyin !== NBSP
  );
}

type LookupTarget = {
  key: string;
  kind: "fragment" | "phrase";
  label: string;
  phrase: string;
  annotationPinyin?: string;
  annotationEnglish?: string;
};

function LookupEntryCard({ entry }: { entry: DictionaryEntry }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-3">
        <h4 className="text-lg font-semibold text-slate-950">{entry.simplified}</h4>
        {entry.traditional && entry.traditional !== entry.simplified ? (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
            {entry.traditional}
          </span>
        ) : null}
        <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-medium text-sky-800">
          {formatPinyin(entry.pinyin)}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{entry.english}</p>
    </article>
  );
}

export default function AnnotatorPage() {
  const [text, setText] = useState("");
  const [annotations, setAnnotations] = useState<AnnotationItem[][]>([]);
  const [selectedFragments, setSelectedFragments] = useState<Fragment[]>([]);
  const [memoryCode, setMemoryCode] = useState(0);
  const [memoryCodeInput, setMemoryCodeInput] = useState("0");
  const [novels, setNovels] = useState<NovelMap>({});
  const [selectedNovel, setSelectedNovel] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [loadingNovels, setLoadingNovels] = useState(true);
  const [annotating, setAnnotating] = useState(false);
  const [loadingMemory, setLoadingMemory] = useState(false);
  const [savingMemory, setSavingMemory] = useState(false);
  const [loadingChapter, setLoadingChapter] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeLookup, setActiveLookup] = useState<LookupTarget | null>(null);
  const [lookupEntries, setLookupEntries] = useState<DictionaryEntry[]>([]);
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const lookupRequestId = useRef(0);

  function resetLookupState() {
    lookupRequestId.current += 1;
    setActiveLookup(null);
    setLookupEntries([]);
    setLoadingLookup(false);
    setLookupError(null);
  }

  useEffect(() => {
    async function loadNovels() {
      try {
        const result = await api.get<NovelMap>("/novel/list");
        setNovels(result);
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setLoadingNovels(false);
      }
    }

    void loadNovels();
  }, []);

  const selectedKeys = useMemo(
    () => new Set(selectedFragments.map(fragmentKey)),
    [selectedFragments],
  );

  async function annotateSource(sourceText: string) {
    if (!sourceText.trim()) {
      setAnnotations([]);
      resetLookupState();
      return;
    }

    setAnnotating(true);
    setErrorMessage(null);
    setStatusMessage(null);
    resetLookupState();

    try {
      const results = await Promise.all(
        segmentText(sourceText).map((segment) =>
          segment.blank
            ? Promise.resolve([])
            : api.post<AnnotationItem[]>("/annotate", { text: segment.text }),
        ),
      );

      setAnnotations(results);
      setStatusMessage("Annotation complete.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setAnnotating(false);
    }
  }

  async function inspectLookup(target: LookupTarget) {
    setActiveLookup(target);
    setLookupEntries([]);
    setLoadingLookup(true);
    setLookupError(null);

    const requestId = lookupRequestId.current + 1;
    lookupRequestId.current = requestId;

    try {
      const params = new URLSearchParams({ phrase: target.phrase });
      const entries = await api.get<DictionaryEntry[]>(`/entry?${params.toString()}`);

      if (lookupRequestId.current !== requestId) {
        return;
      }

      setLookupEntries(entries);
    } catch (error) {
      if (lookupRequestId.current !== requestId) {
        return;
      }

      if (error instanceof ApiError && error.status === 404) {
        setLookupEntries([]);
        setLookupError(null);
      } else {
        setLookupEntries([]);
        setLookupError(getErrorMessage(error));
      }
    } finally {
      if (lookupRequestId.current === requestId) {
        setLoadingLookup(false);
      }
    }
  }

  function toggleFragment(fragment: Fragment) {
    if (!isSelectableFragment(fragment)) {
      return;
    }

    setSelectedFragments((current) => {
      const exists = current.some(
        (entry) =>
          entry.cchar === fragment.cchar && entry.pinyin === fragment.pinyin,
      );

      if (exists) {
        return current.filter(
          (entry) =>
            entry.cchar !== fragment.cchar || entry.pinyin !== fragment.pinyin,
        );
      }

      return [...current, fragment];
    });
  }

  function inspectFragment(fragment: Fragment) {
    toggleFragment(fragment);
    void inspectLookup({
      key: fragmentLookupKey(fragment),
      kind: "fragment",
      label: fragment.cchar,
      phrase: fragment.cchar,
      annotationPinyin: fragment.pinyin,
    });
  }

  function inspectPhrase(item: PhraseAnnotation) {
    const phrase = getPhraseText(item).trim();

    if (!phrase) {
      return;
    }

    void inspectLookup({
      key: phraseLookupKey(phrase),
      kind: "phrase",
      label: phrase,
      phrase,
      annotationPinyin: getPhrasePinyin(item),
      annotationEnglish: item.english,
    });
  }

  async function handleChapterLoad() {
    if (!selectedNovel || !selectedChapter) {
      return;
    }

    setLoadingChapter(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const params = new URLSearchParams({
        novelName: selectedNovel,
        chapter: selectedChapter,
      });
      const response = await api.get<{ text: string }>(
        `/novel?${params.toString()}`,
      );
      setText(response.text);
      await annotateSource(response.text);
      setStatusMessage("Chapter loaded and annotated.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoadingChapter(false);
    }
  }

  async function handleMemoryLoad() {
    if (!memoryCodeInput.trim()) {
      return;
    }

    setLoadingMemory(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const params = new URLSearchParams({ code: memoryCodeInput.trim() });
      const response = await api.get<MemoryRecord>(
        `/memory/fetch?${params.toString()}`,
      );
      setMemoryCode(response.code);
      setMemoryCodeInput(String(response.code));
      setSelectedFragments(response.fragments);
      setStatusMessage(`Loaded memory ${response.code}.`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoadingMemory(false);
    }
  }

  async function handleMemorySave() {
    if (selectedFragments.length === 0) {
      return;
    }

    setSavingMemory(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const response = await api.post<MemoryRecord>("/memory/save", {
        fragments: selectedFragments,
      });
      setMemoryCode(response.code);
      setMemoryCodeInput(String(response.code));
      setStatusMessage(`Saved ${selectedFragments.length} fragment(s).`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSavingMemory(false);
    }
  }

  function clearWorkspace() {
    setText("");
    setAnnotations([]);
    setSelectedFragments([]);
    setStatusMessage(null);
    setErrorMessage(null);
    resetLookupState();
  }

  function renderFragment(fragment: Fragment, key: string, inPhrase = false) {
    const selected = selectedKeys.has(fragmentKey(fragment));
    const lookupSelected =
      activeLookup?.key === fragmentLookupKey(fragment) &&
      fragment.cchar.trim().length > 0;

    if (!isSelectableFragment(fragment)) {
      return (
        <span
          key={key}
          className="whitespace-pre-wrap rounded-lg px-1 py-1 text-base text-slate-700"
        >
          {fragment.cchar}
        </span>
      );
    }

    return (
      <button
        key={key}
        type="button"
        onClick={(event) => {
          if (inPhrase) {
            event.stopPropagation();
          }
          inspectFragment(fragment);
        }}
        className={`flex min-w-11 flex-col items-center rounded-xl border px-2 py-1 text-center transition ${
          selected
            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
            : "border-slate-200 bg-white text-slate-800 hover:border-sky-300 hover:bg-sky-50"
        } ${lookupSelected ? "ring-2 ring-sky-200 ring-offset-2 ring-offset-slate-50" : ""} ${
          inPhrase ? "cursor-pointer" : ""
        }`}
      >
        <span
          className={`min-h-4 text-[0.65rem] leading-4 ${
            selected ? "invisible" : "text-sky-700"
          }`}
        >
          {formatPinyin(fragment.pinyin)}
        </span>
        <span className="text-lg font-medium">{fragment.cchar}</span>
      </button>
    );
  }

  function renderAnnotationItem(item: AnnotationItem, index: number) {
    if (!isPhraseAnnotation(item)) {
      return renderFragment(item, `fragment-${index}`);
    }

    const phrase = getPhraseText(item);
    const phraseSelected = activeLookup?.key === phraseLookupKey(phrase);

    return (
      <div
        key={`phrase-${index}`}
        role="button"
        tabIndex={0}
        onClick={() => inspectPhrase(item)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inspectPhrase(item);
          }
        }}
        title={item.english}
        className={`inline-flex flex-wrap gap-1 rounded-2xl border bg-slate-50 p-1 text-left transition hover:border-sky-300 hover:bg-sky-50 ${
          phraseSelected
            ? "border-sky-300 ring-2 ring-sky-200 ring-offset-2 ring-offset-white"
            : "border-slate-200"
        }`}
      >
        {item.cchars.map((fragment, fragmentIndex) =>
          renderFragment(fragment, `phrase-${index}-${fragmentIndex}`, true),
        )}
      </div>
    );
  }

  return (
    <SiteShell
      title="Annotator"
      description="Paste text, load a novel chapter, annotate against the existing backend, inspect dictionary matches inline, and save or restore fragment memory."
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_1.15fr]">
        <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
              <h2 className="text-lg font-semibold text-slate-950">
                Manual annotation
              </h2>
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Paste Chinese text here…"
                className="min-h-52 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:bg-white"
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={() => void annotateSource(text)}
                  disabled={annotating || loadingChapter || text.trim().length === 0}
                  className="w-full rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
                >
                  {annotating ? "Annotating…" : "Annotate text"}
                </button>
                <button
                  type="button"
                  onClick={clearWorkspace}
                  className="w-full rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
              <h2 className="text-lg font-semibold text-slate-950">
                Novel / chapter
              </h2>
              <div className="space-y-3">
                <label className="block space-y-2 text-sm text-slate-700">
                  <span className="font-medium">Novel</span>
                  <select
                    value={selectedNovel}
                    onChange={(event) => {
                      setSelectedNovel(event.target.value);
                      setSelectedChapter("");
                    }}
                    disabled={loadingNovels}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400 focus:bg-white"
                  >
                    <option value="">Select a novel</option>
                    {Object.entries(novels).map(([novelName, chapters]) => (
                      <option key={novelName} value={novelName}>
                        {novelName} [{chapters.length}]
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-2 text-sm text-slate-700">
                  <span className="font-medium">Chapter</span>
                  <select
                    value={selectedChapter}
                    onChange={(event) => setSelectedChapter(event.target.value)}
                    disabled={!selectedNovel || loadingNovels}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400 focus:bg-white"
                  >
                    <option value="">Select a chapter</option>
                    {(novels[selectedNovel] ?? []).map((chapter) => (
                      <option key={chapter} value={chapter}>
                        {chapter}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <button
                type="button"
                onClick={() => void handleChapterLoad()}
                disabled={
                  loadingChapter ||
                  annotating ||
                  !selectedNovel ||
                  !selectedChapter
                }
                className="w-full rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
              >
                {loadingChapter ? "Loading chapter…" : "Load and annotate"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Memory
                </h2>
                <p className="text-sm leading-6 text-slate-600">
                  Click annotated characters to build the fragment list used by
                  the existing memory endpoints.
                </p>
              </div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                Current code: {memoryCode}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_auto_auto]">
              <input
                type="number"
                min="0"
                value={memoryCodeInput}
                onChange={(event) => setMemoryCodeInput(event.target.value)}
                className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400 focus:bg-white sm:col-span-2 lg:col-span-1"
                placeholder="Memory code"
              />
              <button
                type="button"
                onClick={() => void handleMemoryLoad()}
                disabled={loadingMemory}
                className="w-full rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {loadingMemory ? "Loading…" : "Load memory"}
              </button>
              <button
                type="button"
                onClick={() => void handleMemorySave()}
                disabled={savingMemory || selectedFragments.length === 0}
                className="w-full rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
              >
                {savingMemory ? "Saving…" : "Save memory"}
              </button>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Selected fragments
              </h3>
              {selectedFragments.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">
                  No fragments selected yet.
                </p>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedFragments.map((fragment, index) => (
                    <button
                      key={`${fragmentKey(fragment)}-${index}`}
                      type="button"
                      onClick={() => toggleFragment(fragment)}
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm text-emerald-800"
                    >
                      {fragment.cchar} · {fragment.pinyin}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {(statusMessage || errorMessage) && (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                errorMessage
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {errorMessage ?? statusMessage}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Annotation output
              </h2>
              <p className="text-sm leading-6 text-slate-600">
                Empty and loading states are preserved while the backend
                responses render as selectable token groups.
              </p>
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
              Paragraphs: {annotations.length}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Dictionary inspector
                </h3>
                <p className="text-sm leading-6 text-slate-600">
                  Click a phrase group to inspect the full lookup, or click an individual
                  character to inspect it while toggling memory selection.
                </p>
              </div>
              {activeLookup ? (
                <button
                  type="button"
                  onClick={resetLookupState}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
                >
                  Close inspector
                </button>
              ) : null}
            </div>

            {!activeLookup ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
                Select an annotation to preview dictionary matches here.
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                    {activeLookup.kind === "phrase" ? "Phrase" : "Character"}
                  </span>
                  <h4 className="text-xl font-semibold text-slate-950">{activeLookup.label}</h4>
                  {activeLookup.annotationPinyin ? (
                    <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-medium text-sky-800">
                      {formatPinyin(activeLookup.annotationPinyin)}
                    </span>
                  ) : null}
                </div>

                {activeLookup.annotationEnglish ? (
                  <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600">
                    Annotation gloss: {activeLookup.annotationEnglish}
                  </p>
                ) : null}

                {lookupError ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {lookupError}
                  </div>
                ) : loadingLookup ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
                    Loading dictionary matches…
                  </div>
                ) : lookupEntries.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
                    No saved dictionary entries were returned for this selection.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lookupEntries.map((entry, index) => (
                      <LookupEntryCard key={`${activeLookup.key}-${index}`} entry={entry} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {annotating ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              Annotating text…
            </div>
          ) : annotations.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              No annotations yet. Paste text or load a chapter to begin.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {annotations.map((paragraph, paragraphIndex) => (
                <div
                  key={`paragraph-${paragraphIndex}`}
                  className="min-h-16 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  {paragraph.length === 0 ? (
                    <div className="text-sm italic text-slate-400">
                      Empty paragraph
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-end gap-2">
                      {paragraph.map((item, index) =>
                        renderAnnotationItem(item, index),
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </SiteShell>
  );
}
