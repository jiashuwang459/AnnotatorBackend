"use client";

import { useRef, useState } from "react";
import type { AnnotationToken, Fragment } from "@/types";
import { annotateText } from "@/lib/api";
import AnnotationDisplay from "@/components/AnnotationDisplay";
import MemoryControls from "@/components/MemoryControls";

export default function AnnotatorPage() {
  const [text, setText] = useState("");
  const [tokens, setTokens] = useState<AnnotationToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(true);
  const memFragmentsRef = useRef<Fragment[]>([]);

  const handleAnnotate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setTokens([]);

    try {
      // Split by newlines, annotate each paragraph
      const paragraphs = text.split("\n");
      const allTokens: AnnotationToken[] = [];

      for (const paragraph of paragraphs) {
        if (!paragraph.trim()) {
          // Keep empty lines as spacing
          allTokens.push({ pinyin: "\u00a0", cchar: "\n" });
          continue;
        }
        const result = await annotateText(paragraph);
        allTokens.push(...result);
      }

      setTokens(allTokens);
      setShowInput(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Annotation failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Annotator</h1>
        <MemoryControls
          getFragments={() => memFragmentsRef.current}
          onFragmentsLoaded={(frags) => {
            memFragmentsRef.current = frags;
          }}
        />
      </div>

      {/* Input panel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <button
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors rounded-lg"
          onClick={() => setShowInput((v) => !v)}
        >
          <span>✏️ Input Text</span>
          <span className="text-gray-400">{showInput ? "▲" : "▼"}</span>
        </button>
        {showInput && (
          <div className="px-4 pb-4 flex flex-col gap-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste Chinese text here…"
              rows={6}
              className="w-full border border-gray-300 rounded p-2 text-base resize-y focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <div className="flex gap-2 items-center">
              <button
                onClick={handleAnnotate}
                disabled={loading || !text.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Annotating…
                  </>
                ) : (
                  "🖊️ Annotate"
                )}
              </button>
              {tokens.length > 0 && (
                <button
                  onClick={() => { setTokens([]); setShowInput(true); }}
                  className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {tokens.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[200px]">
          <div className="px-4 py-3 border-b border-gray-100 text-sm font-medium text-gray-600">
            Annotated Result — click any word to look it up
          </div>
          <AnnotationDisplay
            tokens={tokens}
            onMemoryUpdate={(frags) => {
              memFragmentsRef.current = frags;
            }}
          />
        </div>
      )}

      {!tokens.length && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-400">
          <p className="text-4xl mb-3">📖</p>
          <p className="font-medium">Welcome to the Chinese Annotator!</p>
          <p className="text-sm mt-1">
            Paste Chinese text above and click <strong>Annotate</strong> to add pinyin.
            Click any word in the result to see its dictionary definition.
          </p>
        </div>
      )}
    </div>
  );
}
