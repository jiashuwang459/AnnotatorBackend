"use client";

import { useState } from "react";
import type { Fragment } from "@/types";
import { fetchMemory, saveMemory } from "@/lib/api";

interface MemoryControlsProps {
  getFragments: () => Fragment[];
  onFragmentsLoaded: (fragments: Fragment[]) => void;
}

export default function MemoryControls({
  getFragments,
  onFragmentsLoaded,
}: MemoryControlsProps) {
  const [code, setCode] = useState<number | null>(null);
  const [fetchCode, setFetchCode] = useState("");
  const [showFetch, setShowFetch] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await saveMemory(getFragments());
      setCode(res.code);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleFetch = async () => {
    const n = parseInt(fetchCode, 10);
    if (isNaN(n)) {
      setError("Please enter a valid code.");
      return;
    }
    setFetching(true);
    setError(null);
    try {
      const res = await fetchMemory(n);
      setCode(res.code);
      onFragmentsLoaded(res.fragments);
      setShowFetch(false);
      setFetchCode("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Fetch failed");
    } finally {
      setFetching(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Current code display */}
      <div className="flex items-center gap-1.5 border border-gray-300 rounded px-3 py-1.5 bg-white text-sm">
        <span className="text-gray-500">Memory Code:</span>
        <span className="font-mono font-semibold text-indigo-700">
          {code ?? "—"}
        </span>
      </div>

      {/* Load memory */}
      <div className="relative">
        <button
          onClick={() => setShowFetch((v) => !v)}
          title="Load memory code"
          className="px-3 py-1.5 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 transition-colors"
        >
          📂 Load
        </button>
        {showFetch && (
          <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-300 rounded shadow-lg p-3 flex gap-2 items-center">
            <input
              type="number"
              min={0}
              value={fetchCode}
              onChange={(e) => setFetchCode(e.target.value)}
              placeholder="Enter code"
              className="border border-gray-300 rounded px-2 py-1 w-32 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              onClick={handleFetch}
              disabled={fetching}
              className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {fetching ? "…" : "Load"}
            </button>
          </div>
        )}
      </div>

      {/* Save memory */}
      <button
        onClick={handleSave}
        disabled={saving}
        title="Save current memory"
        className="px-3 py-1.5 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center gap-1"
      >
        {saving ? (
          <>
            <span className="animate-spin inline-block w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full" />
            Saving…
          </>
        ) : (
          "💾 Save"
        )}
      </button>

      {error && (
        <span className="text-red-500 text-xs">{error}</span>
      )}
    </div>
  );
}
