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

```bash
cd ./frontend

# runs the frontend with dev configurations
npm run dev
```
