#!/usr/bin/env python3
"""
Detector de Queries N+1 - Mestres do Café
Analisa o código em busca de padrões que podem causar queries N+1
"""

import os
import re
import sys
from pathlib import Path
from typing import List, Dict, Tuple

# Adicionar o diretório src ao path
current_dir = Path(__file__).parent
api_src_dir = current_dir.parent / 'apps' / 'api' / 'src'
sys.path.insert(0, str(api_src_dir))

# Padrões suspeitos de N+1
N1_PATTERNS = [
    # Loop acessando relação
    (r'for\s+\w+\s+in\s+.*:\s*\n.*?\.\w+\.(all|first|filter|get)\(', 'Loop com query de relação'),
    
    # Acesso a relação dentro de loop
    (r'for\s+\w+\s+in\s+.*:.*?\n.*?\.\w+\.', 'Acesso a atributo de relação em loop'),
    
    # Serialização sem eager loading
    (r'class\s+\w+Schema.*?:\s*\n.*?model\s*=\s*\w+.*?\n(?!.*?load_only)', 'Schema sem otimização de campos'),
    
    # Query sem joins
    (r'\.query\.filter\(.*?\)\.all\(\)', 'Query sem joins explícitos'),
    
    # Acesso a relação em template/serialização
    (r'[\'"]\w+\.\w+[\'"]', 'Possível acesso a relação em serialização'),
]

# Padrões de boas práticas
GOOD_PATTERNS = [
    (r'\.options\(.*?joinedload\(', 'Usando joinedload'),
    (r'\.options\(.*?selectinload\(', 'Usando selectinload'),
    (r'\.join\(', 'Usando join explícito'),
    (r'with_entities\(', 'Selecionando campos específicos'),
]

class N1QueryDetector:
    def __init__(self, root_path: Path):
        self.root_path = root_path
        self.issues: List[Dict] = []
        self.good_practices: List[Dict] = []
        
    def scan_file(self, file_path: Path) -> Tuple[int, int]:
        """Escaneia um arquivo em busca de padrões N+1"""
        issues_count = 0
        good_count = 0
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
                
            # Procurar padrões problemáticos
            for pattern, description in N1_PATTERNS:
                for match in re.finditer(pattern, content, re.MULTILINE | re.DOTALL):
                    line_num = content[:match.start()].count('\n') + 1
                    self.issues.append({
                        'file': str(file_path.relative_to(self.root_path)),
                        'line': line_num,
                        'issue': description,
                        'code': lines[line_num-1].strip() if line_num <= len(lines) else '',
                        'severity': 'high' if 'loop' in description.lower() else 'medium'
                    })
                    issues_count += 1
                    
            # Procurar boas práticas
            for pattern, description in GOOD_PATTERNS:
                for match in re.finditer(pattern, content):
                    line_num = content[:match.start()].count('\n') + 1
                    self.good_practices.append({
                        'file': str(file_path.relative_to(self.root_path)),
                        'line': line_num,
                        'practice': description,
                        'code': lines[line_num-1].strip() if line_num <= len(lines) else ''
                    })
                    good_count += 1
                    
        except Exception as e:
            print(f"❌ Erro ao analisar {file_path}: {e}")
            
        return issues_count, good_count
    
    def scan_directory(self, directory: Path):
        """Escaneia um diretório recursivamente"""
        py_files = list(directory.glob('**/*.py'))
        
        print(f"🔍 Analisando {len(py_files)} arquivos Python...")
        print("=" * 60)
        
        total_issues = 0
        total_good = 0
        
        for py_file in py_files:
            # Pular arquivos de teste e migrações
            if any(skip in str(py_file) for skip in ['test_', 'migrations/', '__pycache__']):
                continue
                
            issues, good = self.scan_file(py_file)
            total_issues += issues
            total_good += good
            
        return total_issues, total_good
    
    def generate_report(self):
        """Gera relatório detalhado"""
        print("\n📊 RELATÓRIO DE QUERIES N+1")
        print("=" * 60)
        
        if not self.issues:
            print("✅ Nenhum padrão suspeito de N+1 encontrado!")
        else:
            print(f"\n❌ {len(self.issues)} possíveis problemas encontrados:\n")
            
            # Agrupar por severidade
            high_severity = [i for i in self.issues if i['severity'] == 'high']
            medium_severity = [i for i in self.issues if i['severity'] == 'medium']
            
            if high_severity:
                print("🚨 ALTA SEVERIDADE:")
                for issue in high_severity[:10]:  # Mostrar apenas top 10
                    print(f"  📍 {issue['file']}:{issue['line']}")
                    print(f"     Problema: {issue['issue']}")
                    print(f"     Código: {issue['code'][:80]}...")
                    print()
                    
            if medium_severity:
                print("\n⚠️  MÉDIA SEVERIDADE:")
                for issue in medium_severity[:5]:  # Mostrar apenas top 5
                    print(f"  📍 {issue['file']}:{issue['line']}")
                    print(f"     Problema: {issue['issue']}")
                    print()
        
        if self.good_practices:
            print(f"\n✅ {len(self.good_practices)} boas práticas encontradas:\n")
            # Contar por tipo
            practice_counts = {}
            for gp in self.good_practices:
                practice_counts[gp['practice']] = practice_counts.get(gp['practice'], 0) + 1
                
            for practice, count in practice_counts.items():
                print(f"  ✓ {practice}: {count} ocorrências")
        
        # Sugestões de otimização
        print("\n💡 SUGESTÕES DE OTIMIZAÇÃO:")
        print("=" * 60)
        print("""
1. Para relacionamentos 1-N em loops:
   # ❌ Evitar:
   for order in Order.query.all():
       print(order.items)  # N queries!
   
   # ✅ Usar:
   orders = Order.query.options(selectinload(Order.items)).all()
   for order in orders:
       print(order.items)  # Sem queries extras!

2. Para serialização com relações:
   # ❌ Evitar:
   return jsonify([{"user": p.user.name} for p in posts])
   
   # ✅ Usar:
   posts = Post.query.options(joinedload(Post.user)).all()
   return jsonify([{"user": p.user.name} for p in posts])

3. Para queries complexas:
   # ✅ Usar query builder:
   result = db.session.query(
       Product.id,
       Product.name,
       func.count(Review.id).label('review_count')
   ).outerjoin(Review).group_by(Product.id).all()

4. Implementar DataLoaders para GraphQL-like patterns
5. Usar select_related/prefetch_related patterns
6. Implementar cache de queries frequentes
""")
        
        # Salvar relatório
        report_path = self.root_path / 'docs' / 'n1_queries_report.md'
        report_path.parent.mkdir(exist_ok=True)
        
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write("# Relatório de Queries N+1\n\n")
            f.write(f"Total de issues: {len(self.issues)}\n")
            f.write(f"Total de boas práticas: {len(self.good_practices)}\n\n")
            
            f.write("## Issues Encontrados\n\n")
            for issue in self.issues:
                f.write(f"- **{issue['file']}:{issue['line']}** - {issue['issue']}\n")
                f.write(f"  ```python\n  {issue['code']}\n  ```\n\n")
                
        print(f"\n📄 Relatório salvo em: {report_path}")


def main():
    """Função principal"""
    # Definir diretório para análise
    api_dir = current_dir.parent / 'apps' / 'api'
    
    if not api_dir.exists():
        print(f"❌ Diretório não encontrado: {api_dir}")
        return
        
    detector = N1QueryDetector(current_dir.parent)
    total_issues, total_good = detector.scan_directory(api_dir)
    detector.generate_report()
    
    # Retornar código de saída baseado em issues
    if total_issues > 10:
        print("\n⚠️  Muitos problemas encontrados! Considere refatoração urgente.")
        sys.exit(1)
    elif total_issues > 0:
        print("\n⚠️  Alguns problemas encontrados. Revise o relatório.")
        sys.exit(0)
    else:
        print("\n✅ Código otimizado! Sem problemas de N+1 detectados.")
        sys.exit(0)


if __name__ == "__main__":
    main()