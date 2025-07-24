from flask import request, url_for
from typing import Any, Dict, List, Optional, Union
from sqlalchemy.orm import Query
from math import ceil

class PaginationResult:
    """Classe para resultado de paginação"""

    def __init__(self, items: List[Any], total: int, page: int, per_page: int,
                 has_next: bool, has_prev: bool, next_page: Optional[int] = None,
                 prev_page: Optional[int] = None):
        self.items = items
        self.total = total
        self.page = page
        self.per_page = per_page
        self.has_next = has_next
        self.has_prev = has_prev
        self.next_page = next_page
        self.prev_page = prev_page
        self.pages = ceil(total / per_page) if per_page > 0 else 0

    def to_dict(self, endpoint: str = None, **kwargs) -> Dict[str, Any]:
        """Converte resultado para dicionário"""
        result = {
            'items': self.items,
            'pagination': {
                'total': self.total,
                'pages': self.pages,
                'current_page': self.page,
                'per_page': self.per_page,
                'has_next': self.has_next,
                'has_prev': self.has_prev,
                'next_page': self.next_page,
                'prev_page': self.prev_page
            }
        }

        # Adicionar URLs de navegação se endpoint fornecido
        if endpoint:
            result['pagination']['links'] = self._generate_links(endpoint, **kwargs)

        return result

    def _generate_links(self, endpoint: str, **kwargs) -> Dict[str, Optional[str]]:
        """Gera links de navegação"""
        links = {
            'first': None,
            'prev': None,
            'next': None,
            'last': None
        }

        try:
            # Link para primeira página
            if self.total > 0:
                links['first'] = url_for(endpoint, page = 1, per_page = self.per_page, **kwargs)

            # Link para página anterior
            if self.has_prev:
                links['prev'] = url_for(endpoint, page = self.prev_page, per_page = self.per_page, **kwargs)

            # Link para próxima página
            if self.has_next:
                links['next'] = url_for(endpoint, page = self.next_page, per_page = self.per_page, **kwargs)

            # Link para última página
            if self.pages > 0:
                links['last'] = url_for(endpoint, page = self.pages, per_page = self.per_page, **kwargs)

        except Exception:
            # Se houver erro na geração de URLs, retornar links vazios
            pass

        return links

def paginate_query(query: Query, page: int = None, per_page: int = None,
                  max_per_page: int = 100, default_per_page: int = 20) -> PaginationResult:
    """
    Pagina uma query SQLAlchemy

    Args:
        query: Query SQLAlchemy
        page: Número da página (1-based)
        per_page: Itens por página
        max_per_page: Máximo de itens por página
        default_per_page: Padrão de itens por página

    Returns:
        PaginationResult: Resultado da paginação
    """
    # Obter parâmetros da requisição se não fornecidos
    if page is None:
        page = request.args.get('page', 1, type = int)
    if per_page is None:
        per_page = request.args.get('per_page', default_per_page, type = int)

    # Validar parâmetros
    page = max(1, page)
    per_page = min(max(1, per_page), max_per_page)

    # Calcular offset
    offset = (page - 1) * per_page

    # Obter total de itens
    total = query.count()

    # Obter itens da página atual
    items = query.offset(offset).limit(per_page).all()

    # Calcular navegação
    has_next = offset + per_page < total
    has_prev = page > 1
    next_page = page + 1 if has_next else None
    prev_page = page - 1 if has_prev else None

    return PaginationResult(
        items = items,
        total = total,
        page = page,
        per_page = per_page,
        has_next = has_next,
        has_prev = has_prev,
        next_page = next_page,
        prev_page = prev_page
    )

def paginate_list(items: List[Any], page: int = None, per_page: int = None,
                 max_per_page: int = 100, default_per_page: int = 20) -> PaginationResult:
    """
    Pagina uma lista de itens

    Args:
        items: Lista de itens
        page: Número da página (1-based)
        per_page: Itens por página
        max_per_page: Máximo de itens por página
        default_per_page: Padrão de itens por página

    Returns:
        PaginationResult: Resultado da paginação
    """
    # Obter parâmetros da requisição se não fornecidos
    if page is None:
        page = request.args.get('page', 1, type = int)
    if per_page is None:
        per_page = request.args.get('per_page', default_per_page, type = int)

    # Validar parâmetros
    page = max(1, page)
    per_page = min(max(1, per_page), max_per_page)

    # Calcular total e offset
    total = len(items)
    offset = (page - 1) * per_page

    # Obter itens da página atual
    page_items = items[offset:offset + per_page]

    # Calcular navegação
    has_next = offset + per_page < total
    has_prev = page > 1
    next_page = page + 1 if has_next else None
    prev_page = page - 1 if has_prev else None

    return PaginationResult(
        items = page_items,
        total = total,
        page = page,
        per_page = per_page,
        has_next = has_next,
        has_prev = has_prev,
        next_page = next_page,
        prev_page = prev_page
    )

def get_pagination_params(max_per_page: int = 100, default_per_page: int = 20) -> Dict[str, int]:
    """
    Obtém parâmetros de paginação da requisição

    Args:
        max_per_page: Máximo de itens por página
        default_per_page: Padrão de itens por página

    Returns:
        Dict com page e per_page
    """
    page = request.args.get('page', 1, type = int)
    per_page = request.args.get('per_page', default_per_page, type = int)

    # Validar parâmetros
    page = max(1, page)
    per_page = min(max(1, per_page), max_per_page)

    return {
        'page': page,
        'per_page': per_page
    }

def create_pagination_response(pagination_result: PaginationResult,
                             serializer_func: Optional[callable] = None,
                             endpoint: str = None, **kwargs) -> Dict[str, Any]:
    """
    Cria resposta de paginação padronizada

    Args:
        pagination_result: Resultado da paginação
        serializer_func: Função para serializar itens
        endpoint: Endpoint para geração de links
        **kwargs: Parâmetros adicionais para links

    Returns:
        Dict com resposta formatada
    """
    # Serializar itens se função fornecida
    if serializer_func:
        items = [serializer_func(item) for item in pagination_result.items]
    else:
        items = pagination_result.items

    # Criar resultado temporário com itens serializados
    temp_result = PaginationResult(
        items = items,
        total = pagination_result.total,
        page = pagination_result.page,
        per_page = pagination_result.per_page,
        has_next = pagination_result.has_next,
        has_prev = pagination_result.has_prev,
        next_page = pagination_result.next_page,
        prev_page = pagination_result.prev_page
    )

    return temp_result.to_dict(endpoint = endpoint, **kwargs)

class PaginationHelper:
    """Classe helper para paginação com configurações personalizadas"""

    def __init__(self, max_per_page: int = 100, default_per_page: int = 20):
        self.max_per_page = max_per_page
        self.default_per_page = default_per_page

    def paginate_query(self, query: Query, page: int = None, per_page: int = None) -> PaginationResult:
        """Pagina query com configurações da instância"""
        return paginate_query(
            query = query,
            page = page,
            per_page = per_page,
            max_per_page = self.max_per_page,
            default_per_page = self.default_per_page
        )

    def paginate_list(self, items: List[Any], page: int = None, per_page: int = None) -> PaginationResult:
        """Pagina lista com configurações da instância"""
        return paginate_list(
            items = items,
            page = page,
            per_page = per_page,
            max_per_page = self.max_per_page,
            default_per_page = self.default_per_page
        )

    def get_pagination_params(self) -> Dict[str, int]:
        """Obtém parâmetros com configurações da instância"""
        return get_pagination_params(
            max_per_page = self.max_per_page,
            default_per_page = self.default_per_page
        )

def paginate_search_results(query: Query, search_term: str = None, filters: Dict[str, Any] = None,
                           page: int = None, per_page: int = None,
                           max_per_page: int = 100, default_per_page: int = 20) -> PaginationResult:
    """
    Pagina resultados de busca com filtros

    Args:
        query: Query base
        search_term: Termo de busca
        filters: Filtros adicionais
        page: Número da página
        per_page: Itens por página
        max_per_page: Máximo de itens por página
        default_per_page: Padrão de itens por página

    Returns:
        PaginationResult: Resultado da paginação
    """
    # Aplicar filtros se fornecidos
    if filters:
        for field, value in filters.items():
            if value is not None:
                # Assumir que o modelo tem os campos necessários
                if hasattr(query.column_descriptions[0]['type'], field):
                    query = query.filter(getattr(query.column_descriptions[0]['type'], field) == value)

    # Aplicar busca se fornecida
    if search_term:
        # Implementar busca específica baseada no modelo
        # Isso deve ser customizado para cada caso de uso
        pass

    return paginate_query(
        query = query,
        page = page,
        per_page = per_page,
        max_per_page = max_per_page,
        default_per_page = default_per_page
    )

# Instância global do helper com configurações padrão
default_paginator = PaginationHelper()

# Funções utilitárias que usam a instância global
def paginate(query: Query, **kwargs) -> PaginationResult:
    """Função utilitária para paginação rápida"""
    return default_paginator.paginate_query(query, **kwargs)

def paginate_items(items: List[Any], **kwargs) -> PaginationResult:
    """Função utilitária para paginação de lista"""
    return default_paginator.paginate_list(items, **kwargs)
