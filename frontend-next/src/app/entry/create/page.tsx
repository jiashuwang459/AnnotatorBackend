"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEntry } from "@/lib/api";

const schema = z.object({
  simplified: z.string().min(1, "Required"),
  traditional: z.string(),
  pinyin: z.string().min(1, "Required"),
  english: z.string().min(1, "Required"),
  owner: z.string(),
  priority: z.number().int().min(0),
});

type FormValues = z.infer<typeof schema>;

export default function CreateEntryPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 500, owner: "", traditional: "" },
  });

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    try {
      await createEntry(data);
      setSuccess(true);
      reset();
      setTimeout(() => router.push("/dictionary"), 1500);
    } catch (e: unknown) {
      setServerError(e instanceof Error ? e.message : "Failed to create entry");
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
        <h1 className="text-2xl font-bold text-gray-800">New Dictionary Entry</h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col gap-4"
      >
        <Field label="Simplified *" error={errors.simplified?.message}>
          <input
            {...register("simplified")}
            className="input"
            placeholder="e.g. 你好"
          />
        </Field>

        <Field label="Traditional" error={errors.traditional?.message}>
          <input
            {...register("traditional")}
            className="input"
            placeholder="e.g. 你好 (leave blank if same)"
          />
        </Field>

        <Field label="Pinyin *" error={errors.pinyin?.message}>
          <input
            {...register("pinyin")}
            className="input"
            placeholder="e.g. ni3 hao3"
          />
          <p className="text-xs text-gray-400 mt-1">
            ASCII tone notation: tone number at end of each syllable (1–5)
          </p>
        </Field>

        <Field label="English *" error={errors.english?.message}>
          <input
            {...register("english")}
            className="input"
            placeholder="e.g. hello/hi"
          />
          <p className="text-xs text-gray-400 mt-1">
            Separate multiple definitions with &ldquo;/&rdquo;
          </p>
        </Field>

        <Field label="Owner" error={errors.owner?.message}>
          <input
            {...register("owner")}
            className="input"
            placeholder="Leave blank for default"
          />
        </Field>

        <Field label="Priority" error={errors.priority?.message}>
          <input
            {...register("priority", { valueAsNumber: true })}
            type="number"
            min={0}
            className="input w-28"
          />
          <p className="text-xs text-gray-400 mt-1">
            Lower = higher priority. Default entries are 0–999.
          </p>
        </Field>

        {serverError && (
          <p className="text-red-500 text-sm">{serverError}</p>
        )}
        {success && (
          <p className="text-green-600 text-sm">
            ✓ Entry created! Redirecting…
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors self-start"
        >
          {isSubmitting ? "Creating…" : "Create Entry"}
        </button>
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
