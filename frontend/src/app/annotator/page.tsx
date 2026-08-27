"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
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

type SecondaryPanel = "paste" | "library" | "review" | "menu" | null;
type ViewMode = "reader" | "dictionary";

type PhraseContext = {
  key: string;
  text: string;
  pinyin: string;
  english: string;
};

type LookupTarget = {
  fragment: Fragment;
  phrase: PhraseContext | null;
};

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

function buildPhraseContext(item: PhraseAnnotation): PhraseContext | null {
  const text = getPhraseText(item).trim();

  if (!text) {
    return null;
  }

  return {
    key: phraseLookupKey(text),
    text,
    pinyin: getPhrasePinyin(item),
    english: item.english,
  };
}

function buildEditEntryHref({
  simplified,
  traditional,
  pinyin,
  english,
}: {
  simplified: string;
  traditional?: string;
  pinyin?: string;
  english?: string;
}) {
  const params = new URLSearchParams({ type: "custom", simplified });

  if (traditional) {
    params.set("traditional", traditional);
  }

  if (pinyin) {
    params.set("pinyin", pinyin);
  }

  if (english) {
    params.set("english", english);
  }

  return `/edit-entry?${params.toString()}`;
}

function LookupEntryCard({
  entry,
  actionHref,
}: {
  entry: DictionaryEntry;
  actionHref: string;
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
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
      <div className="mt-4">
        <Link
          href={actionHref}
          className="inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
        >
          Edit entry
        </Link>
      </div>
    </article>
  );
}

function FloatingAction({
  active = false,
  label,
  onClick,
}: {
  active?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-semibold transition ${
        active
          ? "bg-sky-500 text-white shadow-lg shadow-sky-950/20"
          : "bg-white/90 text-slate-700 hover:bg-white"
      }`}
    >
      <span>{label}</span>
    </button>
  );
}

function Overlay({
  children,
  label,
  onClose,
  fullHeight = false,
  layerClassName = "z-40",
}: {
  children: ReactNode;
  label: string;
  onClose: () => void;
  fullHeight?: boolean;
  layerClassName?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (panelRef.current === null) {
      return;
    }

    const panelElement = panelRef.current!;

    panelElement.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = Array.from(
        panelElement.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("hidden"));

      if (focusable.length === 0) {
        event.preventDefault();
        panelElement.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={`fixed inset-0 bg-slate-950/45 backdrop-blur-sm ${layerClassName}`}>
      <button
        type="button"
        aria-label="Close panel"
        onClick={onClose}
        className="absolute inset-0"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={`absolute inset-x-0 bottom-0 z-10 mx-auto w-full max-w-3xl overflow-hidden rounded-t-[2rem] border border-white/10 bg-white shadow-2xl ${
          fullHeight ? "max-h-[92vh]" : "max-h-[80vh]"
        }`}
      >
        {children}
      </div>
    </div>
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
  const [viewMode, setViewMode] = useState<ViewMode>("reader");
  const [activeLookup, setActiveLookup] = useState<LookupTarget | null>(null);
  const [fragmentLookupEntries, setFragmentLookupEntries] = useState<DictionaryEntry[]>(
    [],
  );
  const [phraseLookupEntries, setPhraseLookupEntries] = useState<DictionaryEntry[]>([]);
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<SecondaryPanel>(null);
  const [readerLabel, setReaderLabel] = useState("Open text to begin reading");
  const lookupRequestId = useRef(0);

  const resetLookupState = useCallback(() => {
    lookupRequestId.current += 1;
    setActiveLookup(null);
    setFragmentLookupEntries([]);
    setPhraseLookupEntries([]);
    setLoadingLookup(false);
    setLookupError(null);
  }, []);

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

  function openPanel(panel: Exclude<SecondaryPanel, null>) {
    resetLookupState();
    setActivePanel((current) => (current === panel ? null : panel));
  }

  function switchViewMode(nextMode: ViewMode) {
    setViewMode(nextMode);
    resetLookupState();
  }

  function toggleViewMode() {
    switchViewMode(viewMode === "reader" ? "dictionary" : "reader");
  }

  async function annotateSource(sourceText: string, nextReaderLabel = "Pasted text") {
    if (!sourceText.trim()) {
      setAnnotations([]);
      setReaderLabel("Open text to begin reading");
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
      setReaderLabel(nextReaderLabel);
      setStatusMessage("Annotation complete.");
      setActivePanel(null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setAnnotating(false);
    }
  }

  async function fetchDictionaryEntries(phrase: string) {
    try {
      const params = new URLSearchParams({ phrase });
      return await api.get<DictionaryEntry[]>(`/entry?${params.toString()}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return [];
      }

      throw error;
    }
  }

  async function inspectLookup(fragment: Fragment, phrase: PhraseContext | null) {
    setActivePanel(null);
    setActiveLookup({ fragment, phrase });
    setFragmentLookupEntries([]);
    setPhraseLookupEntries([]);
    setLoadingLookup(true);
    setLookupError(null);

    const requestId = lookupRequestId.current + 1;
    lookupRequestId.current = requestId;

    const phraseText =
      phrase && phrase.text !== fragment.cchar ? phrase.text : null;

    const [fragmentResult, phraseResult] = await Promise.allSettled([
      fetchDictionaryEntries(fragment.cchar),
      phraseText ? fetchDictionaryEntries(phraseText) : Promise.resolve([]),
    ]);

    if (lookupRequestId.current !== requestId) {
      return;
    }

    let nextError: string | null = null;

    if (fragmentResult.status === "fulfilled") {
      setFragmentLookupEntries(fragmentResult.value);
    } else {
      nextError = getErrorMessage(fragmentResult.reason);
      setFragmentLookupEntries([]);
    }

    if (phraseResult.status === "fulfilled") {
      setPhraseLookupEntries(phraseResult.value);
    } else {
      nextError ??= getErrorMessage(phraseResult.reason);
      setPhraseLookupEntries([]);
    }

    setLookupError(nextError);
    setLoadingLookup(false);
  }

  function toggleFragments(fragments: Fragment[]) {
    const selectableFragments = fragments.filter(isSelectableFragment);

    if (selectableFragments.length === 0) {
      return;
    }

    setSelectedFragments((current) => {
      const selected = new Set(current.map(fragmentKey));
      const targetKeys = selectableFragments.map(fragmentKey);
      const everySelected = targetKeys.every((key) => selected.has(key));

      if (everySelected) {
        const removalKeys = new Set(targetKeys);
        return current.filter((fragment) => !removalKeys.has(fragmentKey(fragment)));
      }

      const next = [...current];

      selectableFragments.forEach((fragment) => {
        const key = fragmentKey(fragment);

        if (!selected.has(key)) {
          selected.add(key);
          next.push(fragment);
        }
      });

      return next;
    });
  }

  function handleFragmentPress(fragment: Fragment, phrase: PhraseContext | null) {
    if (viewMode === "reader") {
      toggleFragments([fragment]);
      return;
    }

    void inspectLookup(fragment, phrase);
  }

  function handlePhrasePress(item: PhraseAnnotation) {
    if (viewMode !== "reader") {
      return;
    }

    toggleFragments(item.cchars);
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
      await annotateSource(response.text, `${selectedNovel} · ${selectedChapter}`);
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
    setReaderLabel("Open text to begin reading");
    setStatusMessage(null);
    setErrorMessage(null);
    resetLookupState();
  }

  function renderFragment(
    fragment: Fragment,
    key: string,
    {
      inPhrase = false,
      phrase = null,
    }: { inPhrase?: boolean; phrase?: PhraseContext | null } = {},
  ) {
    const selected = selectedKeys.has(fragmentKey(fragment));
    const lookupSelected =
      activeLookup?.fragment.cchar === fragment.cchar &&
      activeLookup.fragment.pinyin === fragment.pinyin &&
      viewMode === "dictionary";

    if (!isSelectableFragment(fragment)) {
      return (
        <span
          key={key}
          className="rounded-xl px-1 py-1 text-[1.4rem] leading-[3.2rem] text-slate-700"
        >
          {fragment.cchar}
        </span>
      );
    }

    const hidePinyin = viewMode === "reader" && selected;

    return (
      <button
        key={key}
        type="button"
        onClick={(event) => {
          if (inPhrase) {
            event.stopPropagation();
          }

          handleFragmentPress(fragment, phrase);
        }}
        className={`flex min-w-12 flex-col items-center rounded-2xl px-2 py-2 text-center transition ${
          viewMode === "reader"
            ? selected
              ? "bg-transparent text-emerald-700"
              : "bg-transparent text-slate-800 hover:bg-slate-100"
            : selected
              ? "border border-emerald-300 bg-emerald-50 text-slate-900"
              : "border border-slate-200 bg-white text-slate-900 hover:border-sky-200 hover:bg-sky-50"
        } ${lookupSelected ? "ring-2 ring-sky-200 ring-offset-2 ring-offset-white" : ""}`}
      >
        <span
          className={`min-h-4 text-[0.72rem] leading-4 ${
            hidePinyin ? "invisible" : selected ? "text-emerald-600" : "text-sky-700"
          }`}
        >
          {formatPinyin(fragment.pinyin)}
        </span>
        <span className="text-[1.4rem] font-medium leading-7">{fragment.cchar}</span>
      </button>
    );
  }

  function renderAnnotationItem(item: AnnotationItem, index: number) {
    if (!isPhraseAnnotation(item)) {
      return renderFragment(item, `fragment-${index}`);
    }

    const phrase = buildPhraseContext(item);
    const selectableFragments = item.cchars.filter(isSelectableFragment);
    const phraseRecognized =
      selectableFragments.length > 0 &&
      selectableFragments.every((fragment) => selectedKeys.has(fragmentKey(fragment)));
    const phraseSelected = activeLookup?.phrase?.key === phrase?.key;

    if (viewMode === "reader") {
      return (
        <div
          key={`phrase-${index}`}
          role={selectableFragments.length > 0 ? "button" : undefined}
          tabIndex={selectableFragments.length > 0 ? 0 : undefined}
          onClick={() => handlePhrasePress(item)}
          onKeyDown={(event) => {
            if (
              selectableFragments.length > 0 &&
              (event.key === "Enter" || event.key === " ")
            ) {
              event.preventDefault();
              handlePhrasePress(item);
            }
          }}
          title={item.english}
          className={`inline-flex flex-wrap items-end gap-1 rounded-2xl px-0.5 py-1 transition ${
            phraseRecognized ? "text-emerald-700" : ""
          }`}
        >
          {item.cchars.map((fragment, fragmentIndex) =>
            renderFragment(fragment, `phrase-${index}-${fragmentIndex}`, {
              inPhrase: true,
              phrase,
            }),
          )}
        </div>
      );
    }

    return (
      <div
        key={`phrase-${index}`}
        title={item.english}
        className={`inline-flex flex-wrap gap-1 rounded-md border border-dashed p-1.5 transition ${
          phraseSelected
            ? "border-sky-300 bg-sky-50/70"
            : "border-slate-300 bg-slate-50/50"
        }`}
      >
        {item.cchars.map((fragment, fragmentIndex) =>
          renderFragment(fragment, `phrase-${index}-${fragmentIndex}`, {
            inPhrase: true,
            phrase,
          }),
        )}
      </div>
    );
  }

  const headerDescription =
    viewMode === "reader"
      ? "Tap a character to mark it recognized, or tap a word to update the whole phrase without leaving the reading flow."
      : "Tap a character to inspect that character, its pronunciations, and the parent phrase in the dictionary sheet.";

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-28 pt-4 sm:px-6 sm:pt-6">
        <header className="sticky top-0 z-20 rounded-[2rem] border border-white/70 bg-white/85 px-4 py-4 shadow-sm backdrop-blur sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-700">
                Annotator reader
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                {readerLabel}
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {headerDescription}
              </p>
            </div>
            <button
              type="button"
              onClick={() => openPanel("menu")}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
            >
              Menu
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
              Mode: {viewMode}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
              Paragraphs: {annotations.length}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
              Selected: {selectedFragments.length}
            </span>
          </div>

          <div className="mt-4 inline-flex rounded-full bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => switchViewMode("reader")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                viewMode === "reader"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Reader mode
            </button>
            <button
              type="button"
              onClick={() => switchViewMode("dictionary")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                viewMode === "dictionary"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Dictionary mode
            </button>
          </div>
        </header>

        {(statusMessage || errorMessage) && (
          <div
            className={`mt-4 rounded-3xl border px-4 py-3 text-sm ${
              errorMessage
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {errorMessage ?? statusMessage}
          </div>
        )}

        <main className="flex-1 pt-4 sm:pt-6">
          {annotating ? (
            <section className="rounded-[2rem] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-700">
                Annotating
              </p>
              <p className="mt-3 text-lg text-slate-600">
                Preparing a cleaner mobile reading view…
              </p>
            </section>
          ) : annotations.length === 0 ? (
            <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                Reader ready
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                Open a chapter or paste text to start reading.
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
                The reading surface stays clear until you need support tools. Use
                the bottom tray to load text, browse the novel library, review
                recognition memory, or switch modes.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => openPanel("library")}
                  className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Browse library
                </button>
                <button
                  type="button"
                  onClick={() => openPanel("paste")}
                  className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Paste text
                </button>
              </div>
            </section>
          ) : (
            <article className="space-y-5">
              {annotations.map((paragraph, paragraphIndex) => (
                <section
                  key={`paragraph-${paragraphIndex}`}
                  className={`rounded-[2rem] bg-white px-4 py-5 shadow-sm sm:px-6 sm:py-6 ${
                    viewMode === "reader"
                      ? "border border-transparent"
                      : "border border-slate-200"
                  }`}
                >
                  {paragraph.length === 0 ? (
                    <div className="text-sm italic text-slate-400">Empty paragraph</div>
                  ) : (
                    <div className="flex flex-wrap items-end gap-2 leading-[3.4rem]">
                      {paragraph.map((item, index) =>
                        renderAnnotationItem(item, index),
                      )}
                    </div>
                  )}
                </section>
              ))}
            </article>
          )}
        </main>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/70 bg-white/90 px-4 pb-4 pt-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-5xl gap-2">
          <FloatingAction
            label={viewMode === "reader" ? "Dictionary" : "Reader"}
            active={viewMode === "dictionary"}
            onClick={toggleViewMode}
          />
          <FloatingAction
            label="Paste"
            active={activePanel === "paste"}
            onClick={() => openPanel("paste")}
          />
          <FloatingAction
            label="Library"
            active={activePanel === "library"}
            onClick={() => openPanel("library")}
          />
          <FloatingAction
            label="Review"
            active={activePanel === "review"}
            onClick={() => openPanel("review")}
          />
          <FloatingAction
            label="More"
            active={activePanel === "menu"}
            onClick={() => openPanel("menu")}
          />
        </div>
      </div>

      {activePanel === "paste" ? (
        <Overlay label="Paste text" onClose={() => setActivePanel(null)} fullHeight>
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Paste text</h2>
              <p className="text-sm text-slate-600">
                Manual text entry stays close at hand without taking over the reader.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActivePanel(null)}
              className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700"
            >
              Close
            </button>
          </div>
          <div className="space-y-4 overflow-y-auto px-5 py-5">
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Paste Chinese text here…"
              className="min-h-72 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:bg-white"
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() => void annotateSource(text)}
                disabled={annotating || loadingChapter || text.trim().length === 0}
                className="w-full rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
              >
                {annotating ? "Annotating…" : "Annotate text"}
              </button>
              <button
                type="button"
                onClick={clearWorkspace}
                className="w-full rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
              >
                Clear reader
              </button>
            </div>
          </div>
        </Overlay>
      ) : null}

      {activePanel === "library" ? (
        <Overlay label="Novel library" onClose={() => setActivePanel(null)}>
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Novel library</h2>
              <p className="text-sm text-slate-600">
                Choose a novel and chapter, then return straight to the reader.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActivePanel(null)}
              className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700"
            >
              Close
            </button>
          </div>
          <div className="space-y-4 overflow-y-auto px-5 py-5">
            <label className="block space-y-2 text-sm text-slate-700">
              <span className="font-medium">Novel</span>
              <select
                value={selectedNovel}
                onChange={(event) => {
                  setSelectedNovel(event.target.value);
                  setSelectedChapter("");
                }}
                disabled={loadingNovels}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400 focus:bg-white"
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
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400 focus:bg-white"
              >
                <option value="">Select a chapter</option>
                {(novels[selectedNovel] ?? []).map((chapter) => (
                  <option key={chapter} value={chapter}>
                    {chapter}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={() => void handleChapterLoad()}
              disabled={
                loadingChapter || annotating || !selectedNovel || !selectedChapter
              }
              className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
            >
              {loadingChapter ? "Loading chapter…" : "Load and annotate"}
            </button>
          </div>
        </Overlay>
      ) : null}

      {activePanel === "review" ? (
        <Overlay label="Review selections" onClose={() => setActivePanel(null)}>
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Review selections</h2>
              <p className="text-sm text-slate-600">
                Inspect recognized characters and sync them with the memory endpoints.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActivePanel(null)}
              className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700"
            >
              Close
            </button>
          </div>
          <div className="space-y-5 overflow-y-auto px-5 py-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                Current code: {memoryCode}
              </div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                Fragments: {selectedFragments.length}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_auto_auto]">
              <input
                type="number"
                min="0"
                value={memoryCodeInput}
                onChange={(event) => setMemoryCodeInput(event.target.value)}
                className="min-w-0 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400 focus:bg-white sm:col-span-2 lg:col-span-1"
                placeholder="Memory code"
              />
              <button
                type="button"
                onClick={() => void handleMemoryLoad()}
                disabled={loadingMemory}
                className="w-full rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {loadingMemory ? "Loading…" : "Load memory"}
              </button>
              <button
                type="button"
                onClick={() => void handleMemorySave()}
                disabled={savingMemory || selectedFragments.length === 0}
                className="w-full rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
              >
                {savingMemory ? "Saving…" : "Save memory"}
              </button>
            </div>

            {selectedFragments.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                Reader mode taps collect recognized characters here.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedFragments.map((fragment, index) => (
                  <button
                    key={`${fragmentKey(fragment)}-${index}`}
                    type="button"
                    onClick={() => toggleFragments([fragment])}
                    className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
                  >
                    {fragment.cchar} · {fragment.pinyin}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Overlay>
      ) : null}

      {activePanel === "menu" ? (
        <Overlay label="Reader menu" onClose={() => setActivePanel(null)}>
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Reader menu</h2>
              <p className="text-sm text-slate-600">
                Keep secondary tools nearby without moving them into the main view.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActivePanel(null)}
              className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700"
            >
              Close
            </button>
          </div>
          <div className="space-y-3 overflow-y-auto px-5 py-5">
            <Link
              href="/dictionary"
              className="flex items-center justify-between rounded-3xl border border-slate-200 px-4 py-4 text-sm font-semibold text-slate-800 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
            >
              Dictionary lookup
              <span className="text-slate-400">→</span>
            </Link>
            <Link
              href="/edit-entry"
              className="flex items-center justify-between rounded-3xl border border-slate-200 px-4 py-4 text-sm font-semibold text-slate-800 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
            >
              Edit dictionary entries
              <span className="text-slate-400">→</span>
            </Link>
            <button
              type="button"
              onClick={() => openPanel("paste")}
              className="flex w-full items-center justify-between rounded-3xl border border-slate-200 px-4 py-4 text-left text-sm font-semibold text-slate-800 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
            >
              Replace current text
              <span className="text-slate-400">→</span>
            </button>
          </div>
        </Overlay>
      ) : null}

      {activeLookup ? (
        <Overlay
          label="Dictionary lookup"
          onClose={resetLookupState}
          layerClassName="z-50"
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  Character
                </span>
                <h2 className="text-lg font-semibold text-slate-950">
                  {activeLookup.fragment.cchar}
                </h2>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {formatPinyin(activeLookup.fragment.pinyin)}
              </p>
            </div>
            <button
              type="button"
              onClick={resetLookupState}
              className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700"
            >
              Close
            </button>
          </div>
          <div className="space-y-5 overflow-y-auto px-5 py-5">
            {lookupError ? (
              <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {lookupError}
              </div>
            ) : null}

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Character entries
                  </h3>
                  <p className="text-sm text-slate-600">
                    {fragmentLookupEntries.length > 1
                      ? "Multiple pronunciations found for this character."
                      : "Saved dictionary entries for the tapped character."}
                  </p>
                </div>
                <Link
                  href={buildEditEntryHref({
                    simplified: activeLookup.fragment.cchar,
                    pinyin: activeLookup.fragment.pinyin,
                  })}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
                >
                  Edit entry
                </Link>
              </div>

              {loadingLookup ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  Loading dictionary matches…
                </div>
              ) : fragmentLookupEntries.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-500">
                  No saved dictionary entry was returned for this character yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {fragmentLookupEntries.map((entry, index) => (
                    <LookupEntryCard
                      key={`${fragmentKey(activeLookup.fragment)}-${index}`}
                      entry={entry}
                      actionHref={buildEditEntryHref({
                        simplified: entry.simplified,
                        traditional: entry.traditional,
                        pinyin: entry.pinyin,
                        english: entry.english,
                      })}
                    />
                  ))}
                </div>
              )}
            </section>

            {activeLookup.phrase ? (
              <section className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                      Parent phrase
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-lg font-semibold text-slate-950">
                        {activeLookup.phrase.text}
                      </span>
                      {activeLookup.phrase.pinyin ? (
                        <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-medium text-sky-800">
                          {formatPinyin(activeLookup.phrase.pinyin)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <Link
                    href={buildEditEntryHref({
                      simplified: activeLookup.phrase.text,
                      pinyin: activeLookup.phrase.pinyin,
                      english: activeLookup.phrase.english,
                    })}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
                  >
                    Edit entry
                  </Link>
                </div>

                {activeLookup.phrase.english ? (
                  <p className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                    Annotation gloss: {activeLookup.phrase.english}
                  </p>
                ) : null}

                {loadingLookup ? null : phraseLookupEntries.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-500">
                    No saved phrase entry was returned for this word yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {phraseLookupEntries.map((entry, index) => (
                      <LookupEntryCard
                        key={`${activeLookup.phrase?.key ?? "phrase"}-${index}`}
                        entry={entry}
                        actionHref={buildEditEntryHref({
                          simplified: entry.simplified,
                          traditional: entry.traditional,
                          pinyin: entry.pinyin,
                          english: entry.english,
                        })}
                      />
                    ))}
                  </div>
                )}
              </section>
            ) : null}
          </div>
        </Overlay>
      ) : null}
    </div>
  );
}
