"""
Modelos SQLAlchemy para o sistema Mestres do Café
"""

from .auth import User, UserSession
from .customers import Customer, CustomerAddress, Lead, Contact, CustomerSegment, CustomerSegmentMembership
from .products import (
    Product, ProductCategory, ProductVariant, ProductAttribute, ProductAttributeValue,
    StockBatch, StockMovement, StockAlert, InventoryCount, InventoryCountItem
)
from .orders import Order, OrderItem, Cart, CartItem, AbandonedCart
from .payments import Payment, Refund, PaymentWebhook
from .coupons import Coupon, CouponUsage
from .gamification import (
    GamificationLevel, UserPoint, Reward, RewardRedemption,
    Badge, Achievement, UserBadge, UserAchievement, Challenge,
    ChallengeParticipant, UserReward
)
from .blog import (
    BlogPost, BlogComment, BlogCategory, BlogTag, BlogPostTag,
    BlogPostView, BlogPostLike
)
from .newsletter import (
    NewsletterSubscriber, NewsletterTemplate, NewsletterCampaign, Campaign,
    Newsletter
)
from .notifications import (
    Notification, NotificationTemplate, NotificationPreference,
    NotificationQueue
)
from .wishlist import Wishlist, WishlistItem, WishlistShare
from .media import MediaFile
from .financial import FinancialAccount, FinancialTransaction
from .hr import Employee, Department, Position, Payroll, TimeCard, Benefit, EmployeeBenefit
from .system import SystemSetting, SystemLog, AuditLog
from .suppliers import Supplier, PurchaseOrder, PurchaseOrderItem
from .vendors import Vendor, VendorProduct, VendorOrder, VendorCommission, VendorReview

__all__ = [
    # Auth
    'User', 'UserSession',
    
    # Customers & CRM
    'Customer', 'CustomerAddress', 'Lead', 'Contact', 'CustomerSegment', 'CustomerSegmentMembership',
    
    # Products & Stock
    'Product', 'ProductCategory', 'ProductVariant', 'ProductAttribute', 'ProductAttributeValue',
    'StockBatch', 'StockMovement', 'StockAlert', 'InventoryCount', 'InventoryCountItem',
    
    # Orders & Cart
    'Order', 'OrderItem', 'CartItem', 'AbandonedCart',
    
    # Payments
    'Payment', 'Refund', 'PaymentWebhook',
    
    # Coupons
    'Coupon', 'CouponUsage',
    
    # Gamification
    'GamificationLevel', 'UserPoint', 'Reward', 'RewardRedemption',
    
    # Blog
    'BlogPost', 'BlogComment',
    
    # Newsletter & Marketing
    'NewsletterSubscriber', 'NewsletterTemplate', 'NewsletterCampaign', 'Campaign',
    
    # Notifications
    'Notification', 'NotificationTemplate',
    
    # Media
    'MediaFile',
    
    # Financial
    'FinancialAccount', 'FinancialTransaction',
    
    # HR
    'Employee', 'Department', 'Position', 'Payroll', 'TimeCard', 'Benefit', 'EmployeeBenefit',
    
    # Suppliers
    'Supplier', 'PurchaseOrder', 'PurchaseOrderItem',
    
    # Vendors & Marketplace
    'Vendor', 'VendorProduct', 'VendorOrder', 'VendorCommission', 'VendorReview',
    
    # System
    'SystemSetting', 'SystemLog', 'AuditLog'
]