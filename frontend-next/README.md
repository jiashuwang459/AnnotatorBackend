# Chinese Annotator — Next.js Frontend

A Next.js + Tailwind CSS frontend for the Chinese Annotator backend. Replaces the legacy React 17 / Webpack / multi-framework frontend.

## Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS** (v4, via PostCSS)
- **React Hook Form + Zod** for form validation

## Getting Started

1. Start the Django backend (default: `http://localhost:8000`).
2. Install dependencies:

```bash
npm install
```

3. Run the dev server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000).

The Next.js dev server proxies `/api/*` requests to the Django backend at `localhost:8000` (configured in `next.config.ts`).

## Pages

| Route | Description |
|-------|-------------|
| `/` | Annotator — paste Chinese text and get pinyin annotation |
| `/dictionary` | Dictionary lookup — search entries by phrase |
| `/entry/create` | Create a new dictionary entry |
| `/entry/[id]` | Edit or delete an existing dictionary entry |

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with NavBar
│   ├── page.tsx            # Annotator page
│   ├── dictionary/
│   │   └── page.tsx        # Dictionary lookup
│   └── entry/
│       ├── create/page.tsx # Create entry form
│       └── [id]/page.tsx   # Edit/delete entry form
├── components/
│   ├── AnnotationDisplay.tsx  # Renders annotated tokens with pinyin
│   ├── EntryCard.tsx          # Dictionary entry display card
│   ├── HelperCard.tsx         # Inline dictionary popup
│   ├── MemoryControls.tsx     # Save/load memory codes
│   └── NavBar.tsx             # Navigation bar
├── lib/
│   ├── api.ts             # Backend API client (fetch-based)
│   └── pinyin.ts          # ASCII → Unicode pinyin parser
└── types/
    └── index.ts           # Shared TypeScript types
```

## Build

```bash
npm run build
npm start
```
