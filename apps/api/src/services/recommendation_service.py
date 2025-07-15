"""
Sistema de Recomendações com Machine Learning
Algoritmos de recomendação baseados em colaboração e conteúdo
"""

from typing import Dict, List, Any, Optional, Tuple
from collections import defaultdict, Counter
from datetime import datetime, timedelta
import json
import os

# Importações opcionais de ML
try:
    import numpy as np
    import pandas as pd
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    from sklearn.decomposition import TruncatedSVD
    from sklearn.preprocessing import MinMaxScaler
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False
    # Fallbacks para quando sklearn não estiver disponível
    np = None
    pd = None

from ..database import db
from ..models.orders import Order
from ..models.products import Product, ProductCategory
from ..models.customers import Customer
from ..utils.cache import cache_manager, cached

class RecommendationEngine:
    """Motor de recomendações com múltiplos algoritmos"""
    
    def __init__(self):
        self.models_path = "ml_models/"
        self.min_interactions = 3  # Mínimo de interações para recomendação
        self.similarity_threshold = 0.1
        
        # Cria diretório para modelos se não existir
        os.makedirs(self.models_path, exist_ok=True)
    
    @cached(timeout=3600, key_prefix="recommendations")
    def get_user_recommendations(self, user_id: int, num_recommendations: int = 10) -> List[Dict[str, Any]]:
        """Obtém recomendações personalizadas para um usuário"""
        
        try:
            # Combina diferentes tipos de recomendação
            collaborative_recs = self._collaborative_filtering(user_id, num_recommendations // 2)
            content_recs = self._content_based_filtering(user_id, num_recommendations // 2)
            trending_recs = self._trending_products(num_recommendations // 4)
            
            # Combina e remove duplicatas
            all_recommendations = []
            seen_products = set()
            
            # Prioriza recomendações colaborativas
            for rec in collaborative_recs:
                if rec['product_id'] not in seen_products:
                    rec['algorithm'] = 'collaborative'
                    all_recommendations.append(rec)
                    seen_products.add(rec['product_id'])
            
            # Adiciona recomendações baseadas em conteúdo
            for rec in content_recs:
                if rec['product_id'] not in seen_products and len(all_recommendations) < num_recommendations:
                    rec['algorithm'] = 'content_based'
                    all_recommendations.append(rec)
                    seen_products.add(rec['product_id'])
            
            # Completa com produtos em alta
            for rec in trending_recs:
                if rec['product_id'] not in seen_products and len(all_recommendations) < num_recommendations:
                    rec['algorithm'] = 'trending'
                    all_recommendations.append(rec)
                    seen_products.add(rec['product_id'])
            
            return all_recommendations[:num_recommendations]
            
        except Exception as e:
            # Fallback para produtos populares
            return self._fallback_recommendations(num_recommendations)
    
    def _collaborative_filtering(self, user_id: int, num_recommendations: int) -> List[Dict[str, Any]]:
        """Filtragem colaborativa baseada em usuários similares"""
        
        try:
            # Constrói matriz usuário-produto
            interaction_matrix = self._build_interaction_matrix()
            
            if interaction_matrix is None or user_id not in interaction_matrix.index:
                return []
            
            # Calcula similaridade entre usuários
            user_similarities = self._calculate_user_similarity(interaction_matrix, user_id)
            
            # Encontra usuários similares
            similar_users = user_similarities.nlargest(10).index.tolist()
            similar_users = [uid for uid in similar_users if uid != user_id]
            
            if not similar_users:
                return []
            
            # Produtos que o usuário ainda não comprou
            user_products = set(interaction_matrix.loc[user_id][interaction_matrix.loc[user_id] > 0].index)
            
            # Calcula scores de recomendação
            recommendations = defaultdict(float)
            
            for similar_user in similar_users:
                similarity_score = user_similarities[similar_user]
                similar_user_products = interaction_matrix.loc[similar_user]
                
                for product_id, rating in similar_user_products.items():
                    if rating > 0 and product_id not in user_products:
                        recommendations[product_id] += similarity_score * rating
            
            # Ordena por score e retorna top N
            sorted_recs = sorted(recommendations.items(), key=lambda x: x[1], reverse=True)
            
            results = []
            for product_id, score in sorted_recs[:num_recommendations]:
                product = Product.query.get(product_id)
                if product and product.is_active:
                    results.append({
                        'product_id': product_id,
                        'product_name': product.name,
                        'price': float(product.price),
                        'score': float(score),
                        'confidence': min(1.0, score / 10.0)  # Normaliza confiança
                    })
            
            return results
            
        except Exception as e:
            return []
    
    def _content_based_filtering(self, user_id: int, num_recommendations: int) -> List[Dict[str, Any]]:
        """Recomendação baseada no conteúdo dos produtos"""
        
        try:
            # Obtém histórico do usuário
            user_orders = Order.query.filter_by(customer_id=user_id).all()
            if not user_orders:
                return []
            
            # Extrai produtos comprados pelo usuário
            user_products = []
            for order in user_orders:
                for item in order.items:
                    user_products.append(item.product_id)
            
            if not user_products:
                return []
            
            # Constrói perfil do usuário baseado em categorias
            user_profile = self._build_user_content_profile(user_products)
            
            # Encontra produtos similares
            similar_products = self._find_similar_products_by_content(user_profile, user_products)
            
            results = []
            for product_id, score in similar_products[:num_recommendations]:
                product = Product.query.get(product_id)
                if product and product.is_active:
                    results.append({
                        'product_id': product_id,
                        'product_name': product.name,
                        'price': float(product.price),
                        'score': float(score),
                        'confidence': min(1.0, score)
                    })
            
            return results
            
        except Exception as e:
            return []
    
    def _trending_products(self, num_recommendations: int) -> List[Dict[str, Any]]:
        """Produtos em alta baseado em vendas recentes"""
        
        try:
            # Últimos 30 dias
            since_date = datetime.now() - timedelta(days=30)
            
            # Query para produtos mais vendidos
            trending = db.session.query(
                Product.id,
                Product.name,
                Product.price,
                db.func.count(db.text("order_items.id")).label('sales_count'),
                db.func.sum(db.text("order_items.quantity")).label('total_quantity')
            ).join(
                db.text("order_items"), db.text("products.id = order_items.product_id")
            ).join(
                db.text("orders"), db.text("order_items.order_id = orders.id")
            ).filter(
                db.text("orders.created_at >= :since_date"),
                Product.is_active == True
            ).params(
                since_date=since_date
            ).group_by(
                Product.id, Product.name, Product.price
            ).order_by(
                db.text("sales_count DESC")
            ).limit(num_recommendations).all()
            
            results = []
            for product in trending:
                results.append({
                    'product_id': product.id,
                    'product_name': product.name,
                    'price': float(product.price),
                    'score': float(product.sales_count),
                    'confidence': 0.8  # Alta confiança para produtos em alta
                })
            
            return results
            
        except Exception as e:
            return []
    
    def _build_interaction_matrix(self) -> Optional[object]:
        """Constrói matriz de interação usuário-produto"""
        
        if not ML_AVAILABLE:
            return None
            
        try:
            # Query para obter todas as interações
            interactions = db.session.query(
                Order.customer_id,
                db.text("order_items.product_id"),
                db.func.sum(db.text("order_items.quantity")).label('quantity')
            ).join(
                db.text("order_items"), db.text("orders.id = order_items.order_id")
            ).filter(
                Order.status.in_(['completed', 'shipped', 'delivered'])
            ).group_by(
                Order.customer_id,
                db.text("order_items.product_id")
            ).all()
            
            if not interactions:
                return None
            
            # Converte para DataFrame
            df = pd.DataFrame(interactions, columns=['user_id', 'product_id', 'rating'])
            
            # Normaliza ratings (quantidade comprada)
            scaler = MinMaxScaler(feature_range=(1, 5))
            df['rating'] = scaler.fit_transform(df[['rating']])
            
            # Cria matriz pivot
            matrix = df.pivot_table(index='user_id', columns='product_id', values='rating', fill_value=0)
            
            return matrix
            
        except Exception as e:
            return None
    
    def _calculate_user_similarity(self, matrix: pd.DataFrame, user_id: int) -> pd.Series:
        """Calcula similaridade entre usuários usando cosseno"""
        
        try:
            # Calcula similaridade de cosseno
            user_vector = matrix.loc[user_id].values.reshape(1, -1)
            similarities = cosine_similarity(user_vector, matrix.values).flatten()
            
            # Retorna como Series
            return pd.Series(similarities, index=matrix.index)
            
        except Exception as e:
            return pd.Series()
    
    def _build_user_content_profile(self, user_products: List[int]) -> Dict[str, float]:
        """Constrói perfil de conteúdo do usuário"""
        
        try:
            profile = defaultdict(float)
            
            # Agrega características dos produtos comprados
            for product_id in user_products:
                product = Product.query.get(product_id)
                if product:
                    # Peso por categoria
                    if product.category:
                        profile[f"category_{product.category.name}"] += 1.0
                    
                    # Peso por faixa de preço
                    price_range = self._get_price_range(product.price)
                    profile[f"price_range_{price_range}"] += 1.0
                    
                    # Características textuais (nome, descrição)
                    if product.name:
                        for word in product.name.lower().split():
                            if len(word) > 3:  # Ignora palavras muito curtas
                                profile[f"word_{word}"] += 0.5
            
            # Normaliza pesos
            total_weight = sum(profile.values())
            if total_weight > 0:
                for key in profile:
                    profile[key] /= total_weight
            
            return dict(profile)
            
        except Exception as e:
            return {}
    
    def _find_similar_products_by_content(self, user_profile: Dict[str, float], exclude_products: List[int]) -> List[Tuple[int, float]]:
        """Encontra produtos similares baseado no perfil de conteúdo"""
        
        try:
            products = Product.query.filter(
                Product.is_active == True,
                ~Product.id.in_(exclude_products)
            ).all()
            
            similarities = []
            
            for product in products:
                # Constrói perfil do produto
                product_profile = defaultdict(float)
                
                if product.category:
                    product_profile[f"category_{product.category.name}"] = 1.0
                
                price_range = self._get_price_range(product.price)
                product_profile[f"price_range_{price_range}"] = 1.0
                
                if product.name:
                    for word in product.name.lower().split():
                        if len(word) > 3:
                            product_profile[f"word_{word}"] = 0.5
                
                # Calcula similaridade
                similarity = self._calculate_profile_similarity(user_profile, dict(product_profile))
                
                if similarity > self.similarity_threshold:
                    similarities.append((product.id, similarity))
            
            # Ordena por similaridade
            similarities.sort(key=lambda x: x[1], reverse=True)
            
            return similarities
            
        except Exception as e:
            return []
    
    def _calculate_profile_similarity(self, profile1: Dict[str, float], profile2: Dict[str, float]) -> float:
        """Calcula similaridade entre dois perfis usando cosseno"""
        
        try:
            # Obtém todas as chaves
            all_keys = set(profile1.keys()) | set(profile2.keys())
            
            if not all_keys:
                return 0.0
            
            # Constrói vetores
            vector1 = [profile1.get(key, 0.0) for key in all_keys]
            vector2 = [profile2.get(key, 0.0) for key in all_keys]
            
            # Calcula similaridade de cosseno
            dot_product = sum(a * b for a, b in zip(vector1, vector2))
            magnitude1 = sum(a * a for a in vector1) ** 0.5
            magnitude2 = sum(b * b for b in vector2) ** 0.5
            
            if magnitude1 == 0.0 or magnitude2 == 0.0:
                return 0.0
            
            return dot_product / (magnitude1 * magnitude2)
            
        except Exception as e:
            return 0.0
    
    def _get_price_range(self, price: float) -> str:
        """Categoriza preço em faixas"""
        
        if price < 20:
            return "baixo"
        elif price < 50:
            return "medio"
        elif price < 100:
            return "alto"
        else:
            return "premium"
    
    def _fallback_recommendations(self, num_recommendations: int) -> List[Dict[str, Any]]:
        """Recomendações de fallback quando outros algoritmos falham"""
        
        try:
            # Produtos mais populares geral
            popular_products = Product.query.filter(
                Product.is_active == True
            ).order_by(
                Product.created_at.desc()
            ).limit(num_recommendations).all()
            
            results = []
            for product in popular_products:
                results.append({
                    'product_id': product.id,
                    'product_name': product.name,
                    'price': float(product.price),
                    'score': 1.0,
                    'confidence': 0.5,  # Baixa confiança para fallback
                    'algorithm': 'fallback'
                })
            
            return results
            
        except Exception as e:
            return []

class RecommendationAnalytics:
    """Analytics para sistema de recomendações"""
    
    def __init__(self):
        self.engine = RecommendationEngine()
    
    def track_recommendation_click(self, user_id: int, product_id: int, algorithm: str) -> bool:
        """Registra clique em recomendação para análise"""
        
        try:
            # Em produção, salvar em tabela de eventos
            event_data = {
                'user_id': user_id,
                'product_id': product_id,
                'algorithm': algorithm,
                'event_type': 'recommendation_click',
                'timestamp': datetime.now().isoformat()
            }
            
            # Cache para análise
            cache_key = f"rec_click:{user_id}:{product_id}"
            cache_manager.set(cache_key, event_data, timeout=86400)  # 24 horas
            
            return True
            
        except Exception as e:
            return False
    
    def get_recommendation_performance(self, days: int = 30) -> Dict[str, Any]:
        """Analisa performance das recomendações"""
        
        try:
            # Simulação de métricas (em produção, calcular dados reais)
            performance = {
                'period_days': days,
                'total_recommendations_shown': 15420,
                'total_clicks': 1234,
                'total_conversions': 156,
                'click_through_rate': 8.0,  # 8%
                'conversion_rate': 12.6,    # 12.6% dos cliques viraram compras
                'algorithm_performance': {
                    'collaborative': {
                        'recommendations': 6000,
                        'clicks': 520,
                        'conversions': 78,
                        'ctr': 8.7,
                        'conversion_rate': 15.0
                    },
                    'content_based': {
                        'recommendations': 5200,
                        'clicks': 435,
                        'conversions': 62,
                        'ctr': 8.4,
                        'conversion_rate': 14.3
                    },
                    'trending': {
                        'recommendations': 2800,
                        'clicks': 189,
                        'conversions': 12,
                        'ctr': 6.8,
                        'conversion_rate': 6.3
                    },
                    'fallback': {
                        'recommendations': 1420,
                        'clicks': 90,
                        'conversions': 4,
                        'ctr': 6.3,
                        'conversion_rate': 4.4
                    }
                }
            }
            
            return performance
            
        except Exception as e:
            return {'error': str(e)}

# Instâncias globais
recommendation_engine = RecommendationEngine()
recommendation_analytics = RecommendationAnalytics()