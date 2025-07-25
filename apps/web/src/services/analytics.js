/**
 * Serviço de Analytics em Tempo Real
 * Coleta eventos do usuário e envia para API de analytics
 */

class AnalyticsService {
    constructor() {
        this.baseURL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/analytics`;
        this.eventQueue = [];
        this.sessionId = this.getOrCreateSessionId();
        this.userId = null;
        this.isEnabled = import.meta.env.MODE === 'production' || import.meta.env.VITE_ANALYTICS_ENABLED === 'true';
        this.batchSize = 10;
        this.flushInterval = 5000; // 5 segundos
        
        this.initializeService();
    }

    initializeService() {
        if (!this.isEnabled) {
            console.log('Analytics disabled in development');
            return;
        }

        // Inicializar sessão
        this.trackEvent('session_start', {
            referrer: document.referrer,
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            timestamp: new Date().toISOString()
        });

        // Flush periódico da fila
        setInterval(() => {
            this.flushEventQueue();
        }, this.flushInterval);

        // Flush ao sair da página
        window.addEventListener('beforeunload', () => {
            this.trackEvent('session_end');
            this.flushEventQueue(true);
        });

        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackEvent('page_hidden');
            } else {
                this.trackEvent('page_visible');
            }
        });

        console.log('Analytics service initialized');
    }

    getOrCreateSessionId() {
        let sessionId = sessionStorage.getItem('analytics_session_id');
        if (!sessionId) {
            sessionId = this.generateUUID();
            sessionStorage.setItem('analytics_session_id', sessionId);
        }
        return sessionId;
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    setUserId(userId) {
        this.userId = userId;
        this.trackEvent('user_identified', {
            user_id: userId
        });
    }

    // Eventos principais de e-commerce
    trackPageView(page, title = null) {
        this.trackEvent('page_view', {
            page_url: window.location.href,
            page_title: title || document.title,
            page_path: page || window.location.pathname,
            referrer: document.referrer
        });
    }

    trackProductView(product) {
        this.trackEvent('product_view', {
            product_id: product.id,
            product_name: product.name,
            product_category: product.category,
            product_price: product.price,
            custom_data: {
                product_description: product.description,
                product_brand: product.brand,
                in_stock: product.in_stock
            }
        });
    }

    trackAddToCart(product, quantity = 1) {
        this.trackEvent('add_to_cart', {
            product_id: product.id,
            product_name: product.name,
            product_category: product.category,
            product_price: product.price,
            product_quantity: quantity,
            event_value: product.price * quantity
        });
    }

    trackRemoveFromCart(product, quantity = 1) {
        this.trackEvent('remove_from_cart', {
            product_id: product.id,
            product_name: product.name,
            product_category: product.category,
            product_price: product.price,
            product_quantity: quantity,
            event_value: product.price * quantity
        });
    }

    trackCartView(cartItems, totalValue) {
        this.trackEvent('cart_view', {
            event_value: totalValue,
            custom_data: {
                cart_items: cartItems.map(item => ({
                    product_id: item.id,
                    product_name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                cart_size: cartItems.length
            }
        });
    }

    trackCheckoutStart(cartItems, totalValue) {
        this.trackEvent('checkout_start', {
            event_value: totalValue,
            custom_data: {
                checkout_items: cartItems.map(item => ({
                    product_id: item.id,
                    product_name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                checkout_value: totalValue
            }
        });
    }

    trackCheckoutStep(step, stepName, additionalData = {}) {
        this.trackEvent('checkout_step', {
            event_category: 'checkout',
            event_action: stepName,
            event_label: `step_${step}`,
            custom_data: {
                step_number: step,
                step_name: stepName,
                ...additionalData
            }
        });
    }

    trackPaymentStart(paymentMethod, amount) {
        this.trackEvent('payment_start', {
            event_value: amount,
            custom_data: {
                payment_method: paymentMethod,
                amount: amount,
                currency: 'BRL'
            }
        });
    }

    trackPurchaseComplete(transactionId, items, totalValue, paymentMethod) {
        this.trackEvent('checkout_complete', {
            transaction_id: transactionId,
            transaction_value: totalValue,
            currency: 'BRL',
            custom_data: {
                payment_method: paymentMethod,
                items: items.map(item => ({
                    product_id: item.id,
                    product_name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                order_total: totalValue
            }
        });
    }

    trackPaymentFailure(paymentMethod, amount, error) {
        this.trackEvent('payment_failure', {
            event_value: amount,
            custom_data: {
                payment_method: paymentMethod,
                amount: amount,
                currency: 'BRL',
                error_message: error,
                error_code: error.code || 'unknown'
            }
        });
    }

    // Eventos de engajamento
    trackButtonClick(buttonName, location, additionalData = {}) {
        this.trackEvent('button_click', {
            event_category: 'engagement',
            event_action: 'click',
            event_label: buttonName,
            custom_data: {
                button_name: buttonName,
                button_location: location,
                page_url: window.location.href,
                ...additionalData
            }
        });
    }

    trackFormSubmit(formName, formData = {}) {
        this.trackEvent('form_submit', {
            event_category: 'engagement',
            event_action: 'submit',
            event_label: formName,
            custom_data: {
                form_name: formName,
                form_data: formData,
                page_url: window.location.href
            }
        });
    }

    trackSearch(searchTerm, resultsCount = null) {
        this.trackEvent('product_search', {
            event_category: 'search',
            event_action: 'search',
            event_label: searchTerm,
            custom_data: {
                search_term: searchTerm,
                results_count: resultsCount,
                page_url: window.location.href
            }
        });
    }

    trackScrollDepth(percentage) {
        // Throttle scroll depth tracking
        const now = Date.now();
        if (!this.lastScrollTrack || now - this.lastScrollTrack > 5000) {
            this.trackEvent('scroll_depth', {
                event_category: 'engagement',
                event_action: 'scroll',
                event_value: percentage,
                custom_data: {
                    scroll_percentage: percentage,
                    page_url: window.location.href
                }
            });
            this.lastScrollTrack = now;
        }
    }

    trackTimeOnPage(seconds) {
        this.trackEvent('time_on_page', {
            event_category: 'engagement',
            event_action: 'time_spent',
            event_value: seconds,
            custom_data: {
                time_seconds: seconds,
                time_minutes: Math.round(seconds / 60),
                page_url: window.location.href
            }
        });
    }

    // Eventos de erro
    trackError(error, context = '') {
        this.trackEvent('js_error', {
            event_category: 'error',
            event_action: 'javascript_error',
            event_label: error.message || 'Unknown error',
            custom_data: {
                error_message: error.message,
                error_stack: error.stack,
                error_context: context,
                page_url: window.location.href,
                user_agent: navigator.userAgent
            }
        });
    }

    // Método principal de tracking
    trackEvent(eventType, properties = {}) {
        if (!this.isEnabled) {
            return;
        }

        const event = {
            event_type: eventType,
            properties: {
                ...properties,
                session_id: this.sessionId,
                user_id: this.userId,
                timestamp: new Date().toISOString(),
                page_url: window.location.href,
                page_title: document.title,
                referrer: document.referrer
            }
        };

        // Adicionar à fila
        this.eventQueue.push(event);

        // Flush se atingir o batch size
        if (this.eventQueue.length >= this.batchSize) {
            this.flushEventQueue();
        }

        console.log('Analytics event tracked:', eventType, properties);
    }

    // Envio de eventos para API
    async flushEventQueue(synchronous = false) {
        if (this.eventQueue.length === 0) {
            return;
        }

        const events = [...this.eventQueue];
        this.eventQueue = [];

        const payload = { events };

        try {
            const fetchOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            };

            if (synchronous) {
                // Para eventos críticos (como session_end)
                if (navigator.sendBeacon) {
                    navigator.sendBeacon(
                        `${this.baseURL}/track/batch`,
                        JSON.stringify(payload)
                    );
                } else {
                    fetchOptions.keepalive = true;
                }
            }

            const response = await fetch(`${this.baseURL}/track/batch`, fetchOptions);

            if (!response.ok) {
                throw new Error(`Analytics API error: ${response.status}`);
            }

            const result = await response.json();
            console.log('Analytics events sent:', result);

        } catch (error) {
            console.error('Failed to send analytics events:', error);
            
            // Re-adicionar eventos à fila em caso de erro
            this.eventQueue.unshift(...events);
        }
    }

    // Métodos utilitários
    identify(userId, traits = {}) {
        this.setUserId(userId);
        this.trackEvent('user_register', {
            user_id: userId,
            custom_data: traits
        });
    }

    reset() {
        this.userId = null;
        this.sessionId = this.generateUUID();
        sessionStorage.setItem('analytics_session_id', this.sessionId);
        this.eventQueue = [];
    }

    // Auto-track scroll depth
    initScrollTracking() {
        if (!this.isEnabled) return;

        let maxScrollDepth = 0;
        const trackingThresholds = [25, 50, 75, 90, 100];

        const trackScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = Math.round((scrollTop / scrollHeight) * 100);

            if (scrollPercent > maxScrollDepth) {
                maxScrollDepth = scrollPercent;
                
                // Track specific thresholds
                const threshold = trackingThresholds.find(t => scrollPercent >= t && maxScrollDepth < t);
                if (threshold) {
                    this.trackScrollDepth(threshold);
                }
            }
        };

        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(trackScroll, 100);
        });
    }

    // Auto-track time on page
    initTimeTracking() {
        if (!this.isEnabled) return;

        const startTime = Date.now();

        const trackTimeSpent = () => {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            this.trackTimeOnPage(timeSpent);
        };

        // Track time at specific intervals
        const intervals = [30, 60, 120, 300, 600]; // seconds
        intervals.forEach(interval => {
            setTimeout(trackTimeSpent, interval * 1000);
        });

        // Track time when leaving page
        window.addEventListener('beforeunload', trackTimeSpent);
    }
}

// Instância global
const analytics = new AnalyticsService();

// Auto-inicializar tracking adicional
analytics.initScrollTracking();
analytics.initTimeTracking();

// Capturar erros JavaScript globais
window.addEventListener('error', (event) => {
    analytics.trackError(event.error, 'global_error_handler');
});

// Capturar erros de Promise rejeitadas
window.addEventListener('unhandledrejection', (event) => {
    analytics.trackError(new Error(event.reason), 'unhandled_promise_rejection');
});

export default analytics;