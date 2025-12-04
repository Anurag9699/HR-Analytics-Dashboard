#!/usr/bin/env bash
# Build script for Render deployment

set -o errexit  # Exit on error

# Install Python dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --no-input

# Run database migrations
python manage.py migrate

# Seed database with sample data (only if empty)
python manage.py seed_data --employees 25 --days 90 || echo "Seed data may already exist"
