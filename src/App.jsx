import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext';
import { CartProvider } from './contexts/CartContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { lazy, Suspense } from 'react';
import LoadingStates from './components/LoadingStates';

// ✅ LAZY LOADING - Páginas públicas
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

// ✅ LAZY LOADING - E-commerce
const MarketplacePage = lazy(() => import('./pages/MarketplacePage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));

// ✅ LAZY LOADING - Dashboards (grandes)
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// ✅ LAZY LOADING - Módulos Admin (muito grandes)
const AdminCRMDashboard = lazy(() => import('./pages/AdminCRMDashboard'));
const AdminEstoqueDashboard = lazy(() => import('./pages/AdminEstoqueDashboard'));
const AdminEstoqueDashboardEnterprise = lazy(() => import('./pages/AdminEstoqueDashboardEnterprise'));
const AdminFinanceiroDashboard = lazy(() => import('./pages/AdminFinanceiroDashboard'));
const AdminRHDashboard = lazy(() => import('./pages/AdminRHDashboard'));
const AdminVendasDashboard = lazy(() => import('./pages/AdminVendasDashboard'));
const AdminComprasDashboard = lazy(() => import('./pages/AdminComprasDashboard'));
const AdminProducaoDashboard = lazy(() => import('./pages/AdminProducaoDashboard'));
const AdminContabilidadeDashboard = lazy(() => import('./pages/AdminContabilidadeDashboard'));
const AdminBIDashboard = lazy(() => import('./pages/AdminBIDashboard'));
const AdminConfigDashboard = lazy(() => import('./pages/AdminConfigDashboard'));

// ✅ LAZY LOADING - Funcionalidades extras
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostDetailPage = lazy(() => import('./pages/BlogPostDetailPage'));
const CoursesPage = lazy(() => import('./pages/CoursesPage'));
const GamificationPage = lazy(() => import('./pages/GamificationPage'));
const ForumPage = lazy(() => import('./pages/ForumPage'));
const MapPage = lazy(() => import('./pages/MapPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));

// ✅ LAZY LOADING - Páginas especiais
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'));
const AdminBlogManager = lazy(() => import('./pages/AdminBlogManager'));
const AdminFinancial = lazy(() => import('./pages/AdminFinancial'));
const AdminFinancialReports = lazy(() => import('./pages/AdminFinancialReports'));
const AccountActivationPage = lazy(() => import('./pages/AccountActivationPage'));
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage'));
const CustomerDetailView = lazy(() => import('./pages/CustomerDetailView'));
const FileUploadDemo = lazy(() => import('./pages/FileUploadDemo'));

// Páginas de erro (sempre carregadas)
import NotFoundPage from './pages/NotFoundPage';

// ✅ COMPONENTE DE LOADING OTIMIZADO
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
    <div className="text-center">
      <LoadingStates.skeleton className="w-32 h-8 mx-auto mb-4" />
      <LoadingStates.skeleton className="w-48 h-4 mx-auto mb-2" />
      <LoadingStates.skeleton className="w-36 h-4 mx-auto" />
    </div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <SupabaseAuthProvider>
        <NotificationProvider>
          <CartProvider>
            <Router>
              <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
                <Header />
                
                {/* ✅ SUSPENSE WRAPPER - Carregamento otimizado */}
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Páginas públicas */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    
                    {/* E-commerce */}
                    <Route path="/marketplace" element={<MarketplacePage />} />
                    <Route path="/product/:id" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    
                    {/* Dashboards */}
                    <Route path="/dashboard" element={<CustomerDashboard />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    
                    {/* Admin - Dashboard Principal */}
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/analytics" element={<AdminAnalytics />} />
                    
                    {/* Admin - Módulos ERP */}
                    <Route path="/admin/crm" element={<AdminCRMDashboard />} />
                    <Route path="/admin/estoque" element={<AdminEstoqueDashboard />} />
                    <Route path="/admin/estoque-enterprise" element={<AdminEstoqueDashboardEnterprise />} />
                    <Route path="/admin/financeiro" element={<AdminFinanceiroDashboard />} />
                    <Route path="/admin/rh" element={<AdminRHDashboard />} />
                    <Route path="/admin/vendas" element={<AdminVendasDashboard />} />
                    <Route path="/admin/compras" element={<AdminComprasDashboard />} />
                    <Route path="/admin/producao" element={<AdminProducaoDashboard />} />
                    <Route path="/admin/contabilidade" element={<AdminContabilidadeDashboard />} />
                    <Route path="/admin/bi" element={<AdminBIDashboard />} />
                    <Route path="/admin/config" element={<AdminConfigDashboard />} />
                    
                    {/* Admin - Funcionalidades */}
                    <Route path="/admin/blog" element={<AdminBlogManager />} />
                    <Route path="/admin/financial" element={<AdminFinancial />} />
                    <Route path="/admin/financial-reports" element={<AdminFinancialReports />} />
                    <Route path="/admin/customers/:id" element={<CustomerDetailView />} />
                    
                    {/* Conteúdo */}
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/blog/:slug" element={<BlogPostDetailPage />} />
                    <Route path="/courses" element={<CoursesPage />} />
                    
                    {/* Funcionalidades extras */}
                    <Route path="/gamification" element={<GamificationPage />} />
                    <Route path="/forum" element={<ForumPage />} />
                    <Route path="/map" element={<MapPage />} />
                    
                    {/* Páginas especiais */}
                    <Route path="/auth/callback" element={<AuthCallbackPage />} />
                    <Route path="/activate-account" element={<AccountActivationPage />} />
                    <Route path="/file-upload-demo" element={<FileUploadDemo />} />
                    
                    {/* 404 - Sempre carregada */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
                
                <Footer />
              </div>
            </Router>
          </NotificationProvider>
        </CartProvider>
      </SupabaseAuthProvider>
    </ThemeProvider>
  );
}

export default App; 