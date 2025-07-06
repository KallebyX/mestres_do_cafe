from models.base import db
from datetime import datetime
import uuid
from enum import Enum
import json

# ===== ENUMS =====

class UserRole(Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    EMPLOYEE = "employee"
    CUSTOMER = "customer"

class CustomerTypeEnum(Enum):
    PF = "pf"  # Pessoa Física
    PJ = "pj"  # Pessoa Jurídica

class OrderStatusEnum(Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PREPARING = "preparing"
    READY = "ready"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class PaymentStatusEnum(Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"

class PaymentMethodEnum(Enum):
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    PIX = "pix"
    BANK_TRANSFER = "bank_transfer"
    CASH = "cash"

# Modelo de Usuários removido - usando models/user.py

# Modelo de Produtos removido - usando models/products.py

# Modelos de Pedidos removidos - usando models/orders.py

# Modelo de Posts do Blog
class BlogPost(db.Model):
    __tablename__ = 'blog_posts'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(255), nullable=False)
    slug = db.Column(db.String(255), unique=True, nullable=False)
    content = db.Column(db.Text, nullable=False)
    excerpt = db.Column(db.Text)
    image_url = db.Column(db.String(500))
    author_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    category = db.Column(db.String(100))
    tags = db.Column(db.String(500))
    is_published = db.Column(db.Boolean, default=False)
    published_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    author = db.relationship('User', backref='blog_posts')

# Modelo de Níveis de Gamificação
class GamificationLevel(db.Model):
    __tablename__ = 'gamification_levels'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    min_points = db.Column(db.Integer, nullable=False)
    max_points = db.Column(db.Integer)
    discount_percentage = db.Column(db.Integer, default=0)
    benefits = db.Column(db.Text)
    color = db.Column(db.String(20))
    icon = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Modelo de Pontos do Usuário
class UserPoints(db.Model):
    __tablename__ = 'user_points'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    points = db.Column(db.Integer, nullable=False)
    action = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref='points_history')

# Modelo de Categorias removido - usando models/products.py

# ===========================================
# MODELOS CRM EXPANDIDO
# ===========================================

# Modelo de Clientes (CRM)
class Customer(db.Model):
    __tablename__ = 'customers'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True)
    
    # Dados pessoais
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    cpf_cnpj = db.Column(db.String(20))
    birth_date = db.Column(db.Date)
    
    # Endereço
    address_street = db.Column(db.String(255))
    address_number = db.Column(db.String(20))
    address_complement = db.Column(db.String(100))
    address_neighborhood = db.Column(db.String(100))
    address_city = db.Column(db.String(100))
    address_state = db.Column(db.String(2))
    address_cep = db.Column(db.String(10))
    
    # Informações comerciais
    customer_type = db.Column(db.Enum(CustomerTypeEnum), nullable=False)
    company_name = db.Column(db.String(255))
    source = db.Column(db.String(100))  # De onde veio o cliente
    status = db.Column(db.String(50), default='active')  # active, inactive, blocked
    
    # Métricas
    total_orders = db.Column(db.Integer, default=0)
    total_spent = db.Column(db.Numeric(10, 2), default=0.00)
    avg_order_value = db.Column(db.Numeric(10, 2), default=0.00)
    last_order_date = db.Column(db.DateTime)
    acquisition_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Newsletter
    is_subscribed = db.Column(db.Boolean, default=True)
    preferences = db.Column(db.Text)  # JSON com preferências de newsletter
    
    # Relacionamentos
    user = db.relationship('User', backref='customer_profile')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Modelo de Leads
class Lead(db.Model):
    __tablename__ = 'leads'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20))
    
    # Informações do lead
    source = db.Column(db.String(100))  # website, social_media, referral, etc
    status = db.Column(db.String(50), default='new')  # new, contacted, qualified, converted, lost
    interest_level = db.Column(db.String(20))  # low, medium, high
    
    # Dados comerciais
    estimated_value = db.Column(db.Numeric(10, 2))
    conversion_probability = db.Column(db.Integer)  # 0-100%
    
    # Relacionamento
    assigned_to = db.Column(db.String(36), db.ForeignKey('users.id'))
    customer_id = db.Column(db.String(36), db.ForeignKey('customers.id'))  # Se convertido
    
    # Observações
    notes = db.Column(db.Text)
    
    # Datas importantes
    last_contact_date = db.Column(db.DateTime)
    next_follow_up_date = db.Column(db.DateTime)
    converted_at = db.Column(db.DateTime)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    assigned_user = db.relationship('User', backref='assigned_leads')
    customer = db.relationship('Customer', backref='original_lead')

# Modelo de Campanhas
class Campaign(db.Model):
    __tablename__ = 'campaigns'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    
    # Configurações da campanha
    type = db.Column(db.String(50))  # email, whatsapp, sms, push
    status = db.Column(db.String(50), default='draft')  # draft, active, paused, completed
    
    # Datas
    start_date = db.Column(db.DateTime)
    end_date = db.Column(db.DateTime)
    
    # Métricas
    total_recipients = db.Column(db.Integer, default=0)
    sent_count = db.Column(db.Integer, default=0)
    delivered_count = db.Column(db.Integer, default=0)
    opened_count = db.Column(db.Integer, default=0)
    clicked_count = db.Column(db.Integer, default=0)
    converted_count = db.Column(db.Integer, default=0)
    
    # Configurações de conteúdo
    subject = db.Column(db.String(255))
    content = db.Column(db.Text)
    template_id = db.Column(db.String(36))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Modelo de Contatos/Interações
class Contact(db.Model):
    __tablename__ = 'contacts'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = db.Column(db.String(36), db.ForeignKey('customers.id'))
    lead_id = db.Column(db.String(36), db.ForeignKey('leads.id'))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'))  # Quem fez o contato
    
    # Detalhes do contato
    type = db.Column(db.String(50), nullable=False)  # call, email, whatsapp, meeting, note
    subject = db.Column(db.String(255))
    description = db.Column(db.Text)
    
    # Status e resultado
    outcome = db.Column(db.String(100))
    next_action = db.Column(db.String(255))
    follow_up_date = db.Column(db.DateTime)
    
    # Arquivos anexos
    attachments = db.Column(db.Text)  # JSON array de URLs
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    customer = db.relationship('Customer', backref='contacts')
    lead = db.relationship('Lead', backref='contacts')
    user = db.relationship('User', backref='customer_contacts')

# Modelo de Segmentação de Clientes
class CustomerSegment(db.Model):
    __tablename__ = 'customer_segments'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    
    # Critérios de segmentação
    criteria = db.Column(db.Text)  # JSON com os critérios
    
    # Configurações
    is_active = db.Column(db.Boolean, default=True)
    auto_update = db.Column(db.Boolean, default=True)
    
    # Métricas
    customer_count = db.Column(db.Integer, default=0)
    avg_order_value = db.Column(db.Numeric(10, 2), default=0.00)
    total_revenue = db.Column(db.Numeric(10, 2), default=0.00)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Modelo de Relacionamento Customer-Segment (Many-to-Many)
class CustomerSegmentMembership(db.Model):
    __tablename__ = 'customer_segment_memberships'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = db.Column(db.String(36), db.ForeignKey('customers.id'), nullable=False)
    segment_id = db.Column(db.String(36), db.ForeignKey('customer_segments.id'), nullable=False)
    
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    customer = db.relationship('Customer', backref='segment_memberships')
    segment = db.relationship('CustomerSegment', backref='customer_memberships')

# ===========================================
# MODELOS ERP FINANCEIRO
# ===========================================

# Modelo de Contas Financeiras
class FinancialAccount(db.Model):
    __tablename__ = 'financial_accounts'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # bank, cash, credit_card, receivable, payable
    balance = db.Column(db.Numeric(10, 2), default=0.00)
    is_active = db.Column(db.Boolean, default=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Modelo de Transações Financeiras
class FinancialTransaction(db.Model):
    __tablename__ = 'financial_transactions'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    account_id = db.Column(db.String(36), db.ForeignKey('financial_accounts.id'), nullable=False)
    
    # Detalhes da transação
    type = db.Column(db.String(50), nullable=False)  # income, expense, transfer
    category = db.Column(db.String(100))
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    description = db.Column(db.String(255))
    
    # Referências
    order_id = db.Column(db.String(36), db.ForeignKey('orders.id'))
    customer_id = db.Column(db.String(36), db.ForeignKey('customers.id'))
    
    # Datas
    transaction_date = db.Column(db.DateTime, nullable=False)
    due_date = db.Column(db.DateTime)
    paid_date = db.Column(db.DateTime)
    
    # Status
    status = db.Column(db.String(50), default='pending')  # pending, paid, overdue, cancelled
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    account = db.relationship('FinancialAccount', backref='transactions')
    order = db.relationship('Order', backref='financial_transactions')
    customer = db.relationship('Customer', backref='transactions')

# ===========================================
# MODELOS DE GESTÃO DE ARQUIVO
# ===========================================

# Modelo de Arquivos/Mídias
class MediaFile(db.Model):
    __tablename__ = 'media_files'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_url = db.Column(db.String(500))
    
    # Metadados
    file_size = db.Column(db.Integer)
    file_type = db.Column(db.String(50))
    mime_type = db.Column(db.String(100))
    
    # Relacionamentos
    product_id = db.Column(db.String(36), db.ForeignKey('products.id'))
    blog_post_id = db.Column(db.String(36), db.ForeignKey('blog_posts.id'))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    product = db.relationship('Product', backref='media_files')
    blog_post = db.relationship('BlogPost', backref='media_files')

# ===========================================
# MODELOS DE PAGAMENTO - removido, usando models/orders.py
# ===========================================

# ===========================================
# MODELOS DE NEWSLETTER AVANÇADO
# ===========================================

# Modelo de Inscritos na Newsletter
class NewsletterSubscriber(db.Model):
    __tablename__ = 'newsletter_subscribers'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(255), unique=True, nullable=False)
    name = db.Column(db.String(255))
    phone = db.Column(db.String(20))
    is_subscribed = db.Column(db.Boolean, default=True)
    preferences = db.Column(db.Text)  # JSON com preferências
    
    # Métricas de engajamento
    total_emails_received = db.Column(db.Integer, default=0)
    total_emails_opened = db.Column(db.Integer, default=0)
    total_emails_clicked = db.Column(db.Integer, default=0)
    last_email_sent = db.Column(db.DateTime)
    last_email_opened = db.Column(db.DateTime)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Modelo de Templates de Newsletter
class NewsletterTemplate(db.Model):
    __tablename__ = 'newsletter_templates'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False)
    subject = db.Column(db.String(255), nullable=False)
    html_content = db.Column(db.Text, nullable=False)
    text_content = db.Column(db.Text)  # Versão texto plano
    type = db.Column(db.String(50), default='newsletter')  # newsletter, welcome, promotion, etc
    variables = db.Column(db.Text)  # JSON com variáveis disponíveis
    is_active = db.Column(db.Boolean, default=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Modelo de Campanhas de Newsletter
class NewsletterCampaign(db.Model):
    __tablename__ = 'newsletter_campaigns'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False)
    subject = db.Column(db.String(255), nullable=False)
    template_id = db.Column(db.String(36), db.ForeignKey('newsletter_templates.id'), nullable=False)
    
    # Configurações da campanha
    status = db.Column(db.String(50), default='draft')  # draft, scheduled, sent, cancelled
    type = db.Column(db.String(50), default='newsletter')  # newsletter, promotion, announcement
    
    # Segmentação
    segment_criteria = db.Column(db.Text)  # JSON com critérios de segmentação
    
    # Agendamento
    scheduled_at = db.Column(db.DateTime)
    sent_at = db.Column(db.DateTime)
    
    # Métricas
    total_sent = db.Column(db.Integer, default=0)
    total_opened = db.Column(db.Integer, default=0)
    total_clicked = db.Column(db.Integer, default=0)
    total_bounced = db.Column(db.Integer, default=0)
    total_unsubscribed = db.Column(db.Integer, default=0)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    template = db.relationship('NewsletterTemplate', backref='campaigns')

# ===========================================
# MODELOS DE RECURSOS HUMANOS (RH)
# ===========================================

# Modelo de Funcionários
class Employee(db.Model):
    __tablename__ = 'employees'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True)
    
    # Dados pessoais
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    cpf = db.Column(db.String(14), unique=True, nullable=False)
    rg = db.Column(db.String(20))
    birth_date = db.Column(db.Date, nullable=False)
    gender = db.Column(db.String(20))
    marital_status = db.Column(db.String(20))
    
    # Endereço
    address_street = db.Column(db.String(255))
    address_number = db.Column(db.String(20))
    address_complement = db.Column(db.String(100))
    address_neighborhood = db.Column(db.String(100))
    address_city = db.Column(db.String(100))
    address_state = db.Column(db.String(2))
    address_cep = db.Column(db.String(10))
    
    # Dados profissionais
    position = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100))
    hire_date = db.Column(db.Date, nullable=False)
    termination_date = db.Column(db.Date)
    salary = db.Column(db.Numeric(10, 2))
    employment_type = db.Column(db.String(50))  # CLT, PJ, Estagiário, etc
    status = db.Column(db.String(50), default='active')  # active, inactive, terminated
    
    # Dados bancários
    bank_name = db.Column(db.String(100))
    bank_agency = db.Column(db.String(20))
    bank_account = db.Column(db.String(20))
    bank_account_type = db.Column(db.String(20))
    
    # Dados de emergência
    emergency_contact_name = db.Column(db.String(255))
    emergency_contact_phone = db.Column(db.String(20))
    emergency_contact_relationship = db.Column(db.String(50))
    
    # Relacionamentos
    user = db.relationship('User', backref='employee_profile')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Modelo de Departamentos
class Department(db.Model):
    __tablename__ = 'departments'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    manager_id = db.Column(db.String(36), db.ForeignKey('employees.id'))
    budget = db.Column(db.Numeric(10, 2))
    is_active = db.Column(db.Boolean, default=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    manager = db.relationship('Employee', backref='managed_departments')

# Modelo de Cargos
class Position(db.Model):
    __tablename__ = 'positions'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    department_id = db.Column(db.String(36), db.ForeignKey('departments.id'))
    base_salary = db.Column(db.Numeric(10, 2))
    requirements = db.Column(db.Text)
    responsibilities = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    department = db.relationship('Department', backref='positions')

# Modelo de Folha de Pagamento
class Payroll(db.Model):
    __tablename__ = 'payroll'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id = db.Column(db.String(36), db.ForeignKey('employees.id'), nullable=False)
    
    # Período
    month = db.Column(db.Integer, nullable=False)
    year = db.Column(db.Integer, nullable=False)
    
    # Valores
    base_salary = db.Column(db.Numeric(10, 2), nullable=False)
    overtime_hours = db.Column(db.Numeric(5, 2), default=0)
    overtime_value = db.Column(db.Numeric(10, 2), default=0)
    bonus = db.Column(db.Numeric(10, 2), default=0)
    deductions = db.Column(db.Numeric(10, 2), default=0)
    net_salary = db.Column(db.Numeric(10, 2), nullable=False)
    
    # Status
    status = db.Column(db.String(50), default='pending')  # pending, calculated, paid
    payment_date = db.Column(db.Date)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    employee = db.relationship('Employee', backref='payroll_records')

# Modelo de Ponto Eletrônico
class TimeCard(db.Model):
    __tablename__ = 'time_cards'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id = db.Column(db.String(36), db.ForeignKey('employees.id'), nullable=False)
    
    # Data e horários
    date = db.Column(db.Date, nullable=False)
    entry_time = db.Column(db.Time)
    exit_time = db.Column(db.Time)
    lunch_start = db.Column(db.Time)
    lunch_end = db.Column(db.Time)
    
    # Cálculos
    total_hours = db.Column(db.Numeric(5, 2))
    overtime_hours = db.Column(db.Numeric(5, 2), default=0)
    
    # Status
    status = db.Column(db.String(50), default='pending')  # pending, approved, rejected
    notes = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    employee = db.relationship('Employee', backref='time_cards')

# Modelo de Benefícios
class Benefit(db.Model):
    __tablename__ = 'benefits'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    type = db.Column(db.String(50))  # health, dental, meal, transport, etc
    value = db.Column(db.Numeric(10, 2))
    percentage = db.Column(db.Numeric(5, 2))  # Se for percentual do salário
    is_active = db.Column(db.Boolean, default=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Modelo de Benefícios do Funcionário
class EmployeeBenefit(db.Model):
    __tablename__ = 'employee_benefits'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id = db.Column(db.String(36), db.ForeignKey('employees.id'), nullable=False)
    benefit_id = db.Column(db.String(36), db.ForeignKey('benefits.id'), nullable=False)
    
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date)
    value = db.Column(db.Numeric(10, 2))
    is_active = db.Column(db.Boolean, default=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    employee = db.relationship('Employee', backref='benefits')
    benefit = db.relationship('Benefit', backref='employee_benefits')

# ===========================================
# MODELOS DE FORNECEDORES
# ===========================================

# Modelo de Fornecedores
class Supplier(db.Model):
    __tablename__ = 'suppliers'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Dados básicos
    name = db.Column(db.String(255), nullable=False)
    company_name = db.Column(db.String(255))
    cnpj = db.Column(db.String(18), unique=True)
    cpf = db.Column(db.String(14), unique=True)
    ie = db.Column(db.String(20))  # Inscrição Estadual
    im = db.Column(db.String(20))  # Inscrição Municipal
    
    # Contato
    email = db.Column(db.String(255))
    phone = db.Column(db.String(20))
    website = db.Column(db.String(255))
    
    # Endereço
    address_street = db.Column(db.String(255))
    address_number = db.Column(db.String(20))
    address_complement = db.Column(db.String(100))
    address_neighborhood = db.Column(db.String(100))
    address_city = db.Column(db.String(100))
    address_state = db.Column(db.String(2))
    address_cep = db.Column(db.String(10))
    
    # Informações comerciais
    supplier_type = db.Column(db.String(50))  # manufacturer, distributor, service, etc
    category = db.Column(db.String(100))  # café, embalagens, equipamentos, etc
    payment_terms = db.Column(db.String(100))  # 30/60/90 dias, etc
    credit_limit = db.Column(db.Numeric(10, 2))
    current_balance = db.Column(db.Numeric(10, 2), default=0.00)
    
    # Status
    status = db.Column(db.String(50), default='active')  # active, inactive, blocked
    rating = db.Column(db.Integer)  # 1-5 estrelas
    notes = db.Column(db.Text)
    
    # Datas
    registration_date = db.Column(db.DateTime, default=datetime.utcnow)
    last_order_date = db.Column(db.DateTime)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Modelo de Contatos do Fornecedor
class SupplierContact(db.Model):
    __tablename__ = 'supplier_contacts'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    supplier_id = db.Column(db.String(36), db.ForeignKey('suppliers.id'), nullable=False)
    
    name = db.Column(db.String(255), nullable=False)
    position = db.Column(db.String(100))
    email = db.Column(db.String(255))
    phone = db.Column(db.String(20))
    is_primary = db.Column(db.Boolean, default=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    supplier = db.relationship('Supplier', backref='contacts')

# Modelo de Produtos do Fornecedor
class SupplierProduct(db.Model):
    __tablename__ = 'supplier_products'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    supplier_id = db.Column(db.String(36), db.ForeignKey('suppliers.id'), nullable=False)
    product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False)
    
    supplier_product_code = db.Column(db.String(100))
    supplier_product_name = db.Column(db.String(255))
    unit_price = db.Column(db.Numeric(10, 2))
    minimum_order_quantity = db.Column(db.Integer, default=1)
    lead_time_days = db.Column(db.Integer)
    is_preferred = db.Column(db.Boolean, default=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    supplier = db.relationship('Supplier', backref='products')
    product = db.relationship('Product', backref='supplier_products')

# Modelo de Pedidos de Compra
class PurchaseOrder(db.Model):
    __tablename__ = 'purchase_orders'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    supplier_id = db.Column(db.String(36), db.ForeignKey('suppliers.id'), nullable=False)
    employee_id = db.Column(db.String(36), db.ForeignKey('employees.id'), nullable=False)
    
    # Dados do pedido
    order_number = db.Column(db.String(50), unique=True, nullable=False)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(db.Enum(OrderStatusEnum), default=OrderStatusEnum.PENDING)
    
    # Datas
    order_date = db.Column(db.DateTime, nullable=False)
    expected_delivery_date = db.Column(db.Date)
    delivery_date = db.Column(db.Date)
    
    # Informações adicionais
    notes = db.Column(db.Text)
    payment_terms = db.Column(db.String(100))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    supplier = db.relationship('Supplier', backref='purchase_orders')
    employee = db.relationship('Employee', backref='purchase_orders')

# Modelo de Itens do Pedido de Compra
class PurchaseOrderItem(db.Model):
    __tablename__ = 'purchase_order_items'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    purchase_order_id = db.Column(db.String(36), db.ForeignKey('purchase_orders.id'), nullable=False)
    product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False)
    
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    total_price = db.Column(db.Numeric(10, 2), nullable=False)
    
    received_quantity = db.Column(db.Integer, default=0)
    notes = db.Column(db.Text)
    
    # Relacionamentos
    purchase_order = db.relationship('PurchaseOrder', backref='items')
    product = db.relationship('Product', backref='purchase_order_items')

# ===========================================
# EXPANSÃO DO SISTEMA DE CLIENTES
# ===========================================

# Modelo de Tipos de Cliente (PF/CNPJ)
class CustomerType(db.Model):
    __tablename__ = 'customer_types'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(50), nullable=False)  # PF, CNPJ
    description = db.Column(db.Text)
    tax_exemption = db.Column(db.Boolean, default=False)
    requires_document = db.Column(db.Boolean, default=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Modelo de Documentos do Cliente
class CustomerDocument(db.Model):
    __tablename__ = 'customer_documents'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = db.Column(db.String(36), db.ForeignKey('customers.id'), nullable=False)
    
    document_type = db.Column(db.String(50), nullable=False)  # CPF, CNPJ, RG, IE, etc
    document_number = db.Column(db.String(50), nullable=False)
    issuing_authority = db.Column(db.String(100))
    issue_date = db.Column(db.Date)
    expiration_date = db.Column(db.Date)
    is_verified = db.Column(db.Boolean, default=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    customer = db.relationship('Customer', backref='documents')

# Modelo de Endereços do Cliente (múltiplos endereços)
class CustomerAddress(db.Model):
    __tablename__ = 'customer_addresses'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = db.Column(db.String(36), db.ForeignKey('customers.id'), nullable=False)
    
    address_type = db.Column(db.String(50), default='shipping')  # shipping, billing, delivery
    is_default = db.Column(db.Boolean, default=False)
    
    # Endereço
    street = db.Column(db.String(255), nullable=False)
    number = db.Column(db.String(20))
    complement = db.Column(db.String(100))
    neighborhood = db.Column(db.String(100))
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(2), nullable=False)
    cep = db.Column(db.String(10), nullable=False)
    country = db.Column(db.String(100), default='Brasil')
    
    # Informações adicionais
    reference = db.Column(db.String(255))
    notes = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    customer = db.relationship('Customer', backref='addresses')

# Modelo de Contatos do Cliente (múltiplos contatos)
class CustomerContact(db.Model):
    __tablename__ = 'customer_contacts'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = db.Column(db.String(36), db.ForeignKey('customers.id'), nullable=False)
    
    contact_type = db.Column(db.String(50), default='phone')  # phone, email, whatsapp, etc
    contact_value = db.Column(db.String(255), nullable=False)
    is_primary = db.Column(db.Boolean, default=False)
    is_verified = db.Column(db.Boolean, default=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    customer = db.relationship('Customer', backref='contact_info')

# Modelo de Histórico de Cliente
class CustomerHistory(db.Model):
    __tablename__ = 'customer_history'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = db.Column(db.String(36), db.ForeignKey('customers.id'), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'))
    
    action_type = db.Column(db.String(50), nullable=False)  # created, updated, order, contact, etc
    description = db.Column(db.Text)
    old_values = db.Column(db.Text)  # JSON com valores antigos
    new_values = db.Column(db.Text)  # JSON com valores novos
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    customer = db.relationship('Customer', backref='history')
    user = db.relationship('User', backref='customer_history_actions')

# Import stock models to avoid circular imports
from models.stock import StockMovement, StockAlert, ProductBatch, InventoryCount, StockLocation, MovementType

# ===========================================
# MODELOS DE CURSOS
# ===========================================

class Course(db.Model):
    __tablename__ = 'courses'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    instructor = db.Column(db.String(255))
    image_url = db.Column(db.String(500))
    status = db.Column(db.String(50), default='active')  # active, inactive
    start_date = db.Column(db.DateTime)
    end_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class CoursePurchase(db.Model):
    __tablename__ = 'course_purchases'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    course_id = db.Column(db.String(36), db.ForeignKey('courses.id'), nullable=False)
    purchase_date = db.Column(db.DateTime, default=datetime.utcnow)
    price_paid = db.Column(db.Numeric(10, 2), nullable=False)
    # Relacionamentos
    user = db.relationship('User', backref='course_purchases')
    course = db.relationship('Course', backref='purchases')

# ===========================================
# MODELO DE CARRINHO DE COMPRAS - removido, usando models/orders.py
# ===========================================

