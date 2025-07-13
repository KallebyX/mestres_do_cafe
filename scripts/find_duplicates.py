#!/usr/bin/env python3
"""
Script para encontrar arquivos duplicados, código similar e funções repetidas
com barra de progresso otimizada.
"""
import os
import re
import csv
import json
import argparse
import hashlib
import time
from pathlib import Path
from collections import defaultdict
import difflib
import logging

# Tentativa de import de tqdm
try:
    from tqdm import tqdm
    TQDM_AVAILABLE = True
except ImportError:
    TQDM_AVAILABLE = False

# Regex para detecção de funções
PY_FUNC_REGEX = re.compile(r'^\s*(async\s+def|def)\s+([A-Za-z_]\w*)\s*\(')
JS_FUNC_REGEX = re.compile(
    r'(?:function\s+([A-Za-z_]\w*)\s*\(|'
    r'const\s+([A-Za-z_]\w*)\s*=\s*(?:async\s+)?\(?[\w\s,]*\)?\s*=>)'
)

# Cores para output
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

def progress_bar(iterable, desc="Processando", total=None):
    """Wrapper para barra de progresso"""
    if TQDM_AVAILABLE:
        return tqdm(iterable, desc=desc, total=total, 
                   bar_format='{l_bar}{bar}| {n_fmt}/{total_fmt} '
                             '[{elapsed}<{remaining}, {rate_fmt}]')
    else:
        # Fallback simples
        if total is None:
            total = len(list(iterable)) if hasattr(iterable, '__len__') else 0
        
        def simple_progress(items):
            count = 0
            for item in items:
                count += 1
                if count % 10 == 0 or count == total:
                    percent = (count / total * 100) if total > 0 else 0
                    print(f"\r{desc}: {count}/{total} ({percent:.1f}%)", 
                          end="", flush=True)
                yield item
            print()  # Nova linha no final
        
        return simple_progress(iterable)

def parse_args():
    parser = argparse.ArgumentParser(
        description='Analisa duplicações e similaridades de código.'
    )
    parser.add_argument(
        '-r', '--root', type=Path, default=Path.cwd(),
        help='Diretório raiz do projeto'
    )
    parser.add_argument(
        '-e', '--extensions', nargs='+',
        default=['.js', '.jsx', '.ts', '.tsx', '.py', '.vue', '.css'],
        help='Extensões de arquivo a analisar'
    )
    parser.add_argument(
        '-i', '--ignore-dirs', nargs='+',
        default=['node_modules', 'venv', 'dist', 'build', '.git', 
                 '__pycache__', '.pytest_cache', '.vscode', '.idea'],
        help='Diretórios a ignorar'
    )
    parser.add_argument(
        '-t', '--threshold', type=float, default=0.85,
        help='Threshold para similaridade (0-1)'
    )
    parser.add_argument(
        '--skip-similar', action='store_true',
        help='Pular análise de similaridade (mais rápido)'
    )
    parser.add_argument(
        '--max-files', type=int, default=1000,
        help='Máximo de arquivos para análise de similaridade'
    )
    return parser.parse_args()

def setup_logging():
    logging.basicConfig(
        format='%(message)s', level=logging.INFO
    )

def should_ignore(path: Path, ignore_dirs) -> bool:
    """Verifica se o caminho deve ser ignorado"""
    path_str = str(path)
    for d in ignore_dirs:
        if f"/{d}/" in path_str or path_str.endswith(f"/{d}"):
            return True
    
    # Ignorar arquivos muito grandes (>1MB)
    try:
        if path.stat().st_size > 1024 * 1024:
            return True
    except:
        pass
    
    return False

def get_hash(path: Path) -> str:
    """Calcula hash MD5 do arquivo"""
    hasher = hashlib.md5()
    try:
        with open(path, 'rb') as f:
            for chunk in iter(lambda: f.read(8192), b''):
                hasher.update(chunk)
        return hasher.hexdigest()
    except Exception:
        return None

def find_files(root, exts, ignore_dirs):
    """Encontra todos os arquivos válidos"""
    print(f"{Colors.BLUE}📁 Escaneando arquivos...{Colors.END}")
    
    all_files = []
    for dirpath, dirs, files in os.walk(root):
        # Remover diretórios ignorados
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        
        for file in files:
            fp = Path(dirpath) / file
            if fp.suffix in exts and not should_ignore(fp, ignore_dirs):
                all_files.append(fp)
    
    print(f"{Colors.GREEN}✅ Encontrados {len(all_files)} arquivos{Colors.END}")
    return all_files

def find_exact_duplicates(file_list):
    """Encontra arquivos com conteúdo idêntico"""
    print(f"\n{Colors.GREEN}🔍 Procurando duplicações exatas...{Colors.END}")
    
    hashes = defaultdict(list)
    
    for fp in progress_bar(file_list, "Calculando hashes"):
        file_hash = get_hash(fp)
        if file_hash:
            hashes[file_hash].append(fp)
    
    duplicates = {h: lst for h, lst in hashes.items() if len(lst) > 1}
    
    duplicate_count = sum(len(files) - 1 for files in duplicates.values())
    print(f"{Colors.YELLOW}📊 {len(duplicates)} grupos, "
          f"{duplicate_count} arquivos duplicados{Colors.END}")
    
    return duplicates

def find_similar_optimized(file_list, threshold, max_files):
    """Versão otimizada para encontrar arquivos similares"""
    print(f"\n{Colors.YELLOW}🔍 Procurando similares > "
          f"{threshold*100:.0f}%...{Colors.END}")
    
    # Limitar número de arquivos para evitar travamento
    if len(file_list) > max_files:
        print(f"{Colors.RED}⚠️  Limitando análise a {max_files} arquivos "
              f"(use --max-files para alterar){Colors.END}")
        file_list = file_list[:max_files]
    
    # Ler conteúdo dos arquivos
    contents = {}
    for fp in progress_bar(file_list, "Lendo arquivos"):
        try:
            content = fp.read_text(encoding='utf-8', errors='ignore')
            if len(content) > 50:  # Ignorar arquivos muito pequenos
                contents[str(fp.relative_to(Path.cwd()))] = content
        except Exception:
            continue
    
    # Comparar arquivos (otimizado)
    keys = list(contents.keys())
    similar = []
    compared = set()
    
    total_comparisons = len(keys) * (len(keys) - 1) // 2
    current_comparison = 0
    
    for i, f1 in enumerate(keys):
        if f1 in compared:
            continue
            
        group = [f1]
        compared.add(f1)
        
        for j in range(i + 1, len(keys)):
            f2 = keys[j]
            if f2 in compared:
                continue
            
            current_comparison += 1
            if current_comparison % 100 == 0:
                percent = (current_comparison / total_comparisons * 100)
                print(f"\rComparando: {current_comparison}/{total_comparisons} "
                      f"({percent:.1f}%)", end="", flush=True)
            
            # Comparação rápida inicial
            if abs(len(contents[f1]) - len(contents[f2])) > 0.3 * max(len(contents[f1]), len(contents[f2])):
                continue
            
            try:
                ratio = difflib.SequenceMatcher(
                    None, contents[f1], contents[f2]).ratio()
                if ratio >= threshold:
                    group.append(f2)
                    compared.add(f2)
            except Exception:
                continue
        
        if len(group) > 1:
            similar.append(group)
    
    print(f"\n{Colors.YELLOW}📊 {len(similar)} grupos similares{Colors.END}")
    return similar

def find_functions(file_list):
    """Encontra funções duplicadas"""
    print(f"\n{Colors.RED}🔍 Procurando funções duplicadas...{Colors.END}")
    
    sigs = defaultdict(list)
    
    for fp in progress_bar(file_list, "Escaneando funções"):
        try:
            text = fp.read_text(encoding='utf-8', errors='ignore').splitlines()
            for lineno, line in enumerate(text, 1):
                # Python functions
                m_py = PY_FUNC_REGEX.match(line)
                if m_py:
                    name = m_py.group(2)
                    if not name.startswith('_'):  # Ignorar funções privadas
                        sigs[name].append((str(fp), lineno))
                    continue
                
                # JavaScript functions
                m_js = JS_FUNC_REGEX.search(line)
                if m_js:
                    name = m_js.group(1) or m_js.group(2)
                    if name and not name.startswith('_'):
                        sigs[name].append((str(fp), lineno))
        except Exception:
            continue
    
    # Filtrar funções comuns
    common_names = {'main', 'init', 'setup', 'test', 'render', 'create'}
    dup = {n: loc for n, loc in sigs.items() 
           if len(loc) > 1 and n not in common_names}
    
    print(f"{Colors.RED}📊 {len(dup)} funções repetidas{Colors.END}")
    return dup

def generate_report(exact, similar, funcs, output_file):
    """Gera relatório completo"""
    report = {
        'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
        'summary': {
            'exact_duplicates': sum(len(v) - 1 for v in exact.values()),
            'similar_groups': len(similar),
            'duplicate_functions': len(funcs)
        },
        'exact_groups': {h: [str(p) for p in grp] for h, grp in exact.items()},
        'similar_groups': {f'group_{i+1}': grp for i, grp in enumerate(similar)},
        'functions_groups': funcs
    }
    
    # Salvar JSON
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    return report

def print_summary(report):
    """Imprime resumo colorido"""
    print(f"\n{Colors.BOLD}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}📋 RESUMO DA ANÁLISE{Colors.END}")
    print(f"{Colors.BOLD}{'='*60}{Colors.END}")
    
    summary = report['summary']
    
    print(f"\n{Colors.GREEN}🔴 Duplicações exatas: "
          f"{summary['exact_duplicates']}{Colors.END}")
    print(f"{Colors.YELLOW}🟡 Grupos similares: "
          f"{summary['similar_groups']}{Colors.END}")
    print(f"{Colors.RED}🟠 Funções duplicadas: "
          f"{summary['duplicate_functions']}{Colors.END}")
    
    total_issues = (summary['exact_duplicates'] + 
                   summary['similar_groups'] + 
                   summary['duplicate_functions'])
    
    print(f"\n{Colors.BOLD}✨ Total de oportunidades de limpeza: "
          f"{total_issues}{Colors.END}")

def main():
    args = parse_args()
    setup_logging()
    
    start_time = time.time()
    
    print(f"{Colors.BOLD}🧹 ANÁLISE DE DUPLICAÇÕES - MESTRES DO CAFÉ{Colors.END}")
    print(f"{Colors.BOLD}{'='*60}{Colors.END}")
    
    # Encontrar arquivos
    files = find_files(args.root, args.extensions, args.ignore_dirs)
    
    if not files:
        print(f"{Colors.RED}❌ Nenhum arquivo encontrado{Colors.END}")
        return
    
    # Análise de duplicações exatas
    exact = find_exact_duplicates(files)
    
    # Análise de similaridade (opcional)
    similar = []
    if not args.skip_similar:
        similar = find_similar_optimized(files, args.threshold, args.max_files)
    else:
        print(f"{Colors.YELLOW}⏭️  Análise de similaridade pulada{Colors.END}")
    
    # Análise de funções
    funcs = find_functions(files)
    
    # Gerar relatório
    output_file = args.root / 'duplication_report.json'
    report = generate_report(exact, similar, funcs, output_file)
    
    # Mostrar resumo
    print_summary(report)
    
    elapsed = time.time() - start_time
    print(f"\n{Colors.GREEN}💾 Relatório salvo em: {output_file}{Colors.END}")
    print(f"{Colors.BLUE}⏱️  Tempo total: {elapsed:.2f}s{Colors.END}")

if __name__ == '__main__':
    main()
