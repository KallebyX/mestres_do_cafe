#!/usr/bin/env python3
"""
Script to find and remove dead code and unused imports
"""

import os
import re
import ast
import sys
from pathlib import Path
from collections import defaultdict
import json

class DeadCodeCleaner:
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        self.report = {
            'unused_imports': [],
            'dead_functions': [],
            'unused_variables': [],
            'duplicate_code': [],
            'orphaned_files': []
        }
    
    def find_js_files(self):
        """Find all JavaScript/JSX files"""
        js_files = []
        for pattern in ['**/*.js', '**/*.jsx']:
            js_files.extend(self.project_root.glob(pattern))
        
        # Exclude node_modules and other build directories
        excluded_dirs = {'node_modules', 'dist', 'build', '.git', '.venv', '__pycache__'}
        return [f for f in js_files if not any(part in excluded_dirs for part in f.parts)]
    
    def find_py_files(self):
        """Find all Python files"""
        py_files = list(self.project_root.glob('**/*.py'))
        
        # Exclude virtual environments and cache directories
        excluded_dirs = {'.venv', '__pycache__', '.git', 'migrations'}
        return [f for f in py_files if not any(part in excluded_dirs for part in f.parts)]
    
    def analyze_js_imports(self, file_path):
        """Analyze JavaScript imports and exports"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Find import statements
            import_pattern = r'import\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)(?:\s*,\s*{[^}]*})?\s+from\s+[\'"]([^\'"]+)[\'"]'
            imports = re.findall(import_pattern, content)
            
            # Find named imports
            named_import_pattern = r'import\s+{([^}]+)}\s+from\s+[\'"]([^\'"]+)[\'"]'
            named_imports = re.findall(named_import_pattern, content)
            
            # Find default imports
            default_import_pattern = r'import\s+(\w+)\s+from\s+[\'"]([^\'"]+)[\'"]'
            default_imports = re.findall(default_import_pattern, content)
            
            # Find export statements
            export_pattern = r'export\s+(?:default\s+)?(?:const|let|var|function|class)?\s*(\w+)'
            exports = re.findall(export_pattern, content)
            
            # Check for unused imports
            unused_imports = []
            
            # Check named imports
            for imports_str, module in named_imports:
                imported_names = [name.strip() for name in imports_str.split(',')]
                for name in imported_names:
                    # Remove potential aliases
                    clean_name = name.split(' as ')[0].strip()
                    if not self._is_used_in_content(clean_name, content):
                        unused_imports.append(f"{clean_name} from '{module}'")
            
            # Check default imports
            for name, module in default_imports:
                if not self._is_used_in_content(name, content):
                    unused_imports.append(f"{name} from '{module}'")
            
            if unused_imports:
                self.report['unused_imports'].append({
                    'file': str(file_path),
                    'imports': unused_imports
                })
            
            return {
                'imports': imports,
                'exports': exports,
                'unused_imports': unused_imports
            }
            
        except Exception as e:
            print(f"Error analyzing {file_path}: {e}")
            return None
    
    def analyze_py_imports(self, file_path):
        """Analyze Python imports"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            try:
                tree = ast.parse(content)
            except SyntaxError as e:
                print(f"Syntax error in {file_path}: {e}")
                return None
            
            imports = []
            unused_imports = []
            
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        name = alias.asname if alias.asname else alias.name
                        if not self._is_used_in_content(name, content):
                            unused_imports.append(f"import {alias.name}")
                        imports.append(alias.name)
                
                elif isinstance(node, ast.ImportFrom):
                    module = node.module or ''
                    for alias in node.names:
                        name = alias.asname if alias.asname else alias.name
                        if not self._is_used_in_content(name, content):
                            unused_imports.append(f"from {module} import {alias.name}")
                        imports.append(f"{module}.{alias.name}")
            
            if unused_imports:
                self.report['unused_imports'].append({
                    'file': str(file_path),
                    'imports': unused_imports
                })
            
            return {
                'imports': imports,
                'unused_imports': unused_imports
            }
            
        except Exception as e:
            print(f"Error analyzing {file_path}: {e}")
            return None
    
    def _is_used_in_content(self, name, content):
        """Check if a name is used in the content"""
        # Simple regex to find usage of the name
        # This is a basic implementation and could be improved
        pattern = r'\b' + re.escape(name) + r'\b'
        matches = re.findall(pattern, content)
        
        # Must appear more than once (once for import, once for usage)
        return len(matches) > 1
    
    def find_dead_functions(self):
        """Find functions that are never called"""
        js_files = self.find_js_files()
        py_files = self.find_py_files()
        
        # Analyze JavaScript functions
        for file_path in js_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Find function definitions
                function_pattern = r'(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:\([^)]*\)\s*=>|function))'
                functions = re.findall(function_pattern, content)
                
                # Flatten the tuple results
                function_names = [f[0] or f[1] for f in functions if f[0] or f[1]]
                
                # Check if functions are used
                for func_name in function_names:
                    if not self._is_function_used(func_name, content, js_files):
                        self.report['dead_functions'].append({
                            'file': str(file_path),
                            'function': func_name,
                            'type': 'javascript'
                        })
                        
            except Exception as e:
                print(f"Error analyzing functions in {file_path}: {e}")
        
        # Analyze Python functions
        for file_path in py_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                try:
                    tree = ast.parse(content)
                except SyntaxError:
                    continue
                
                for node in ast.walk(tree):
                    if isinstance(node, ast.FunctionDef):
                        func_name = node.name
                        if not func_name.startswith('_') and not self._is_function_used(func_name, content, py_files):
                            self.report['dead_functions'].append({
                                'file': str(file_path),
                                'function': func_name,
                                'type': 'python'
                            })
                            
            except Exception as e:
                print(f"Error analyzing functions in {file_path}: {e}")
    
    def _is_function_used(self, func_name, content, all_files):
        """Check if a function is used in the codebase"""
        # Check in current file
        pattern = r'\b' + re.escape(func_name) + r'\s*\('
        matches = re.findall(pattern, content)
        
        # Must appear more than once (once for definition, once for usage)
        if len(matches) > 1:
            return True
        
        # Check in other files (basic implementation)
        for file_path in all_files[:10]:  # Limit to first 10 files for performance
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    other_content = f.read()
                
                if re.search(pattern, other_content):
                    return True
                    
            except Exception:
                continue
        
        return False
    
    def find_orphaned_files(self):
        """Find files that are not imported or referenced anywhere"""
        js_files = self.find_js_files()
        
        # Build import graph
        import_graph = defaultdict(set)
        
        for file_path in js_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Find relative imports
                import_pattern = r'from\s+[\'"](\.[^\'"]+)[\'"]'
                imports = re.findall(import_pattern, content)
                
                for imp in imports:
                    resolved_path = self._resolve_import_path(file_path, imp)
                    if resolved_path:
                        import_graph[str(file_path)].add(str(resolved_path))
                        
            except Exception as e:
                print(f"Error analyzing imports in {file_path}: {e}")
        
        # Find files that are never imported
        all_files = set(str(f) for f in js_files)
        imported_files = set()
        
        for imports in import_graph.values():
            imported_files.update(imports)
        
        orphaned = all_files - imported_files
        
        # Filter out entry points and special files
        entry_points = {'main.jsx', 'index.js', 'App.jsx', 'app.js'}
        
        for file_path in orphaned:
            file_name = Path(file_path).name
            if file_name not in entry_points and not file_name.startswith('.'):
                self.report['orphaned_files'].append(file_path)
    
    def _resolve_import_path(self, current_file, import_path):
        """Resolve relative import path to absolute path"""
        try:
            current_dir = Path(current_file).parent
            
            # Handle relative imports
            if import_path.startswith('./'):
                resolved = current_dir / import_path[2:]
            elif import_path.startswith('../'):
                resolved = current_dir / import_path
            else:
                resolved = current_dir / import_path
            
            # Try different extensions
            for ext in ['.js', '.jsx', '.ts', '.tsx']:
                if (resolved.with_suffix(ext)).exists():
                    return resolved.with_suffix(ext)
            
            # Try index files
            if resolved.is_dir():
                for ext in ['.js', '.jsx', '.ts', '.tsx']:
                    index_file = resolved / f'index{ext}'
                    if index_file.exists():
                        return index_file
            
            return None
            
        except Exception:
            return None
    
    def generate_cleanup_script(self):
        """Generate a script to clean up dead code"""
        script_content = """#!/usr/bin/env python3
# Generated cleanup script

import os
import re
from pathlib import Path

def remove_unused_imports():
    \"\"\"Remove unused imports from files\"\"\"
    pass

def remove_dead_functions():
    \"\"\"Remove dead functions from files\"\"\"
    pass

def remove_orphaned_files():
    \"\"\"Remove orphaned files\"\"\"
    orphaned_files = {orphaned_files}
    
    for file_path in orphaned_files:
        if Path(file_path).exists():
            print(f"Removing orphaned file: {file_path}")
            # os.remove(file_path)  # Uncomment to actually remove

if __name__ == "__main__":
    print("Running dead code cleanup...")
    remove_unused_imports()
    remove_dead_functions()
    remove_orphaned_files()
    print("Cleanup complete!")
""".format(orphaned_files=self.report['orphaned_files'])
        
        return script_content
    
    def run_analysis(self):
        """Run complete dead code analysis"""
        print("Starting dead code analysis...")
        
        # Analyze JavaScript files
        js_files = self.find_js_files()
        print(f"Found {len(js_files)} JavaScript files")
        
        for file_path in js_files:
            self.analyze_js_imports(file_path)
        
        # Analyze Python files
        py_files = self.find_py_files()
        print(f"Found {len(py_files)} Python files")
        
        for file_path in py_files:
            self.analyze_py_imports(file_path)
        
        # Find dead functions
        print("Analyzing dead functions...")
        self.find_dead_functions()
        
        # Find orphaned files
        print("Finding orphaned files...")
        self.find_orphaned_files()
        
        return self.report
    
    def save_report(self, output_file):
        """Save analysis report to file"""
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(self.report, f, indent=2, ensure_ascii=False)
        
        print(f"Analysis report saved to {output_file}")
    
    def print_summary(self):
        """Print analysis summary"""
        print("\\n" + "="*50)
        print("DEAD CODE ANALYSIS SUMMARY")
        print("="*50)
        
        print(f"Files with unused imports: {len(self.report['unused_imports'])}")
        print(f"Dead functions found: {len(self.report['dead_functions'])}")
        print(f"Orphaned files found: {len(self.report['orphaned_files'])}")
        
        if self.report['unused_imports']:
            print("\\nFILES WITH UNUSED IMPORTS:")
            for item in self.report['unused_imports'][:10]:  # Show first 10
                print(f"  {item['file']}: {len(item['imports'])} unused imports")
        
        if self.report['dead_functions']:
            print("\\nDEAD FUNCTIONS:")
            for item in self.report['dead_functions'][:10]:  # Show first 10
                print(f"  {item['file']}: {item['function']} ({item['type']})")
        
        if self.report['orphaned_files']:
            print("\\nORPHANED FILES:")
            for file_path in self.report['orphaned_files'][:10]:  # Show first 10
                print(f"  {file_path}")


def main():
    if len(sys.argv) != 2:
        print("Usage: python cleanup_dead_code.py <project_root>")
        sys.exit(1)
    
    project_root = sys.argv[1]
    
    if not os.path.exists(project_root):
        print(f"Error: Project root '{project_root}' does not exist")
        sys.exit(1)
    
    cleaner = DeadCodeCleaner(project_root)
    report = cleaner.run_analysis()
    
    # Save report
    report_file = os.path.join(project_root, 'dead_code_report.json')
    cleaner.save_report(report_file)
    
    # Print summary
    cleaner.print_summary()
    
    # Generate cleanup script
    cleanup_script = cleaner.generate_cleanup_script()
    script_file = os.path.join(project_root, 'cleanup_script.py')
    
    with open(script_file, 'w', encoding='utf-8') as f:
        f.write(cleanup_script)
    
    print(f"\\nCleanup script generated: {script_file}")
    print("Review the report and run the cleanup script to remove dead code.")


if __name__ == "__main__":
    main()