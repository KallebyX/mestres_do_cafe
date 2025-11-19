#!/usr/bin/env python3
"""
Script de Auditoria de JWT em Endpoints
Analisa todos os arquivos de rotas e identifica endpoints sem proteção JWT
"""

import os
import re
from pathlib import Path
from typing import List, Dict, Tuple
from collections import defaultdict

# Cores para output
class Colors:
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    RED = '\033[0;31m'
    BLUE = '\033[0;34m'
    CYAN = '\033[0;36m'
    NC = '\033[0m'  # No Color
    BOLD = '\033[1m'

def parse_route_file(file_path: str) -> Dict:
    """Analisa um arquivo de rotas e extrai informações sobre endpoints"""

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        lines = content.split('\n')

    endpoints = []
    decorators_stack = []

    for i, line in enumerate(lines):
        line_stripped = line.strip()

        # Detectar decorators
        if line_stripped.startswith('@'):
            decorators_stack.append(line_stripped)

        # Detectar definição de função
        elif line_stripped.startswith('def ') and decorators_stack:
            # Verificar se há route decorator
            route_decorator = None
            for decorator in decorators_stack:
                if '.route(' in decorator or '@route(' in decorator:
                    route_decorator = decorator
                    break

            if route_decorator:
                # Extrair informações do endpoint
                func_name = line_stripped.split('(')[0].replace('def ', '')

                # Extrair path do route
                path_match = re.search(r"['\"]([^'\"]+)['\"]", route_decorator)
                path = path_match.group(1) if path_match else "unknown"

                # Extrair métodos HTTP
                methods_match = re.search(r"methods\s*=\s*\[([^\]]+)\]", route_decorator)
                if methods_match:
                    methods = [m.strip().strip("'\"") for m in methods_match.group(1).split(',')]
                else:
                    methods = ['GET']  # Default

                # Verificar se tem @jwt_required ou decorators equivalentes
                has_jwt = any('@jwt_required' in d or '@require_auth' in d or '@require_admin' in d for d in decorators_stack)

                # Verificar se é debug_only
                is_debug_only = any('@debug_only' in d for d in decorators_stack)

                # Verificar se é admin_required ou custom protection
                has_custom_protection = any(
                    d for d in decorators_stack
                    if '@admin_required' in d or '@role_required' in d or '@permission_required' in d
                )

                endpoints.append({
                    'function': func_name,
                    'path': path,
                    'methods': methods,
                    'has_jwt': has_jwt,
                    'is_debug_only': is_debug_only,
                    'has_custom_protection': has_custom_protection,
                    'line': i + 1,
                    'decorators': list(decorators_stack)
                })

            # Limpar stack de decorators após encontrar função
            decorators_stack = []

        # Se linha não é decorator nem def, limpar stack
        elif not line_stripped.startswith('@') and line_stripped:
            if not line_stripped.startswith('def '):
                decorators_stack = []

    return {
        'file': file_path,
        'endpoints': endpoints
    }

def should_require_jwt(endpoint: Dict) -> bool:
    """Determina se um endpoint deveria requerer JWT"""

    # Endpoints que geralmente são públicos
    public_paths = [
        '/health',
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
        '/verify-email',
        '/webhook',
        '/public',
    ]

    # Métodos GET de leitura pública geralmente não precisam de JWT
    public_get_paths = [
        '/products',
        '/categories',
        '/blog',
        '/newsletter/verify',
    ]

    path = endpoint['path']
    methods = endpoint['methods']

    # Debug endpoints não precisam (já tem @debug_only)
    if endpoint['is_debug_only']:
        return False

    # Endpoints públicos explícitos
    if any(public in path for public in public_paths):
        return False

    # GET endpoints públicos de leitura
    if 'GET' in methods and len(methods) == 1:
        if any(public in path for public in public_get_paths):
            return False

    # Todos os outros devem ter JWT
    return True

def generate_report(results: List[Dict]) -> Dict:
    """Gera relatório de auditoria"""

    report = {
        'total_files': len(results),
        'total_endpoints': 0,
        'protected': 0,
        'unprotected': 0,
        'public_by_design': 0,
        'security_gaps': [],
        'by_file': {}
    }

    for result in results:
        file_name = os.path.basename(result['file'])
        file_report = {
            'total': len(result['endpoints']),
            'protected': 0,
            'unprotected': 0,
            'gaps': []
        }

        for endpoint in result['endpoints']:
            report['total_endpoints'] += 1

            if endpoint['has_jwt'] or endpoint['has_custom_protection']:
                report['protected'] += 1
                file_report['protected'] += 1
            else:
                # Verificar se deveria ter JWT
                if should_require_jwt(endpoint):
                    report['security_gaps'].append({
                        'file': result['file'],
                        'function': endpoint['function'],
                        'path': endpoint['path'],
                        'methods': endpoint['methods'],
                        'line': endpoint['line']
                    })
                    file_report['gaps'].append(endpoint)
                    report['unprotected'] += 1
                    file_report['unprotected'] += 1
                else:
                    report['public_by_design'] += 1

        report['by_file'][file_name] = file_report

    return report

def print_report(report: Dict):
    """Imprime relatório formatado"""

    c = Colors

    print(f"\n{c.BLUE}{'=' * 60}")
    print(f"  AUDITORIA DE JWT - MESTRES DO CAFÉ")
    print(f"{'=' * 60}{c.NC}\n")

    # Estatísticas gerais
    print(f"{c.BOLD}ESTATÍSTICAS GERAIS{c.NC}")
    print(f"  Arquivos analisados:     {report['total_files']}")
    print(f"  Total de endpoints:      {report['total_endpoints']}")
    print(f"  {c.GREEN}✓ Protegidos (JWT):      {report['protected']}{c.NC}")
    print(f"  {c.YELLOW}○ Públicos (by design):  {report['public_by_design']}{c.NC}")
    print(f"  {c.RED}✗ Sem proteção:          {report['unprotected']}{c.NC}")

    coverage = (report['protected'] / report['total_endpoints'] * 100) if report['total_endpoints'] > 0 else 0
    print(f"\n  Taxa de proteção:        {coverage:.1f}%")

    # Gaps de segurança
    if report['security_gaps']:
        print(f"\n{c.RED}{c.BOLD}GAPS DE SEGURANÇA IDENTIFICADOS ({len(report['security_gaps'])}):{c.NC}")
        print(f"{c.RED}{'─' * 60}{c.NC}\n")

        for gap in report['security_gaps']:
            file_short = gap['file'].replace('/home/user/mestres_do_cafe/', '')
            print(f"{c.RED}✗{c.NC} {c.BOLD}{gap['function']}{c.NC}")
            print(f"  Path:    {gap['path']}")
            print(f"  Methods: {', '.join(gap['methods'])}")
            print(f"  File:    {file_short}:{gap['line']}")
            print()
    else:
        print(f"\n{c.GREEN}✓ Nenhum gap de segurança identificado!{c.NC}")

    # Relatório por arquivo
    print(f"\n{c.BOLD}RELATÓRIO POR ARQUIVO{c.NC}")
    print(f"{'─' * 60}\n")

    for file_name, file_report in sorted(report['by_file'].items()):
        if file_report['gaps']:
            status = f"{c.RED}✗{c.NC}"
        elif file_report['unprotected'] > 0:
            status = f"{c.YELLOW}⚠{c.NC}"
        else:
            status = f"{c.GREEN}✓{c.NC}"

        print(f"{status} {file_name}")
        print(f"   Total: {file_report['total']} | "
              f"Protegidos: {file_report['protected']} | "
              f"Gaps: {len(file_report['gaps'])}")

    # Recomendações
    print(f"\n{c.BOLD}RECOMENDAÇÕES{c.NC}")
    print(f"{'─' * 60}\n")

    if report['security_gaps']:
        print(f"{c.YELLOW}1. Adicionar @jwt_required() aos {len(report['security_gaps'])} endpoints sem proteção{c.NC}")
        print(f"{c.YELLOW}2. Verificar se endpoints precisam de proteção adicional (admin_required){c.NC}")
        print(f"{c.YELLOW}3. Implementar rate limiting em endpoints públicos{c.NC}")
        print(f"{c.YELLOW}4. Adicionar logs de auditoria em endpoints sensíveis{c.NC}")
    else:
        print(f"{c.GREEN}✓ Todos os endpoints estão adequadamente protegidos!{c.NC}")
        print(f"{c.GREEN}✓ Continue mantendo a cobertura de JWT em novos endpoints{c.NC}")

    print()

def save_report_to_file(report: Dict, results: List[Dict], output_file: str):
    """Salva relatório detalhado em arquivo Markdown"""

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# Relatório de Auditoria de JWT\n\n")
        f.write(f"**Data da auditoria**: {os.popen('date').read().strip()}\n\n")

        # Sumário
        f.write("## Sumário Executivo\n\n")
        f.write(f"- **Arquivos analisados**: {report['total_files']}\n")
        f.write(f"- **Total de endpoints**: {report['total_endpoints']}\n")
        f.write(f"- **Protegidos com JWT**: {report['protected']} ({report['protected']/report['total_endpoints']*100:.1f}%)\n")
        f.write(f"- **Públicos (by design)**: {report['public_by_design']}\n")
        f.write(f"- **Gaps de segurança**: {report['unprotected']}\n\n")

        # Status
        if report['security_gaps']:
            f.write("⚠️ **STATUS**: Gaps de segurança identificados - ação requerida\n\n")
        else:
            f.write("✅ **STATUS**: Todos os endpoints estão adequadamente protegidos\n\n")

        # Gaps de segurança
        if report['security_gaps']:
            f.write("## Gaps de Segurança Identificados\n\n")
            f.write(f"Total de {len(report['security_gaps'])} endpoints sem proteção JWT:\n\n")

            for gap in report['security_gaps']:
                file_short = gap['file'].replace('/home/user/mestres_do_cafe/', '')
                f.write(f"### `{gap['function']}()`\n\n")
                f.write(f"- **Path**: `{gap['path']}`\n")
                f.write(f"- **Methods**: {', '.join(gap['methods'])}\n")
                f.write(f"- **Arquivo**: `{file_short}:{gap['line']}`\n")
                f.write(f"- **Ação**: Adicionar `@jwt_required()` antes do route decorator\n\n")

        # Relatório detalhado por arquivo
        f.write("## Relatório Detalhado por Arquivo\n\n")

        for result in sorted(results, key=lambda x: os.path.basename(x['file'])):
            file_name = os.path.basename(result['file'])
            file_report = report['by_file'][file_name]

            f.write(f"### {file_name}\n\n")
            f.write(f"- Total de endpoints: {file_report['total']}\n")
            f.write(f"- Protegidos: {file_report['protected']}\n")
            f.write(f"- Gaps: {len(file_report['gaps'])}\n\n")

            if file_report['gaps']:
                f.write("**Endpoints sem proteção:**\n\n")
                for gap in file_report['gaps']:
                    f.write(f"- `{gap['path']}` ({', '.join(gap['methods'])}) - linha {gap['line']}\n")
                f.write("\n")

            # Listar todos os endpoints
            f.write("<details>\n<summary>Ver todos os endpoints</summary>\n\n")
            f.write("| Função | Path | Métodos | JWT | Linha |\n")
            f.write("|--------|------|---------|-----|-------|\n")

            for endpoint in result['endpoints']:
                jwt_status = "✅" if endpoint['has_jwt'] or endpoint['has_custom_protection'] else "❌"
                methods_str = ", ".join(endpoint['methods'])
                f.write(f"| `{endpoint['function']}` | `{endpoint['path']}` | {methods_str} | {jwt_status} | {endpoint['line']} |\n")

            f.write("\n</details>\n\n")

        # Recomendações
        f.write("## Recomendações\n\n")

        if report['security_gaps']:
            f.write("### Ações Imediatas\n\n")
            f.write(f"1. **Adicionar @jwt_required()** aos {len(report['security_gaps'])} endpoints identificados\n")
            f.write("2. **Revisar permissões** - alguns endpoints podem precisar de `@admin_required()`\n")
            f.write("3. **Implementar rate limiting** em endpoints públicos\n")
            f.write("4. **Adicionar logs de auditoria** em endpoints sensíveis (admin, pagamentos, etc.)\n\n")

            f.write("### Próximos Passos\n\n")
            f.write("- [ ] Corrigir gaps de segurança identificados\n")
            f.write("- [ ] Adicionar testes de autorização para cada endpoint\n")
            f.write("- [ ] Implementar rate limiting\n")
            f.write("- [ ] Configurar logs de auditoria\n")
            f.write("- [ ] Executar auditoria novamente após correções\n\n")
        else:
            f.write("### Manutenção\n\n")
            f.write("- ✅ Manter cobertura de JWT em novos endpoints\n")
            f.write("- ✅ Executar auditoria regularmente (mensal)\n")
            f.write("- ✅ Revisar logs de acesso periodicamente\n")
            f.write("- ✅ Atualizar documentação de segurança\n\n")

        # Referências
        f.write("## Referências\n\n")
        f.write("- [Flask-JWT-Extended Documentation](https://flask-jwt-extended.readthedocs.io/)\n")
        f.write("- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)\n")
        f.write("- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)\n\n")

def main():
    """Função principal"""

    # Diretórios para analisar
    base_dir = Path(__file__).parent.parent / "apps" / "api" / "src" / "controllers"

    print(f"{Colors.BLUE}Analisando arquivos de rotas...{Colors.NC}")
    print(f"Diretório: {base_dir}\n")

    # Encontrar todos os arquivos Python
    route_files = []
    for pattern in ["routes/*.py", "*.py"]:
        route_files.extend(base_dir.glob(pattern))

    # Filtrar arquivos __init__.py e base.py
    route_files = [f for f in route_files if f.name not in ['__init__.py', 'base.py']]

    print(f"Encontrados {len(route_files)} arquivos para analisar\n")

    # Analisar cada arquivo
    results = []
    for file_path in sorted(route_files):
        print(f"  Analisando: {file_path.name}...")
        result = parse_route_file(str(file_path))
        if result['endpoints']:
            results.append(result)

    # Gerar relatório
    report = generate_report(results)

    # Imprimir relatório
    print_report(report)

    # Salvar relatório em arquivo
    output_file = Path(__file__).parent.parent / "docs" / "JWT_AUDIT_REPORT.md"
    save_report_to_file(report, results, str(output_file))

    print(f"{Colors.GREEN}Relatório detalhado salvo em: {output_file}{Colors.NC}\n")

    # Exit code baseado em gaps de segurança
    if report['security_gaps']:
        exit(1)
    else:
        exit(0)

if __name__ == "__main__":
    main()
