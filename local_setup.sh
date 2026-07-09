#!/usr/bin/env bash
set -o errexit

# First-time local setup for backend and frontend-next development.
# Run from the repository root with: bash local_setup.sh

if ! command -v uv >/dev/null 2>&1; then
	echo "Error: uv is not installed. Install it first, for example with: brew install uv" >&2
	exit 1
fi

if [ ! -d ./.venv ]; then
	uv venv --python 3.8.10
fi

. ./setenv
uv pip install -r requirements.txt

mkdir -p static
uv run python manage.py collectstatic --no-input
uv run python manage.py migrate

if command -v npm >/dev/null 2>&1; then
	if [ -d frontend-next ]; then
		(
			cd frontend-next
			npm install
		)
	fi
else
	echo "Warning: npm is not installed. Skipping frontend dependency installation." >&2
	echo "Install Node.js/npm, then run: cd frontend-next && npm install" >&2
fi