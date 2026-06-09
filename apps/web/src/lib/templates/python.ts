import type JSZip from "jszip";
import type { TechStackItemType } from "@blueprint/shared";
import { PYTHON_DEV_DEFAULTS } from "@blueprint/shared";
import { generateProjectReadme } from "./shared";

export async function generatePythonProject(
  zip: JSZip,
  projectName: string,
  description: string,
  features: string[],
  techStack: TechStackItemType[]
): Promise<void> {
  const isDjango = techStack.some((item) => item.name.toLowerCase() === "django");
  const isFlask = techStack.some((item) => item.name.toLowerCase() === "flask");

  const requirements = isDjango
    ? "Django>=4.2.0\ndjangorestframework>=3.14.0\npython-decouple>=3.8"
    : isFlask
      ? "Flask>=2.3.0\nFlask-RESTful>=0.3.10\npython-decouple>=3.8"
      : "fastapi>=0.104.0\nuvicorn>=0.24.0\npydantic>=2.5.0";

  zip.file("requirements.txt", requirements);

  if (isDjango) {
    zip.file("manage.py", generateDjangoManagePy(projectName));

    const configFolder = zip.folder(projectName.replace(/-/g, "_"));
    if (configFolder) {
      configFolder.file("__init__.py", "");
      configFolder.file("settings.py", generateDjangoSettings(projectName));
      configFolder.file("urls.py", generateDjangoURLs());
      configFolder.file("wsgi.py", generateDjangoWSGI(projectName));
    }

    const appFolder = zip.folder("app");
    if (appFolder) {
      appFolder.file("__init__.py", "");
      appFolder.file("models.py", generateDjangoModels(features));
      appFolder.file("views.py", generateDjangoViews(features));
      appFolder.file("urls.py", generateDjangoAppURLs());
    }
  } else if (isFlask) {
    const srcFolder = zip.folder("src");
    if (srcFolder) {
      srcFolder.file("app.py", generateFlaskApp(projectName, features));
      srcFolder.file("models.py", generateFlaskModels(features));
    }
  } else {
    const srcFolder = zip.folder("src");
    if (srcFolder) {
      srcFolder.file("main.py", generateFastAPIIndex(projectName, features));
      srcFolder.file("models.py", generateFastAPIModels(features));
    }
  }

  zip.file("README.md", generateProjectReadme(projectName, description, features, "Python"));
}

export function generateDjangoManagePy(projectName: string): string {
  return `#!/usr/bin/env python
import os
import sys

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', '${projectName.replace(/-/g, "_")}.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
`;
}

export function generateDjangoSettings(projectName: string): string {
  return `from pathlib import Path
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY', default='your-secret-key-here')

DEBUG = config('DEBUG', default=False, cast=bool)

ALLOWED_HOSTS = []

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'app',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = '${projectName.replace(/-/g, "_")}.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
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

WSGI_APPLICATION = '${projectName.replace(/-/g, "_")}.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

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

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
}
`;
}

export function generateDjangoURLs(): string {
  return `from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('app.urls')),
]`;
}

export function generateDjangoWSGI(projectName: string): string {
  return `import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', '${projectName.replace(/-/g, "_")}.settings')

application = get_wsgi_application()
`;
}

export function generateDjangoModels(_features: string[]): string {
  void _features;
  return `from django.db import models

class Project(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Feature(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='features')
    name = models.CharField(max_length=200)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
`;
}

export function generateDjangoViews(_features: string[]): string {
  void _features;
  return `from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Project, Feature

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

class FeatureViewSet(viewsets.ModelViewSet):
    queryset = Feature.objects.all()
    serializer_class = FeatureSerializer

@api_view(['GET'])
def health_check(request):
    return Response({'status': 'ok'})
`;
}

export function generateDjangoAppURLs(): string {
  return `from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'projects', views.ProjectViewSet)
router.register(r'features', views.FeatureViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('health/', views.health_check),
]
`;
}

export function generateFlaskApp(projectName: string, features: string[]): string {
  return `from flask import Flask, jsonify
from flask_restful import Api, Resource
from decouple import config

app = Flask(__name__)
api = Api(app)

class HealthCheck(Resource):
    def get(self):
        return {'status': 'ok'}

class ProjectInfo(Resource):
    def get(self):
        return {
            'name': '${projectName}',
            'features': ${JSON.stringify(features)}
        }

api.add_resource(HealthCheck, '/health')
api.add_resource(ProjectInfo, '/')

if __name__ == '__main__':
    app.run(debug=config('DEBUG', default=False, cast=bool))
`;
}

export function generateFlaskModels(_features: string[]): string {
  void _features;
  return `from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    features = db.relationship('Feature', backref='project', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Feature(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'completed': self.completed,
            'project_id': self.project_id,
            'created_at': self.created_at.isoformat()
        }
`;
}

export function generateFastAPIIndex(projectName: string, features: string[]): string {
  return `from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI(title="${projectName}", description="${projectName} API")

class Project(BaseModel):
    name: str
    description: str
    features: List[str]

@app.get("/")
async def root():
    return {
        "message": "Welcome to ${projectName} API",
        "features": ${JSON.stringify(features)}
    }

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/project", response_model=Project)
async def get_project():
    return Project(
        name="${projectName}",
        description="${projectName} API",
        features=${JSON.stringify(features)}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="${PYTHON_DEV_DEFAULTS.DEV_HOST}", port=${PYTHON_DEV_DEFAULTS.DEV_PORT})
`;
}

export function generateFastAPIModels(_features: string[]): string {
  void _features;
  return `from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class FeatureBase(BaseModel):
    name: str
    completed: bool = False

class FeatureCreate(FeatureBase):
    pass

class Feature(FeatureBase):
    id: int
    project_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    name: str
    description: str

class ProjectCreate(ProjectBase):
    features: List[FeatureCreate] = []

class Project(ProjectBase):
    id: int
    features: List[Feature] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
`;
}
