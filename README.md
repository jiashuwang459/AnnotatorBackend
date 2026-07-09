# AnnotatorBackend

## Backend (Django)

Use `uv` to manage the Python environment and dependencies for this project.
NOTE: Deploy/runtime currently targets Python 3.8.10 (see `runtime.txt`).

### macOS (Homebrew)

Install `uv` with Homebrew:

```bash
brew update
brew install uv
```

If needed, verify versions:

```bash
uv --version
```

### Ubuntu (alternative)

Install system Python and `uv`:

```bash
sudo apt-get update
sudo apt install python3.8 python3-pip
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Then restart your shell (or source your shell profile) so `uv` is on your `PATH`.

### Creating the uv-managed environment

When you're in the base directory, `AnnotatorBackend`

```bash
uv venv --python 3.8.10
. ./setenv
```

#### Contents of ./setenv

```bash
source ./.venv/bin/activate
```

IMPORTANT! Make sure to execute `. ./setenv` in the base folder to activate the environment before any development or execution.

### Python dependencies

```bash
uv pip install -r requirements.txt
```

### First-time local setup

For a first-time local checkout on macOS, the fastest path is:

```bash
brew install uv
brew install sqlite
bash local_setup.sh
```

What `local_setup.sh` does:

1. creates a local Python 3.8.10 virtual environment with `uv` if needed
2. installs backend dependencies from `requirements.txt`
3. creates the local `static/` directory
4. collects static assets with Django `collectstatic`
5. applies Django migrations to `db.sqlite3`
6. installs frontend dependencies in `frontend/`

After that, start the backend and frontend in separate terminals:

```bash
uv run python manage.py runserver
```

```bash
cd frontend
npm run dev
```

If you prefer not to activate the environment first, you can run commands through `uv` directly:

```bash
uv run python manage.py migrate
uv run python manage.py runserver
```

### Startup guide

```bash
mkdir -p static
uv run python manage.py migrate
```

### Working with db.sqlite3 on macOS

This project defaults to SQLite in local development:

```bash
DATABASE_URL=sqlite:///db.sqlite3
```

You can inspect the database directly from the repository root with the macOS `sqlite3` CLI:

```bash
sqlite3 db.sqlite3
```

Useful commands inside the SQLite prompt:

```sql
.tables
.schema api_entry
SELECT COUNT(*) FROM api_entry;
SELECT * FROM api_entry LIMIT 10;
.quit
```

You can also run one-off queries without entering the interactive prompt:

```bash
sqlite3 db.sqlite3 ".tables"
sqlite3 db.sqlite3 ".schema api_entry"
sqlite3 db.sqlite3 "SELECT COUNT(*) FROM api_entry;"
```

If you prefer to open the configured Django database through Django itself:

```bash
uv run python manage.py dbshell
```

If `sqlite3` is not installed on your Mac:

```bash
brew install sqlite
```

### Common Commands

```bash
# from repository root (AnnotatorBackend)

# make migrations based on Model objects in <app>/models.py
uv run python manage.py makemigrations

# runs all migrations based on migrations in <app>/migrations/<migration>.py
uv run python manage.py migrate

# runs the backend server
uv run python manage.py runserver
```

## Frontend (React)

The frontend's base directory is: `/AnnotatorBackend/frontend`.

### Installing npm

see https://github.com/nvm-sh/nvm

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
nvm install node
```

### NPM dependencies

```bash
cd ./frontend
npm install
```

### To run performance analysis

1. set env variable PERFORMANCE=1.
2. run the server without threads.

```bash
uv pip install django-debug-toolbar pympler
```

```bash
PERFORMANCE=1
uv run python manage.py runserver --nothreading
```

###

You can list environment variables in the `.env` file of the root directory, which will automatically be added when the program runs. My local `.env` file is as follows:

.env

```bash
DATABASE_URL=sqlite:///db.sqlite3
NODE_ENV=development
DEBUG=1
# PERFORMANCE=1
DJANGO_LOG_LEVEL="INFO"

```

### Common Commands

```bash
# Add dependencies to requirements.txt file:
uv pip freeze > requirements.txt
```

```bash
# Run the backend deployment. Note - make sure to run build.sh first, and to set debug to false.
uv run python -m gunicorn Annotator.asgi:application -k uvicorn.workers.UvicornWorker
```

### build.sh

The repository includes `build.sh` for deployment-style setup. It:

1. ensures `uv` is available
2. installs Python dependencies
3. collects static assets
4. applies Django migrations

Run it from the repository root:

```bash
./build.sh
```

If the file is not executable in your environment, use:

```bash
bash build.sh
```

For local development, you can still run the individual commands manually if you do not want the full build flow.

```bash
cd ./frontend

# runs the frontend with dev configurations
npm run dev
```
