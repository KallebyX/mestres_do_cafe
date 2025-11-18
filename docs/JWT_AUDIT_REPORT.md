# Relatório de Auditoria de JWT

**Data da auditoria**: Tue Nov 18 17:31:34 UTC 2025

## Sumário Executivo

- **Arquivos analisados**: 34
- **Total de endpoints**: 336
- **Protegidos com JWT**: 125 (37.2%)
- **Públicos (by design)**: 24
- **Gaps de segurança**: 187

⚠️ **STATUS**: Gaps de segurança identificados - ação requerida

## Gaps de Segurança Identificados

Total de 187 endpoints sem proteção JWT:

### `get_products()`

- **Path**: `/`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/products_controller.py:173`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_product()`

- **Path**: `/<int:product_id>`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/products_controller.py:180`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `create_product()`

- **Path**: `/`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/products_controller.py:188`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `update_product()`

- **Path**: `/<int:product_id>`
- **Methods**: PUT
- **Arquivo**: `apps/api/src/controllers/products_controller.py:196`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `delete_product()`

- **Path**: `/<int:product_id>`
- **Methods**: DELETE
- **Arquivo**: `apps/api/src/controllers/products_controller.py:204`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `search_products()`

- **Path**: `/search`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/products_controller.py:211`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_featured_products()`

- **Path**: `/featured`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/products_controller.py:218`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_products_by_category()`

- **Path**: `/category/<category>`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/products_controller.py:225`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_low_stock_products()`

- **Path**: `/low-stock`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/products_controller.py:233`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `toggle_product_status()`

- **Path**: `/<int:product_id>/toggle-status`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/products_controller.py:241`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `update_stock()`

- **Path**: `/<int:product_id>/stock`
- **Methods**: PUT
- **Arquivo**: `apps/api/src/controllers/products_controller.py:249`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `bulk_create_products()`

- **Path**: `/bulk`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/products_controller.py:264`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `bulk_update_products()`

- **Path**: `/bulk`
- **Methods**: PUT
- **Arquivo**: `apps/api/src/controllers/products_controller.py:275`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `bulk_delete_products()`

- **Path**: `/bulk`
- **Methods**: DELETE
- **Arquivo**: `apps/api/src/controllers/products_controller.py:286`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_all_reviews()`

- **Path**: `/`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/reviews.py:122`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_product_reviews()`

- **Path**: `/product/<int:product_id>`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/reviews.py:154`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_product_review_stats()`

- **Path**: `/product/<int:product_id>/stats`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/reviews.py:273`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_product_featured_reviews()`

- **Path**: `/product/<int:product_id>/featured`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/reviews.py:633`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_featured_reviews()`

- **Path**: `/featured`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/reviews.py:674`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_product_recent_reviews()`

- **Path**: `/product/<int:product_id>/recent`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/reviews.py:780`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_product_rating_distribution()`

- **Path**: `/product/<int:product_id>/rating-distribution`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/reviews.py:820`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_product_engagement_metrics()`

- **Path**: `/product/<int:product_id>/engagement`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/reviews.py:867`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_enhanced_product_review_stats()`

- **Path**: `/product/<int:product_id>/enhanced-stats`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/reviews.py:918`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_all_reviews()`

- **Path**: `/`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/reviews_simple.py:46`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `test_route()`

- **Path**: `/test`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/reviews_simple.py:67`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_product_review_stats()`

- **Path**: `/product/<product_id>/stats`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/reviews_simple.py:78`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_rating_distribution()`

- **Path**: `/product/<product_id>/rating-distribution`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/reviews_simple.py:123`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_engagement_metrics()`

- **Path**: `/product/<product_id>/engagement`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/reviews_simple.py:167`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_recent_reviews()`

- **Path**: `/product/<product_id>/recent`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/reviews_simple.py:207`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_featured_reviews()`

- **Path**: `/product/<product_id>/featured`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/reviews_simple.py:308`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_product_reviews()`

- **Path**: `/product/<product_id>`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/reviews_simple.py:386`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `add_review()`

- **Path**: `/add`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/reviews_simple.py:505`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_dashboard()`

- **Path**: `/dashboard`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/admin.py:18`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_orders()`

- **Path**: `/orders`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/admin.py:195`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `create_admin_order()`

- **Path**: `/orders`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/admin.py:234`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `update_admin_order()`

- **Path**: `/orders/<order_id>`
- **Methods**: PUT
- **Arquivo**: `apps/api/src/controllers/routes/admin.py:331`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `delete_admin_order()`

- **Path**: `/orders/<order_id>`
- **Methods**: DELETE
- **Arquivo**: `apps/api/src/controllers/routes/admin.py:440`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `update_order_status()`

- **Path**: `/orders/<order_id>/update-status`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/admin.py:477`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_admin_stats()`

- **Path**: `/stats`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/admin.py:541`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_admin_users()`

- **Path**: `/users`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/admin.py:599`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `create_admin_user()`

- **Path**: `/users`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/admin.py:642`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `update_admin_user()`

- **Path**: `/users/<user_id>`
- **Methods**: PUT
- **Arquivo**: `apps/api/src/controllers/routes/admin.py:744`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `delete_admin_user()`

- **Path**: `/users/<user_id>`
- **Methods**: DELETE
- **Arquivo**: `apps/api/src/controllers/routes/admin.py:842`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `toggle_user_status()`

- **Path**: `/users/<user_id>/toggle-status`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/admin.py:875`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `create_admin_product()`

- **Path**: `/products`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/admin.py:1001`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `update_admin_product()`

- **Path**: `/products/<product_id>`
- **Methods**: PUT
- **Arquivo**: `apps/api/src/controllers/routes/admin.py:1166`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `delete_admin_product()`

- **Path**: `/products/<product_id>`
- **Methods**: DELETE
- **Arquivo**: `apps/api/src/controllers/routes/admin.py:1315`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `toggle_product_status()`

- **Path**: `/products/<product_id>/toggle-status`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/admin.py:1348`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `create_admin_blog_post()`

- **Path**: `/blog/posts`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/admin.py:1478`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `update_admin_blog_post()`

- **Path**: `/blog/posts/<post_id>`
- **Methods**: PUT
- **Arquivo**: `apps/api/src/controllers/routes/admin.py:1572`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `delete_admin_blog_post()`

- **Path**: `/blog/posts/<post_id>`
- **Methods**: DELETE
- **Arquivo**: `apps/api/src/controllers/routes/admin.py:1663`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `toggle_blog_post_status()`

- **Path**: `/blog/posts/<post_id>/toggle-status`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/admin.py:1691`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_top_products_revenue()`

- **Path**: `/analytics/top-products-revenue`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/admin.py:1725`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_admin_summary()`

- **Path**: `/summary`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/admin.py:1789`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_customers()`

- **Path**: `/customers`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/admin.py:1837`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_leads()`

- **Path**: `/leads`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/admin.py:1870`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `create_blog_category()`

- **Path**: `/blog/categories`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/admin.py:1941`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `update_blog_category()`

- **Path**: `/blog/categories/<category_id>`
- **Methods**: PUT
- **Arquivo**: `apps/api/src/controllers/routes/admin.py:1995`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `delete_blog_category()`

- **Path**: `/blog/categories/<category_id>`
- **Methods**: DELETE
- **Arquivo**: `apps/api/src/controllers/routes/admin.py:2056`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_dashboard_sales()`

- **Path**: `/dashboard/sales`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/admin.py:2097`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_dashboard_customers()`

- **Path**: `/dashboard/customers`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/admin.py:2176`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_dashboard_financial()`

- **Path**: `/dashboard/financial`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/admin.py:2201`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_admin_analytics()`

- **Path**: `/analytics`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/admin.py:2231`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_sales_analytics()`

- **Path**: `/analytics/sales`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/admin.py:2435`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_customers_analytics()`

- **Path**: `/analytics/customers`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/admin.py:2584`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_order_documents()`

- **Path**: `/orders/<order_id>/documents`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/admin.py:2661`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `track_event()`

- **Path**: `/track`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/analytics.py:9`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `track_batch_events()`

- **Path**: `/track/batch`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/analytics.py:31`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_posts()`

- **Path**: `/posts`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/blog.py:23`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_post()`

- **Path**: `/posts/<post_id>`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/blog.py:81`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_post_by_slug()`

- **Path**: `/posts/slug/<slug>`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/blog.py:103`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `like_post()`

- **Path**: `/posts/<post_id>/like`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/blog.py:301`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_comments()`

- **Path**: `/posts/<post_id>/comments`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/blog.py:326`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_tags()`

- **Path**: `/tags`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/blog.py:478`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_cart_items()`

- **Path**: `/items`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/cart.py:102`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_cart_count()`

- **Path**: `/count`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/cart.py:556`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_all_carts()`

- **Path**: `/admin/all`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/cart.py:585`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_user_cart()`

- **Path**: `/admin/user/<user_id>`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/cart.py:662`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `checkout_home()`

- **Path**: `/`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/checkout.py:27`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `create_checkout_session()`

- **Path**: `/session`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/checkout.py:50`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `validate_checkout()`

- **Path**: `/validate`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/checkout.py:133`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `process_checkout()`

- **Path**: `/process`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/checkout.py:184`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `checkout_success()`

- **Path**: `/success`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/checkout.py:258`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `cancel_checkout()`

- **Path**: `/cancel`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/checkout.py:286`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `start_checkout()`

- **Path**: `/start`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/checkout.py:492`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `validate_cep_route()`

- **Path**: `/validate-cep`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/checkout.py:590`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `calculate_shipping_options()`

- **Path**: `/shipping-options`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/checkout.py:612`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `apply_coupon()`

- **Path**: `/apply-coupon`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/checkout.py:650`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `complete_checkout()`

- **Path**: `/complete`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/checkout.py:706`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_payment_methods()`

- **Path**: `/payment-methods`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/checkout.py:851`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_abandoned_carts()`

- **Path**: `/abandoned-carts`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/checkout.py:900`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_coupons()`

- **Path**: `/`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/coupons.py:12`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `create_coupon()`

- **Path**: `/`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/coupons.py:49`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_coupon()`

- **Path**: `/<coupon_id>`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/coupons.py:101`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `update_coupon()`

- **Path**: `/<coupon_id>`
- **Methods**: PUT
- **Arquivo**: `apps/api/src/controllers/routes/coupons.py:115`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `validate_coupon()`

- **Path**: `/validate/<code>`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/coupons.py:167`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `apply_coupon()`

- **Path**: `/apply`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/coupons.py:239`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_coupons_analytics()`

- **Path**: `/analytics`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/coupons.py:291`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_coupon_usage()`

- **Path**: `/<coupon_id>/usage`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/coupons.py:341`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_customer_types()`

- **Path**: `/types`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/customers.py:24`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_customers()`

- **Path**: `/`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/customers.py:53`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `create_customer()`

- **Path**: `/`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/customers.py:94`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_customer()`

- **Path**: `/<customer_id>`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/customers.py:164`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `update_customer()`

- **Path**: `/<customer_id>`
- **Methods**: PUT
- **Arquivo**: `apps/api/src/controllers/routes/customers.py:233`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_customer_addresses()`

- **Path**: `/<customer_id>/addresses`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/customers.py:296`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `add_customer_address()`

- **Path**: `/<customer_id>/addresses`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/customers.py:322`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_customers_analytics()`

- **Path**: `/analytics/overview`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/customers.py:376`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_user_dashboard()`

- **Path**: `/user/<user_id>`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/dashboard.py:9`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_user_progress()`

- **Path**: `/user/<user_id>/progress`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/dashboard.py:76`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_user_recommendations()`

- **Path**: `/user/<user_id>/recommendations`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/dashboard.py:127`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_levels()`

- **Path**: `/levels`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/gamification.py:25`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_rewards()`

- **Path**: `/rewards`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/gamification.py:142`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_leaderboard()`

- **Path**: `/leaderboard`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/gamification.py:267`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `calculate_shipping()`

- **Path**: `/calculate`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/melhor_envio.py:41`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_order_shipping()`

- **Path**: `/order/<order_id>`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/melhor_envio.py:75`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `track_shipment()`

- **Path**: `/track/<tracking_code>`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/melhor_envio.py:195`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_agencies()`

- **Path**: `/agencies`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/melhor_envio.py:259`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `oauth_callback()`

- **Path**: `/callback`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/melhor_envio.py:313`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_payment_methods()`

- **Path**: `/payment-methods`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/mercado_pago.py:463`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `create_card_token()`

- **Path**: `/transparent/create-card-token`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/mercado_pago.py:545`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `process_transparent_payment()`

- **Path**: `/transparent/process-payment`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/mercado_pago.py:584`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `validate_payment_data()`

- **Path**: `/transparent/validate-payment`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/mercado_pago.py:712`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_installments()`

- **Path**: `/transparent/installments`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/mercado_pago.py:742`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_transparent_payment_methods()`

- **Path**: `/transparent/payment-methods`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/mercado_pago.py:775`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `subscribe()`

- **Path**: `/subscribe`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/newsletter.py:23`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `unsubscribe()`

- **Path**: `/unsubscribe`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/newsletter.py:75`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_user_notifications()`

- **Path**: `/`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/notifications.py:28`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `mark_notification_as_read()`

- **Path**: `/<int:notification_id>/read`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/notifications.py:81`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `mark_all_as_read()`

- **Path**: `/read-all`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/notifications.py:110`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `delete_notification()`

- **Path**: `/<int:notification_id>`
- **Methods**: DELETE
- **Arquivo**: `apps/api/src/controllers/routes/notifications.py:135`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_notification_preferences()`

- **Path**: `/preferences`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/notifications.py:158`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `update_notification_preferences()`

- **Path**: `/preferences`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/notifications.py:186`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `send_notification()`

- **Path**: `/send`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/notifications.py:231`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `broadcast_notification()`

- **Path**: `/broadcast`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/notifications.py:270`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_notification_templates()`

- **Path**: `/admin/templates`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/notifications.py:333`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `create_notification_template()`

- **Path**: `/admin/templates`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/notifications.py:346`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_notification_logs()`

- **Path**: `/admin/logs`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/notifications.py:387`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_notification_stats()`

- **Path**: `/admin/stats`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/notifications.py:478`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_orders()`

- **Path**: `/`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/orders.py:14`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_order()`

- **Path**: `/<order_id>`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/orders.py:58`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `create_order()`

- **Path**: `/`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/orders.py:101`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `update_order_status()`

- **Path**: `/<order_id>/status`
- **Methods**: PUT
- **Arquivo**: `apps/api/src/controllers/routes/orders.py:277`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `orders_analytics()`

- **Path**: `/analytics`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/orders.py:307`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `performance_comparison()`

- **Path**: `/performance-comparison`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/orders.py:363`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `payments_home()`

- **Path**: `/`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/payments.py:15`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `process_payment()`

- **Path**: `/process`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/payments.py:83`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_payment()`

- **Path**: `/<payment_id>`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/payments.py:158`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_order_payments()`

- **Path**: `/order/<order_id>`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/payments.py:188`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_payment_methods()`

- **Path**: `/methods`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/payments.py:213`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `refund_payment()`

- **Path**: `/refund/<payment_id>`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/payments.py:289`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_products()`

- **Path**: `/`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/products.py:97`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_product_by_id()`

- **Path**: `/by-id/<product_id>`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/products.py:361`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_product()`

- **Path**: `/<product_id>`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/products.py:446`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_featured_products()`

- **Path**: `/featured`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/products.py:553`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `search_products()`

- **Path**: `/search`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/products.py:594`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `audit_requests()`

- **Path**: `/audit/requests`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/security.py:21`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_blocked_ips()`

- **Path**: `/blocked-ips`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/security.py:39`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `unblock_ip()`

- **Path**: `/unblock-ip`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/security.py:69`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_rate_limits()`

- **Path**: `/rate-limits`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/security.py:104`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `security_report()`

- **Path**: `/security-report`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/security.py:122`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `fix_reviews_types()`

- **Path**: `/fix-reviews-types`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/setup.py:9`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `create_reviews_table()`

- **Path**: `/create-reviews`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/setup.py:54`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `check_database_schema()`

- **Path**: `/check-schema`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/setup.py:122`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `test_endpoint()`

- **Path**: `/test`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/setup.py:160`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `force_init_database()`

- **Path**: `/force-init`
- **Methods**: POST, GET
- **Arquivo**: `apps/api/src/controllers/routes/setup.py:169`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `create_tables()`

- **Path**: `/create-tables`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/setup.py:209`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `setup_render_database()`

- **Path**: `/setup-render-db`
- **Methods**: POST, GET
- **Arquivo**: `apps/api/src/controllers/routes/setup.py:243`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `migrate_to_neon()`

- **Path**: `/migrate-to-neon`
- **Methods**: POST, GET
- **Arquivo**: `apps/api/src/controllers/routes/setup.py:283`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `insert_sample_data()`

- **Path**: `/insert-sample-data`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/setup.py:323`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_stock()`

- **Path**: `, methods=[`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/stock.py:17`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_product_stock()`

- **Path**: `/<product_id>`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/stock.py:92`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `adjust_stock()`

- **Path**: `/<product_id>/adjust`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/stock.py:137`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_stock_movements()`

- **Path**: `/movements`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/stock.py:221`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_stock_alerts()`

- **Path**: `/alerts`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/stock.py:265`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_users()`

- **Path**: `/users`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/user.py:7`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `create_user()`

- **Path**: `/users`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/routes/user.py:12`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_user()`

- **Path**: `/users/<int:user_id>`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/routes/user.py:21`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `update_user()`

- **Path**: `/users/<int:user_id>`
- **Methods**: PUT
- **Arquivo**: `apps/api/src/controllers/routes/user.py:26`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `delete_user()`

- **Path**: `/users/<int:user_id>`
- **Methods**: DELETE
- **Arquivo**: `apps/api/src/controllers/routes/user.py:35`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `shipping_home()`

- **Path**: `/`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/shipping.py:12`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `calculate_shipping()`

- **Path**: `/calculate`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/shipping.py:52`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_cep_info()`

- **Path**: `/cep/<cep>`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/shipping.py:162`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_shipping_services()`

- **Path**: `/services`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/shipping.py:214`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `get_wishlist()`

- **Path**: `/`
- **Methods**: GET
- **Arquivo**: `apps/api/src/controllers/wishlist.py:11`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `add_to_wishlist()`

- **Path**: `/add`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/wishlist.py:55`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `remove_from_wishlist()`

- **Path**: `/remove/<int:product_id>`
- **Methods**: DELETE
- **Arquivo**: `apps/api/src/controllers/wishlist.py:124`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

### `toggle_wishlist()`

- **Path**: `/toggle`
- **Methods**: POST
- **Arquivo**: `apps/api/src/controllers/wishlist.py:168`
- **Ação**: Adicionar `@jwt_required()` antes do route decorator

## Relatório Detalhado por Arquivo

### admin.py

- Total de endpoints: 40
- Protegidos: 0
- Gaps: 34

**Endpoints sem proteção:**

- `/dashboard` (GET) - linha 18
- `/orders` (GET) - linha 195
- `/orders` (POST) - linha 234
- `/orders/<order_id>` (PUT) - linha 331
- `/orders/<order_id>` (DELETE) - linha 440
- `/orders/<order_id>/update-status` (POST) - linha 477
- `/stats` (GET) - linha 541
- `/users` (GET) - linha 599
- `/users` (POST) - linha 642
- `/users/<user_id>` (PUT) - linha 744
- `/users/<user_id>` (DELETE) - linha 842
- `/users/<user_id>/toggle-status` (POST) - linha 875
- `/products` (POST) - linha 1001
- `/products/<product_id>` (PUT) - linha 1166
- `/products/<product_id>` (DELETE) - linha 1315
- `/products/<product_id>/toggle-status` (POST) - linha 1348
- `/blog/posts` (POST) - linha 1478
- `/blog/posts/<post_id>` (PUT) - linha 1572
- `/blog/posts/<post_id>` (DELETE) - linha 1663
- `/blog/posts/<post_id>/toggle-status` (POST) - linha 1691
- `/analytics/top-products-revenue` (GET) - linha 1725
- `/summary` (GET) - linha 1789
- `/customers` (GET) - linha 1837
- `/leads` (GET) - linha 1870
- `/blog/categories` (POST) - linha 1941
- `/blog/categories/<category_id>` (PUT) - linha 1995
- `/blog/categories/<category_id>` (DELETE) - linha 2056
- `/dashboard/sales` (GET) - linha 2097
- `/dashboard/customers` (GET) - linha 2176
- `/dashboard/financial` (GET) - linha 2201
- `/analytics` (GET) - linha 2231
- `/analytics/sales` (GET) - linha 2435
- `/analytics/customers` (GET) - linha 2584
- `/orders/<order_id>/documents` (GET) - linha 2661

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_dashboard` | `/dashboard` | GET | ❌ | 18 |
| `get_orders` | `/orders` | GET | ❌ | 195 |
| `create_admin_order` | `/orders` | POST | ❌ | 234 |
| `update_admin_order` | `/orders/<order_id>` | PUT | ❌ | 331 |
| `delete_admin_order` | `/orders/<order_id>` | DELETE | ❌ | 440 |
| `update_order_status` | `/orders/<order_id>/update-status` | POST | ❌ | 477 |
| `get_admin_stats` | `/stats` | GET | ❌ | 541 |
| `get_admin_users` | `/users` | GET | ❌ | 599 |
| `create_admin_user` | `/users` | POST | ❌ | 642 |
| `update_admin_user` | `/users/<user_id>` | PUT | ❌ | 744 |
| `delete_admin_user` | `/users/<user_id>` | DELETE | ❌ | 842 |
| `toggle_user_status` | `/users/<user_id>/toggle-status` | POST | ❌ | 875 |
| `get_admin_products` | `/products` | GET | ❌ | 943 |
| `create_admin_product` | `/products` | POST | ❌ | 1001 |
| `update_admin_product` | `/products/<product_id>` | PUT | ❌ | 1166 |
| `delete_admin_product` | `/products/<product_id>` | DELETE | ❌ | 1315 |
| `toggle_product_status` | `/products/<product_id>/toggle-status` | POST | ❌ | 1348 |
| `get_admin_blog_posts` | `/blog/posts` | GET | ❌ | 1413 |
| `create_admin_blog_post` | `/blog/posts` | POST | ❌ | 1478 |
| `update_admin_blog_post` | `/blog/posts/<post_id>` | PUT | ❌ | 1572 |
| `delete_admin_blog_post` | `/blog/posts/<post_id>` | DELETE | ❌ | 1663 |
| `toggle_blog_post_status` | `/blog/posts/<post_id>/toggle-status` | POST | ❌ | 1691 |
| `get_top_products_revenue` | `/analytics/top-products-revenue` | GET | ❌ | 1725 |
| `get_admin_summary` | `/summary` | GET | ❌ | 1789 |
| `get_customers` | `/customers` | GET | ❌ | 1837 |
| `get_leads` | `/leads` | GET | ❌ | 1870 |
| `get_blog_categories` | `/blog/categories` | GET | ❌ | 1914 |
| `create_blog_category` | `/blog/categories` | POST | ❌ | 1941 |
| `update_blog_category` | `/blog/categories/<category_id>` | PUT | ❌ | 1995 |
| `delete_blog_category` | `/blog/categories/<category_id>` | DELETE | ❌ | 2056 |
| `get_dashboard_sales` | `/dashboard/sales` | GET | ❌ | 2097 |
| `get_dashboard_products` | `/dashboard/products` | GET | ❌ | 2145 |
| `get_dashboard_customers` | `/dashboard/customers` | GET | ❌ | 2176 |
| `get_dashboard_financial` | `/dashboard/financial` | GET | ❌ | 2201 |
| `get_admin_analytics` | `/analytics` | GET | ❌ | 2231 |
| `get_blog_analytics` | `/analytics/blog` | GET | ❌ | 2358 |
| `get_sales_analytics` | `/analytics/sales` | GET | ❌ | 2435 |
| `get_products_analytics` | `/analytics/products` | GET | ❌ | 2515 |
| `get_customers_analytics` | `/analytics/customers` | GET | ❌ | 2584 |
| `get_order_documents` | `/orders/<order_id>/documents` | GET | ❌ | 2661 |

</details>

### admin_products.py

- Total de endpoints: 5
- Protegidos: 5
- Gaps: 0

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `populate_weight_prices` | `/populate-weight-prices` | POST | ✅ | 10 |
| `get_product_prices` | `/<int:product_id>/prices` | GET | ✅ | 116 |
| `create_product_price` | `/<int:product_id>/prices` | POST | ✅ | 162 |
| `update_product_price` | `/prices/<int:price_id>` | PUT | ✅ | 229 |
| `delete_product_price` | `/prices/<int:price_id>` | DELETE | ✅ | 273 |

</details>

### analytics.py

- Total de endpoints: 3
- Protegidos: 0
- Gaps: 2

**Endpoints sem proteção:**

- `/track` (POST) - linha 9
- `/track/batch` (POST) - linha 31

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `track_event` | `/track` | POST | ❌ | 9 |
| `track_batch_events` | `/track/batch` | POST | ❌ | 31 |
| `analytics_health` | `/health` | GET | ❌ | 55 |

</details>

### auth.py

- Total de endpoints: 5
- Protegidos: 2
- Gaps: 0

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `debug_database` | `/debug-database` | GET | ❌ | 87 |
| `login` | `/login` | POST | ❌ | 138 |
| `register` | `/register` | POST | ❌ | 245 |
| `get_current_user` | `/me` | GET | ✅ | 361 |
| `logout` | `/logout` | POST | ✅ | 402 |

</details>

### blog.py

- Total de endpoints: 13
- Protegidos: 6
- Gaps: 6

**Endpoints sem proteção:**

- `/posts` (GET) - linha 23
- `/posts/<post_id>` (GET) - linha 81
- `/posts/slug/<slug>` (GET) - linha 103
- `/posts/<post_id>/like` (POST) - linha 301
- `/posts/<post_id>/comments` (GET) - linha 326
- `/tags` (GET) - linha 478

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_posts` | `/posts` | GET | ❌ | 23 |
| `get_post` | `/posts/<post_id>` | GET | ❌ | 81 |
| `get_post_by_slug` | `/posts/slug/<slug>` | GET | ❌ | 103 |
| `create_post` | `/posts` | POST | ✅ | 126 |
| `update_post` | `/posts/<post_id>` | PUT | ✅ | 201 |
| `delete_post` | `/posts/<post_id>` | DELETE | ✅ | 270 |
| `like_post` | `/posts/<post_id>/like` | POST | ❌ | 301 |
| `get_comments` | `/posts/<post_id>/comments` | GET | ❌ | 326 |
| `create_comment` | `/posts/<post_id>/comments` | POST | ✅ | 348 |
| `approve_comment` | `/comments/<comment_id>/approve` | POST | ✅ | 394 |
| `delete_comment` | `/comments/<comment_id>` | DELETE | ✅ | 420 |
| `get_categories` | `/categories` | GET | ❌ | 457 |
| `get_tags` | `/tags` | GET | ❌ | 478 |

</details>

### cart.py

- Total de endpoints: 9
- Protegidos: 5
- Gaps: 4

**Endpoints sem proteção:**

- `/items` (GET) - linha 102
- `/count` (GET) - linha 556
- `/admin/all` (GET) - linha 585
- `/admin/user/<user_id>` (GET) - linha 662

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_cart` | `/` | GET | ✅ | 18 |
| `get_cart_items` | `/items` | GET | ❌ | 102 |
| `add_to_cart` | `/add` | POST | ✅ | 174 |
| `update_cart_item` | `/<product_id>` | PUT | ✅ | 377 |
| `remove_from_cart` | `/<product_id>` | DELETE | ✅ | 455 |
| `clear_cart` | `/clear` | DELETE | ✅ | 512 |
| `get_cart_count` | `/count` | GET | ❌ | 556 |
| `get_all_carts` | `/admin/all` | GET | ❌ | 585 |
| `get_user_cart` | `/admin/user/<user_id>` | GET | ❌ | 662 |

</details>

### checkout.py

- Total de endpoints: 13
- Protegidos: 0
- Gaps: 13

**Endpoints sem proteção:**

- `/` (GET) - linha 27
- `/session` (POST) - linha 50
- `/validate` (POST) - linha 133
- `/process` (POST) - linha 184
- `/success` (GET) - linha 258
- `/cancel` (POST) - linha 286
- `/start` (POST) - linha 492
- `/validate-cep` (POST) - linha 590
- `/shipping-options` (POST) - linha 612
- `/apply-coupon` (POST) - linha 650
- `/complete` (POST) - linha 706
- `/payment-methods` (GET) - linha 851
- `/abandoned-carts` (GET) - linha 900

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `checkout_home` | `/` | GET | ❌ | 27 |
| `create_checkout_session` | `/session` | POST | ❌ | 50 |
| `validate_checkout` | `/validate` | POST | ❌ | 133 |
| `process_checkout` | `/process` | POST | ❌ | 184 |
| `checkout_success` | `/success` | GET | ❌ | 258 |
| `cancel_checkout` | `/cancel` | POST | ❌ | 286 |
| `start_checkout` | `/start` | POST | ❌ | 492 |
| `validate_cep_route` | `/validate-cep` | POST | ❌ | 590 |
| `calculate_shipping_options` | `/shipping-options` | POST | ❌ | 612 |
| `apply_coupon` | `/apply-coupon` | POST | ❌ | 650 |
| `complete_checkout` | `/complete` | POST | ❌ | 706 |
| `get_payment_methods` | `/payment-methods` | GET | ❌ | 851 |
| `get_abandoned_carts` | `/abandoned-carts` | GET | ❌ | 900 |

</details>

### coupons.py

- Total de endpoints: 8
- Protegidos: 0
- Gaps: 8

**Endpoints sem proteção:**

- `/` (GET) - linha 12
- `/` (POST) - linha 49
- `/<coupon_id>` (GET) - linha 101
- `/<coupon_id>` (PUT) - linha 115
- `/validate/<code>` (POST) - linha 167
- `/apply` (POST) - linha 239
- `/analytics` (GET) - linha 291
- `/<coupon_id>/usage` (GET) - linha 341

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_coupons` | `/` | GET | ❌ | 12 |
| `create_coupon` | `/` | POST | ❌ | 49 |
| `get_coupon` | `/<coupon_id>` | GET | ❌ | 101 |
| `update_coupon` | `/<coupon_id>` | PUT | ❌ | 115 |
| `validate_coupon` | `/validate/<code>` | POST | ❌ | 167 |
| `apply_coupon` | `/apply` | POST | ❌ | 239 |
| `get_coupons_analytics` | `/analytics` | GET | ❌ | 291 |
| `get_coupon_usage` | `/<coupon_id>/usage` | GET | ❌ | 341 |

</details>

### crm.py

- Total de endpoints: 21
- Protegidos: 21
- Gaps: 0

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_pipelines` | `/pipelines` | GET | ✅ | 28 |
| `create_pipeline` | `/pipelines` | POST | ✅ | 42 |
| `get_pipeline_stages` | `/pipelines/<pipeline_id>/stages` | GET | ✅ | 97 |
| `create_pipeline_stage` | `/pipelines/<pipeline_id>/stages` | POST | ✅ | 111 |
| `get_deals` | `/deals` | GET | ✅ | 152 |
| `create_deal` | `/deals` | POST | ✅ | 202 |
| `get_deal` | `/deals/<deal_id>` | GET | ✅ | 250 |
| `move_deal` | `/deals/<deal_id>/move` | POST | ✅ | 267 |
| `win_deal` | `/deals/<deal_id>/win` | POST | ✅ | 314 |
| `lose_deal` | `/deals/<deal_id>/lose` | POST | ✅ | 341 |
| `get_deal_activities` | `/deals/<deal_id>/activities` | GET | ✅ | 370 |
| `create_deal_activity` | `/deals/<deal_id>/activities` | POST | ✅ | 384 |
| `complete_activity` | `/activities/<activity_id>/complete` | POST | ✅ | 419 |
| `get_deal_notes` | `/deals/<deal_id>/notes` | GET | ✅ | 445 |
| `create_deal_note` | `/deals/<deal_id>/notes` | POST | ✅ | 459 |
| `get_sales_funnel` | `/sales-funnel` | GET | ✅ | 491 |
| `get_automations` | `/automations` | GET | ✅ | 557 |
| `create_automation` | `/automations` | POST | ✅ | 571 |
| `get_lead_scores` | `/lead-scores` | GET | ✅ | 612 |
| `get_lead_score` | `/leads/<lead_id>/score` | GET | ✅ | 637 |
| `calculate_lead_score` | `/leads/<lead_id>/score` | POST | ✅ | 659 |

</details>

### customers.py

- Total de endpoints: 8
- Protegidos: 0
- Gaps: 8

**Endpoints sem proteção:**

- `/types` (GET) - linha 24
- `/` (GET) - linha 53
- `/` (POST) - linha 94
- `/<customer_id>` (GET) - linha 164
- `/<customer_id>` (PUT) - linha 233
- `/<customer_id>/addresses` (GET) - linha 296
- `/<customer_id>/addresses` (POST) - linha 322
- `/analytics/overview` (GET) - linha 376

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_customer_types` | `/types` | GET | ❌ | 24 |
| `get_customers` | `/` | GET | ❌ | 53 |
| `create_customer` | `/` | POST | ❌ | 94 |
| `get_customer` | `/<customer_id>` | GET | ❌ | 164 |
| `update_customer` | `/<customer_id>` | PUT | ❌ | 233 |
| `get_customer_addresses` | `/<customer_id>/addresses` | GET | ❌ | 296 |
| `add_customer_address` | `/<customer_id>/addresses` | POST | ❌ | 322 |
| `get_customers_analytics` | `/analytics/overview` | GET | ❌ | 376 |

</details>

### dashboard.py

- Total de endpoints: 3
- Protegidos: 0
- Gaps: 3

**Endpoints sem proteção:**

- `/user/<user_id>` (GET) - linha 9
- `/user/<user_id>/progress` (GET) - linha 76
- `/user/<user_id>/recommendations` (GET) - linha 127

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_user_dashboard` | `/user/<user_id>` | GET | ❌ | 9 |
| `get_user_progress` | `/user/<user_id>/progress` | GET | ❌ | 76 |
| `get_user_recommendations` | `/user/<user_id>/recommendations` | GET | ❌ | 127 |

</details>

### debug.py

- Total de endpoints: 2
- Protegidos: 0
- Gaps: 0

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `debug_env` | `/env` | GET | ❌ | 34 |
| `debug_database` | `/database` | GET | ❌ | 109 |

</details>

### erp.py

- Total de endpoints: 16
- Protegidos: 16
- Gaps: 0

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_purchase_requests` | `/purchase-requests` | GET | ✅ | 28 |
| `create_purchase_request` | `/purchase-requests` | POST | ✅ | 63 |
| `approve_purchase_request` | `/purchase-requests/<request_id>/approve` | POST | ✅ | 121 |
| `reject_purchase_request` | `/purchase-requests/<request_id>/reject` | POST | ✅ | 159 |
| `get_supplier_contracts` | `/supplier-contracts` | GET | ✅ | 195 |
| `create_supplier_contract` | `/supplier-contracts` | POST | ✅ | 232 |
| `get_production_orders` | `/production-orders` | GET | ✅ | 278 |
| `create_production_order` | `/production-orders` | POST | ✅ | 312 |
| `start_production_order` | `/production-orders/<order_id>/start` | POST | ✅ | 366 |
| `complete_production_order` | `/production-orders/<order_id>/complete` | POST | ✅ | 393 |
| `get_quality_controls` | `/quality-controls` | GET | ✅ | 428 |
| `create_quality_control` | `/quality-controls` | POST | ✅ | 462 |
| `approve_quality_control` | `/quality-controls/<inspection_id>/approve` | POST | ✅ | 501 |
| `reject_quality_control` | `/quality-controls/<inspection_id>/reject` | POST | ✅ | 528 |
| `calculate_material_requirements` | `/material-requirements` | POST | ✅ | 557 |
| `get_material_requirements` | `/material-requirements` | GET | ✅ | 604 |

</details>

### financial.py

- Total de endpoints: 15
- Protegidos: 15
- Gaps: 0

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_accounts_payable` | `/accounts-payable` | GET | ✅ | 27 |
| `create_account_payable` | `/accounts-payable` | POST | ✅ | 80 |
| `pay_account_payable` | `/accounts-payable/<account_id>/pay` | POST | ✅ | 141 |
| `get_accounts_receivable` | `/accounts-receivable` | GET | ✅ | 176 |
| `create_account_receivable` | `/accounts-receivable` | POST | ✅ | 228 |
| `receive_account_receivable` | `/accounts-receivable/<account_id>/receive` | POST | ✅ | 288 |
| `get_cash_flow` | `/cash-flow` | GET | ✅ | 323 |
| `calculate_cash_flow` | `/cash-flow/calculate` | POST | ✅ | 351 |
| `get_income_statements` | `/income-statement` | GET | ✅ | 453 |
| `calculate_income_statement` | `/income-statement/calculate` | POST | ✅ | 480 |
| `get_bank_reconciliations` | `/bank-reconciliation` | GET | ✅ | 541 |
| `create_bank_reconciliation` | `/bank-reconciliation` | POST | ✅ | 564 |
| `get_budgets` | `/budgets` | GET | ✅ | 611 |
| `create_budget` | `/budgets` | POST | ✅ | 638 |
| `update_budget_actual` | `/budgets/<budget_id>/update-actual` | PUT | ✅ | 676 |

</details>

### gamification.py

- Total de endpoints: 9
- Protegidos: 6
- Gaps: 3

**Endpoints sem proteção:**

- `/levels` (GET) - linha 25
- `/rewards` (GET) - linha 142
- `/leaderboard` (GET) - linha 267

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_levels` | `/levels` | GET | ❌ | 25 |
| `create_level` | `/levels` | POST | ✅ | 39 |
| `get_my_points` | `/my-points` | GET | ✅ | 65 |
| `add_points_manual` | `/add-points` | POST | ✅ | 95 |
| `get_rewards` | `/rewards` | GET | ❌ | 142 |
| `create_reward` | `/rewards` | POST | ✅ | 156 |
| `redeem_reward` | `/rewards/<reward_id>/redeem` | POST | ✅ | 180 |
| `get_my_redemptions` | `/my-redemptions` | GET | ✅ | 250 |
| `get_leaderboard` | `/leaderboard` | GET | ❌ | 267 |

</details>

### health.py

- Total de endpoints: 1
- Protegidos: 0
- Gaps: 0

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `health_check` | `/health` | GET | ❌ | 8 |

</details>

### hr.py

- Total de endpoints: 14
- Protegidos: 14
- Gaps: 0

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_departments` | `/departments` | GET | ✅ | 25 |
| `create_department` | `/departments` | POST | ✅ | 39 |
| `get_positions` | `/positions` | GET | ✅ | 73 |
| `create_position` | `/positions` | POST | ✅ | 87 |
| `get_employees` | `/employees` | GET | ✅ | 114 |
| `create_employee` | `/employees` | POST | ✅ | 134 |
| `get_employee` | `/employees/<employee_id>` | GET | ✅ | 190 |
| `check_in` | `/timecard/check-in` | POST | ✅ | 206 |
| `check_out` | `/timecard/check-out` | POST | ✅ | 245 |
| `get_payrolls` | `/payroll` | GET | ✅ | 287 |
| `create_payroll` | `/payroll` | POST | ✅ | 315 |
| `get_benefits` | `/benefits` | GET | ✅ | 382 |
| `create_benefit` | `/benefits` | POST | ✅ | 396 |
| `get_employee_benefits` | `/employees/<employee_id>/benefits` | GET | ✅ | 421 |

</details>

### melhor_envio.py

- Total de endpoints: 9
- Protegidos: 3
- Gaps: 5

**Endpoints sem proteção:**

- `/calculate` (POST) - linha 41
- `/order/<order_id>` (GET) - linha 75
- `/track/<tracking_code>` (GET) - linha 195
- `/agencies` (GET) - linha 259
- `/callback` (GET) - linha 313

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `calculate_shipping` | `/calculate` | POST | ❌ | 41 |
| `get_order_shipping` | `/order/<order_id>` | GET | ❌ | 75 |
| `create_shipment` | `/create-shipment` | POST | ✅ | 110 |
| `track_shipment` | `/track/<tracking_code>` | GET | ❌ | 195 |
| `cancel_shipment` | `/cancel-shipment/<shipment_id>` | POST | ✅ | 218 |
| `get_agencies` | `/agencies` | GET | ❌ | 259 |
| `webhook` | `/webhook` | POST | ❌ | 287 |
| `oauth_callback` | `/callback` | GET | ❌ | 313 |
| `get_shipments` | `/orders` | GET | ✅ | 347 |

</details>

### mercado_pago.py

- Total de endpoints: 12
- Protegidos: 4
- Gaps: 6

**Endpoints sem proteção:**

- `/payment-methods` (GET) - linha 463
- `/transparent/create-card-token` (POST) - linha 545
- `/transparent/process-payment` (POST) - linha 584
- `/transparent/validate-payment` (POST) - linha 712
- `/transparent/installments` (GET) - linha 742
- `/transparent/payment-methods` (GET) - linha 775

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `create_preference` | `/create-preference` | POST | ✅ | 57 |
| `process_payment` | `/process-payment` | POST | ✅ | 197 |
| `webhook_test` | `/webhook` | GET | ❌ | 329 |
| `webhook` | `/webhook` | POST | ❌ | 343 |
| `get_payment_status` | `/payment/<payment_id>` | GET | ✅ | 405 |
| `get_payment_methods` | `/payment-methods` | GET | ❌ | 463 |
| `refund_payment` | `/refund` | POST | ✅ | 486 |
| `create_card_token` | `/transparent/create-card-token` | POST | ❌ | 545 |
| `process_transparent_payment` | `/transparent/process-payment` | POST | ❌ | 584 |
| `validate_payment_data` | `/transparent/validate-payment` | POST | ❌ | 712 |
| `get_installments` | `/transparent/installments` | GET | ❌ | 742 |
| `get_transparent_payment_methods` | `/transparent/payment-methods` | GET | ❌ | 775 |

</details>

### newsletter.py

- Total de endpoints: 9
- Protegidos: 7
- Gaps: 2

**Endpoints sem proteção:**

- `/subscribe` (POST) - linha 23
- `/unsubscribe` (POST) - linha 75

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `subscribe` | `/subscribe` | POST | ❌ | 23 |
| `unsubscribe` | `/unsubscribe` | POST | ❌ | 75 |
| `get_subscribers` | `/subscribers` | GET | ✅ | 100 |
| `get_templates` | `/templates` | GET | ✅ | 128 |
| `create_template` | `/templates` | POST | ✅ | 146 |
| `get_campaigns` | `/campaigns` | GET | ✅ | 184 |
| `create_campaign` | `/campaigns` | POST | ✅ | 202 |
| `send_campaign` | `/campaigns/<campaign_id>/send` | POST | ✅ | 240 |
| `get_campaign_stats` | `/campaigns/<campaign_id>/stats` | GET | ✅ | 277 |

</details>

### notifications.py

- Total de endpoints: 13
- Protegidos: 0
- Gaps: 12

**Endpoints sem proteção:**

- `/` (GET) - linha 28
- `/<int:notification_id>/read` (POST) - linha 81
- `/read-all` (POST) - linha 110
- `/<int:notification_id>` (DELETE) - linha 135
- `/preferences` (GET) - linha 158
- `/preferences` (POST) - linha 186
- `/send` (POST) - linha 231
- `/broadcast` (POST) - linha 270
- `/admin/templates` (GET) - linha 333
- `/admin/templates` (POST) - linha 346
- `/admin/logs` (GET) - linha 387
- `/admin/stats` (GET) - linha 478

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_user_notifications` | `/` | GET | ❌ | 28 |
| `mark_notification_as_read` | `/<int:notification_id>/read` | POST | ❌ | 81 |
| `mark_all_as_read` | `/read-all` | POST | ❌ | 110 |
| `delete_notification` | `/<int:notification_id>` | DELETE | ❌ | 135 |
| `get_notification_preferences` | `/preferences` | GET | ❌ | 158 |
| `update_notification_preferences` | `/preferences` | POST | ❌ | 186 |
| `send_notification` | `/send` | POST | ❌ | 231 |
| `broadcast_notification` | `/broadcast` | POST | ❌ | 270 |
| `get_notification_templates` | `/admin/templates` | GET | ❌ | 333 |
| `create_notification_template` | `/admin/templates` | POST | ❌ | 346 |
| `get_notification_logs` | `/admin/logs` | GET | ❌ | 387 |
| `get_notification_stats` | `/admin/stats` | GET | ❌ | 478 |
| `notifications_health` | `/health` | GET | ❌ | 551 |

</details>

### orders.py

- Total de endpoints: 6
- Protegidos: 0
- Gaps: 6

**Endpoints sem proteção:**

- `/` (GET) - linha 14
- `/<order_id>` (GET) - linha 58
- `/` (POST) - linha 101
- `/<order_id>/status` (PUT) - linha 277
- `/analytics` (GET) - linha 307
- `/performance-comparison` (GET) - linha 363

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_orders` | `/` | GET | ❌ | 14 |
| `get_order` | `/<order_id>` | GET | ❌ | 58 |
| `create_order` | `/` | POST | ❌ | 101 |
| `update_order_status` | `/<order_id>/status` | PUT | ❌ | 277 |
| `orders_analytics` | `/analytics` | GET | ❌ | 307 |
| `performance_comparison` | `/performance-comparison` | GET | ❌ | 363 |

</details>

### payments.py

- Total de endpoints: 7
- Protegidos: 0
- Gaps: 6

**Endpoints sem proteção:**

- `/` (GET) - linha 15
- `/process` (POST) - linha 83
- `/<payment_id>` (GET) - linha 158
- `/order/<order_id>` (GET) - linha 188
- `/methods` (GET) - linha 213
- `/refund/<payment_id>` (POST) - linha 289

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `payments_home` | `/` | GET | ❌ | 15 |
| `process_payment` | `/process` | POST | ❌ | 83 |
| `get_payment` | `/<payment_id>` | GET | ❌ | 158 |
| `get_order_payments` | `/order/<order_id>` | GET | ❌ | 188 |
| `get_payment_methods` | `/methods` | GET | ❌ | 213 |
| `payment_webhook` | `/webhook` | POST | ❌ | 252 |
| `refund_payment` | `/refund/<payment_id>` | POST | ❌ | 289 |

</details>

### pdv.py

- Total de endpoints: 14
- Protegidos: 14
- Gaps: 0

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_cash_registers` | `/cash-registers` | GET | ✅ | 27 |
| `create_cash_register` | `/cash-registers` | POST | ✅ | 41 |
| `open_session` | `/sessions/open` | POST | ✅ | 74 |
| `close_session` | `/sessions/<session_id>/close` | POST | ✅ | 119 |
| `get_current_session` | `/sessions/current` | GET | ✅ | 159 |
| `get_sessions` | `/sessions` | GET | ✅ | 186 |
| `create_movement` | `/movements` | POST | ✅ | 226 |
| `get_movements` | `/movements/<session_id>` | GET | ✅ | 274 |
| `create_sale` | `/sales` | POST | ✅ | 290 |
| `get_sale` | `/sales/<sale_id>` | GET | ✅ | 383 |
| `get_sales` | `/sales` | GET | ✅ | 400 |
| `cancel_sale` | `/sales/<sale_id>/cancel` | POST | ✅ | 440 |
| `session_summary` | `/reports/session-summary/<session_id>` | GET | ✅ | 489 |
| `daily_sales` | `/reports/daily-sales` | GET | ✅ | 524 |

</details>

### products.py

- Total de endpoints: 8
- Protegidos: 0
- Gaps: 5

**Endpoints sem proteção:**

- `/` (GET) - linha 97
- `/by-id/<product_id>` (GET) - linha 361
- `/<product_id>` (GET) - linha 446
- `/featured` (GET) - linha 553
- `/search` (GET) - linha 594

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_products` | `/` | GET | ❌ | 97 |
| `debug_uuid_product` | `/debug-uuid/<product_id>` | GET | ❌ | 284 |
| `debug_products` | `/debug-search` | GET | ❌ | 313 |
| `get_product_by_id` | `/by-id/<product_id>` | GET | ❌ | 361 |
| `get_product` | `/<product_id>` | GET | ❌ | 446 |
| `get_categories` | `/categories` | GET | ❌ | 530 |
| `get_featured_products` | `/featured` | GET | ❌ | 553 |
| `search_products` | `/search` | GET | ❌ | 594 |

</details>

### products_controller.py

- Total de endpoints: 15
- Protegidos: 0
- Gaps: 14

**Endpoints sem proteção:**

- `/` (GET) - linha 173
- `/<int:product_id>` (GET) - linha 180
- `/` (POST) - linha 188
- `/<int:product_id>` (PUT) - linha 196
- `/<int:product_id>` (DELETE) - linha 204
- `/search` (GET) - linha 211
- `/featured` (GET) - linha 218
- `/category/<category>` (GET) - linha 225
- `/low-stock` (GET) - linha 233
- `/<int:product_id>/toggle-status` (POST) - linha 241
- `/<int:product_id>/stock` (PUT) - linha 249
- `/bulk` (POST) - linha 264
- `/bulk` (PUT) - linha 275
- `/bulk` (DELETE) - linha 286

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_products` | `/` | GET | ❌ | 173 |
| `get_product` | `/<int:product_id>` | GET | ❌ | 180 |
| `create_product` | `/` | POST | ❌ | 188 |
| `update_product` | `/<int:product_id>` | PUT | ❌ | 196 |
| `delete_product` | `/<int:product_id>` | DELETE | ❌ | 204 |
| `search_products` | `/search` | GET | ❌ | 211 |
| `get_featured_products` | `/featured` | GET | ❌ | 218 |
| `get_products_by_category` | `/category/<category>` | GET | ❌ | 225 |
| `get_low_stock_products` | `/low-stock` | GET | ❌ | 233 |
| `toggle_product_status` | `/<int:product_id>/toggle-status` | POST | ❌ | 241 |
| `update_stock` | `/<int:product_id>/stock` | PUT | ❌ | 249 |
| `get_product_categories` | `/categories` | GET | ❌ | 256 |
| `bulk_create_products` | `/bulk` | POST | ❌ | 264 |
| `bulk_update_products` | `/bulk` | PUT | ❌ | 275 |
| `bulk_delete_products` | `/bulk` | DELETE | ❌ | 286 |

</details>

### reviews.py

- Total de endpoints: 15
- Protegidos: 6
- Gaps: 9

**Endpoints sem proteção:**

- `/` (GET) - linha 122
- `/product/<int:product_id>` (GET) - linha 154
- `/product/<int:product_id>/stats` (GET) - linha 273
- `/product/<int:product_id>/featured` (GET) - linha 633
- `/featured` (GET) - linha 674
- `/product/<int:product_id>/recent` (GET) - linha 780
- `/product/<int:product_id>/rating-distribution` (GET) - linha 820
- `/product/<int:product_id>/engagement` (GET) - linha 867
- `/product/<int:product_id>/enhanced-stats` (GET) - linha 918

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_all_reviews` | `/` | GET | ❌ | 122 |
| `get_product_reviews` | `/product/<int:product_id>` | GET | ❌ | 154 |
| `get_product_review_stats` | `/product/<int:product_id>/stats` | GET | ❌ | 273 |
| `create_review` | `/product/<int:product_id>` | POST | ✅ | 325 |
| `update_review` | `/<int:review_id>` | PUT | ✅ | 401 |
| `delete_review` | `/<int:review_id>` | DELETE | ✅ | 456 |
| `vote_review_helpful` | `/<int:review_id>/helpful` | POST | ✅ | 489 |
| `add_company_response` | `/<int:review_id>/response` | POST | ✅ | 570 |
| `get_product_featured_reviews` | `/product/<int:product_id>/featured` | GET | ❌ | 633 |
| `get_featured_reviews` | `/featured` | GET | ❌ | 674 |
| `moderate_review` | `/<int:review_id>/moderate` | PUT | ✅ | 732 |
| `get_product_recent_reviews` | `/product/<int:product_id>/recent` | GET | ❌ | 780 |
| `get_product_rating_distribution` | `/product/<int:product_id>/rating-distribution` | GET | ❌ | 820 |
| `get_product_engagement_metrics` | `/product/<int:product_id>/engagement` | GET | ❌ | 867 |
| `get_enhanced_product_review_stats` | `/product/<int:product_id>/enhanced-stats` | GET | ❌ | 918 |

</details>

### reviews_simple.py

- Total de endpoints: 10
- Protegidos: 0
- Gaps: 9

**Endpoints sem proteção:**

- `/` (GET) - linha 46
- `/test` (GET) - linha 67
- `/product/<product_id>/stats` (GET) - linha 78
- `/product/<product_id>/rating-distribution` (GET) - linha 123
- `/product/<product_id>/engagement` (GET) - linha 167
- `/product/<product_id>/recent` (GET) - linha 207
- `/product/<product_id>/featured` (GET) - linha 308
- `/product/<product_id>` (GET) - linha 386
- `/add` (POST) - linha 505

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_all_reviews` | `/` | GET | ❌ | 46 |
| `test_route` | `/test` | GET | ❌ | 67 |
| `debug_routes` | `/debug-routes` | GET | ❌ | 73 |
| `get_product_review_stats` | `/product/<product_id>/stats` | GET | ❌ | 78 |
| `get_rating_distribution` | `/product/<product_id>/rating-distribution` | GET | ❌ | 123 |
| `get_engagement_metrics` | `/product/<product_id>/engagement` | GET | ❌ | 167 |
| `get_recent_reviews` | `/product/<product_id>/recent` | GET | ❌ | 207 |
| `get_featured_reviews` | `/product/<product_id>/featured` | GET | ❌ | 308 |
| `get_product_reviews` | `/product/<product_id>` | GET | ❌ | 386 |
| `add_review` | `/add` | POST | ❌ | 505 |

</details>

### security.py

- Total de endpoints: 5
- Protegidos: 0
- Gaps: 5

**Endpoints sem proteção:**

- `/audit/requests` (GET) - linha 21
- `/blocked-ips` (GET) - linha 39
- `/unblock-ip` (POST) - linha 69
- `/rate-limits` (GET) - linha 104
- `/security-report` (GET) - linha 122

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `audit_requests` | `/audit/requests` | GET | ❌ | 21 |
| `get_blocked_ips` | `/blocked-ips` | GET | ❌ | 39 |
| `unblock_ip` | `/unblock-ip` | POST | ❌ | 69 |
| `get_rate_limits` | `/rate-limits` | GET | ❌ | 104 |
| `security_report` | `/security-report` | GET | ❌ | 122 |

</details>

### setup.py

- Total de endpoints: 9
- Protegidos: 0
- Gaps: 9

**Endpoints sem proteção:**

- `/fix-reviews-types` (GET) - linha 9
- `/create-reviews` (GET) - linha 54
- `/check-schema` (GET) - linha 122
- `/test` (GET) - linha 160
- `/force-init` (POST, GET) - linha 169
- `/create-tables` (POST) - linha 209
- `/setup-render-db` (POST, GET) - linha 243
- `/migrate-to-neon` (POST, GET) - linha 283
- `/insert-sample-data` (POST) - linha 323

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `fix_reviews_types` | `/fix-reviews-types` | GET | ❌ | 9 |
| `create_reviews_table` | `/create-reviews` | GET | ❌ | 54 |
| `check_database_schema` | `/check-schema` | GET | ❌ | 122 |
| `test_endpoint` | `/test` | GET | ❌ | 160 |
| `force_init_database` | `/force-init` | POST, GET | ❌ | 169 |
| `create_tables` | `/create-tables` | POST | ❌ | 209 |
| `setup_render_database` | `/setup-render-db` | POST, GET | ❌ | 243 |
| `migrate_to_neon` | `/migrate-to-neon` | POST, GET | ❌ | 283 |
| `insert_sample_data` | `/insert-sample-data` | POST | ❌ | 323 |

</details>

### shipping.py

- Total de endpoints: 5
- Protegidos: 1
- Gaps: 4

**Endpoints sem proteção:**

- `/` (GET) - linha 12
- `/calculate` (POST) - linha 52
- `/cep/<cep>` (GET) - linha 162
- `/services` (GET) - linha 214

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `shipping_home` | `/` | GET | ❌ | 12 |
| `calculate_shipping` | `/calculate` | POST | ❌ | 52 |
| `get_cep_info` | `/cep/<cep>` | GET | ❌ | 162 |
| `get_shipping_services` | `/services` | GET | ❌ | 214 |
| `create_shipping_quote` | `/quote` | POST | ✅ | 257 |

</details>

### stock.py

- Total de endpoints: 5
- Protegidos: 0
- Gaps: 5

**Endpoints sem proteção:**

- `, methods=[` (GET) - linha 17
- `/<product_id>` (GET) - linha 92
- `/<product_id>/adjust` (POST) - linha 137
- `/movements` (GET) - linha 221
- `/alerts` (GET) - linha 265

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_stock` | `, methods=[` | GET | ❌ | 17 |
| `get_product_stock` | `/<product_id>` | GET | ❌ | 92 |
| `adjust_stock` | `/<product_id>/adjust` | POST | ❌ | 137 |
| `get_stock_movements` | `/movements` | GET | ❌ | 221 |
| `get_stock_alerts` | `/alerts` | GET | ❌ | 265 |

</details>

### user.py

- Total de endpoints: 5
- Protegidos: 0
- Gaps: 5

**Endpoints sem proteção:**

- `/users` (GET) - linha 7
- `/users` (POST) - linha 12
- `/users/<int:user_id>` (GET) - linha 21
- `/users/<int:user_id>` (PUT) - linha 26
- `/users/<int:user_id>` (DELETE) - linha 35

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_users` | `/users` | GET | ❌ | 7 |
| `create_user` | `/users` | POST | ❌ | 12 |
| `get_user` | `/users/<int:user_id>` | GET | ❌ | 21 |
| `update_user` | `/users/<int:user_id>` | PUT | ❌ | 26 |
| `delete_user` | `/users/<int:user_id>` | DELETE | ❌ | 35 |

</details>

### wishlist.py

- Total de endpoints: 4
- Protegidos: 0
- Gaps: 4

**Endpoints sem proteção:**

- `/` (GET) - linha 11
- `/add` (POST) - linha 55
- `/remove/<int:product_id>` (DELETE) - linha 124
- `/toggle` (POST) - linha 168

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_wishlist` | `/` | GET | ❌ | 11 |
| `add_to_wishlist` | `/add` | POST | ❌ | 55 |
| `remove_from_wishlist` | `/remove/<int:product_id>` | DELETE | ❌ | 124 |
| `toggle_wishlist` | `/toggle` | POST | ❌ | 168 |

</details>

## Recomendações

### Ações Imediatas

1. **Adicionar @jwt_required()** aos 187 endpoints identificados
2. **Revisar permissões** - alguns endpoints podem precisar de `@admin_required()`
3. **Implementar rate limiting** em endpoints públicos
4. **Adicionar logs de auditoria** em endpoints sensíveis (admin, pagamentos, etc.)

### Próximos Passos

- [ ] Corrigir gaps de segurança identificados
- [ ] Adicionar testes de autorização para cada endpoint
- [ ] Implementar rate limiting
- [ ] Configurar logs de auditoria
- [ ] Executar auditoria novamente após correções

## Referências

- [Flask-JWT-Extended Documentation](https://flask-jwt-extended.readthedocs.io/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

