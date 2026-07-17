FROM python:3.12-slim

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir -r apps/api/requirements.txt

WORKDIR /app/apps/api

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]