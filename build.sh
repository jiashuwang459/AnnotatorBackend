#!/usr/bin/env bash
# Exit on error
set -o errexit

# Ensure uv is available, or install it with an available Python executable.
if command -v uv >/dev/null 2>&1; then
	:
elif command -v python3 >/dev/null 2>&1; then
	python3 -m pip install --upgrade pip uv
elif command -v python >/dev/null 2>&1; then
	python -m pip install --upgrade pip uv
else
	echo "Error: neither uv nor python/python3 is available in build environment." >&2
	exit 1
fi

# Use local uv-managed virtual environment when available.
if [ -f ./.venv/bin/activate ]; then
	. ./setenv
	uv pip install -r requirements.txt
else
	uv pip install --system -r requirements.txt
fi

# Convert static asset files
uv run python manage.py collectstatic --no-input

# Apply any outstanding database migrations
uv run python manage.py migrate