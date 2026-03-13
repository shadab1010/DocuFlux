# Use Python slim image
FROM python:3.10-slim

# Environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=app.py
# Set HOME so LibreOffice can write its profile in Docker
ENV HOME=/root
# Headless mode for LibreOffice (no real display needed)
ENV DISPLAY=:99

# ─── Step 1: System packages for document conversion ───────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    # ── LibreOffice core (headless only, no full desktop) ──
    libreoffice \
    libreoffice-writer \
    libreoffice-calc \
    libreoffice-impress \
    libreoffice-java-common \
    # ── Java runtime (needed by LibreOffice for some filters) ──
    default-jre-headless \
    # ── Pandoc (used as fallback converter in libreoffice_converter.py) ──
    pandoc \
    # ── PDF utilities ──
    ghostscript \
    poppler-utils \
    # ── OCR support ──
    tesseract-ocr \
    tesseract-ocr-eng \
    # ── Font packages (critical for accurate PDF/Word rendering) ──
    # Liberation fonts: open-source metrically-compatible with Arial, Times New Roman, Courier New
    fonts-liberation \
    fonts-liberation2 \
    # DejaVu – good Unicode coverage
    fonts-dejavu-core \
    fonts-dejavu-extra \
    # FreeFont – extra coverage
    fonts-freefont-ttf \
    # Crosextra fonts (Carlito ≈ Calibri, Caladea ≈ Cambria) – critical for .docx accuracy
    fonts-crosextra-carlito \
    fonts-crosextra-caladea \
    # Noto fonts – cover most Unicode scripts (emoji, CJK, Arabic, etc.)
    fonts-noto-core \
    fonts-noto-mono \
    # WenQuanYi for CJK characters
    fonts-wqy-zenhei \
    # ── Font tooling ──
    fontconfig \
    # ── General utilities ──
    curl \
    wget \
    ca-certificates \
    # ── Xvfb: virtual display for LibreOffice headless (prevents display errors) ──
    xvfb \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# ─── Step 2: Rebuild font cache so LibreOffice picks everything up ─────────────
RUN fc-cache -f -v

# ─── Step 3: Configure LibreOffice for headless use ───────────────────────────
# Create a persistent profile directory that LibreOffice can use as a base
RUN mkdir -p /root/.config/libreoffice

# ─── Step 4: Set working directory and install Python packages ─────────────────
WORKDIR /app

# Copy requirements first (leverages Docker layer caching)
COPY requirements.txt /app/

# Install Python packages
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# ─── Step 5: Install Playwright browser ────────────────────────────────────────
RUN playwright install chromium --with-deps

# ─── Step 6: Copy application code ─────────────────────────────────────────────
COPY . /app/

# ─── Step 7: Create necessary directories ──────────────────────────────────────
RUN mkdir -p /app/uploads \
 && mkdir -p /tmp/lo_profiles

# Expose port for Render
EXPOSE 10000

# Run the application
CMD ["bash", "-c", "Xvfb :99 -screen 0 1024x768x24 -nolisten tcp & sleep 1 && gunicorn app:app --bind 0.0.0.0:10000 --timeout 120 --workers 2"]