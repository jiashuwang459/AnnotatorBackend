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

const modeDescriptions: Record<ViewMode, string> = {
  reader:
    "Tap a character to mark it recognized, or tap a word to update the whole phrase without leaving the reading flow.",
  dictionary:
    "Tap a character to inspect that character, its pronunciations, and the parent phrase in the dictionary sheet.",
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

function ModeToast({ message }: { message: string | null }) {
  return (
    <div
      className={`pointer-events-none fixed inset-x-0 top-14 z-50 flex justify-center px-4 transition duration-200 ${
        message ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
      }`}
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="rounded-full bg-slate-950/85 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur">
        {message ?? ""}
      </div>
    </div>
  );
}

function VerticalProgressBar({
  progress,
  viewMode,
}: {
  progress: number;
  viewMode: ViewMode;
}) {
  return (
    <div className="fixed left-0 top-0 z-40 h-full w-1 bg-black/5">
      <div
        className={`w-full origin-top transition-[height,background-color] duration-200 ${
          viewMode === "reader" ? "bg-emerald-500" : "bg-sky-500"
        }`}
        style={{ height: `${progress}%` }}
      />
    </div>
  );
}

function SpeedDialFab({
  expanded,
  onToggleExpanded,
  onToggleMode,
  onOpenLibrary,
  onOpenPaste,
  onOpenReview,
  onOpenMenu,
  viewMode,
}: {
  expanded: boolean;
  onToggleExpanded: () => void;
  onToggleMode: () => void;
  onOpenLibrary: () => void;
  onOpenPaste: () => void;
  onOpenReview: () => void;
  onOpenMenu: () => void;
  viewMode: ViewMode;
}) {
  const actions = [
    {
      label: viewMode === "reader" ? "Dictionary mode" : "Reader mode",
      icon: viewMode === "reader" ? "🔎" : "📖",
      onClick: onToggleMode,
    },
    { label: "Paste text", icon: "✍️", onClick: onOpenPaste },
    { label: "Library", icon: "📚", onClick: onOpenLibrary },
    { label: "Review", icon: "✅", onClick: onOpenReview },
    { label: "More", icon: "☰", onClick: onOpenMenu },
  ];

  return (
    <div className="fixed bottom-5 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {expanded
        ? actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className="flex items-center gap-3 rounded-full border border-white/70 bg-white/92 px-4 py-2 text-sm font-semibold text-slate-800 shadow-lg backdrop-blur transition hover:bg-white"
            >
              <span className="text-base" aria-hidden="true">
                {action.icon}
              </span>
              <span>{action.label}</span>
            </button>
          ))
        : null}

      <button
        type="button"
        onClick={onToggleExpanded}
        aria-label={expanded ? "Collapse actions" : "Expand actions"}
        aria-expanded={expanded}
        className="rounded-full border border-white/70 bg-slate-950/85 px-4 py-4 text-white shadow-xl backdrop-blur transition hover:bg-slate-950"
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <span className="text-lg" aria-hidden="true">
            {expanded ? "×" : "+"}
          </span>
          <span className="hidden sm:inline">Actions</span>
        </span>
      </button>
    </div>
  );
}

function ChapterNavigation({
  hasPrevious,
  hasNext,
  loading,
  onPrevious,
  onNext,
}: {
  hasPrevious: boolean;
  hasNext: boolean;
  loading: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  if (!hasPrevious && !hasNext) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-300/70 bg-white/55 px-3 py-3 backdrop-blur">
      <button
        type="button"
        onClick={onPrevious}
        disabled={!hasPrevious || loading}
        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous chapter
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!hasNext || loading}
        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next chapter
      </button>
    </div>
  );
}

function ReaderHeader({
  hidden,
  onMenuOpen,
  paragraphCount,
  selectedCount,
  readerLabel,
  viewMode,
}: {
  hidden: boolean;
  onMenuOpen: () => void;
  paragraphCount: number;
  selectedCount: number;
  readerLabel: string;
  viewMode: ViewMode;
}) {
  return (
    <header
      className={`sticky top-3 z-20 mb-3 rounded-[1.6rem] border border-white/70 bg-white/70 px-3 py-3 shadow-sm backdrop-blur transition-transform duration-200 sm:top-4 sm:px-4 ${
        hidden ? "-translate-y-[calc(100%+1rem)]" : "translate-y-0"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{readerLabel}</p>
          <p className="text-[0.7rem] uppercase tracking-[0.22em] text-slate-500">
            {paragraphCount} paragraphs · {selectedCount} saved
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] ${
              viewMode === "reader"
                ? "bg-amber-100/90 text-amber-800"
                : "bg-slate-200/90 text-slate-700"
            }`}
          >
            {viewMode}
          </span>
          <button
            type="button"
            onClick={onMenuOpen}
            aria-label="Open reader menu"
            className="rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
          >
            Menu
          </button>
        </div>
      </div>
    </header>
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

    const panelElement = panelRef.current;

    panelElement.focus();

    function handleKeyDown(event: KeyboardEvent) {
      const activeElement = document.activeElement;

      if (
        !(activeElement instanceof Node) ||
        (activeElement !== panelElement && !panelElement.contains(activeElement))
      ) {
        return;
      }

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
  const [headerHidden, setHeaderHidden] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [fabExpanded, setFabExpanded] = useState(false);
  const [modeToast, setModeToast] = useState<string | null>(null);
  const lookupRequestId = useRef(0);
  const initialModeRef = useRef(true);
  const updateProgress = useCallback(() => {
    const scrollTop = window.scrollY;
    const scrollHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    if (scrollHeight <= 0) {
      setScrollProgress(0);
      return;
    }

    setScrollProgress(Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100)));
  }, []);

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

  useEffect(() => {
    let lastScrollY = window.scrollY;

    function handleScroll() {
      const nextScrollY = window.scrollY;
      const scrollingDown = nextScrollY > lastScrollY;

      if (nextScrollY < 24) {
        setHeaderHidden(false);
      } else if (scrollingDown && nextScrollY - lastScrollY > 4) {
        setHeaderHidden(true);
      } else if (!scrollingDown && lastScrollY - nextScrollY > 4) {
        setHeaderHidden(false);
      }

      lastScrollY = nextScrollY;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const resizeOptions = { passive: true } as AddEventListenerOptions;

    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress as EventListener, resizeOptions);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener(
        "resize",
        updateProgress as EventListener,
        resizeOptions,
      );
    };
  }, [updateProgress]);

  useEffect(() => {
    if (initialModeRef.current) {
      initialModeRef.current = false;
      return;
    }

    setModeToast(
      viewMode === "reader"
        ? "Reader Mode: Tap characters to toggle recognition."
        : "Dictionary Mode: Tap phrases to view definitions.",
    );

    const timeoutId = window.setTimeout(() => setModeToast(null), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [viewMode]);

  const selectedKeys = useMemo(
    () => new Set(selectedFragments.map(fragmentKey)),
    [selectedFragments],
  );

  function openPanel(panel: Exclude<SecondaryPanel, null>) {
    resetLookupState();
    setFabExpanded(false);
    setActivePanel((current) => (current === panel ? null : panel));
  }

  function switchViewMode(nextMode: ViewMode) {
    setFabExpanded(false);
    setViewMode(nextMode);
    resetLookupState();
    updateProgress();
  }

  function toggleViewMode() {
    switchViewMode(viewMode === "reader" ? "dictionary" : "reader");
  }

  const chapterList = selectedNovel ? (novels[selectedNovel] ?? []) : [];
  const chapterIndex = chapterList.indexOf(selectedChapter);
  const previousChapter =
    chapterIndex > 0 ? chapterList[chapterIndex - 1] : null;
  const nextChapter =
    chapterIndex >= 0 && chapterIndex < chapterList.length - 1
      ? chapterList[chapterIndex + 1]
      : null;

  async function annotateSource(sourceText: string, nextReaderLabel = "Pasted text") {
    if (!sourceText.trim()) {
      setAnnotations([]);
      setReaderLabel("Open text to begin reading");
      setScrollProgress(0);
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
    setFabExpanded(false);
    setActivePanel(null);
    setActiveLookup({ fragment, phrase });
    setFragmentLookupEntries([]);
    setPhraseLookupEntries([]);
    setLoadingLookup(true);
    setLookupError(null);

    const requestId = lookupRequestId.current + 1;
    lookupRequestId.current = requestId;

    try {
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
    } catch (error) {
      if (lookupRequestId.current !== requestId) {
        return;
      }

      setFragmentLookupEntries([]);
      setPhraseLookupEntries([]);
      setLookupError(getErrorMessage(error));
      setLoadingLookup(false);
    }
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
    toggleFragments(item.cchars);
  }

  async function loadChapter(novelName: string, chapter: string) {
    if (!novelName || !chapter) {
      return;
    }

    setFabExpanded(false);
    setLoadingChapter(true);
    setErrorMessage(null);
    setStatusMessage(null);
    setScrollProgress(0);
    setSelectedNovel(novelName);
    setSelectedChapter(chapter);

    try {
      const params = new URLSearchParams({
        novelName,
        chapter,
      });
      const response = await api.get<{ text: string }>(
        `/novel?${params.toString()}`,
      );
      setText(response.text);
      await annotateSource(response.text, `${novelName} · ${chapter}`);
      setStatusMessage("Chapter loaded and annotated.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoadingChapter(false);
    }
  }

  async function handleChapterLoad() {
    if (!selectedNovel || !selectedChapter) {
      return;
    }

    await loadChapter(selectedNovel, selectedChapter);
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
    setFabExpanded(false);
    setScrollProgress(0);
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
          className="px-0 py-0 text-[1.4rem] leading-[3.2rem] text-slate-700"
        >
          {fragment.cchar}
        </span>
      );
    }

    const hidePinyin = viewMode === "reader" && selected;
    const fragmentToneClass = selected
      ? "text-emerald-700"
      : viewMode === "reader"
        ? "text-slate-800"
        : "text-slate-900";

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
        className={`flex min-w-[1.35em] flex-col items-center bg-transparent px-0 py-0 text-center transition ${fragmentToneClass} ${
          lookupSelected ? "rounded-md bg-sky-100/70 text-sky-900" : ""
        }`}
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
          className={`inline-flex flex-wrap items-end gap-0 rounded-md transition ${
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
        role={selectableFragments.length > 0 ? "button" : undefined}
        tabIndex={selectableFragments.length > 0 ? 0 : undefined}
        onClick={() => {
          const fragment = selectableFragments[0];

          if (fragment) {
            // Phrase taps open the phrase-level context while defaulting the
            // fragment detail to the first selectable character.
            handleFragmentPress(fragment, phrase);
          }
        }}
        onKeyDown={(event) => {
          if (
            selectableFragments.length > 0 &&
            (event.key === "Enter" || event.key === " ")
          ) {
            event.preventDefault();
            const fragment = selectableFragments[0];

            if (fragment) {
              handleFragmentPress(fragment, phrase);
            }
          }
        }}
        title={item.english}
        className={`inline-flex cursor-pointer flex-wrap items-end gap-0 rounded-md border border-transparent px-0 py-0 transition-colors ${
          phraseSelected
            ? "bg-sky-100/65"
            : "bg-sky-50/25 hover:bg-sky-100/45 active:bg-sky-100/60"
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

  const modeDescription = modeDescriptions[viewMode];
  const chapterNavigationProps: Parameters<typeof ChapterNavigation>[0] = {
    hasPrevious: previousChapter !== null,
    hasNext: nextChapter !== null,
    loading: loadingChapter || annotating,
    onPrevious: () => {
      if (selectedNovel && previousChapter) {
        void loadChapter(selectedNovel, previousChapter);
      }
    },
    onNext: () => {
      if (selectedNovel && nextChapter) {
        void loadChapter(selectedNovel, nextChapter);
      }
    },
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        viewMode === "reader" ? "bg-[#fdf6e3]" : "bg-slate-100"
      }`}
    >
      <VerticalProgressBar progress={scrollProgress} viewMode={viewMode} />
      <ModeToast message={modeToast} />

      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 pb-24 pt-4 sm:px-7 sm:pt-6">
        <ReaderHeader
          hidden={headerHidden}
          onMenuOpen={() => openPanel("menu")}
          paragraphCount={annotations.length}
          selectedCount={selectedFragments.length}
          readerLabel={readerLabel}
          viewMode={viewMode}
        />

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

        {annotations.length > 0 && !annotating ? (
          <div className="mb-4 px-1 text-sm leading-6 text-slate-600">
            {modeDescription}
          </div>
        ) : null}

        <main className="flex-1 pt-4 sm:pt-6">
          {annotating ? (
            <section className="rounded-[2rem] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-700">
                Annotating
              </p>
              <p className="mt-3 text-lg text-slate-600">
                Processing text, this may take a moment…
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
                the floating action menu to load text, browse the novel library,
                review recognition memory, or switch modes.
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
              <ChapterNavigation {...chapterNavigationProps} />
              {annotations.map((paragraph, paragraphIndex) => (
                <div
                  key={`paragraph-${paragraphIndex}`}
                  className="py-1"
                >
                  {paragraph.length === 0 ? (
                    <div className="h-6" />
                  ) : (
                    <div className="flex flex-wrap items-end gap-x-0 gap-y-2 leading-[3.4rem]">
                      {paragraph.map((item, index) =>
                        renderAnnotationItem(item, index),
                      )}
                    </div>
                  )}
                </div>
              ))}
              <ChapterNavigation {...chapterNavigationProps} />
            </article>
          )}
        </main>
      </div>

      <SpeedDialFab
        expanded={fabExpanded}
        onToggleExpanded={() => setFabExpanded((current) => !current)}
        onToggleMode={toggleViewMode}
        onOpenPaste={() => openPanel("paste")}
        onOpenLibrary={() => openPanel("library")}
        onOpenReview={() => openPanel("review")}
        onOpenMenu={() => openPanel("menu")}
        viewMode={viewMode}
      />

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
