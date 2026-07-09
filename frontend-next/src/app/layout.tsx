import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Chinese Annotator",
  description: "Annotate Chinese text with pinyin and dictionary lookups",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50">
        <NavBar />
        <main className="flex-1 container mx-auto px-4 py-6 max-w-5xl">
          {children}
        </main>
      </body>
    </html>
  );
}
