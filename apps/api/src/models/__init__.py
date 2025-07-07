"""
Modelos do Sistema Mestres do Café Enterprise
Centraliza todas as importações dos modelos para garantir que o SQLAlchemy
encontre todos os relacionamentos corretamente.
"""

# Importa a base do SQLAlchemy
from .base import db

# Importa modelos de checkout
from .checkout import (
    CheckoutEvent,
    CheckoutSession,
    CheckoutStatus,
    CouponCode,
    PaymentMethod,
    ShippingAddress,
    ShippingMethod,
    ShippingOption,
)

# Importa modelos do ERP (database.py)
from .database import (  # Blog; Gamificação; CRM; Financeiro; Mídia; Newsletter; RH; Fornecedores; Clientes expandido; Cursos; Enums
    Benefit,
    BlogPost,
    Campaign,
    Contact,
    Course,
    CoursePurchase,
    Customer,
    CustomerAddress,
    CustomerContact,
    CustomerDocument,
    CustomerHistory,
    CustomerSegment,
    CustomerSegmentMembership,
    CustomerType,
    CustomerTypeEnum,
    Department,
    Employee,
    EmployeeBenefit,
    FinancialAccount,
    FinancialTransaction,
    GamificationLevel,
    Lead,
    MediaFile,
    NewsletterCampaign,
    NewsletterSubscriber,
    NewsletterTemplate,
    OrderStatusEnum,
    PaymentMethodEnum,
    PaymentStatusEnum,
    Payroll,
    Position,
    PurchaseOrder,
    PurchaseOrderItem,
    Supplier,
    SupplierContact,
    SupplierProduct,
    TimeCard,
    UserPoints,
    UserRole,
)

# Importa modelos do Melhor Envio
from .melhor_envio import (
    EnvioMelhorEnvio,
    FreteCalculado,
    MelhorEnvioConfig,
    RastreamentoEnvio,
)
from .orders import Cart, CartItem, Order, OrderItem, OrderStatus, Payment
from .products import (
    Category,
    Product,
    ProductImage,
    Review,
    ReviewHelpful,
    ReviewResponse,
)

# Importa modelos de estoque
from .stock import (
    InventoryCount,
    MovementType,
    ProductBatch,
    StockAlert,
    StockLocation,
    StockMovement,
)

# Importa modelos principais
from .user import User

# Importa modelos de wishlist
from .wishlist import Wishlist, WishlistItem

# Lista de todos os modelos para facilitar importação
__all__ = [
    'db',
    # Modelos principais
    'User',
    'Category',
    'Product', 
    'ProductImage',
    'Review',
    'ReviewHelpful',
    'ReviewResponse',
    'Order',
    'OrderItem',
    'Cart',
    'CartItem',
    'Payment',
    'OrderStatus',
    
    # Modelos de checkout
    'CheckoutSession',
    'ShippingAddress',
    'ShippingOption',
    'CouponCode',
    'CheckoutEvent',
    'CheckoutStatus',
    'PaymentMethod',
    'ShippingMethod',
    
    # Modelos de estoque
    'StockMovement',
    'StockAlert',
    'ProductBatch',
    'InventoryCount',
    'StockLocation',
    'MovementType',
    
    # Modelos de wishlist
    'Wishlist',
    'WishlistItem',
    
    # Modelos do Melhor Envio
    'MelhorEnvioConfig',
    'FreteCalculado',
    'EnvioMelhorEnvio',
    'RastreamentoEnvio',
    
    # Modelos ERP
    'BlogPost',
    'GamificationLevel',
    'UserPoints',
    'Customer',
    'Lead',
    'Campaign',
    'Contact',
    'CustomerSegment',
    'CustomerSegmentMembership',
    'FinancialAccount',
    'FinancialTransaction',
    'MediaFile',
    'NewsletterSubscriber',
    'NewsletterTemplate',
    'NewsletterCampaign',
    'Employee',
    'Department',
    'Position',
    'Payroll',
    'TimeCard',
    'Benefit',
    'EmployeeBenefit',
    'Supplier',
    'SupplierContact',
    'SupplierProduct',
    'PurchaseOrder',
    'PurchaseOrderItem',
    'CustomerType',
    'CustomerDocument',
    'CustomerAddress',
    'CustomerContact',
    'CustomerHistory',
    'Course',
    'CoursePurchase',
    
    # Enums
    'UserRole',
    'CustomerTypeEnum',
    'OrderStatusEnum',
    'PaymentStatusEnum',
    'PaymentMethodEnum'
]