"""
Vercel Serverless Function Entry Point
Mestres do Cafe - Enterprise API
"""

import sys
import os

# Add the api source directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'apps', 'api', 'src'))

# Import the Flask app
from app import create_app, seed_initial_data

# Create the app for Vercel
# Vercel's Python runtime will automatically detect this WSGI app
app = create_app('production')

# Seed initial data (creates super admin and basic data)
seed_initial_data(app)
