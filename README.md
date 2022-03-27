# AnnotatorBackend

## Backend (Django)

I recommend creating a python venv to work on this project.
NOTE: I'm currently using python 3.9.1


### From a fresh Ubuntu installation on Windows

Using python 3.8.10

```bash
sudo apt-get update
sudo apt install python3.8-venv
```

### Creating a python venv
When you're in the base directory, `AnnotatorBackend`

```bash
python3 -m venv chinese-env
. ./setenv
```

#### Contents of ./setenv
``` bash
source ./chinese-env/bin/activate
```

IMPORTANT! Make sure to execute `. ./setenv` in the base folder to activate the venv before any development or execution

### Python dependencies

``` bash
pip install django
pip install djangorestframework
```

### Common Commands

``` bash
cd ./Annotator

# make migrations based on Model objects in <app>/models.py
python manage.py makemigrations

# runs all migrations based on migrations in <app>/migrations/<migration>.py
python manage.py migrate

# runs the backend server
python manage.py runserver
```

## Frontend (React)

The frontend's base directory is: `/AnnotatorBackend/Annotator/frontend`.

### NPM dependencies

``` bash
cd ./Annotator/frontend
npm install
```

### Common Commands

``` bash
cd ./Annotator/frontend

# runs the frontend with dev configurations
npm run dev
```