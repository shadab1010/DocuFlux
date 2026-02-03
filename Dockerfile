# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=app.py

# Install system dependencies including LibreOffice and Java (required for some LO ops)
RUN apt-get update && apt-get install -y \
    libreoffice \
    default-jre \
    ghostscript \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt /app/

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container at /app
COPY . /app/

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose Render's expected port
EXPOSE 10000

# Run gunicorn when the container launches
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:10000"]
