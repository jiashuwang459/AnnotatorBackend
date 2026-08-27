# Copilot Instructions for AnnotatorBackend

## 1. Project Overview

This is a **Chinese reading-learning application** that helps users who can speak and understand Mandarin learn to read Chinese characters. The core feature is Pinyin annotation: users paste or select Chinese text, and the app generates Pinyin (transliteration) displayed above each character. Users can toggle Pinyin on/off and progressively mark characters or words as "recognized", enabling incremental reading progress.

**Full Stack:**

| Layer | Technology |
|---|---|
| Backend API | Django 4.x + Django REST Framework (DRF) 3.x |
| Frontend UI | Next.js 16 with React 19, Tailwind CSS 4, TypeScript 5 |
| Bundler | Next.js built-in bundler |
| HTTP Client | axios (with Django CSRF token support configured) |
| Language (backend) | Python 3 |
| Language (frontend) | TypeScript |
| Python Environment & Dependency Tool | uv (`uv venv`, `uv pip`, `uv run`) with `requirements.txt` |
| Data | CEDict dictionary, custom Trie structure for lookups |

The Django project lives under `Annotator/` and contains one Django app:
- `api/` — all backend REST API logic (models, views, serializers, utilities)

The frontend is a separate Next.js application under `frontend/` that communicates with the backend via REST API calls.

---

## 2. Code Style & Conventions

### Python (Backend)

- **Naming:**
  - Functions and local variables: `snake_case` (e.g., `parse_pinyin`, `reload_entry`)
  - Classes: `PascalCase` (e.g., `EntryView`, `AnnotationSerializer`)
  - Constants: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_OWNER`, `MAX_PRIORITY`)
  - Model fields: use `camelCase` to match the existing convention in `models.py` (e.g., `createdAt`, `updatedAt`)
- **Formatting:** Follow PEP 8. Use 4-space indentation. Keep lines under 120 characters.
- **Imports:** Group in order — stdlib, Django/DRF, local app imports. Use absolute imports within the project.
- **Early returns:** Prefer early returns over deeply nested conditionals.
- **Error handling:** Always return a DRF `Response` with an appropriate `status` code. Never let an uncaught exception propagate to the client.
- **No unused code:** Do not leave commented-out code blocks unless they carry meaningful in-progress notes. Remove dead code.
- **Type hints:** Add type hints to new utility functions and helper methods when the types are non-obvious.

### TypeScript (Frontend)

- **Naming:**
  - React components: `PascalCase` file names and function names (e.g., `HelperCard.tsx`, `DisplayArea.tsx`)
  - Variables, functions, props: `camelCase` (e.g., `parsePinyin`, `triggerAnnotate`)
  - Constants: `UPPER_SNAKE_CASE`
- **Formatting:** 2-space indentation, single quotes for strings. Follow TypeScript strict mode requirements.
- **TypeScript:** All new code must use TypeScript (`.ts` and `.tsx` files). Use strict mode with proper type annotations.
- **Functional components:** Use **functional components** with React hooks (the modern React paradigm). Do not use class-based components.
- **State management:** Use React hooks for state management (`useState`, `useContext`, etc.). Do not introduce Redux, Zustand, or other external state libraries without explicit approval.
- **Styling:** Use Tailwind CSS for styling. Apply utility classes directly to JSX elements. Do not use styled-components or CSS-in-JS.

---

## 3. Architecture & Directory Patterns

### Backend (`Annotator/api/`)

```
Annotator/
├── Annotator/          # Django project settings, root URL conf
│   ├── settings.py
│   └── urls.py         # Routes: /api/ → api.urls
├── api/                # Main API Django app
│   ├── models.py       # All Django ORM models
│   ├── serializers.py  # All DRF serializers
│   ├── views.py        # All API views (class-based)
│   ├── urls.py         # API URL patterns (prefix: /api/)
│   ├── utils.py        # Shared utility functions (isChinese, parsePinyin, CEDict loading, etc.)
│   ├── Trie.py         # Trie data structure for fast dictionary lookups
│   ├── migrations/     # Django database migrations (auto-generated)
│   └── tests.py        # Django test cases
└── frontend/           # Next.js frontend application
    ├── src/
    │   ├── app/        # Next.js App Router pages and layouts
    │   ├── components/ # All React components (one per file)
    │   └── lib/        # Utility functions and helpers
    ├── public/         # Static assets
    ├── next.config.ts  # Next.js configuration
    ├── tsconfig.json   # TypeScript configuration
    ├── tailwind.config.ts # Tailwind CSS configuration
    └── package.json
```

**Rules:**
- New API endpoints **must** be added to `api/urls.py` and `api/views.py`. URL patterns use the existing `/api/<resource>` convention.
- New models go in `api/models.py`. Run `python manage.py makemigrations` after any model change.
- New serializers go in `api/serializers.py`.
- Shared/reusable backend logic (e.g., Chinese character parsing, dictionary helpers) goes in `api/utils.py`.
- New React components go in `frontend/src/components/` as a single `.tsx` file per component. Use functional components with TypeScript.
- Do not create sub-directories inside `frontend/src/components/` unless there is an explicit need for co-located assets.
- Pages and layouts go in `frontend/src/app/` following Next.js App Router conventions.
- Utility functions and custom hooks go in `frontend/src/lib/`.

### Module Interaction

- The frontend communicates with the backend **exclusively via axios HTTP calls** to `/api/` endpoints.
- CSRF tokens are handled globally via `axios.defaults.xsrfCookieName` and `axios.defaults.xsrfHeaderName` (already configured in `App.js`). Do not bypass CSRF protection.
- The backend does **not** import anything from the `frontend/` app. Data flows strictly from the database → DRF serializer → JSON response → React component.

---

## 4. Tech-Specific Rules

### Django / Django REST Framework

**DO:**
- Use `uv` for Python environment and dependency workflows (`uv venv`, `uv pip install -r requirements.txt`, `uv run python ...`).
- Use **class-based views** inheriting from `APIView` or a DRF generic view (`generics.ListAPIView`, `generics.ListCreateAPIView`, `generics.RetrieveUpdateDestroyAPIView`). Match the pattern in `views.py`.
- Use a dedicated **serializer** for every model interaction. Never directly build raw dicts from `request.data` without validation.
- Validate input with `serializer.is_valid()` before accessing `serializer.data`.
- Return `Response(data, status=status.HTTP_<CODE>_<NAME>)` for all API responses.
- Use `Entry.objects.filter(...)` with Q objects for complex lookups. Always call `.order_by()` when the ordering matters.
- Use `get_or_create` for idempotent object creation (see `CreateMemoryView`).
- Add new URL patterns to `api/urls.py` using `path(...)` with descriptive resource names.
- Always handle the case where a session does not yet exist: `if not self.request.session.exists(...): self.request.session.create()`.

**DO NOT:**
- Do not add new Python package managers or lockfile workflows (Poetry/Pipenv/etc.) without explicit approval.
- Do not use Django function-based views. All views must be class-based.
- Do not use `django.shortcuts.render` for API responses (it is only used in `frontend/views.py` to serve the SPA shell).
- Do not use raw SQL queries. Use the Django ORM exclusively.
- Do not expose the Django admin credentials or internal model data without proper serializer filtering.
- Do not use `serializer.save()` unless the serializer's `create`/`update` method is explicitly defined for that serializer.
- Do not hardcode the `owner` field; use the `OwnerOrDefault(owner)` utility and the `DEFAULT_OWNER` constant from `utils.py`.

### React / Next.js (Frontend)

**DO:**
- Use **functional components** with React hooks (`useState`, `useEffect`, etc.) for all new components.
- Export components as default or named exports, e.g. `export default function MyComponent() { ... }` or `export function MyComponent() { ... }`.
- Use `axios` for all HTTP requests to backend `/api/` endpoints.
- Use **Tailwind CSS** for all styling. Apply utility classes directly to JSX elements (e.g., `<div className="flex items-center gap-4">`).
- Use Next.js App Router conventions for pages and layouts. Place pages in `src/app/` following the file-based routing structure.
- Use custom hooks in `src/lib/` for shared logic between components.

**DO NOT:**
- Do not use class-based components. This project uses modern functional components with hooks exclusively.
- Do not use MUI, styled-components, or other CSS-in-JS libraries. Use Tailwind CSS only.
- Do not use `fetch` for HTTP calls. Use `axios` exclusively.
- Do not add new npm packages without explicit approval. Check `frontend/package.json` before installing new dependencies.
- Do not use the old `react-router-dom` library. Next.js App Router handles routing natively.

### Pinyin / Chinese Text Processing

- **Always** use `isChinese(char)` from `api/utils.py` to detect Chinese characters — do not write ad-hoc Unicode range checks.
- **Always** use `parsePinyin(pinyin)` from `api/utils.py` (backend) or the `parsePinyin` method in `HelperCard.js` (frontend) to convert ASCII pinyin (e.g., `san1`) to toned Unicode pinyin (e.g., `sān`). Do not duplicate this logic.
- When performing dictionary lookups at annotation time, use the `Trie` class from `api/Trie.py` — do not do linear scans over `Entry.objects.all()`.
- Pinyin in storage (database and serialized form) follows the CEDict ASCII format (e.g., `zhong1 guo2`). Convert to display form only at render time.

---

## 5. Testing & Documentation

### Instruction Maintenance Requirement

`copilot-instructions.md` is a living source of truth for coding agents in this repository.

Whenever any PR or commit changes project-level conventions or implementation direction, this file **must** be reviewed and updated in the same change set.

Required update triggers include:
- Architecture changes (new app/module boundaries, moved responsibilities, routing structure changes)
- Stack/technology changes (framework/library upgrades, replacements, additions, removals)
- Code style or convention changes (naming, formatting, component patterns, serializer/view patterns)
- Build/deploy/runtime changes (webpack/build pipeline, env handling, deployment platform behavior)
- Testing strategy changes (new frameworks, required coverage expectations, test command changes)

Contributor checklist for such changes:
1. Update the relevant section(s) in this file to match the new reality.
2. Remove or rewrite outdated guidance; do not leave contradictory rules.
3. In the PR description, include a short note confirming instruction updates were reviewed.

If a change intentionally diverges from existing guidance temporarily, add a concise `TODO` in this file describing:
- what is changing,
- why the temporary divergence exists, and
- when/how it will be reconciled.

### Backend Tests

- Tests live in `api/tests.py` and `frontend/tests.py`.
- Use Django's `TestCase` base class: `from django.test import TestCase`.
- Use DRF's `APITestCase` for endpoint tests that require the test client: `from rest_framework.test import APITestCase`.
- **Each view** should have a corresponding test class that covers:
  - Happy path (valid input → expected HTTP 200/201 response)
  - Invalid input (missing required fields → HTTP 400)
  - Not-found cases (HTTP 404)
- Run tests with: `uv run python manage.py test`

### Frontend Tests

- No automated test framework is currently configured for the frontend. If you add tests, use **Jest** (which is compatible with the existing Babel config) placed alongside the component file (`ComponentName.test.js`).
- Do not configure or run Playwright or Cypress tests unless the project explicitly adopts them.

### Code Documentation

- **Python:** Use Google-style docstrings for all public functions and class methods. Include `Args:`, `Returns:`, and `Raises:` sections when applicable.
  ```python
  def parse_pinyin(pinyin: str) -> str:
      """Convert ASCII pinyin to toned Unicode.

      Args:
          pinyin: ASCII pinyin string, e.g. 'san1'.

      Returns:
          Toned Unicode pinyin string, e.g. 'sān'.
      """
  ```
- **TypeScript:** Use proper type annotations and JSDoc comments when needed for complex types.
  ```typescript
  /**
   * Parses pinyin from ASCII to UTF-8.
   */
  function parsePinyin(pinyin: string): string {
    // implementation
  }
  ```
- **Inline comments:** Add inline comments only when the logic is non-obvious (e.g., Unicode range handling, priority ordering). Do not add comments that merely restate what the code does.
- **TODO comments:** Use `# TODO:` or `// TODO:` for known missing features or edge cases, followed by a concise description. Do not leave empty TODOs.
