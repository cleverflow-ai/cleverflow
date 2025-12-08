# Base image with CUDA, choose your CUDA version accordingly
FROM nvidia/cuda:13.0.2-runtime-ubuntu22.04

# In case CUDA is not needed, you can use a lighter base image
# FROM python:3.12-slim

# Install Python, pip, uv, and system dependencies for OpenCV and Tesseract OCR
RUN apt-get update && apt-get install -y \
    python3 python3-pip python3-venv curl build-essential \
    libgl1 \
    libglib2.0-0 \
    tesseract-ocr tesseract-ocr-deu tesseract-ocr-eng tesseract-ocr-fra \
    tesseract-ocr-spa tesseract-ocr-ita tesseract-ocr-por tesseract-ocr-nld \
    && pip3 install uv \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy pyproject.toml first to cache dependencies
COPY pyproject.toml ./

# Create virtual environment and install dependencies with uv
RUN uv venv && \
    . .venv/bin/activate && \
    uv pip install --upgrade pip && \
    uv pip install .

# Copy source code
COPY . .

# Run baml-cli generate at build time (optional)
RUN uv run baml-cli generate

# Run server using uvicorn via uv
CMD ["uv", "run", "uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8031"]
