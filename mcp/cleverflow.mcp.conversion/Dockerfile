# Base image with CUDA, choose your CUDA version accordingly
FROM nvidia/cuda:12.9.1-runtime-ubuntu22.04

# In case CUDA is not needed, you can use a lighter base image
# FROM python:3.11-slim

# Install Python, pip, and uv
RUN apt-get update && apt-get install -y \
    python3 python3-pip python3-venv curl build-essential && \
    pip install uv && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

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

# Default: run main.py using uv
CMD ["uv", "run", "server.py"]
