"""
Django settings for Annotator project.

Generated by 'django-admin startproject' using Django 3.2.5.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.2/ref/settings/
"""

import logging
from pathlib import Path
from pprint import pprint
# import django_heroku
from dotenv import load_dotenv
import dj_database_url
import os

# from Annotator import dj_redis_url
PROJECT = 'annotator'

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv()

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'y87-@d^e3gw=1*yf2-gjf#q2a5r-&d00d(ih6xb*mh%-v%lyp7'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

# SECRET_KEY = '' # Change to empty string

if DEBUG:
    ALLOWED_HOSTS = ['127.0.0.1:8000', 'localhost']
else:
    ALLOWED_HOSTS = ['https://chinese-annotator.herokuapp.com',
                     'https://chinese-annotator.netlify.app',
                     'https://annotatorbackend.onrender.com',
                     'localhost']


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'api.apps.ApiConfig',
    'frontend.apps.FrontendConfig',
    'corsheaders',
    'rest_framework',
    'Annotator'
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

ROOT_URLCONF = 'Annotator.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'build')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'Annotator.wsgi.application'


# Database
# https://docs.djangoproject.com/en/3.2/ref/settings/#databases

# CACHE_TTL = 60 * 15

# REDIS_TLS_URL = "redis://127.0.0.1:6379/1",
# CACHES = {'default': django_cache_url.parse(REDIS_URL)}

# CACHES = {
#     "default": dj_redis_url.config()
# }

# import urllib.parse as urlparse
    
# redis_url = urlparse.urlparse(os.environ.get('REDISCLOUD_URL'))

# pprint(redis_url)

# pprint(redis_url.hostname)
# pprint(redis_url.port)
# pprint(redis_url.password)

# CACHES = {
#     "default": dj_redis_url.config(),
#     'extra': {
#         'BACKEND': 'redis_cache.RedisCache',
#         'LOCATION': '%s:%d' % (redis_url.hostname, redis_url.port),
#         'OPTIONS': {
#             'PASSWORD': redis_url.password,
#             'DB': 0,
#         },
#         'TIMEOUT': None
#     }
# }

# pprint(CACHES)

DATABASES = {}
# DATABASES['default'] = dj_database_url.config(conn_max_age=600)

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql_psycopg2',
#         'NAME': 'ChineseAnnotator',
#         'USER': 'jiashu',
#         'PASSWORD': '123456',
#         'HOST': 'localhost',
#         'PORT': '5432',
#     }
# }

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql_psycopg2',
#         'NAME': 'd254lrpu994doe',
#         'USER': 'hmvnpbpjzerayq',
#         'PASSWORD': '84187d732654298c65f9382cf003bb26dc9b77303cb77c1f6a1688648ef71a22',
#         'HOST': 'ec2-52-21-136-176.compute-1.amazonaws.com',
#         'PORT': '5432',
#     }
# }

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': BASE_DIR / 'db.sqlite3',
#     }
# }

DATABASES = {
    'default': dj_database_url.config(
        # Replace this value with your local database's connection string.
        default='postgresql://postgres:postgres@localhost:5432/mysite',
        conn_max_age=600
    )
}


# Password validation
# https://docs.djangoproject.com/en/3.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/3.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

# This setting informs Django of the URI path from which your static files will be served to users
# Here, they well be accessible at your-domain.onrender.com/static/... or yourcustomdomain.com/static/...
STATIC_URL = '/static/'

# This production code might break development mode, so we check whether we're in DEBUG mode
if not DEBUG:
    # Tell Django to copy static assets into a path called `staticfiles` (this is specific to Render)
    STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
    # Enable the WhiteNoise storage backend, which compresses static files to reduce disk use
    # and renames the files with unique names for each version to support long-term caching
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
X_FRAME_OPTIONS = 'SAMEORIGIN'

# Default primary key field type
# https://docs.djangoproject.com/en/3.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

APPEND_SLASH = False

# Option 1
CORS_ORIGIN_WHITELIST = [
    'https://localhost:8000',
    'https://127.0.0.1:8000',
]

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': os.getenv('DJANGO_LOG_LEVEL', 'DEBUG'),
        },
    },
}

# django_heroku.settings(locals())

# Add these at the very last line of settings.py
options = DATABASES['default'].get('OPTIONS', {})
options.pop('sslmode', None)
