"""
Modelos SQLAlchemy para o sistema Mestres do Café
"""

from .auth import User, UserSession
from .blog import BlogPost, BlogComment
from .coupons import Coupon, CouponUsage
from .customers import (
    Contact,
    Customer,
    CustomerAddress,
    CustomerSegment,
    CustomerSegmentMembership,
    Lead,
)
from .financial import FinancialAccount, FinancialTransaction
from .gamification import GamificationLevel, UserPoint, Reward, RewardRedemption
from .hr import (
    Department,
    Position,
    Employee,
    TimeCard,
    Payroll,
    Benefit,
    EmployeeBenefit,
)
from .media import MediaFile
from .newsletter import (
    NewsletterSubscriber,
    NewsletterTemplate,
    NewsletterCampaign,
    Campaign,
)
from .notifications import (
    Notification,
    NotificationLog,
    NotificationSubscription,
    NotificationTemplate,
)
from .orders import AbandonedCart, Cart, CartItem, Order, OrderItem
from .payments import EscrowTransaction, Payment, PaymentDispute, PaymentWebhook, Refund
from .products import (
    InventoryCount,
    InventoryCountItem,
    Product,
    ProductAttribute,
    ProductAttributeValue,
    ProductCategory,
    ProductPrice,
    ProductVariant,
    Review,
    ReviewHelpful,
    ReviewResponse,
    StockAlert,
    StockBatch,
    StockMovement,
)
from .suppliers import PurchaseOrder, PurchaseOrderItem, Supplier
from .system import AuditLog, SystemLog, SystemSetting
from .tenancy import Tenant, TenantSubscription, TenantSettings
from .vendors import Vendor, VendorCommission, VendorOrder, VendorProduct, VendorReview
from .wishlist import Wishlist, WishlistItem, WishlistShare

__all__ = [
    # Auth
    "User",
    "UserSession",
    # Customers & CRM
    "Customer",
    "CustomerAddress",
    "Lead",
    "Contact",
    "CustomerSegment",
    "CustomerSegmentMembership",
    # Products & Stock
    "Product",
    "ProductCategory",
    "ProductVariant",
    "ProductAttribute",
    "ProductAttributeValue",
    "StockBatch",
    "StockMovement",
    "StockAlert",
    "InventoryCount",
    "InventoryCountItem",
    # Orders & Cart
    "Order",
    "OrderItem",
    "Cart",
    "CartItem",
    "AbandonedCart",
    # Payments
    "Payment",
    "Refund",
    "PaymentDispute",
    "EscrowTransaction",
    "PaymentWebhook",
    # Coupons
    "Coupon",
    "CouponUsage",
    # Gamification
    "GamificationLevel",
    "UserPoint",
    "Reward",
    "RewardRedemption",
    # Blog
    "BlogPost",
    "BlogComment",
    # Newsletter & Marketing
    "NewsletterSubscriber",
    "NewsletterTemplate",
    "NewsletterCampaign",
    "Campaign",
    # Notifications
    "Notification",
    "NotificationTemplate",
    "NotificationSubscription",
    "NotificationLog",
    # Media
    "MediaFile",
    # Financial
    "FinancialAccount",
    "FinancialTransaction",
    # HR
    "Employee",
    "Department",
    "Position",
    "Payroll",
    "TimeCard",
    "Benefit",
    "EmployeeBenefit",
    # Suppliers
    "Supplier",
    "PurchaseOrder",
    "PurchaseOrderItem",
    # Vendors & Marketplace
    "Vendor",
    "VendorProduct",
    "VendorOrder",
    "VendorCommission",
    "VendorReview",
    # Multi-tenancy
    "Tenant",
    "TenantSubscription",
    "TenantSettings",
    # System
    "SystemSetting",
    "SystemLog",
    "AuditLog",
]
