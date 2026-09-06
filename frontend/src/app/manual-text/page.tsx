"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { SiteShell } from "@/components/site-shell";

const MANUAL_READER_DRAFT_KEY = "annotator.manualReaderDraft";

export default function ManualTextPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [label, setLabel] = useState("Manual text");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextText = text.trim();

    if (!nextText) {
      return;
    }

    window.sessionStorage.setItem(
      MANUAL_READER_DRAFT_KEY,
      JSON.stringify({
        text: nextText,
        label: label.trim() || "Manual text",
      }),
    );

    router.push("/annotator");
  }

  return (
    <SiteShell
      title="Manual text reader"
      description="Prepare custom text on a separate screen, then open it in the immersive reader without crowding the library-focused book view."
    >
      <section className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="manual-reader-label"
              className="text-sm font-semibold uppercase tracking-wide text-slate-500"
            >
              Reader label
            </label>
            <input
              id="manual-reader-label"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Manual text"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:bg-white"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="manual-reader-text"
              className="text-sm font-semibold uppercase tracking-wide text-slate-500"
            >
              Chinese text
            </label>
            <textarea
              id="manual-reader-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Paste or edit the chapter text here…"
              className="min-h-80 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:bg-white"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="submit"
              disabled={text.trim().length === 0}
              className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
            >
              Open in reader
            </button>
            <Link
              href="/annotator"
              className="w-full rounded-full border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
            >
              Back to library reader
            </Link>
          </div>
        </form>
      </section>
    </SiteShell>
  );
}
