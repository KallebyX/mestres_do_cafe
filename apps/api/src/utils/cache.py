import redis
import json
import pickle
import hashlib
from datetime import datetime, timedelta
from functools import wraps
from flask import current_app
from typing import Any, Optional, Union, Dict, List

class CacheManager:
    """Gerenciador de cache com Redis"""
    
    def __init__(self, redis_url: str = None):
        self.redis_url = redis_url or current_app.config.get('REDIS_URL', 'redis://localhost:6379')
        self._redis_client = None
        self._fallback_cache = {}  # Cache em memória como fallback
    
    @property
    def redis_client(self):
        """Lazy initialization do cliente Redis"""
        if self._redis_client is None:
            try:
                self._redis_client = redis.Redis.from_url(
                    self.redis_url,
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5,
                    retry_on_timeout=True
                )
                # Teste de conexão
                self._redis_client.ping()
            except Exception as e:
                current_app.logger.warning(f"Redis connection failed: {e}. Using fallback cache.")
                self._redis_client = None
        return self._redis_client
    
    def _generate_key(self, key: str, prefix: str = "mc") -> str:
        """Gera chave do cache com prefixo"""
        return f"{prefix}:{key}"
    
    def _serialize_value(self, value: Any) -> str:
        """Serializa valor para armazenamento"""
        if isinstance(value, (str, int, float, bool)):
            return json.dumps(value)
        else:
            # Para objetos complexos, usar pickle e base64
            import base64
            return base64.b64encode(pickle.dumps(value)).decode('utf-8')
    
    def _deserialize_value(self, value: str) -> Any:
        """Deserializa valor do cache"""
        try:
            return json.loads(value)
        except (json.JSONDecodeError, ValueError):
            # Tentar deserializar como pickle
            try:
                import base64
                return pickle.loads(base64.b64decode(value.encode('utf-8')))
            except Exception:
                return value
    
    def set(self, key: str, value: Any, timeout: int = 300) -> bool:
        """Define valor no cache"""
        cache_key = self._generate_key(key)
        serialized_value = self._serialize_value(value)
        
        if self.redis_client:
            try:
                return self.redis_client.setex(cache_key, timeout, serialized_value)
            except Exception as e:
                current_app.logger.error(f"Redis set error: {e}")
        
        # Fallback para cache em memória
        self._fallback_cache[cache_key] = {
            'value': serialized_value,
            'expires_at': datetime.now() + timedelta(seconds=timeout)
        }
        return True
    
    def get(self, key: str) -> Any:
        """Obtém valor do cache"""
        cache_key = self._generate_key(key)
        
        if self.redis_client:
            try:
                value = self.redis_client.get(cache_key)
                if value is not None:
                    return self._deserialize_value(value)
            except Exception as e:
                current_app.logger.error(f"Redis get error: {e}")
        
        # Fallback para cache em memória
        if cache_key in self._fallback_cache:
            cache_item = self._fallback_cache[cache_key]
            if datetime.now() < cache_item['expires_at']:
                return self._deserialize_value(cache_item['value'])
            else:
                del self._fallback_cache[cache_key]
        
        return None
    
    def delete(self, key: str) -> bool:
        """Remove valor do cache"""
        cache_key = self._generate_key(key)
        
        if self.redis_client:
            try:
                return bool(self.redis_client.delete(cache_key))
            except Exception as e:
                current_app.logger.error(f"Redis delete error: {e}")
        
        # Fallback para cache em memória
        if cache_key in self._fallback_cache:
            del self._fallback_cache[cache_key]
            return True
        return False
    
    def exists(self, key: str) -> bool:
        """Verifica se chave existe no cache"""
        cache_key = self._generate_key(key)
        
        if self.redis_client:
            try:
                return bool(self.redis_client.exists(cache_key))
            except Exception as e:
                current_app.logger.error(f"Redis exists error: {e}")
        
        # Fallback para cache em memória
        if cache_key in self._fallback_cache:
            cache_item = self._fallback_cache[cache_key]
            if datetime.now() < cache_item['expires_at']:
                return True
            else:
                del self._fallback_cache[cache_key]
        
        return False
    
    def clear_pattern(self, pattern: str) -> int:
        """Remove todas as chaves que correspondem ao padrão"""
        if self.redis_client:
            try:
                keys = self.redis_client.keys(self._generate_key(pattern))
                if keys:
                    return self.redis_client.delete(*keys)
            except Exception as e:
                current_app.logger.error(f"Redis clear_pattern error: {e}")
        
        # Fallback para cache em memória
        count = 0
        keys_to_delete = []
        for key in self._fallback_cache:
            if pattern in key:
                keys_to_delete.append(key)
        
        for key in keys_to_delete:
            del self._fallback_cache[key]
            count += 1
        
        return count
    
    def get_stats(self) -> Dict[str, Any]:
        """Obtém estatísticas do cache"""
        if self.redis_client:
            try:
                info = self.redis_client.info()
                return {
                    'type': 'redis',
                    'connected_clients': info.get('connected_clients', 0),
                    'used_memory': info.get('used_memory_human', 'N/A'),
                    'keyspace_hits': info.get('keyspace_hits', 0),
                    'keyspace_misses': info.get('keyspace_misses', 0),
                    'keys_count': self.redis_client.dbsize()
                }
            except Exception as e:
                current_app.logger.error(f"Redis stats error: {e}")
        
        return {
            'type': 'memory',
            'keys_count': len(self._fallback_cache),
            'memory_usage': 'N/A'
        }

# Instância global do cache
cache_manager = CacheManager()

def cache_set(key: str, value: Any, timeout: int = 300) -> bool:
    """Função utilitária para definir cache"""
    return cache_manager.set(key, value, timeout)

def cache_get(key: str) -> Any:
    """Função utilitária para obter cache"""
    return cache_manager.get(key)

def cache_delete(key: str) -> bool:
    """Função utilitária para deletar cache"""
    return cache_manager.delete(key)

def cache_exists(key: str) -> bool:
    """Função utilitária para verificar existência"""
    return cache_manager.exists(key)

def cache_clear_pattern(pattern: str) -> int:
    """Função utilitária para limpar padrão"""
    return cache_manager.clear_pattern(pattern)

def cached(timeout: int = 300, key_prefix: str = ""):
    """Decorator para cache automático de funções"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Gerar chave única baseada na função e argumentos
            func_signature = f"{func.__module__}.{func.__name__}"
            args_signature = hashlib.md5(str(args).encode()).hexdigest()
            kwargs_signature = hashlib.md5(str(sorted(kwargs.items())).encode()).hexdigest()
            
            cache_key = f"{key_prefix}:{func_signature}:{args_signature}:{kwargs_signature}"
            
            # Tentar obter do cache
            cached_result = cache_get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Executar função e cachear resultado
            result = func(*args, **kwargs)
            cache_set(cache_key, result, timeout)
            
            return result
        return wrapper
    return decorator

def cache_key_for_user(user_id: Union[int, str], key: str) -> str:
    """Gera chave de cache específica para usuário"""
    return f"user:{user_id}:{key}"

def cache_key_for_session(session_id: str, key: str) -> str:
    """Gera chave de cache específica para sessão"""
    return f"session:{session_id}:{key}"

def cache_key_for_product(product_id: Union[int, str], key: str) -> str:
    """Gera chave de cache específica para produto"""
    return f"product:{product_id}:{key}"

def invalidate_user_cache(user_id: Union[int, str]) -> int:
    """Invalida todo o cache de um usuário"""
    return cache_clear_pattern(f"user:{user_id}:*")

def invalidate_product_cache(product_id: Union[int, str]) -> int:
    """Invalida todo o cache de um produto"""
    return cache_clear_pattern(f"product:{product_id}:*")

class CacheWarmup:
    """Classe para pré-aquecer cache com dados frequentemente acessados"""
    
    @staticmethod
    def warm_products_cache():
        """Pré-aquece cache de produtos"""
        from models.products import Product
        
        try:
            # Cachear produtos mais populares
            popular_products = Product.query.filter_by(is_active=True).limit(50).all()
            
            for product in popular_products:
                cache_key = cache_key_for_product(product.id, "details")
                cache_set(cache_key, product.to_dict(), timeout=3600)  # 1 hora
            
            current_app.logger.info(f"Cached {len(popular_products)} popular products")
            
        except Exception as e:
            current_app.logger.error(f"Error warming up products cache: {e}")
    
    @staticmethod
    def warm_categories_cache():
        """Pré-aquece cache de categorias"""
        from models.products import Category
        
        try:
            categories = Category.query.filter_by(is_active=True).all()
            
            cache_key = "categories:all"
            cache_set(cache_key, [cat.to_dict() for cat in categories], timeout=7200)  # 2 horas
            
            current_app.logger.info(f"Cached {len(categories)} categories")
            
        except Exception as e:
            current_app.logger.error(f"Error warming up categories cache: {e}")

def init_cache_warmup():
    """Inicializa pré-aquecimento do cache"""
    warmup = CacheWarmup()
    warmup.warm_products_cache()
    warmup.warm_categories_cache()