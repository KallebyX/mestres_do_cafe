# Relatório de Auditoria de JWT

**Data da auditoria**: Wed Nov 19 18:49:44 UTC 2025

## Sumário Executivo

- **Arquivos analisados**: 34
- **Total de endpoints**: 336
- **Protegidos com JWT**: 323 (96.1%)
- **Públicos (by design)**: 13
- **Gaps de segurança**: 0

✅ **STATUS**: Todos os endpoints estão adequadamente protegidos

## Relatório Detalhado por Arquivo

### admin.py

- Total de endpoints: 40
- Protegidos: 40
- Gaps: 0

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_dashboard` | `/dashboard` | GET | ✅ | 55 |
| `get_orders` | `/orders` | GET | ✅ | 234 |
| `create_admin_order` | `/orders` | POST | ✅ | 275 |
| `update_admin_order` | `/orders/<order_id>` | PUT | ✅ | 374 |
| `delete_admin_order` | `/orders/<order_id>` | DELETE | ✅ | 485 |
| `update_order_status` | `/orders/<order_id>/update-status` | POST | ✅ | 524 |
| `get_admin_stats` | `/stats` | GET | ✅ | 590 |
| `get_admin_users` | `/users` | GET | ✅ | 650 |
| `create_admin_user` | `/users` | POST | ✅ | 695 |
| `update_admin_user` | `/users/<user_id>` | PUT | ✅ | 799 |
| `delete_admin_user` | `/users/<user_id>` | DELETE | ✅ | 899 |
| `toggle_user_status` | `/users/<user_id>/toggle-status` | POST | ✅ | 934 |
| `get_admin_products` | `/products` | GET | ✅ | 1004 |
| `create_admin_product` | `/products` | POST | ✅ | 1064 |
| `update_admin_product` | `/products/<product_id>` | PUT | ✅ | 1231 |
| `delete_admin_product` | `/products/<product_id>` | DELETE | ✅ | 1382 |
| `toggle_product_status` | `/products/<product_id>/toggle-status` | POST | ✅ | 1417 |
| `get_admin_blog_posts` | `/blog/posts` | GET | ✅ | 1484 |
| `create_admin_blog_post` | `/blog/posts` | POST | ✅ | 1551 |
| `update_admin_blog_post` | `/blog/posts/<post_id>` | PUT | ✅ | 1647 |
| `delete_admin_blog_post` | `/blog/posts/<post_id>` | DELETE | ✅ | 1740 |
| `toggle_blog_post_status` | `/blog/posts/<post_id>/toggle-status` | POST | ✅ | 1770 |
| `get_top_products_revenue` | `/analytics/top-products-revenue` | GET | ✅ | 1806 |
| `get_admin_summary` | `/summary` | GET | ✅ | 1872 |
| `get_customers` | `/customers` | GET | ✅ | 1922 |
| `get_leads` | `/leads` | GET | ✅ | 1957 |
| `get_blog_categories` | `/blog/categories` | GET | ✅ | 2003 |
| `create_blog_category` | `/blog/categories` | POST | ✅ | 2032 |
| `update_blog_category` | `/blog/categories/<category_id>` | PUT | ✅ | 2088 |
| `delete_blog_category` | `/blog/categories/<category_id>` | DELETE | ✅ | 2151 |
| `get_dashboard_sales` | `/dashboard/sales` | GET | ✅ | 2194 |
| `get_dashboard_products` | `/dashboard/products` | GET | ✅ | 2244 |
| `get_dashboard_customers` | `/dashboard/customers` | GET | ✅ | 2277 |
| `get_dashboard_financial` | `/dashboard/financial` | GET | ✅ | 2304 |
| `get_admin_analytics` | `/analytics` | GET | ✅ | 2336 |
| `get_blog_analytics` | `/analytics/blog` | GET | ✅ | 2465 |
| `get_sales_analytics` | `/analytics/sales` | GET | ✅ | 2544 |
| `get_products_analytics` | `/analytics/products` | GET | ✅ | 2626 |
| `get_customers_analytics` | `/analytics/customers` | GET | ✅ | 2697 |
| `get_order_documents` | `/orders/<order_id>/documents` | GET | ✅ | 2776 |

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
- Protegidos: 2
- Gaps: 0

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `track_event` | `/track` | POST | ✅ | 11 |
| `track_batch_events` | `/track/batch` | POST | ✅ | 34 |
| `analytics_health` | `/health` | GET | ❌ | 58 |

</details>

### auth.py

- Total de endpoints: 5
- Protegidos: 3
- Gaps: 0

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `debug_database` | `/debug-database` | GET | ✅ | 90 |
| `login` | `/login` | POST | ❌ | 142 |
| `register` | `/register` | POST | ❌ | 261 |
| `get_current_user` | `/me` | GET | ✅ | 377 |
| `logout` | `/logout` | POST | ✅ | 418 |

</details>

### blog.py

- Total de endpoints: 13
- Protegidos: 12
- Gaps: 0

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_posts` | `/posts` | GET | ✅ | 24 |
| `get_post` | `/posts/<post_id>` | GET | ✅ | 83 |
| `get_post_by_slug` | `/posts/slug/<slug>` | GET | ✅ | 106 |
| `create_post` | `/posts` | POST | ✅ | 129 |
| `update_post` | `/posts/<post_id>` | PUT | ✅ | 204 |
| `delete_post` | `/posts/<post_id>` | DELETE | ✅ | 273 |
| `like_post` | `/posts/<post_id>/like` | POST | ✅ | 305 |
| `get_comments` | `/posts/<post_id>/comments` | GET | ✅ | 331 |
| `create_comment` | `/posts/<post_id>/comments` | POST | ✅ | 353 |
| `approve_comment` | `/comments/<comment_id>/approve` | POST | ✅ | 399 |
| `delete_comment` | `/comments/<comment_id>` | DELETE | ✅ | 425 |
| `get_categories` | `/categories` | GET | ❌ | 462 |
| `get_tags` | `/tags` | GET | ✅ | 484 |

</details>

### cart.py

- Total de endpoints: 9
- Protegidos: 9
- Gaps: 0

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_cart` | `/` | GET | ✅ | 18 |
| `get_cart_items` | `/items` | GET | ✅ | 103 |
| `add_to_cart` | `/add` | POST | ✅ | 175 |
| `update_cart_item` | `/<product_id>` | PUT | ✅ | 378 |
| `remove_from_cart` | `/<product_id>` | DELETE | ✅ | 456 |
| `clear_cart` | `/clear` | DELETE | ✅ | 513 |
| `get_cart_count` | `/count` | GET | ✅ | 558 |
| `get_all_carts` | `/admin/all` | GET | ✅ | 588 |
| `get_user_cart` | `/admin/user/<user_id>` | GET | ✅ | 666 |

</details>

### checkout.py

- Total de endpoints: 13
- Protegidos: 13
- Gaps: 0

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `checkout_home` | `/` | GET | ✅ | 29 |
| `create_checkout_session` | `/session` | POST | ✅ | 53 |
| `validate_checkout` | `/validate` | POST | ✅ | 137 |
| `process_checkout` | `/process` | POST | ✅ | 189 |
| `checkout_success` | `/success` | GET | ✅ | 264 |
| `cancel_checkout` | `/cancel` | POST | ✅ | 293 |
| `start_checkout` | `/start` | POST | ✅ | 500 |
| `validate_cep_route` | `/validate-cep` | POST | ✅ | 599 |
| `calculate_shipping_options` | `/shipping-options` | POST | ✅ | 622 |
| `apply_coupon` | `/apply-coupon` | POST | ✅ | 661 |
| `complete_checkout` | `/complete` | POST | ✅ | 718 |
| `get_payment_methods` | `/payment-methods` | GET | ✅ | 864 |
| `get_abandoned_carts` | `/abandoned-carts` | GET | ✅ | 914 |

</details>

### coupons.py

- Total de endpoints: 8
- Protegidos: 8
- Gaps: 0

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_coupons` | `/` | GET | ✅ | 14 |
| `create_coupon` | `/` | POST | ✅ | 52 |
| `get_coupon` | `/<coupon_id>` | GET | ✅ | 105 |
| `update_coupon` | `/<coupon_id>` | PUT | ✅ | 120 |
| `validate_coupon` | `/validate/<code>` | POST | ✅ | 173 |
| `apply_coupon` | `/apply` | POST | ✅ | 246 |
| `get_coupons_analytics` | `/analytics` | GET | ✅ | 299 |
| `get_coupon_usage` | `/<coupon_id>/usage` | GET | ✅ | 350 |

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
- Protegidos: 8
- Gaps: 0

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_customer_types` | `/types` | GET | ✅ | 26 |
| `get_customers` | `/` | GET | ✅ | 56 |
| `create_customer` | `/` | POST | ✅ | 98 |
| `get_customer` | `/<customer_id>` | GET | ✅ | 169 |
| `update_customer` | `/<customer_id>` | PUT | ✅ | 239 |
| `get_customer_addresses` | `/<customer_id>/addresses` | GET | ✅ | 303 |
| `add_customer_address` | `/<customer_id>/addresses` | POST | ✅ | 330 |
| `get_customers_analytics` | `/analytics/overview` | GET | ✅ | 385 |

</details>

### dashboard.py

- Total de endpoints: 3
- Protegidos: 3
- Gaps: 0

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_user_dashboard` | `/user/<user_id>` | GET | ✅ | 11 |
| `get_user_progress` | `/user/<user_id>/progress` | GET | ✅ | 79 |
| `get_user_recommendations` | `/user/<user_id>/recommendations` | GET | ✅ | 131 |

</details>

### debug.py

- Total de endpoints: 2
- Protegidos: 2
- Gaps: 0

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `debug_env` | `/env` | GET | ✅ | 36 |
| `debug_database` | `/database` | GET | ✅ | 112 |

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
- Protegidos: 9
- Gaps: 0

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_levels` | `/levels` | GET | ✅ | 26 |
| `create_level` | `/levels` | POST | ✅ | 40 |
| `get_my_points` | `/my-points` | GET | ✅ | 66 |
| `add_points_manual` | `/add-points` | POST | ✅ | 96 |
| `get_rewards` | `/rewards` | GET | ✅ | 144 |
| `create_reward` | `/rewards` | POST | ✅ | 158 |
| `redeem_reward` | `/rewards/<reward_id>/redeem` | POST | ✅ | 182 |
| `get_my_redemptions` | `/my-redemptions` | GET | ✅ | 252 |
| `get_leaderboard` | `/leaderboard` | GET | ✅ | 270 |

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
- Protegidos: 8
- Gaps: 0

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `calculate_shipping` | `/calculate` | POST | ✅ | 42 |
| `get_order_shipping` | `/order/<order_id>` | GET | ✅ | 77 |
| `create_shipment` | `/create-shipment` | POST | ✅ | 112 |
| `track_shipment` | `/track/<tracking_code>` | GET | ✅ | 198 |
| `cancel_shipment` | `/cancel-shipment/<shipment_id>` | POST | ✅ | 221 |
| `get_agencies` | `/agencies` | GET | ✅ | 263 |
| `webhook` | `/webhook` | POST | ❌ | 291 |
| `oauth_callback` | `/callback` | GET | ✅ | 318 |
| `get_shipments` | `/orders` | GET | ✅ | 352 |

</details>

### mercado_pago.py

- Total de endpoints: 12
- Protegidos: 10
- Gaps: 0

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `create_preference` | `/create-preference` | POST | ✅ | 57 |
| `process_payment` | `/process-payment` | POST | ✅ | 197 |
| `webhook_test` | `/webhook` | GET | ❌ | 329 |
| `webhook` | `/webhook` | POST | ❌ | 343 |
| `get_payment_status` | `/payment/<payment_id>` | GET | ✅ | 405 |
| `get_payment_methods` | `/payment-methods` | GET | ✅ | 464 |
| `refund_payment` | `/refund` | POST | ✅ | 487 |
| `create_card_token` | `/transparent/create-card-token` | POST | ✅ | 547 |
| `process_transparent_payment` | `/transparent/process-payment` | POST | ✅ | 587 |
| `validate_payment_data` | `/transparent/validate-payment` | POST | ✅ | 716 |
| `get_installments` | `/transparent/installments` | GET | ✅ | 747 |
| `get_transparent_payment_methods` | `/transparent/payment-methods` | GET | ✅ | 781 |

</details>

### newsletter.py

- Total de endpoints: 9
- Protegidos: 9
- Gaps: 0

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `subscribe` | `/subscribe` | POST | ✅ | 24 |
| `unsubscribe` | `/unsubscribe` | POST | ✅ | 77 |
| `get_subscribers` | `/subscribers` | GET | ✅ | 102 |
| `get_templates` | `/templates` | GET | ✅ | 130 |
| `create_template` | `/templates` | POST | ✅ | 148 |
| `get_campaigns` | `/campaigns` | GET | ✅ | 186 |
| `create_campaign` | `/campaigns` | POST | ✅ | 204 |
| `send_campaign` | `/campaigns/<campaign_id>/send` | POST | ✅ | 242 |
| `get_campaign_stats` | `/campaigns/<campaign_id>/stats` | GET | ✅ | 279 |

</details>

### notifications.py

- Total de endpoints: 13
- Protegidos: 12
- Gaps: 0

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_user_notifications` | `/` | GET | ✅ | 30 |
| `mark_notification_as_read` | `/<int:notification_id>/read` | POST | ✅ | 84 |
| `mark_all_as_read` | `/read-all` | POST | ✅ | 114 |
| `delete_notification` | `/<int:notification_id>` | DELETE | ✅ | 140 |
| `get_notification_preferences` | `/preferences` | GET | ✅ | 164 |
| `update_notification_preferences` | `/preferences` | POST | ✅ | 193 |
| `send_notification` | `/send` | POST | ✅ | 239 |
| `broadcast_notification` | `/broadcast` | POST | ✅ | 279 |
| `get_notification_templates` | `/admin/templates` | GET | ✅ | 343 |
| `create_notification_template` | `/admin/templates` | POST | ✅ | 357 |
| `get_notification_logs` | `/admin/logs` | GET | ✅ | 399 |
| `get_notification_stats` | `/admin/stats` | GET | ✅ | 491 |
| `notifications_health` | `/health` | GET | ❌ | 564 |

</details>

### orders.py

- Total de endpoints: 6
- Protegidos: 6
- Gaps: 0

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_orders` | `/` | GET | ✅ | 16 |
| `get_order` | `/<order_id>` | GET | ✅ | 61 |
| `create_order` | `/` | POST | ✅ | 105 |
| `update_order_status` | `/<order_id>/status` | PUT | ✅ | 282 |
| `orders_analytics` | `/analytics` | GET | ✅ | 325 |
| `performance_comparison` | `/performance-comparison` | GET | ✅ | 382 |

</details>

### payments.py

- Total de endpoints: 7
- Protegidos: 6
- Gaps: 0

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `payments_home` | `/` | GET | ✅ | 17 |
| `process_payment` | `/process` | POST | ✅ | 86 |
| `get_payment` | `/<payment_id>` | GET | ✅ | 162 |
| `get_order_payments` | `/order/<order_id>` | GET | ✅ | 193 |
| `get_payment_methods` | `/methods` | GET | ✅ | 219 |
| `payment_webhook` | `/webhook` | POST | ❌ | 258 |
| `refund_payment` | `/refund/<payment_id>` | POST | ✅ | 296 |

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
- Protegidos: 7
- Gaps: 0

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_products` | `/` | GET | ✅ | 99 |
| `debug_uuid_product` | `/debug-uuid/<product_id>` | GET | ✅ | 287 |
| `debug_products` | `/debug-search` | GET | ✅ | 317 |
| `get_product_by_id` | `/by-id/<product_id>` | GET | ✅ | 366 |
| `get_product` | `/<product_id>` | GET | ✅ | 452 |
| `get_categories` | `/categories` | GET | ❌ | 536 |
| `get_featured_products` | `/featured` | GET | ✅ | 560 |
| `search_products` | `/search` | GET | ✅ | 602 |

</details>

### products_controller.py

- Total de endpoints: 15
- Protegidos: 14
- Gaps: 0

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_products` | `/` | GET | ✅ | 175 |
| `get_product` | `/<int:product_id>` | GET | ✅ | 183 |
| `create_product` | `/` | POST | ✅ | 191 |
| `update_product` | `/<int:product_id>` | PUT | ✅ | 199 |
| `delete_product` | `/<int:product_id>` | DELETE | ✅ | 207 |
| `search_products` | `/search` | GET | ✅ | 215 |
| `get_featured_products` | `/featured` | GET | ✅ | 223 |
| `get_products_by_category` | `/category/<category>` | GET | ✅ | 231 |
| `get_low_stock_products` | `/low-stock` | GET | ✅ | 239 |
| `toggle_product_status` | `/<int:product_id>/toggle-status` | POST | ✅ | 247 |
| `update_stock` | `/<int:product_id>/stock` | PUT | ✅ | 255 |
| `get_product_categories` | `/categories` | GET | ❌ | 262 |
| `bulk_create_products` | `/bulk` | POST | ✅ | 270 |
| `bulk_update_products` | `/bulk` | PUT | ✅ | 281 |
| `bulk_delete_products` | `/bulk` | DELETE | ✅ | 292 |

</details>

### reviews.py

- Total de endpoints: 15
- Protegidos: 15
- Gaps: 0

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_all_reviews` | `/` | GET | ✅ | 123 |
| `get_product_reviews` | `/product/<int:product_id>` | GET | ✅ | 156 |
| `get_product_review_stats` | `/product/<int:product_id>/stats` | GET | ✅ | 276 |
| `create_review` | `/product/<int:product_id>` | POST | ✅ | 328 |
| `update_review` | `/<int:review_id>` | PUT | ✅ | 404 |
| `delete_review` | `/<int:review_id>` | DELETE | ✅ | 459 |
| `vote_review_helpful` | `/<int:review_id>/helpful` | POST | ✅ | 492 |
| `add_company_response` | `/<int:review_id>/response` | POST | ✅ | 573 |
| `get_product_featured_reviews` | `/product/<int:product_id>/featured` | GET | ✅ | 637 |
| `get_featured_reviews` | `/featured` | GET | ✅ | 679 |
| `moderate_review` | `/<int:review_id>/moderate` | PUT | ✅ | 737 |
| `get_product_recent_reviews` | `/product/<int:product_id>/recent` | GET | ✅ | 786 |
| `get_product_rating_distribution` | `/product/<int:product_id>/rating-distribution` | GET | ✅ | 827 |
| `get_product_engagement_metrics` | `/product/<int:product_id>/engagement` | GET | ✅ | 875 |
| `get_enhanced_product_review_stats` | `/product/<int:product_id>/enhanced-stats` | GET | ✅ | 927 |

</details>

### reviews_simple.py

- Total de endpoints: 10
- Protegidos: 9
- Gaps: 0

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_all_reviews` | `/` | GET | ✅ | 48 |
| `test_route` | `/test` | GET | ✅ | 70 |
| `debug_routes` | `/debug-routes` | GET | ❌ | 76 |
| `get_product_review_stats` | `/product/<product_id>/stats` | GET | ✅ | 82 |
| `get_rating_distribution` | `/product/<product_id>/rating-distribution` | GET | ✅ | 128 |
| `get_engagement_metrics` | `/product/<product_id>/engagement` | GET | ✅ | 173 |
| `get_recent_reviews` | `/product/<product_id>/recent` | GET | ✅ | 214 |
| `get_featured_reviews` | `/product/<product_id>/featured` | GET | ✅ | 316 |
| `get_product_reviews` | `/product/<product_id>` | GET | ✅ | 395 |
| `add_review` | `/add` | POST | ✅ | 515 |

</details>

### security.py

- Total de endpoints: 5
- Protegidos: 5
- Gaps: 0

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `audit_requests` | `/audit/requests` | GET | ✅ | 23 |
| `get_blocked_ips` | `/blocked-ips` | GET | ✅ | 42 |
| `unblock_ip` | `/unblock-ip` | POST | ✅ | 73 |
| `get_rate_limits` | `/rate-limits` | GET | ✅ | 109 |
| `security_report` | `/security-report` | GET | ✅ | 128 |

</details>

### setup.py

- Total de endpoints: 9
- Protegidos: 9
- Gaps: 0

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `fix_reviews_types` | `/fix-reviews-types` | GET | ✅ | 11 |
| `create_reviews_table` | `/create-reviews` | GET | ✅ | 57 |
| `check_database_schema` | `/check-schema` | GET | ✅ | 126 |
| `test_endpoint` | `/test` | GET | ✅ | 165 |
| `force_init_database` | `/force-init` | POST, GET | ✅ | 175 |
| `create_tables` | `/create-tables` | POST | ✅ | 216 |
| `setup_render_database` | `/setup-render-db` | POST, GET | ✅ | 251 |
| `migrate_to_neon` | `/migrate-to-neon` | POST, GET | ✅ | 292 |
| `insert_sample_data` | `/insert-sample-data` | POST | ✅ | 333 |

</details>

### shipping.py

- Total de endpoints: 5
- Protegidos: 5
- Gaps: 0

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `shipping_home` | `/` | GET | ✅ | 13 |
| `calculate_shipping` | `/calculate` | POST | ✅ | 54 |
| `get_cep_info` | `/cep/<cep>` | GET | ✅ | 165 |
| `get_shipping_services` | `/services` | GET | ✅ | 218 |
| `create_shipping_quote` | `/quote` | POST | ✅ | 261 |

</details>

### stock.py

- Total de endpoints: 5
- Protegidos: 5
- Gaps: 0

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_stock` | `, methods=[` | GET | ✅ | 19 |
| `get_product_stock` | `/<product_id>` | GET | ✅ | 95 |
| `adjust_stock` | `/<product_id>/adjust` | POST | ✅ | 141 |
| `get_stock_movements` | `/movements` | GET | ✅ | 226 |
| `get_stock_alerts` | `/alerts` | GET | ✅ | 271 |

</details>

### user.py

- Total de endpoints: 5
- Protegidos: 5
- Gaps: 0

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_users` | `/users` | GET | ✅ | 9 |
| `create_user` | `/users` | POST | ✅ | 15 |
| `get_user` | `/users/<int:user_id>` | GET | ✅ | 25 |
| `update_user` | `/users/<int:user_id>` | PUT | ✅ | 31 |
| `delete_user` | `/users/<int:user_id>` | DELETE | ✅ | 41 |

</details>

### wishlist.py

- Total de endpoints: 4
- Protegidos: 4
- Gaps: 0

<details>
<summary>Ver todos os endpoints</summary>

| Função | Path | Métodos | JWT | Linha |
|--------|------|---------|-----|-------|
| `get_wishlist` | `/` | GET | ✅ | 13 |
| `add_to_wishlist` | `/add` | POST | ✅ | 58 |
| `remove_from_wishlist` | `/remove/<int:product_id>` | DELETE | ✅ | 130 |
| `toggle_wishlist` | `/toggle` | POST | ✅ | 176 |

</details>

## Recomendações

### Manutenção

- ✅ Manter cobertura de JWT em novos endpoints
- ✅ Executar auditoria regularmente (mensal)
- ✅ Revisar logs de acesso periodicamente
- ✅ Atualizar documentação de segurança

## Referências

- [Flask-JWT-Extended Documentation](https://flask-jwt-extended.readthedocs.io/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

