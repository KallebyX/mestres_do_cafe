// Barrel exports para serviços
export {
  analyticsAPI, default as api, authAPI, blogAPI, cartAPI, checkoutApi, financialAPI,
  hrAPI, newsletterAPI, notificationAPI, ordersAPI, productsAPI, reportsAPI, reviewsAPI, shippingAPI, stockAPI, wishlistAPI
} from './api.js';

export { adminCustomersApi } from './admin-customers-api.js';
export {
  getNewsletterStats, getWhatsAppStatus, sendEmailNewsletter,
  sendWhatsAppNewsletter
} from './newsletter-api.js';

