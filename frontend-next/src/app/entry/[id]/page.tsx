"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateEntry, deleteEntry } from "@/lib/api";
import type { Entry } from "@/types";

const schema = z.object({
  simplified: z.string().min(1, "Required"),
  traditional: z.string(),
  pinyin: z.string().min(1, "Required"),
  english: z.string().min(1, "Required"),
  owner: z.string(),
  priority: z.number().int().min(0),
});

type FormValues = z.infer<typeof schema>;

export default function EditEntryPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [entry, setEntry] = useState<Entry | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      simplified: "",
      traditional: "",
      pinyin: "",
      english: "",
      owner: "",
      priority: 500,
    },
  });

  // Load entry data from sessionStorage (set by EntryCard when user clicks Edit)
  useEffect(() => {
    const cached = sessionStorage.getItem(`entry_${id}`);
    if (cached) {
      try {
        const parsed: Entry = JSON.parse(cached);
        setEntry(parsed);
        reset({
          simplified: parsed.simplified,
          traditional: parsed.traditional ?? "",
          pinyin: parsed.pinyin,
          english: parsed.english,
          owner: parsed.owner ?? "",
          priority: parsed.priority,
        });
      } catch {
        setLoadError("Could not parse entry data.");
      }
    } else {
      setLoadError(
        "Entry data not found. Please navigate to this page from the Dictionary or Annotator."
      );
    }
  }, [id, reset]);

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    try {
      const updated = await updateEntry(id, data);
      setEntry(updated);
      sessionStorage.setItem(`entry_${id}`, JSON.stringify(updated));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (e: unknown) {
      setServerError(e instanceof Error ? e.message : "Update failed");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this entry permanently?")) return;
    setDeleting(true);
    try {
      await deleteEntry(id);
      sessionStorage.removeItem(`entry_${id}`);
      router.push("/dictionary");
    } catch (e: unknown) {
      setServerError(e instanceof Error ? e.message : "Delete failed");
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-800 transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          Edit Entry #{id}
          {entry && ` — ${entry.simplified}`}
        </h1>
      </div>

      {loadError && (
        <div className="bg-yellow-50 border border-yellow-300 rounded p-4 text-yellow-800 text-sm">
          {loadError}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col gap-4"
      >
        <Field label="Simplified *" error={errors.simplified?.message}>
          <input {...register("simplified")} className="input" />
        </Field>

        <Field label="Traditional" error={errors.traditional?.message}>
          <input {...register("traditional")} className="input" />
        </Field>

        <Field label="Pinyin *" error={errors.pinyin?.message}>
          <input {...register("pinyin")} className="input" placeholder="e.g. ni3 hao3" />
          <p className="text-xs text-gray-400 mt-1">ASCII tone notation (1–5)</p>
        </Field>

        <Field label="English *" error={errors.english?.message}>
          <input {...register("english")} className="input" placeholder='e.g. hello/hi' />
          <p className="text-xs text-gray-400 mt-1">Separate definitions with "/"</p>
        </Field>

        <Field label="Owner" error={errors.owner?.message}>
          <input {...register("owner")} className="input" />
        </Field>

        <Field label="Priority" error={errors.priority?.message}>
          <input
            {...register("priority", { valueAsNumber: true })}
            type="number"
            min={0}
            className="input w-28"
          />
        </Field>

        {serverError && <p className="text-red-500 text-sm">{serverError}</p>}
        {success && <p className="text-green-600 text-sm">✓ Entry updated!</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting || !!loadError}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Saving…" : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || !!loadError}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}
