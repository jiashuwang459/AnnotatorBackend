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
const MANUAL_READER_DRAFT_KEY = "annotator.manualReaderDraft";

type SecondaryPanel = "library" | "review" | "menu" | null;
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

function TopToast({
  message,
  tone = "neutral",
}: {
  message: string | null;
  tone?: "neutral" | "success";
}) {
  return (
    <div
      className={`pointer-events-none fixed inset-x-0 top-14 z-50 flex justify-center px-4 transition duration-200 ${
        message ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
      }`}
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={`rounded-full px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur ${
          tone === "success" ? "bg-emerald-700/90" : "bg-slate-950/85"
        }`}
      >
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

function SideActionRail({
  onToggleMode,
  onOpenLibrary,
  onOpenMemory,
  onSaveMemory,
  onOpenMenu,
  canSaveMemory,
  savingMemory,
  viewMode,
}: {
  onToggleMode: () => void;
  onOpenLibrary: () => void;
  onOpenMemory: () => void;
  onSaveMemory: () => void;
  onOpenMenu: () => void;
  canSaveMemory: boolean;
  savingMemory: boolean;
  viewMode: ViewMode;
}) {
  const actions = [
    {
      label: viewMode === "reader" ? "Dictionary mode" : "Reader mode",
      icon: viewMode === "reader" ? "🔎" : "📖",
      onClick: onToggleMode,
    },
    { label: "Library", icon: "📚", onClick: onOpenLibrary },
    {
      label: savingMemory ? "Saving…" : "Save memory",
      icon: "💾",
      onClick: onSaveMemory,
      disabled: !canSaveMemory || savingMemory,
    },
    { label: "Load memory", icon: "🧠", onClick: onOpenMemory },
    { label: "More", icon: "☰", onClick: onOpenMenu },
  ];

  return (
    <div className="fixed right-3 top-1/2 z-40 flex -translate-y-1/2 flex-col items-end gap-2 sm:right-5">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={action.onClick}
          disabled={"disabled" in action ? action.disabled : false}
          data-reader-interactive="true"
          className="flex items-center gap-3 rounded-full border border-white/70 bg-white/88 px-3 py-2 text-sm font-semibold text-slate-800 shadow-lg backdrop-blur transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
        >
          <span className="text-base" aria-hidden="true">
            {action.icon}
          </span>
          <span className="hidden sm:inline">{action.label}</span>
        </button>
      ))}
    </div>
  );
}

function ChapterNavigation({
  chapterLabel,
  hasPrevious,
  hasNext,
  loading,
  onPrevious,
  onNext,
}: {
  chapterLabel?: string;
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
    <div className="space-y-3">
      {chapterLabel ? (
        <p className="text-center text-sm font-medium tracking-[0.08em] text-slate-500">
          end of chapter {chapterLabel}
        </p>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!hasPrevious || loading}
          data-reader-interactive="true"
          className="rounded-full border border-slate-400/70 bg-white/50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous chapter
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext || loading}
          data-reader-interactive="true"
          className="rounded-full border border-slate-400/70 bg-white/50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next chapter
        </button>
      </div>
    </div>
  );
}

function ReaderHeader({
  hidden,
  onMenuOpen,
  paragraphCount,
  selectedCount,
  readerLabel,
}: {
  hidden: boolean;
  onMenuOpen: () => void;
  paragraphCount: number;
  selectedCount: number;
  readerLabel: string;
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
  variant = "sheet",
}: {
  children: ReactNode;
  label: string;
  onClose: () => void;
  fullHeight?: boolean;
  layerClassName?: string;
  variant?: "sheet" | "popup";
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
    <div
      className={`fixed inset-0 bg-slate-950/45 backdrop-blur-sm ${layerClassName} ${
        variant === "popup" ? "flex items-center justify-center p-4" : ""
      }`}
    >
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
        className={`z-10 mx-auto w-full overflow-hidden border border-white/10 bg-white shadow-2xl ${
          variant === "popup"
            ? "relative max-w-2xl rounded-[2rem] max-h-[85vh]"
            : `absolute inset-x-0 bottom-0 max-w-3xl rounded-t-[2rem] ${
                fullHeight ? "max-h-[92vh]" : "max-h-[80vh]"
              }`
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export default function AnnotatorPage() {
  const [, setText] = useState("");
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
  const [actionRailVisible, setActionRailVisible] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<"neutral" | "success">("neutral");
  const lookupRequestId = useRef(0);
  const previousViewModeRef = useRef<ViewMode>("reader");
  const toastTimeoutRef = useRef<number | null>(null);
  const longPressTimeoutRef = useRef<number | null>(null);
  const longPressTriggeredRef = useRef(false);
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

      if (Math.abs(nextScrollY - lastScrollY) > 2) {
        setActionRailVisible(false);
      }

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
    const resizeOptions: boolean | AddEventListenerOptions = { passive: true };

    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, resizeOptions);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress, resizeOptions);
    };
  }, [updateProgress]);

  useEffect(() => {
    if (previousViewModeRef.current === viewMode) {
      return;
    }

    previousViewModeRef.current = viewMode;

    setToastTone("neutral");
    setToastMessage(
      viewMode === "reader"
        ? "Reader Mode: Tap characters to toggle recognition."
        : "Dictionary Mode: Tap phrases to view definitions.",
    );

    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = window.setTimeout(() => setToastMessage(null), 2200);
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, [viewMode]);

  const showToast = useCallback((message: string, tone: "neutral" | "success" = "neutral") => {
    setToastTone(tone);
    setToastMessage(message);

    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = window.setTimeout(() => setToastMessage(null), 2200);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }

      if (longPressTimeoutRef.current) {
        window.clearTimeout(longPressTimeoutRef.current);
      }
    };
  }, []);

  const selectedKeys = useMemo(
    () => new Set(selectedFragments.map(fragmentKey)),
    [selectedFragments],
  );

  function clearLongPressTimeout() {
    if (longPressTimeoutRef.current) {
      window.clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  }

  function beginLongPress(fragment: Fragment, phrase: PhraseContext | null) {
    clearLongPressTimeout();
    longPressTriggeredRef.current = false;

    longPressTimeoutRef.current = window.setTimeout(() => {
      longPressTriggeredRef.current = true;
      void inspectLookup(fragment, phrase);
    }, 450);
  }

  function openPanel(panel: Exclude<SecondaryPanel, null>) {
    resetLookupState();
    setActionRailVisible(false);
    setActivePanel((current) => (current === panel ? null : panel));
  }

  function switchViewMode(nextMode: ViewMode) {
    setViewMode(nextMode);
    resetLookupState();
    updateProgress();
  }

  function toggleViewMode() {
    switchViewMode(viewMode === "reader" ? "dictionary" : "reader");
  }

  function toggleActionRailFromSurface(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.closest("[data-reader-interactive='true']")) {
      return;
    }

    setActionRailVisible((current) => !current);
  }

  const chapterList = selectedNovel ? (novels[selectedNovel] ?? []) : [];
  const chapterIndex = chapterList.indexOf(selectedChapter);
  const previousChapter =
    chapterIndex > 0 ? chapterList[chapterIndex - 1] : null;
  const nextChapter =
    chapterIndex >= 0 && chapterIndex < chapterList.length - 1
      ? chapterList[chapterIndex + 1]
      : null;

  const annotateSource = useCallback(
    async (sourceText: string, nextReaderLabel = "Pasted text") => {
      if (!sourceText.trim()) {
        setAnnotations([]);
        setReaderLabel("Open text to begin reading");
        setScrollProgress(0);
        resetLookupState();
        return;
      }

      setAnnotating(true);
      setErrorMessage(null);
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
        showToast("Annotation complete.", "success");
        setActivePanel(null);
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setAnnotating(false);
      }
    },
    [resetLookupState, showToast],
  );

  useEffect(() => {
    const pendingDraft = window.sessionStorage.getItem(MANUAL_READER_DRAFT_KEY);

    if (!pendingDraft) {
      return;
    }

    window.sessionStorage.removeItem(MANUAL_READER_DRAFT_KEY);

    try {
      const parsed = JSON.parse(pendingDraft) as { text?: string; label?: string };
      const nextText = parsed.text?.trim() ?? "";

      if (!nextText) {
        return;
      }

      setText(nextText);
      setSelectedNovel("");
      setSelectedChapter("");
      void annotateSource(nextText, parsed.label?.trim() || "Manual text");
    } catch {
      setErrorMessage("Could not open the saved manual text draft.");
    }
  }, [annotateSource]);

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

    setLoadingChapter(true);
    setErrorMessage(null);
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
      showToast("Chapter loaded and annotated.", "success");
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

    try {
      const params = new URLSearchParams({ code: memoryCodeInput.trim() });
      const response = await api.get<MemoryRecord>(
        `/memory/fetch?${params.toString()}`,
      );
      setMemoryCode(response.code);
      setMemoryCodeInput(String(response.code));
      setSelectedFragments(response.fragments);
      showToast(`Loaded memory ${response.code}.`, "success");
      setActivePanel(null);
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

    try {
      const response = await api.post<MemoryRecord>("/memory/save", {
        fragments: selectedFragments,
      });
      setMemoryCode(response.code);
      setMemoryCodeInput(String(response.code));
      showToast(`Saved ${selectedFragments.length} fragment(s).`, "success");

      if (activePanel === "review") {
        setActivePanel(null);
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSavingMemory(false);
    }
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
          data-reader-interactive="true"
          className="reader-punctuation px-0 py-0 text-[1.4rem] leading-[3.2rem] text-slate-700"
        >
          {fragment.cchar}
        </span>
      );
    }

    const hidePinyin = viewMode === "reader" && selected;
    const fragmentToneClass = viewMode === "reader" ? "text-slate-800" : "text-slate-900";

    return (
      <button
        key={key}
        type="button"
        data-reader-interactive="true"
        onPointerDown={() => beginLongPress(fragment, phrase)}
        onPointerUp={clearLongPressTimeout}
        onPointerMove={clearLongPressTimeout}
        onPointerLeave={clearLongPressTimeout}
        onPointerCancel={clearLongPressTimeout}
        onContextMenu={(event) => event.preventDefault()}
        onClick={(event) => {
          if (inPhrase) {
            event.stopPropagation();
          }

          if (longPressTriggeredRef.current) {
            longPressTriggeredRef.current = false;
            return;
          }

          handleFragmentPress(fragment, phrase);
        }}
        className={`flex min-w-[1.35em] flex-col items-center bg-transparent px-0 py-0 text-center transition ${fragmentToneClass} ${
          lookupSelected ? "rounded-md bg-sky-100/70 text-sky-900" : ""
        }`}
      >
        <span
          className={`min-h-4 text-[0.72rem] leading-4 ${hidePinyin ? "invisible" : "text-sky-700"}`}
        >
          {formatPinyin(fragment.pinyin)}
        </span>
        <span className="reader-character text-[1.4rem] font-medium leading-7">
          {fragment.cchar}
        </span>
      </button>
    );
  }

  function renderAnnotationItem(item: AnnotationItem, index: number) {
    if (!isPhraseAnnotation(item)) {
      return renderFragment(item, `fragment-${index}`);
    }

    const phrase = buildPhraseContext(item);
    const selectableFragments = item.cchars.filter(isSelectableFragment);
    const phraseSelected = activeLookup?.phrase?.key === phrase?.key;

    if (viewMode === "reader") {
      return (
        <div
          key={`phrase-${index}`}
          data-reader-interactive="true"
          role={selectableFragments.length > 0 ? "button" : undefined}
          tabIndex={selectableFragments.length > 0 ? 0 : undefined}
          onClick={
            selectableFragments.length > 0
              ? () => handlePhrasePress(item)
              : undefined
          }
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
          className="inline-flex flex-wrap items-end gap-0 rounded-md transition"
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
        data-reader-interactive="true"
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
      <TopToast message={toastMessage} tone={toastTone} />

      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 pb-24 pt-4 sm:px-7 sm:pt-6">
        <ReaderHeader
          hidden={headerHidden}
          onMenuOpen={() => openPanel("menu")}
          paragraphCount={annotations.length}
          selectedCount={selectedFragments.length}
          readerLabel={readerLabel}
        />

        {errorMessage && (
          <div
            className="mt-4 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {errorMessage}
          </div>
        )}

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
                Open a chapter from the library to start reading.
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
                The reading surface stays clear until you need support tools. Use the
                action buttons on the right edge to open the library, manage memory,
                or switch modes.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => openPanel("library")}
                 data-reader-interactive="true"
                 className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                 Browse library
                </button>
                <button
                 type="button"
                 onClick={() => openPanel("menu")}
                 data-reader-interactive="true"
                 className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                 Open menu
                </button>
              </div>
            </section>
          ) : (
            <article
              className="reader-text space-y-5"
              onClick={(event) => toggleActionRailFromSurface(event.target)}
            >
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
              <ChapterNavigation
                {...chapterNavigationProps}
                chapterLabel={selectedChapter || "this chapter"}
              />
            </article>
          )}
        </main>
      </div>

      {actionRailVisible ? (
        <SideActionRail
          onToggleMode={toggleViewMode}
          onOpenLibrary={() => openPanel("library")}
          onOpenMemory={() => openPanel("review")}
          onSaveMemory={() => void handleMemorySave()}
          onOpenMenu={() => openPanel("menu")}
          canSaveMemory={selectedFragments.length > 0}
          savingMemory={savingMemory}
          viewMode={viewMode}
        />
      ) : null}

      {activePanel === "library" ? (
        <Overlay
          label="Novel library"
          onClose={() => setActivePanel(null)}
          variant="popup"
        >
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
        <Overlay label="Memory" onClose={() => setActivePanel(null)} variant="popup">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Memory</h2>
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
        <Overlay label="Reader menu" onClose={() => setActivePanel(null)} variant="popup">
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
            <Link
              href="/manual-text"
              className="flex items-center justify-between rounded-3xl border border-slate-200 px-4 py-4 text-sm font-semibold text-slate-800 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
            >
              Manual text reader
              <span className="text-slate-400">→</span>
            </Link>
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

                {loadingLookup ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-500">
                    Loading phrase matches…
                  </div>
                ) : phraseLookupEntries.length === 0 ? (
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
