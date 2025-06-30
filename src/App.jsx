import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext';
import { CartProvider } from './contexts/CartContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MarketplacePage from './pages/MarketplacePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import GamificationPage from './pages/GamificationPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import MapPage from './pages/MapPage';
import CoursesPage from './pages/CoursesPage';
import ForumPage from './pages/ForumPage';
import BlogPage from './pages/BlogPage';
import BlogPostDetailPage from './pages/BlogPostDetailPage';
import AdminBlogManager from './pages/AdminBlogManager';
import AdminCRMDashboard from './pages/AdminCRMDashboard';
import AdminFinancialReports from './pages/AdminFinancialReports';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminFinancial from './pages/AdminFinancial';
import AccountActivationPage from './pages/AccountActivationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import NotFoundPage from './pages/NotFoundPage';
import CustomerDetailView from './pages/CustomerDetailView';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <SupabaseAuthProvider>
        <CartProvider>
          <Router>
            <div className="App min-h-screen transition-colors duration-300" style={{
              backgroundColor: 'var(--color-bg-primary)',
              color: 'var(--color-text-primary)'
            }}>
              <Header />

              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/activate/:token" element={<AccountActivationPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/auth/callback" element={<AuthCallbackPage />} />
                  <Route path="/marketplace" element={<MarketplacePage />} />
                  <Route path="/produto/:id" element={<ProductDetailPage />} />
                  <Route path="/carrinho" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/dashboard" element={<CustomerDashboard />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/crm" element={<AdminCRMDashboard />} />
                  <Route path="/admin/customer/:customerId" element={<CustomerDetailView />} />
                  <Route path="/admin/blog" element={<AdminBlogManager />} />
                  <Route path="/admin/financeiro" element={<AdminFinancialReports />} />
                  <Route path="/admin/analytics" element={<AdminAnalytics />} />
                  <Route path="/gamificacao" element={<GamificationPage />} />
                  <Route path="/cursos" element={<CoursesPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/blog/:slug" element={<BlogPostDetailPage />} />
                  <Route path="/forum" element={<ForumPage />} />
                  <Route path="/contato" element={<ContactPage />} />
                  <Route path="/sobre" element={<AboutPage />} />
                  <Route path="/perfil" element={<ProfilePage />} />
                  <Route path="/pedidos" element={<OrdersPage />} />
                  <Route path="/localizacoes" element={<MapPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </SupabaseAuthProvider>
    </ThemeProvider>
  );
}

export default App; 