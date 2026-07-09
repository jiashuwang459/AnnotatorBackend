"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { api, getErrorMessage } from "@/lib/api";
import type { EditEntryRecord, EditEntryType } from "@/lib/types";

const fieldLimits = {
  traditional: 20,
  simplified: 20,
  pinyin: 100,
  english: 200,
  reason: 1000,
  notes: 1000,
  type: 10,
} satisfies Record<string, number>;

const entryTypes: Array<{ label: string; value: EditEntryType }> = [
  { label: "Custom", value: "custom" },
  { label: "Priority", value: "priority" },
  { label: "Blacklist", value: "blacklist" },
  { label: "Other", value: "other" },
];

const fieldsByType: Record<EditEntryType, Array<keyof FormState>> = {
  custom: ["simplified", "traditional", "pinyin", "english", "notes"],
  priority: ["simplified", "traditional", "pinyin", "english", "reason"],
  blacklist: ["simplified", "traditional", "pinyin", "english", "reason"],
  other: [
    "simplified",
    "traditional",
    "pinyin",
    "english",
    "reason",
    "notes",
  ],
};

type FormState = {
  type: EditEntryType | "";
  simplified: string;
  traditional: string;
  pinyin: string;
  english: string;
  reason: string;
  notes: string;
};

const emptyForm: FormState = {
  type: "",
  simplified: "",
  traditional: "",
  pinyin: "",
  english: "",
  reason: "",
  notes: "",
};

type FieldProps = {
  id: keyof FormState;
  label: string;
  multiline?: boolean;
};

function Field({
  id,
  label,
  multiline = false,
  value,
  onChange,
  error,
}: FieldProps & {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const className =
    "mt-2 w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 shadow-sm outline-none transition focus:bg-white " +
    (error
      ? "border-rose-300 focus:border-rose-400"
      : "border-slate-200 focus:border-sky-400");

  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={fieldLimits[id]}
          className={`${className} min-h-28`}
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={fieldLimits[id]}
          className={className}
        />
      )}
      <span className="mt-1 block text-xs text-slate-500">
        Max {fieldLimits[id]} characters
      </span>
      {error ? (
        <span className="mt-1 block text-xs text-rose-600">{error}</span>
      ) : null}
    </label>
  );
}

export default function EditEntryPage() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>(
    {},
  );
  const [recentEntries, setRecentEntries] = useState<EditEntryRecord[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submittedEntry, setSubmittedEntry] = useState<EditEntryRecord | null>(
    null,
  );

  const activeFields = useMemo(
    () => (form.type ? fieldsByType[form.type] : []),
    [form.type],
  );

  useEffect(() => {
    async function loadEntries(type: EditEntryType) {
      setLoadingEntries(true);
      setErrorMessage(null);

      try {
        const params = new URLSearchParams({ type });
        const response = await api.get<EditEntryRecord[]>(
          `/entry/edit?${params.toString()}`,
        );
        setRecentEntries(response);
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setLoadingEntries(false);
      }
    }

    if (form.type) {
      void loadEntries(form.type);
    }
  }, [form.type]);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate() {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (!form.type) {
      nextErrors.type = "Choose an edit type.";
    }

    for (const field of activeFields) {
      const value = form[field].trim();
      if (!value) {
        nextErrors[field] = "This field is required.";
        continue;
      }

      if (value.length > fieldLimits[field]) {
        nextErrors[field] = `Must be ${fieldLimits[field]} characters or fewer.`;
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate() || !form.type) {
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload = activeFields.reduce<Record<string, string>>(
        (result, field) => {
          result[field] = form[field].trim();
          return result;
        },
        { type: form.type },
      );

      const response = await api.post<EditEntryRecord>("/entry/edit", payload);
      setSubmittedEntry(response);
      setSuccessMessage("Entry edit submitted.");
      setRecentEntries((current) => [response, ...current]);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SiteShell
      title="Edit dictionary entries"
      description="Submit custom, priority, blacklist, or other edits through the existing backend contract while surfacing recent submissions."
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Edit type
              </span>
              <select
                value={form.type}
                onChange={(event) => {
                  setRecentEntries([]);
                  updateField(
                    "type",
                    event.target.value as EditEntryType | "",
                  );
                }}
                className={`mt-2 w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm shadow-sm outline-none transition focus:bg-white ${
                  errors.type
                    ? "border-rose-300 focus:border-rose-400"
                    : "border-slate-200 focus:border-sky-400"
                }`}
              >
                <option value="">Select a type</option>
                {entryTypes.map((entryType) => (
                  <option key={entryType.value} value={entryType.value}>
                    {entryType.label}
                  </option>
                ))}
              </select>
              {errors.type ? (
                <span className="mt-1 block text-xs text-rose-600">
                  {errors.type}
                </span>
              ) : null}
            </label>

            {activeFields.includes("simplified") ? (
              <Field
                id="simplified"
                label="Simplified Chinese"
                value={form.simplified}
                onChange={(value) => updateField("simplified", value)}
                error={errors.simplified}
              />
            ) : null}
            {activeFields.includes("traditional") ? (
              <Field
                id="traditional"
                label="Traditional Chinese"
                value={form.traditional}
                onChange={(value) => updateField("traditional", value)}
                error={errors.traditional}
              />
            ) : null}
            {activeFields.includes("pinyin") ? (
              <Field
                id="pinyin"
                label="Pinyin"
                value={form.pinyin}
                onChange={(value) => updateField("pinyin", value)}
                error={errors.pinyin}
              />
            ) : null}
            {activeFields.includes("english") ? (
              <Field
                id="english"
                label="English"
                multiline
                value={form.english}
                onChange={(value) => updateField("english", value)}
                error={errors.english}
              />
            ) : null}
            {activeFields.includes("reason") ? (
              <Field
                id="reason"
                label="Reason"
                multiline
                value={form.reason}
                onChange={(value) => updateField("reason", value)}
                error={errors.reason}
              />
            ) : null}
            {activeFields.includes("notes") ? (
              <Field
                id="notes"
                label="Notes"
                multiline
                value={form.notes}
                onChange={(value) => updateField("notes", value)}
                error={errors.notes}
              />
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="submit"
                disabled={submitting || !form.type}
                className="w-full rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
              >
                {submitting ? "Submitting…" : "Submit entry edit"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setForm(emptyForm);
                  setErrors({});
                  setSubmittedEntry(null);
                  setSuccessMessage(null);
                  setErrorMessage(null);
                }}
                className="w-full rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
              >
                Reset form
              </button>
            </div>
          </form>

          {(successMessage || errorMessage) && (
            <div
              className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
                errorMessage
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {errorMessage ?? successMessage}
            </div>
          )}

          {submittedEntry ? (
            <pre className="mt-5 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
              <code>{JSON.stringify(submittedEntry, null, 2)}</code>
            </pre>
          ) : null}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950">
              Recent submissions
            </h2>
            <p className="text-sm leading-6 text-slate-600">
              This view reads from
              <code className="mx-1 rounded bg-slate-100 px-1 py-0.5 text-xs text-slate-900">
                /api/entry/edit
              </code>
              so the page can confirm what was accepted by the backend.
            </p>
          </div>

          {loadingEntries ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              Loading recent entries…
            </div>
          ) : !form.type ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              Choose an edit type to inspect submitted entries.
            </div>
          ) : recentEntries.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              No entries returned for this type yet.
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {recentEntries.map((entry) => (
                <article
                  key={entry.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-950">
                      {entry.simplified}
                    </h3>
                    {entry.traditional &&
                    entry.traditional !== entry.simplified ? (
                      <span className="rounded-full bg-white px-3 py-1 text-sm text-slate-600">
                        {entry.traditional}
                      </span>
                    ) : null}
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                      {entry.type}
                    </span>
                  </div>
                  <div className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                    <p>
                      <span className="font-semibold text-slate-900">
                        Pinyin:
                      </span>{" "}
                      {entry.pinyin}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">
                        English:
                      </span>{" "}
                      {entry.english}
                    </p>
                    {entry.reason ? (
                      <p>
                        <span className="font-semibold text-slate-900">
                          Reason:
                        </span>{" "}
                        {entry.reason}
                      </p>
                    ) : null}
                    {entry.notes ? (
                      <p>
                        <span className="font-semibold text-slate-900">
                          Notes:
                        </span>{" "}
                        {entry.notes}
                      </p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </SiteShell>
  );
}
