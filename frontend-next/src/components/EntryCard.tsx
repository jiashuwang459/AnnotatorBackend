"use client";

import Link from "next/link";
import type { Entry } from "@/types";
import { parsePinyinString } from "@/lib/pinyin";

interface EntryCardProps {
  entry: Entry;
  showEditLink?: boolean;
}

export default function EntryCard({ entry, showEditLink = true }: EntryCardProps) {
  const handleEditClick = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`entry_${entry.id}`, JSON.stringify(entry));
    }
  };

  return (
    <div className="border border-cyan-300 rounded p-3 bg-white flex flex-col gap-1">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-800">{entry.simplified}</span>
        {entry.traditional && entry.traditional !== entry.simplified && (
          <span className="text-gray-500 text-sm">({entry.traditional})</span>
        )}
        <span className="text-indigo-600 font-medium">
          {parsePinyinString(entry.pinyin)}
        </span>
        {showEditLink && (
          <Link
            href={`/entry/${entry.id}`}
            onClick={handleEditClick}
            className="ml-auto text-xs text-blue-500 hover:underline"
          >
            Edit
          </Link>
        )}
      </div>
      <ol className="list-decimal list-inside text-gray-700 text-sm space-y-0.5">
        {entry.english.split("/").map((def, i) => (
          <li key={i}>{def}</li>
        ))}
      </ol>
      <div className="text-xs text-gray-400">
        Priority: {entry.priority} · Owner: {entry.owner || "(default)"}
      </div>
    </div>
  );
}
