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
from .pdv import CashRegister, CashSession, CashMovement, Sale, SaleItem
from .erp import (
    PurchaseRequest,
    PurchaseRequestItem,
    SupplierContract,
    ProductionOrder,
    ProductionMaterial,
    QualityControl,
    MaterialRequirement,
)
from .financial_advanced import (
    AccountsPayable,
    AccountsReceivable,
    CashFlow,
    IncomeStatement,
    BankReconciliation,
    Budget,
)
from .crm_advanced import (
    SalesPipeline,
    PipelineStage,
    Deal,
    DealActivity,
    DealNote,
    SalesFunnel,
    MarketingAutomation,
    LeadScore,
)
from .fiscal import (
    EmpresaEmissora,
    ContadorResponsavel,
    CertificadoDigital,
    SerieFiscal,
    DocumentoFiscal,
    ItemDocumentoFiscal,
    PagamentoDocumentoFiscal,
    EventoDocumentoFiscal,
    CartaCorrecao,
    InutilizacaoNumeracao,
    LogComunicacaoSefaz,
    ConfiguracaoSefaz,
    ContingenciaFiscal,
    AuditoriaFiscal,
)
from .tax import (
    NCMCode,
    CFOPCode,
    ICMSRate,
    ProductTax,
    TaxCalculation,
    TaxExemption,
)

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
    # Reviews
    "Review",
    "ReviewHelpful",
    "ReviewResponse",
    # Pricing
    "ProductPrice",
    # Wishlist
    "Wishlist",
    "WishlistItem",
    "WishlistShare",
    # PDV (Point of Sale)
    "CashRegister",
    "CashSession",
    "CashMovement",
    "Sale",
    "SaleItem",
    # ERP Advanced
    "PurchaseRequest",
    "PurchaseRequestItem",
    "SupplierContract",
    "ProductionOrder",
    "ProductionMaterial",
    "QualityControl",
    "MaterialRequirement",
    # Financial Advanced
    "AccountsPayable",
    "AccountsReceivable",
    "CashFlow",
    "IncomeStatement",
    "BankReconciliation",
    "Budget",
    # CRM Advanced
    "SalesPipeline",
    "PipelineStage",
    "Deal",
    "DealActivity",
    "DealNote",
    "SalesFunnel",
    "MarketingAutomation",
    "LeadScore",
    # Fiscal / NF-e / NFC-e
    "EmpresaEmissora",
    "ContadorResponsavel",
    "CertificadoDigital",
    "SerieFiscal",
    "DocumentoFiscal",
    "ItemDocumentoFiscal",
    "PagamentoDocumentoFiscal",
    "EventoDocumentoFiscal",
    "CartaCorrecao",
    "InutilizacaoNumeracao",
    "LogComunicacaoSefaz",
    "ConfiguracaoSefaz",
    "ContingenciaFiscal",
    "AuditoriaFiscal",
    # Tax
    "NCMCode",
    "CFOPCode",
    "ICMSRate",
    "ProductTax",
    "TaxCalculation",
    "TaxExemption",
]
