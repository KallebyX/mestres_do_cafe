"""
Modelos de dados para sistema de analytics avançado em tempo real
Sistema completo de coleta, processamento e análise de dados de negócio
"""

from datetime import datetime, timedelta
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, JSON, ForeignKey, Index
from database import db
from enum import Enum


class EventType(Enum):
    """Tipos de eventos de analytics"""
    # Eventos de navegação
    PAGE_VIEW = "page_view"
    SESSION_START = "session_start"
    SESSION_END = "session_end"

    # Eventos de produto
    PRODUCT_VIEW = "product_view"
    PRODUCT_SEARCH = "product_search"
    CATEGORY_VIEW = "category_view"

    # Eventos de carrinho
    ADD_TO_CART = "add_to_cart"
    REMOVE_FROM_CART = "remove_from_cart"
    CART_VIEW = "cart_view"
    CART_ABANDON = "cart_abandon"

    # Eventos de checkout
    CHECKOUT_START = "checkout_start"
    CHECKOUT_STEP = "checkout_step"
    CHECKOUT_COMPLETE = "checkout_complete"
    CHECKOUT_ABANDON = "checkout_abandon"

    # Eventos de pagamento
    PAYMENT_START = "payment_start"
    PAYMENT_SUCCESS = "payment_success"
    PAYMENT_FAILURE = "payment_failure"

    # Eventos de usuário
    USER_REGISTER = "user_register"
    USER_LOGIN = "user_login"
    USER_LOGOUT = "user_logout"

    # Eventos de engajamento
    BUTTON_CLICK = "button_click"
    FORM_SUBMIT = "form_submit"
    SCROLL_DEPTH = "scroll_depth"
    TIME_ON_PAGE = "time_on_page"

    # Eventos de erro
    ERROR_404 = "error_404"
    ERROR_500 = "error_500"
    JS_ERROR = "js_error"


class Analytics(db.Model):
    """
    Modelo principal para eventos de analytics
    Armazena todos os eventos coletados do frontend e backend
    """
    __tablename__ = 'analytics'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key = True)

    # Identificadores
    session_id = Column(String(255), nullable = False, index = True)
    user_id = Column(String(255), nullable = True, index = True)
    anonymous_id = Column(String(255), nullable = True, index = True)

    # Evento
    event_type = Column(String(50), nullable = False, index = True)
    event_category = Column(String(50), nullable = True, index = True)
    event_action = Column(String(100), nullable = True)
    event_label = Column(String(255), nullable = True)
    event_value = Column(Float, nullable = True)

    # Dados contextuais
    page_url = Column(String(500), nullable = True)
    page_title = Column(String(255), nullable = True)
    referrer = Column(String(500), nullable = True)
    user_agent = Column(Text, nullable = True)

    # Localização
    ip_address = Column(String(45), nullable = True)
    country = Column(String(2), nullable = True)
    region = Column(String(100), nullable = True)
    city = Column(String(100), nullable = True)

    # Dispositivo
    device_type = Column(String(20), nullable = True)  # desktop, mobile, tablet
    device_brand = Column(String(50), nullable = True)
    device_model = Column(String(100), nullable = True)
    browser = Column(String(50), nullable = True)
    browser_version = Column(String(20), nullable = True)
    os = Column(String(50), nullable = True)
    os_version = Column(String(20), nullable = True)
    screen_resolution = Column(String(20), nullable = True)

    # E-commerce específico
    product_id = Column(String(50), nullable = True, index = True)
    product_name = Column(String(255), nullable = True)
    product_category = Column(String(100), nullable = True)
    product_price = Column(Float, nullable = True)
    product_quantity = Column(Integer, nullable = True)

    # Transação
    transaction_id = Column(String(100), nullable = True, index = True)
    transaction_value = Column(Float, nullable = True)
    currency = Column(String(3), nullable = True, default='BRL')

    # Dados personalizados (JSON)
    custom_data = Column(JSON, nullable = True)

    # Timestamps
    created_at = Column(DateTime, default = datetime.utcnow, nullable = False, index = True)
    processed_at = Column(DateTime, nullable = True)

    # Índices compostos para performance
    __table_args__ = (
        Index('idx_analytics_session_time', 'session_id', 'created_at'),
        Index('idx_analytics_user_time', 'user_id', 'created_at'),
        Index('idx_analytics_event_time', 'event_type', 'created_at'),
        Index('idx_analytics_product_time', 'product_id', 'created_at'),
    )

    def to_dict(self):
        """Serialização para JSON"""
        return {
            'id': self.id,
            'session_id': self.session_id,
            'user_id': self.user_id,
            'anonymous_id': self.anonymous_id,
            'event_type': self.event_type,
            'event_category': self.event_category,
            'event_action': self.event_action,
            'event_label': self.event_label,
            'event_value': self.event_value,
            'page_url': self.page_url,
            'page_title': self.page_title,
            'referrer': self.referrer,
            'ip_address': self.ip_address,
            'country': self.country,
            'region': self.region,
            'city': self.city,
            'device_type': self.device_type,
            'device_brand': self.device_brand,
            'browser': self.browser,
            'browser_version': self.browser_version,
            'os': self.os,
            'os_version': self.os_version,
            'screen_resolution': self.screen_resolution,
            'product_id': self.product_id,
            'product_name': self.product_name,
            'product_category': self.product_category,
            'product_price': self.product_price,
            'product_quantity': self.product_quantity,
            'transaction_id': self.transaction_id,
            'transaction_value': self.transaction_value,
            'currency': self.currency,
            'custom_data': self.custom_data,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'processed_at': self.processed_at.isoformat() if self.processed_at else None
        }


class AnalyticsMetrics(db.Model):
    """
    Métricas agregadas calculadas em tempo real
    Para performance de dashboards e relatórios
    """
    __tablename__ = 'analytics_metrics'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key = True)

    # Identificadores
    metric_name = Column(String(100), nullable = False, index = True)
    metric_category = Column(String(50), nullable = False, index = True)
    time_granularity = Column(String(20), nullable = False)  # minute, hour, day, week, month
    time_bucket = Column(DateTime, nullable = False, index = True)

    # Filtros (opcionais)
    user_segment = Column(String(50), nullable = True)
    product_category = Column(String(100), nullable = True)
    device_type = Column(String(20), nullable = True)
    traffic_source = Column(String(50), nullable = True)

    # Valores da métrica
    metric_value = Column(Float, nullable = False)
    metric_count = Column(Integer, nullable = True)
    unique_users = Column(Integer, nullable = True)
    unique_sessions = Column(Integer, nullable = True)

    # Metadados
    calculation_method = Column(String(50), nullable = True)
    confidence_level = Column(Float, nullable = True)
    sample_size = Column(Integer, nullable = True)

    # Timestamps
    created_at = Column(DateTime, default = datetime.utcnow, nullable = False)
    updated_at = Column(DateTime, default = datetime.utcnow, onupdate = datetime.utcnow)

    # Índices compostos
    __table_args__ = (
        Index('idx_metrics_name_time', 'metric_name', 'time_bucket'),
        Index('idx_metrics_category_time', 'metric_category', 'time_bucket'),
        Index('idx_metrics_granularity_time', 'time_granularity', 'time_bucket'),
    )

    def to_dict(self):
        """Serialização para JSON"""
        return {
            'id': self.id,
            'metric_name': self.metric_name,
            'metric_category': self.metric_category,
            'time_granularity': self.time_granularity,
            'time_bucket': self.time_bucket.isoformat() if self.time_bucket else None,
            'user_segment': self.user_segment,
            'product_category': self.product_category,
            'device_type': self.device_type,
            'traffic_source': self.traffic_source,
            'metric_value': self.metric_value,
            'metric_count': self.metric_count,
            'unique_users': self.unique_users,
            'unique_sessions': self.unique_sessions,
            'calculation_method': self.calculation_method,
            'confidence_level': self.confidence_level,
            'sample_size': self.sample_size,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class UserBehavior(db.Model):
    """
    Análise de comportamento do usuário
    Jornadas, funis de conversão e segmentação
    """
    __tablename__ = 'user_behavior'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key = True)

    # Identificadores
    user_id = Column(String(255), nullable = True, index = True)
    session_id = Column(String(255), nullable = False, index = True)
    anonymous_id = Column(String(255), nullable = True, index = True)

    # Jornada
    journey_stage = Column(String(50), nullable = False)  # awareness, consideration, purchase, retention
    funnel_step = Column(String(50), nullable = True)
    conversion_path = Column(Text, nullable = True)  # JSON array de eventos

    # Comportamento
    pages_viewed = Column(Integer, nullable = True)
    time_spent_minutes = Column(Float, nullable = True)
    bounce_rate = Column(Float, nullable = True)
    scroll_depth_avg = Column(Float, nullable = True)

    # Engajamento
    clicks_count = Column(Integer, nullable = True)
    interactions_count = Column(Integer, nullable = True)
    form_submissions = Column(Integer, nullable = True)
    downloads = Column(Integer, nullable = True)

    # E-commerce
    products_viewed = Column(Integer, nullable = True)
    categories_explored = Column(Integer, nullable = True)
    cart_additions = Column(Integer, nullable = True)
    cart_removals = Column(Integer, nullable = True)
    checkout_attempts = Column(Integer, nullable = True)
    purchases_completed = Column(Integer, nullable = True)
    total_spent = Column(Float, nullable = True)

    # Segmentação
    user_segment = Column(String(50), nullable = True)
    customer_lifetime_value = Column(Float, nullable = True)
    recency_score = Column(Integer, nullable = True)  # 1-5
    frequency_score = Column(Integer, nullable = True)  # 1-5
    monetary_score = Column(Integer, nullable = True)  # 1-5

    # Dados contextuais
    traffic_source = Column(String(100), nullable = True)
    referrer_domain = Column(String(255), nullable = True)
    campaign_source = Column(String(100), nullable = True)
    campaign_medium = Column(String(50), nullable = True)
    campaign_name = Column(String(100), nullable = True)

    # Timestamps
    session_start = Column(DateTime, nullable = True, index = True)
    session_end = Column(DateTime, nullable = True)
    created_at = Column(DateTime, default = datetime.utcnow, nullable = False)
    updated_at = Column(DateTime, default = datetime.utcnow, onupdate = datetime.utcnow)

    def to_dict(self):
        """Serialização para JSON"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'session_id': self.session_id,
            'anonymous_id': self.anonymous_id,
            'journey_stage': self.journey_stage,
            'funnel_step': self.funnel_step,
            'conversion_path': self.conversion_path,
            'pages_viewed': self.pages_viewed,
            'time_spent_minutes': self.time_spent_minutes,
            'bounce_rate': self.bounce_rate,
            'scroll_depth_avg': self.scroll_depth_avg,
            'clicks_count': self.clicks_count,
            'interactions_count': self.interactions_count,
            'form_submissions': self.form_submissions,
            'downloads': self.downloads,
            'products_viewed': self.products_viewed,
            'categories_explored': self.categories_explored,
            'cart_additions': self.cart_additions,
            'cart_removals': self.cart_removals,
            'checkout_attempts': self.checkout_attempts,
            'purchases_completed': self.purchases_completed,
            'total_spent': self.total_spent,
            'user_segment': self.user_segment,
            'customer_lifetime_value': self.customer_lifetime_value,
            'recency_score': self.recency_score,
            'frequency_score': self.frequency_score,
            'monetary_score': self.monetary_score,
            'traffic_source': self.traffic_source,
            'referrer_domain': self.referrer_domain,
            'campaign_source': self.campaign_source,
            'campaign_medium': self.campaign_medium,
            'campaign_name': self.campaign_name,
            'session_start': self.session_start.isoformat() if self.session_start else None,
            'session_end': self.session_end.isoformat() if self.session_end else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class BusinessMetrics(db.Model):
    """
    KPIs e métricas de negócio para dashboards executivos
    Calculados em tempo real com dados agregados
    """
    __tablename__ = 'business_metrics'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key = True)

    # Identificadores temporais
    date = Column(DateTime, nullable = False, index = True)
    period_type = Column(String(20), nullable = False)  # hourly, daily, weekly, monthly

    # Métricas de tráfego
    unique_visitors = Column(Integer, nullable = True)
    page_views = Column(Integer, nullable = True)
    sessions = Column(Integer, nullable = True)
    bounce_rate = Column(Float, nullable = True)
    avg_session_duration = Column(Float, nullable = True)

    # Métricas de e-commerce
    revenue = Column(Float, nullable = True)
    orders_count = Column(Integer, nullable = True)
    conversion_rate = Column(Float, nullable = True)
    average_order_value = Column(Float, nullable = True)
    cart_abandonment_rate = Column(Float, nullable = True)

    # Métricas de produto
    products_sold = Column(Integer, nullable = True)
    top_selling_product_id = Column(String(50), nullable = True)
    top_category = Column(String(100), nullable = True)
    inventory_turnover = Column(Float, nullable = True)

    # Métricas de usuário
    new_users = Column(Integer, nullable = True)
    returning_users = Column(Integer, nullable = True)
    customer_acquisition_cost = Column(Float, nullable = True)
    customer_lifetime_value = Column(Float, nullable = True)
    user_retention_rate = Column(Float, nullable = True)

    # Métricas de marketing
    organic_traffic = Column(Integer, nullable = True)
    paid_traffic = Column(Integer, nullable = True)
    social_traffic = Column(Integer, nullable = True)
    email_traffic = Column(Integer, nullable = True)
    direct_traffic = Column(Integer, nullable = True)

    # Métricas de performance
    page_load_time_avg = Column(Float, nullable = True)
    error_rate = Column(Float, nullable = True)
    uptime_percentage = Column(Float, nullable = True)

    # Comparações
    revenue_growth_rate = Column(Float, nullable = True)
    visitor_growth_rate = Column(Float, nullable = True)
    conversion_growth_rate = Column(Float, nullable = True)

    # Timestamps
    created_at = Column(DateTime, default = datetime.utcnow, nullable = False)
    updated_at = Column(DateTime, default = datetime.utcnow, onupdate = datetime.utcnow)

    def to_dict(self):
        """Serialização para JSON"""
        return {
            'id': self.id,
            'date': self.date.isoformat() if self.date else None,
            'period_type': self.period_type,
            'unique_visitors': self.unique_visitors,
            'page_views': self.page_views,
            'sessions': self.sessions,
            'bounce_rate': self.bounce_rate,
            'avg_session_duration': self.avg_session_duration,
            'revenue': self.revenue,
            'orders_count': self.orders_count,
            'conversion_rate': self.conversion_rate,
            'average_order_value': self.average_order_value,
            'cart_abandonment_rate': self.cart_abandonment_rate,
            'products_sold': self.products_sold,
            'top_selling_product_id': self.top_selling_product_id,
            'top_category': self.top_category,
            'inventory_turnover': self.inventory_turnover,
            'new_users': self.new_users,
            'returning_users': self.returning_users,
            'customer_acquisition_cost': self.customer_acquisition_cost,
            'customer_lifetime_value': self.customer_lifetime_value,
            'user_retention_rate': self.user_retention_rate,
            'organic_traffic': self.organic_traffic,
            'paid_traffic': self.paid_traffic,
            'social_traffic': self.social_traffic,
            'email_traffic': self.email_traffic,
            'direct_traffic': self.direct_traffic,
            'page_load_time_avg': self.page_load_time_avg,
            'error_rate': self.error_rate,
            'uptime_percentage': self.uptime_percentage,
            'revenue_growth_rate': self.revenue_growth_rate,
            'visitor_growth_rate': self.visitor_growth_rate,
            'conversion_growth_rate': self.conversion_growth_rate,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
