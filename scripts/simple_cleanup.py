#!/usr/bin/env python3
"""
Simple cleanup script to remove some obvious dead code
"""

import os
import re
from pathlib import Path

def remove_unused_imports():
    """Remove specific unused imports that we identified"""
    
    # Files and their unused imports to remove
    cleanup_targets = [
        {
            'file': 'apps/web/src/services/wishlist-api.js',
            'remove_imports': ['apiRequest from \'./api\'']
        },
        {
            'file': 'apps/web/src/services/admin-customers-api.js',
            'remove_imports': ['supabase from \'../lib/api.js\'']
        },
        {
            'file': 'apps/web/src/services/shipping-api.js',
            'remove_imports': ['apiRequest from \'./api\'']
        },
        {
            'file': 'apps/web/src/contexts/NotificationContext.jsx',
            'remove_imports': ['Bell', 'Clock', 'TrendingDown', 'TrendingUp']
        },
        {
            'file': 'apps/web/src/components/Header.jsx',
            'remove_imports': ['Settings']
        }
    ]
    
    project_root = Path('/Users/kalleby/Downloads/mestres_cafe_enterprise')
    
    for target in cleanup_targets:
        file_path = project_root / target['file']
        
        if not file_path.exists():
            print(f"File not found: {file_path}")
            continue
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Remove unused imports
            for import_to_remove in target['remove_imports']:
                if 'from' in import_to_remove:
                    # Handle full import line
                    pattern = r'import\s+' + re.escape(import_to_remove) + r'\s*;?\s*\n?'
                    content = re.sub(pattern, '', content)
                else:
                    # Handle named import within destructuring
                    # Pattern to match and remove from destructuring imports
                    pattern = r'(\{[^}]*?)' + re.escape(import_to_remove) + r'\s*,?\s*([^}]*\})'
                    content = re.sub(pattern, r'\1\2', content)
                    
                    # Clean up empty destructuring or extra commas
                    content = re.sub(r'\{\s*,\s*', '{', content)
                    content = re.sub(r',\s*\}', '}', content)
                    content = re.sub(r'\{\s*\}', '{}', content)
            
            # Only write if content changed
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Cleaned up imports in: {file_path}")
            else:
                print(f"No changes needed in: {file_path}")
                
        except Exception as e:
            print(f"Error cleaning up {file_path}: {e}")

def remove_some_orphaned_files():
    """Remove some obviously orphaned files"""
    
    project_root = Path('/Users/kalleby/Downloads/mestres_cafe_enterprise')
    
    # Safe files to remove (these are clearly orphaned based on the analysis)
    safe_to_remove = [
        'apps/web/src/services/supabase-admin-full.js',  # We consolidated APIs
        'apps/web/src/pages/AdminDashboard.old.jsx',     # Old backup file
        'apps/web/src/components/ui/radio-group.jsx',    # Unused UI component
        'apps/web/src/components/ui/separator.jsx',      # Unused UI component
        'apps/web/src/hooks/use-mobile.js'               # Unused hook
    ]
    
    for file_path in safe_to_remove:
        full_path = project_root / file_path
        if full_path.exists():
            try:
                os.remove(full_path)
                print(f"Removed orphaned file: {file_path}")
            except Exception as e:
                print(f"Error removing {file_path}: {e}")
        else:
            print(f"File not found: {file_path}")

def clean_up_console_logs():
    """Remove console.log statements from JavaScript files"""
    
    project_root = Path('/Users/kalleby/Downloads/mestres_cafe_enterprise')
    
    # Find JavaScript files
    js_files = list(project_root.glob('apps/web/src/**/*.js')) + list(project_root.glob('apps/web/src/**/*.jsx'))
    
    console_pattern = r'console\.log\([^)]*\);\s*\n?'
    
    for file_path in js_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Remove console.log statements
            content = re.sub(console_pattern, '', content)
            
            # Only write if content changed
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Removed console.log from: {file_path}")
                
        except Exception as e:
            print(f"Error cleaning up {file_path}: {e}")

def remove_empty_lines():
    """Remove excessive empty lines"""
    
    project_root = Path('/Users/kalleby/Downloads/mestres_cafe_enterprise')
    
    # Find JavaScript files
    js_files = list(project_root.glob('apps/web/src/**/*.js')) + list(project_root.glob('apps/web/src/**/*.jsx'))
    
    for file_path in js_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Replace multiple empty lines with single empty line
            content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
            
            # Only write if content changed
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Cleaned up empty lines in: {file_path}")
                
        except Exception as e:
            print(f"Error cleaning up {file_path}: {e}")

def main():
    print("Starting simple dead code cleanup...")
    
    print("\n1. Removing unused imports...")
    remove_unused_imports()
    
    print("\n2. Removing orphaned files...")
    remove_some_orphaned_files()
    
    print("\n3. Removing console.log statements...")
    clean_up_console_logs()
    
    print("\n4. Cleaning up empty lines...")
    remove_empty_lines()
    
    print("\nSimple cleanup complete!")
    print("Run your tests to make sure everything still works.")

if __name__ == "__main__":
    main()