#!/usr/bin/env python3
"""
Script Automatizado de Correção de JWT
Adiciona @jwt_required() em todos os endpoints que precisam de proteção
"""

import os
import re
from pathlib import Path
from typing import List, Tuple

# Endpoints que devem permanecer públicos (sem JWT)
PUBLIC_ENDPOINTS = {
    '/health', '/ping', '/status',  # Health checks
    '/login', '/register', '/forgot-password', '/reset-password',  # Auth
    '/verify-email', '/resend-verification',  # Email verification
    '/webhook',  # Webhooks externos
    '/newsletter/verify',  # Verificação de newsletter
    '/validate-cep', '/payment-methods',  # Info pública
    '/products', '/categories', '/blog',  # Leitura pública (GET apenas)
}

# Métodos HTTP que geralmente são públicos para certos endpoints
PUBLIC_GET_PATTERNS = [
    r'@\w+_bp\.route\(["\']/(products|categories|blog)["\'].*methods.*GET',
]

def should_be_public(route_decorator: str, method: str, path: str) -> bool:
    """Determina se um endpoint deve ser público"""

    # Verificar se está na lista de públicos
    for public_path in PUBLIC_ENDPOINTS:
        if public_path in path:
            return True

    # GET endpoints de leitura pública
    if 'GET' in method and not any(word in path.lower() for word in ['admin', 'user', 'profile', 'account', 'order', 'checkout', 'cart']):
        for pattern in PUBLIC_GET_PATTERNS:
            if re.search(pattern, route_decorator):
                return True

    return False


def add_jwt_to_file(file_path: str) -> Tuple[bool, int]:
    """
    Adiciona @jwt_required() em endpoints que não têm
    Retorna (modified, count_added)
    """

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        lines = content.split('\n')

    # Verificar se já tem importação do jwt_required
    has_import = 'from flask_jwt_extended import' in content

    modifications = []
    endpoints_added = 0

    i = 0
    while i < len(lines):
        line = lines[i]

        # Detectar route decorator
        if re.match(r'\s*@\w+_bp\.route\(', line):
            route_line_idx = i
            route_decorator = line

            # Pegar linhas seguintes até encontrar a definição da função
            j = i + 1
            decorators = [line]

            while j < len(lines):
                next_line = lines[j]

                # Se é outro decorator, adicionar
                if next_line.strip().startswith('@'):
                    decorators.append(next_line)
                    j += 1
                # Se é a definição da função, parar
                elif next_line.strip().startswith('def '):
                    func_def_idx = j
                    func_line = next_line

                    # Extrair informações do endpoint
                    path_match = re.search(r'["\']([^"\']+)["\']', route_decorator)
                    path = path_match.group(1) if path_match else ''

                    methods_match = re.search(r'methods\s*=\s*\[([^\]]+)\]', route_decorator)
                    methods = methods_match.group(1) if methods_match else 'GET'

                    # Verificar se já tem jwt_required
                    has_jwt = any('@jwt_required' in d for d in decorators)

                    # Verificar se deve ser público
                    is_public = should_be_public(route_decorator, methods, path)

                    # Se não tem JWT e não deve ser público, adicionar
                    if not has_jwt and not is_public:
                        # Adicionar @jwt_required() antes da função
                        indent = re.match(r'^(\s*)def', func_line).group(1)
                        jwt_decorator = f"{indent}@jwt_required()"

                        modifications.append((func_def_idx, jwt_decorator))
                        endpoints_added += 1

                    break
                else:
                    j += 1

            i = j
        else:
            i += 1

    # Se não teve modificações, retornar
    if not modifications:
        return False, 0

    # Aplicar modificações (de trás para frente para não afetar índices)
    for idx, decorator in reversed(modifications):
        lines.insert(idx, decorator)

    # Adicionar import se necessário
    if not has_import and endpoints_added > 0:
        # Encontrar linha de imports do Flask
        for i, line in enumerate(lines):
            if 'from flask import' in line:
                # Verificar se jwt_extended já está importado
                if 'flask_jwt_extended' not in '\n'.join(lines[:i+10]):
                    lines.insert(i + 1, 'from flask_jwt_extended import jwt_required, get_jwt_identity')
                break

    # Salvar arquivo
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

    return True, endpoints_added


def process_all_routes():
    """Processa todos os arquivos de rotas"""

    routes_dir = Path(__file__).parent.parent / 'apps' / 'api' / 'src' / 'controllers' / 'routes'

    print("🔒 Iniciando correção automática de JWT...")
    print(f"📁 Diretório: {routes_dir}\n")

    total_files = 0
    total_endpoints = 0
    modified_files = []

    # Processar todos os arquivos .py
    for file_path in sorted(routes_dir.glob('*.py')):
        if file_path.name in ['__init__.py', 'admin.py', 'checkout.py']:
            continue  # Pular já corrigidos

        print(f"⚙️  Processando: {file_path.name}...", end=' ')

        try:
            modified, count = add_jwt_to_file(str(file_path))

            if modified:
                total_files += 1
                total_endpoints += count
                modified_files.append((file_path.name, count))
                print(f"✅ {count} endpoints protegidos")
            else:
                print("⏭️  Nenhuma modificação necessária")

        except Exception as e:
            print(f"❌ Erro: {str(e)}")

    # Resumo
    print(f"\n{'=' * 60}")
    print(f"✨ CORREÇÃO CONCLUÍDA!")
    print(f"{'=' * 60}")
    print(f"📊 Arquivos modificados: {total_files}")
    print(f"🔒 Endpoints protegidos: {total_endpoints}")

    if modified_files:
        print(f"\n📝 Detalhes por arquivo:")
        for filename, count in modified_files:
            print(f"   • {filename}: {count} endpoints")

    print(f"\n{'=' * 60}\n")


if __name__ == '__main__':
    process_all_routes()
