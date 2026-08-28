"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { href: "/annotator", label: "Annotator" },
  { href: "/dictionary", label: "Dictionary" },
  { href: "/edit-entry", label: "Edit entry" },
];

type SiteShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function SiteShell({ title, description, children }: SiteShellProps) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:gap-8 sm:px-6 sm:py-6 lg:px-8">
      <header className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
              Annotator frontend
            </p>
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                {title}
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                {description}
              </p>
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-2xl border px-4 py-2 text-center text-sm font-medium transition sm:rounded-full ${
                  pathname === item.href
                    ? "border-sky-200 bg-sky-50 text-sky-700"
                    : "border-slate-200 text-slate-700 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
