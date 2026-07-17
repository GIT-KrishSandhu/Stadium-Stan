FROM python:3.12-slim

WORKDIR /app

# Copy backend
COPY apps/api/ ./apps/api/

# Copy shared packages
COPY packages/ ./packages/

# Install dependencies
RUN pip install --no-cache-dir -r apps/api/requirements.txt

# Allow imports like `import packages.*`
ENV PYTHONPATH=/app

EXPOSE 8080

WORKDIR /app/apps/api

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]