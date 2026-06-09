FROM python:3.12-slim

WORKDIR /app

# Added libopenblas-dev and liblapack-dev for FAISS vector operations
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    libopenblas-dev \
    liblapack-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Start the FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
