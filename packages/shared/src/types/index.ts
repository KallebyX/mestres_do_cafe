/**
 * Tipos TypeScript compartilhados para todo o sistema Mestres do Café
 */

// ============================================================================
// TIPOS BASE
// ============================================================================

export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface TimestampedEntity {
  created_at: string;
  updated_at: string;
}

export interface SoftDeletableEntity extends TimestampedEntity {
  deleted_at?: string | null;
}

// ============================================================================
// TIPOS DE USUÁRIO
// ============================================================================

export type UserRole = 'customer' | 'admin' | 'manager' | 'employee';

export interface User extends BaseEntity {
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  email_verified: boolean;
  profile_image?: string;
  birth_date?: string;
  gender?: 'M' | 'F' | 'O';
  preferences?: UserPreferences;
}

export interface UserPreferences {
  newsletter: boolean;
  notifications: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  currency: string;
  timezone: string;
}

export interface UserProfile {
  user_id: number;
  bio?: string;
  website?: string;
  social_links?: SocialLinks;
  address?: Address;
  preferences: UserPreferences;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
}

// ============================================================================
// TIPOS DE PRODUTO
// ============================================================================

export type ProductStatus = 'active' | 'inactive' | 'draft' | 'archived';
export type ProductType = 'coffee' | 'equipment' | 'accessory' | 'course';

export interface Product extends BaseEntity {
  name: string;
  description: string;
  short_description?: string;
  price: number;
  compare_price?: number;
  cost_price?: number;
  sku: string;
  barcode?: string;
  weight: number;
  dimensions?: ProductDimensions;
  category_id: number;
  brand_id?: number;
  status: ProductStatus;
  type: ProductType;
  stock_quantity: number;
  min_stock_level: number;
  max_stock_level?: number;
  is_featured: boolean;
  is_digital: boolean;
  requires_shipping: boolean;
  tags?: string[];
  images?: ProductImage[];
  variants?: ProductVariant[];
  attributes?: ProductAttribute[];
  seo?: SEOData;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in';
}

export interface ProductImage {
  id: number;
  url: string;
  alt_text?: string;
  position: number;
  is_primary: boolean;
}

export interface ProductVariant {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock_quantity: number;
  attributes: Record<string, string>;
}

export interface ProductAttribute {
  name: string;
  value: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  is_variant: boolean;
}

export interface Category extends BaseEntity {
  name: string;
  description?: string;
  slug: string;
  parent_id?: number;
  image?: string;
  is_active: boolean;
  sort_order: number;
  seo?: SEOData;
}

export interface Brand extends BaseEntity {
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  is_active: boolean;
}

// ============================================================================
// TIPOS DE PEDIDO
// ============================================================================

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'refunded';

export type PaymentStatus = 
  | 'pending' 
  | 'paid' 
  | 'failed' 
  | 'refunded' 
  | 'partially_refunded';

export type PaymentMethod = 
  | 'credit_card' 
  | 'debit_card' 
  | 'pix' 
  | 'boleto' 
  | 'paypal';

export interface Order extends BaseEntity {
  order_number: string;
  user_id: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  notes?: string;
  shipping_address: Address;
  billing_address?: Address;
  items: OrderItem[];
  payments?: Payment[];
  shipments?: Shipment[];
  timeline?: OrderTimeline[];
}

export interface OrderItem {
  id: number;
  product_id: number;
  variant_id?: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_name: string;
  product_sku: string;
  product_image?: string;
}

export interface Payment {
  id: number;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transaction_id?: string;
  gateway_response?: Record<string, any>;
  processed_at?: string;
}

export interface Shipment {
  id: number;
  tracking_number?: string;
  carrier?: string;
  shipped_at?: string;
  delivered_at?: string;
  items: ShipmentItem[];
}

export interface ShipmentItem {
  order_item_id: number;
  quantity: number;
}

export interface OrderTimeline {
  id: number;
  status: OrderStatus;
  message: string;
  created_at: string;
  created_by?: number;
}

// ============================================================================
// TIPOS DE ENDEREÇO
// ============================================================================

export interface Address {
  id?: number;
  type?: 'shipping' | 'billing' | 'home' | 'work';
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default?: boolean;
}

// ============================================================================
// TIPOS DE CARRINHO
// ============================================================================

export interface CartItem {
  id: number;
  product_id: number;
  variant_id?: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  product: Pick<Product, 'name' | 'images' | 'sku'>;
}

export interface Cart {
  id: number;
  user_id?: number;
  session_id?: string;
  items: CartItem[];
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  expires_at?: string;
}

// ============================================================================
// TIPOS DE DESCONTO
// ============================================================================

export type DiscountType = 'percentage' | 'fixed_amount' | 'free_shipping';
export type DiscountTarget = 'order' | 'product' | 'category' | 'shipping';

export interface Discount extends BaseEntity {
  code: string;
  name: string;
  description?: string;
  type: DiscountType;
  value: number;
  target: DiscountTarget;
  minimum_amount?: number;
  maximum_discount?: number;
  usage_limit?: number;
  usage_count: number;
  user_usage_limit?: number;
  starts_at: string;
  ends_at?: string;
  is_active: boolean;
  applicable_products?: number[];
  applicable_categories?: number[];
}

// ============================================================================
// TIPOS DE BLOG
// ============================================================================

export type PostStatus = 'draft' | 'published' | 'archived';

export interface BlogPost extends BaseEntity {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  author_id: number;
  category_id?: number;
  status: PostStatus;
  published_at?: string;
  tags?: string[];
  seo?: SEOData;
  reading_time?: number;
  view_count: number;
}

export interface BlogCategory extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  is_active: boolean;
}

// ============================================================================
// TIPOS DE CURSO
// ============================================================================

export type CourseStatus = 'draft' | 'published' | 'archived';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Course extends BaseEntity {
  title: string;
  slug: string;
  description: string;
  short_description?: string;
  featured_image?: string;
  instructor_id: number;
  category_id?: number;
  status: CourseStatus;
  level: CourseLevel;
  price: number;
  duration_hours: number;
  max_students?: number;
  enrolled_count: number;
  rating: number;
  review_count: number;
  tags?: string[];
  lessons?: Lesson[];
  seo?: SEOData;
}

export interface Lesson extends BaseEntity {
  title: string;
  description?: string;
  content: string;
  video_url?: string;
  duration_minutes: number;
  position: number;
  is_free: boolean;
  course_id: number;
}

export interface CourseEnrollment extends BaseEntity {
  user_id: number;
  course_id: number;
  enrolled_at: string;
  completed_at?: string;
  progress_percentage: number;
  last_accessed_at?: string;
}

// ============================================================================
// TIPOS DE FÓRUM
// ============================================================================

export interface ForumCategory extends BaseEntity {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  position: number;
  is_active: boolean;
  topic_count: number;
  post_count: number;
  last_post_at?: string;
}

export interface ForumTopic extends BaseEntity {
  title: string;
  content: string;
  author_id: number;
  category_id: number;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  reply_count: number;
  last_reply_at?: string;
  last_reply_by?: number;
  tags?: string[];
}

export interface ForumPost extends BaseEntity {
  content: string;
  author_id: number;
  topic_id: number;
  parent_id?: number;
  is_solution: boolean;
  like_count: number;
  edited_at?: string;
  edited_by?: number;
}

// ============================================================================
// TIPOS DE GAMIFICAÇÃO
// ============================================================================

export interface Achievement extends BaseEntity {
  name: string;
  description: string;
  icon: string;
  points: number;
  badge_color: string;
  criteria: Record<string, any>;
  is_active: boolean;
}

export interface UserAchievement extends BaseEntity {
  user_id: number;
  achievement_id: number;
  earned_at: string;
  progress?: number;
}

export interface UserPoints extends BaseEntity {
  user_id: number;
  total_points: number;
  available_points: number;
  level: number;
  next_level_points: number;
}

// ============================================================================
// TIPOS DE ANALYTICS
// ============================================================================

export interface AnalyticsEvent {
  id: string;
  event_type: string;
  user_id?: number;
  session_id: string;
  properties: Record<string, any>;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
}

export interface MetricData {
  metric: string;
  value: number;
  timestamp: string;
  dimensions?: Record<string, string>;
}

// ============================================================================
// TIPOS DE SEO
// ============================================================================

export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string[];
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  canonical_url?: string;
  robots?: string;
}

// ============================================================================
// TIPOS DE API
// ============================================================================

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  meta?: ResponseMeta;
}

export interface APIError {
  code: number;
  message: string;
  details?: Record<string, any>;
  error_id?: string;
  timestamp: string;
}

export interface ResponseMeta {
  page?: number;
  per_page?: number;
  total?: number;
  total_pages?: number;
  has_next?: boolean;
  has_prev?: boolean;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  category_id?: number;
  brand_id?: number;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  is_featured?: boolean;
  tags?: string[];
}

// ============================================================================
// TIPOS DE CONFIGURAÇÃO
// ============================================================================

export interface AppConfig {
  app_name: string;
  app_version: string;
  environment: 'development' | 'staging' | 'production';
  debug: boolean;
  api_url: string;
  cdn_url?: string;
  features: FeatureFlags;
  integrations: IntegrationConfig;
  limits: AppLimits;
}

export interface FeatureFlags {
  enable_registration: boolean;
  enable_guest_checkout: boolean;
  enable_reviews: boolean;
  enable_wishlist: boolean;
  enable_blog: boolean;
  enable_forum: boolean;
  enable_courses: boolean;
  enable_gamification: boolean;
  enable_analytics: boolean;
  enable_notifications: boolean;
}

export interface IntegrationConfig {
  payment_gateways: PaymentGatewayConfig[];
  shipping_providers: ShippingProviderConfig[];
  email_service: EmailServiceConfig;
  sms_service?: SMSServiceConfig;
  analytics_service?: AnalyticsServiceConfig;
}

export interface PaymentGatewayConfig {
  name: string;
  enabled: boolean;
  test_mode: boolean;
  config: Record<string, any>;
}

export interface ShippingProviderConfig {
  name: string;
  enabled: boolean;
  config: Record<string, any>;
}

export interface EmailServiceConfig {
  provider: string;
  config: Record<string, any>;
}

export interface SMSServiceConfig {
  provider: string;
  config: Record<string, any>;
}

export interface AnalyticsServiceConfig {
  provider: string;
  config: Record<string, any>;
}

export interface AppLimits {
  max_cart_items: number;
  max_file_size_mb: number;
  max_images_per_product: number;
  session_timeout_minutes: number;
  rate_limit_requests_per_minute: number;
}

// ============================================================================
// TIPOS DE NOTIFICAÇÃO
// ============================================================================

export type NotificationType = 
  | 'order_confirmed'
  | 'order_shipped'
  | 'order_delivered'
  | 'payment_received'
  | 'stock_low'
  | 'new_message'
  | 'course_enrolled'
  | 'achievement_earned';

export interface Notification extends BaseEntity {
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  read_at?: string;
  action_url?: string;
}

// ============================================================================
// TIPOS DE ARQUIVO
// ============================================================================

export interface FileUpload {
  id: number;
  filename: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  url: string;
  thumbnail_url?: string;
  uploaded_by: number;
  uploaded_at: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// TIPOS DE VALIDAÇÃO
// ============================================================================

export interface ValidationRule {
  field: string;
  rules: string[];
  message?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// ============================================================================
// TIPOS DE EVENTO
// ============================================================================

export interface DomainEvent {
  id: string;
  type: string;
  aggregate_id: string;
  aggregate_type: string;
  data: Record<string, any>;
  metadata: EventMetadata;
  occurred_at: string;
}

export interface EventMetadata {
  user_id?: number;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  correlation_id?: string;
  causation_id?: string;
}

// ============================================================================
// EXPORTS
// ============================================================================

export * from './api';
export * from './auth';
export * from './common';

