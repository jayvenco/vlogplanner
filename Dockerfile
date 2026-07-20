# Stage 1: build the frontend static assets
FROM node:20-alpine AS frontend-build

WORKDIR /frontend

COPY frontend/package.json ./
RUN npm install

COPY frontend/ .
RUN npm run build

# Stage 2: backend + serves the built frontend
FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .
COPY --from=frontend-build /frontend/dist ./static

RUN mkdir -p /app/data /app/uploads/thumbnails /app/uploads/inspirations /app/backups

ENV DATA_DIR=/app/data
ENV UPLOADS_DIR=/app/uploads
ENV BACKUPS_DIR=/app/backups

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
