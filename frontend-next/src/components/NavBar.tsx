"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Annotator" },
  { href: "/dictionary", label: "Dictionary" },
  { href: "/entry/create", label: "New Entry" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="bg-slate-800 text-white px-6 py-3 flex items-center gap-6 shadow-md">
      <span className="font-bold text-lg tracking-wide mr-4 text-indigo-300">
        Chinese Annotator
      </span>
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`text-sm font-medium px-3 py-1 rounded transition-colors ${
            pathname === href
              ? "bg-indigo-600 text-white"
              : "text-slate-300 hover:text-white hover:bg-slate-700"
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
