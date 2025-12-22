"""
Vercel Serverless Function Entry Point
Mestres do Cafe - Enterprise API
"""

import sys
import os

# Add the api source directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'apps', 'api', 'src'))

# Import the Flask app
from app import create_app

# Create the app for Vercel
app = create_app('production')

# Vercel handler
def handler(request):
    """Handle incoming requests for Vercel"""
    return app(request.environ, request.start_response)
