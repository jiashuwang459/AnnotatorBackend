# Copilot Instructions for AnnotatorBackend

## 1. Project Overview

**What this app does:**
This is a Chinese reading-comprehension tool that helps Mandarin speakers (who already understand spoken Chinese) learn to *read* characters. Users paste or select Chinese text; the app annotates each character with its Pinyin pronunciation (rendered above the character using tone-marked Unicode). Users can toggle Pinyin on/off per character or per word and mark individual characters/pinyin as "known", letting them track reading progress over time.

**Core tech stack:**

| Layer | Technology |
|---|---|
| Backend language | Python 3.9 |
| Backend framework | Django 4.0.3 |
| REST API | Django REST Framework 3.13.1 |
| Database | PostgreSQL (via `dj_database_url`, hosted on Heroku) |
| Static files | WhiteNoise |
| Frontend language | JavaScript (ES2020, **no TypeScript**) |
| Frontend framework | React 17 (class components) |
| Bundler | Webpack 5 + Babel |
| HTTP client | Axios |
| UI components | MUI v5, React-Bootstrap 2, styled-components |
| Icons | react-icons |
| Routing | react-router-dom v5 (BrowserRouter) |
| Deployment | Heroku (`Procfile`, `runtime.txt`) |

---

## 2. Code Style & Conventions

### Python (Backend)

- **Naming:**
  - Functions and variables: `snake_case` (e.g., `load_default_dictionary`, `is_chinese`)
  - Classes: `PascalCase` (e.g., `EntryView`, `MemorySerializer`)
  - Constants: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_OWNER`, `MAX_PRIORITY`, `INVALID_PRIORITY`)
  - Django model field names: use `camelCase` to match the existing convention in this project (e.g., `createdAt`, `updatedAt`, `cchar`) — **do not switch to `snake_case` for model fields**
- **Type hints:** Not currently used in this codebase. Do not add type hints unless the user explicitly asks.
- **Comments:** Use inline `#` comments to explain non-obvious logic (e.g., Unicode ranges, priority semantics). Keep comments concise.
- **Imports:** Group in order: standard library, third-party (Django/DRF), local app imports. Separate groups with a blank line.
- **Error handling:** Return DRF `Response` objects with appropriate HTTP status codes. Never raise bare `Exception`; use DRF serializer validation or explicit `Response(status=...)`.
- **Early returns:** Use early returns in views to guard against invalid input before performing expensive operations.

### JavaScript / React (Frontend)

- **Naming:**
  - Variables and functions: `camelCase` (e.g., `handleAnnotateButtonClick`, `fetchCode`)
  - React component classes: `PascalCase` (e.g., `Annotation`, `DisplayArea`)
  - Constants: `UPPER_SNAKE_CASE` (e.g., `NBSP`)
  - State keys: `camelCase` (e.g., `memSaveLoading`, `fetchOverlayShow`)
- **Component style:** Use **React class components** (not functional components with hooks) to match the existing codebase. The only exception is small inline utilities like `UpdatingTooltip` (a `React.forwardRef` wrapper).
- **Event handlers:** Name handlers with the `handle` prefix (e.g., `handleTextChange`, `handleSaveMemoryButtonClick`). Bind them in the constructor.
- **API calls:** Always use **Axios**, never the native `fetch` API. Use `.then()` / `.finally()` chains; do not introduce `async/await` unless refactoring a full component.
- **Styled components:** Use `styled-components` for layout containers. Use MUI components for form elements (inputs, form controls, grids). Use React-Bootstrap for buttons, spinners, overlays, tooltips, and popovers.
- **No TypeScript:** This project is plain JavaScript. Do not add `.ts`/`.tsx` files or TypeScript configuration.

---

## 3. Architecture & Directory Patterns

```
AnnotatorBackend/                  # Repository root
├── requirements.txt               # Python dependencies
├── Procfile                       # Heroku process definition
├── runtime.txt                    # Python version for Heroku
├── copilot-instructions.md        # This file
└── Annotator/                     # Django project root (run manage.py from here)
    ├── manage.py
    ├── Annotator/                 # Django project settings package
    │   ├── settings.py            # All Django config; uses django_heroku + dotenv
    │   ├── urls.py                # Root URL conf — routes /api/* to api, / to frontend
    │   ├── wsgi.py
    │   └── asgi.py
    ├── api/                       # Backend REST API Django app
    │   ├── models.py              # ORM models: Entry, BlacklistEntry, Fragment, Memory
    │   ├── views.py               # DRF APIView/generics views for all endpoints
    │   ├── serializers.py         # DRF serializers (one per model/operation)
    │   ├── urls.py                # API URL patterns (no trailing slashes — APPEND_SLASH=False)
    │   ├── utils.py               # Pure utility functions: parsePinyin, isChinese, data loaders
    │   ├── Trie.py                # Trie data structure for longest-match Chinese annotation
    │   ├── migrations/            # Auto-generated Django migrations
    │   └── tests.py               # Django TestCase tests for the API
    ├── frontend/                  # Frontend Django app (serves the React SPA)
    │   ├── views.py               # Single view: renders index.html (the React entry point)
    │   ├── urls.py                # Routes /, /manual, /dictionary to index
    │   ├── src/
    │   │   ├── index.js           # Webpack entry — imports and mounts App
    │   │   └── components/        # All React components go here
    │   │       ├── App.js         # Root component: sets up MUI ThemeProvider
    │   │       ├── Home.js        # Router and top-level layout
    │   │       ├── ManualPage.js  # Manual text input + annotation page
    │   │       ├── DictionaryPage.js  # Dictionary lookup page
    │   │       ├── DisplayArea.js # Renders annotated Chinese text (characters + pinyin)
    │   │       ├── Annotation.js  # Text input form + annotate button
    │   │       ├── Memory.js      # Save/load reading-progress memory codes
    │   │       ├── HelperCard.js  # Tooltip/popover helper card for a character
    │   │       └── UpdatingTooltip.js  # forwardRef tooltip that re-schedules on content change
    │   ├── static/frontend/       # Webpack build output — DO NOT edit manually
    │   ├── templates/frontend/    # Django template: index.html (loads the JS bundle)
    │   └── webpack.config.js      # Webpack 5 config
    └── data/                      # Chinese dictionary data files
        ├── cedict_ts.u8           # Raw CC-CEDICT source (do not modify)
        ├── data2.json             # Parsed dictionary (generated by reloadCEDict())
        ├── custom.json            # Custom hand-crafted entries
        ├── blacklist.json         # Entries to suppress from annotation output
        ├── priority.json          # Priority overrides for specific entries
        └── vowels.json            # Pinyin tone-mark lookup table (ASCII → Unicode)
```

### Module interaction rules

- **Backend → Frontend boundary:** The Django backend serves the React SPA via `frontend/views.py`. All data exchange happens through the `/api/*` REST endpoints using Axios.
- **New API endpoints:** Add to `api/views.py` (create a new view class), register in `api/urls.py`. Create a serializer in `api/serializers.py` for any new request/response shape.
- **New React pages:** Add a new component file in `frontend/src/components/`. Register the route in `Home.js` (the react-router-dom `<Switch>`). Add the URL to `frontend/urls.py` so Django serves the SPA for that path.
- **New data utilities:** Add to `api/utils.py` if the function is pure (no Django ORM). Add to `api/views.py` or a new view method if it requires database access.
- **Data files:** Load/parse data through the helper functions in `api/utils.py` (e.g., `loadDefaultDictionary`, `parsePinyin`). Never import data files directly in views.

---

## 4. Tech-Specific Rules

### Django / Django REST Framework

**Do:**
- Extend `generics.ListAPIView` or `generics.ListCreateAPIView` for standard list/create endpoints.
- Extend `APIView` directly when you need custom `get`/`post`/`delete` logic that doesn't map to a single queryset.
- Use DRF `Serializer.is_valid(raise_exception=True)` to validate incoming data.
- Use `@transaction.atomic` when a view or utility function performs multiple related writes that must succeed or fail together.
- Use `Q` objects from `django.db.models` for complex queryset filtering (OR conditions, etc.).
- Use the `OwnerOrDefault(owner)` utility to scope queries to the correct owner (combines `default`, `custom`, and user-specific entries).
- Keep the priority system intact: `MAIN_PRIORITY < CUSTOM_PRIORITY < USER_PRIORITY < DEFAULT_PRIORITY < SURNAME_PRIORITY < VARIANT_PRIORITY < MAX_PRIORITY`. Entries at or above `MAX_PRIORITY` are considered blacklisted and suppressed.
- Return `Response(serializer.data, status=status.HTTP_200_OK)` (or appropriate status) from every view.
- Note that `APPEND_SLASH = False` in settings — **do not add trailing slashes to URL patterns in `api/urls.py`**.

**Don't:**
- Don't use Django function-based views for new API endpoints — use class-based views.
- Don't bypass the serializer layer to write raw data directly to models from views.
- Don't add new `print()` debug statements to production code; remove debug prints before committing.
- Don't use `Entry.objects.all()` without filtering in views that are user-facing — always scope to `OwnerOrDefault` or a specific owner.
- Don't store the CEDict source (`cedict_ts.u8`) in the database; it is parsed into `data2.json` via `reloadCEDict()` and loaded into the DB via `loadDefaultDictionary()`.

### React / Frontend

**Do:**
- Write new components as **class components** with `constructor(props)`, state initialization in the constructor, and event handlers bound in the constructor.
- Use `axios.get(url)` / `axios.post(url, data)` for all HTTP requests. `axios.defaults.xsrfCookieName` and `axios.defaults.xsrfHeaderName` are already configured globally in `App.js` — don't configure them again in individual components.
- Use the MUI `<Grid>` component for layout within pages/forms.
- Use `styled-components` for page-level containers and layout wrappers.
- Use React-Bootstrap `<Button>`, `<Spinner>`, `<OverlayTrigger>`, `<Tooltip>`, `<Popover>`, and `<Overlay>` for interactive UI elements.
- Disable buttons and show a `<Spinner>` while async operations are in progress (set a `loading` flag in state).
- Use the CSRF-safe Axios instance — never disable CSRF for POST/DELETE requests.
- Use `react-router-dom` v5 patterns: `<BrowserRouter>`, `<Switch>`, `<Route exact path="...">`.
- Use `react-icons` (e.g., `MdSave`, `TiFolderOpen`, `BsArrowBarRight`) for icon buttons.

**Don't:**
- Don't use functional components with hooks for new feature components (except small `React.forwardRef` wrappers).
- Don't use `fetch()` — always use Axios.
- Don't use `useEffect`, `useState`, or other hooks inside class components.
- Don't import MUI components and React-Bootstrap components for the same purpose — follow existing patterns per component.
- Don't import CSS files or global stylesheets directly in component files; styling is done via styled-components and UI library class props.
- Don't edit files in `frontend/static/frontend/` — this is the Webpack build output and is regenerated on every build.

### Pinyin / Chinese text processing

- Pinyin in the database and API is stored in ASCII tone-number format (e.g., `"san1"` for `sān`). Use `parsePinyin(pinyin)` from `api/utils.py` to convert to Unicode for display.
- Chinese character detection uses the multi-range Unicode regex in `isChinese(char)` in `api/utils.py`. Do not use a simplified single-range regex.
- The annotation algorithm uses a **Trie** (`api/Trie.py`) to find the longest matching dictionary entry for each position in the input text. Do not replace the Trie with linear search.
- The `Fragment` model represents a single (pinyin, Chinese character) pair. `Memory` is a collection of `Fragment` objects identified by a numeric code.

---

## 5. Testing & Documentation

### Testing

- Backend tests live in `Annotator/api/tests.py`. Write Django `TestCase` subclasses.
- Frontend tests live in `Annotator/frontend/tests.py`.
- Test class names: `PascalCase` ending in `Test` (e.g., `EntryViewTest`, `AnnotationViewTest`).
- Test method names: `snake_case` starting with `test_` (e.g., `test_get_entry_returns_empty_when_no_phrase`).
- Prefer testing views through the Django test client (`self.client.get(...)` / `self.client.post(...)`).
- For utility functions like `parsePinyin` or `isChinese`, write unit tests that call the function directly.
- Before writing a test, run the existing test suite to confirm a clean baseline:
  ```bash
  cd Annotator
  python manage.py test
  ```

### Running the app locally

```bash
# Activate the virtual environment (from repo root)
. ./setenv

# Install Python dependencies
pip install -r requirements.txt

# Run migrations
cd Annotator
python manage.py migrate

# Start the Django backend
python manage.py runserver

# In a separate terminal — build or watch the frontend bundle
cd Annotator/frontend
npm install
npm run dev   # development watch mode
# npm run build  # production build
```

### Documentation / Comments

- Document complex algorithms with a concise block comment above the function explaining *what* it does and *why* the approach was chosen (see the Unicode range comments in `isChinese` and the priority system comments in `utils.py` as examples).
- For Django views, add a docstring to `get_queryset` methods that describes accepted query parameters and return behaviour (follow the example in `EntryView.get_queryset`).
- Keep comments in English.
- Do not add JSDoc or Python docstrings to simple getter/setter methods or one-liner helpers.
- Remove `TODO:` comments when the referenced work is complete.
- Do not leave `print()` debug statements or `console.log()` calls in committed code unless they are clearly labelled for permanent observability (none currently qualify).
