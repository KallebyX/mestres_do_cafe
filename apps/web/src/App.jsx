import { lazy, Suspense } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ThemeProvider } from "./contexts/ThemeContext";

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="mt-4 text-gray-600">Carregando...</p>
    </div>
  </div>
);

// Lazy load all pages
const LandingPage = lazy(() => import("./pages/LandingPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const AccountActivationPage = lazy(() => import("./pages/AccountActivationPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const AuthCallbackPage = lazy(() => import("./pages/AuthCallbackPage"));
const MarketplacePage = lazy(() => import("./pages/MarketplacePage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const PremiumProductDetailPage = lazy(() => import("./pages/PremiumProductDetailPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const CustomerDashboard = lazy(() => import("./pages/CustomerDashboard"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostDetailPage = lazy(() => import("./pages/BlogPostDetailPage"));
const CoursesPage = lazy(() => import("./pages/CoursesPage"));
const ForumPage = lazy(() => import("./pages/ForumPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const MapPage = lazy(() => import("./pages/MapPage"));
const GamificationPage = lazy(() => import("./pages/GamificationPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const DesignSystemDemo = lazy(() => import("./pages/DesignSystemDemo"));
const ProductCardsDemo = lazy(() => import("./pages/ProductCardsDemo"));

// Admin pages - grouped for better code splitting
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const AdminBIDashboard = lazy(() => import("./pages/AdminBIDashboard"));
const AdminBlogManager = lazy(() => import("./pages/AdminBlogManager"));
const AdminComprasDashboard = lazy(() => import("./pages/AdminComprasDashboard"));
const AdminConfigDashboard = lazy(() => import("./pages/AdminConfigDashboard"));
const AdminContabilidadeDashboard = lazy(() => import("./pages/AdminContabilidadeDashboard"));
const AdminCRMDashboard = lazy(() => import("./pages/AdminCRMDashboard"));
const AdminEstoqueDashboard = lazy(() => import("./pages/AdminEstoqueDashboard"));
const AdminEstoqueDashboardEnterprise = lazy(() => import("./pages/AdminEstoqueDashboardEnterprise"));
const AdminFinanceiroDashboard = lazy(() => import("./pages/AdminFinanceiroDashboard"));
const AdminFinancialReports = lazy(() => import("./pages/AdminFinancialReports"));
const AdminProducaoDashboard = lazy(() => import("./pages/AdminProducaoDashboard"));
const AdminRHDashboard = lazy(() => import("./pages/AdminRHDashboard"));
const AdminVendasDashboard = lazy(() => import("./pages/AdminVendasDashboard"));
const CustomerDetailView = lazy(() => import("./pages/CustomerDetailView"));

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <CartProvider>
            <Router>
              <div
                className="App min-h-screen transition-colors duration-300"
                style={{
                  backgroundColor: "var(--color-bg-primary)",
                  color: "var(--color-text-primary)",
                }}
              >
                <Header />

                <main className="flex-1">
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route
                        path="/activate/:token"
                        element={<AccountActivationPage />}
                      />
                      <Route
                        path="/forgot-password"
                        element={<ForgotPasswordPage />}
                      />
                      <Route
                        path="/reset-password"
                        element={<ResetPasswordPage />}
                      />
                      <Route
                        path="/auth/callback"
                        element={<AuthCallbackPage />}
                      />
                      
                      {/* Shop Routes */}
                      <Route path="/marketplace" element={<MarketplacePage />} />
                      <Route
                        path="/produto/:id"
                        element={<ProductDetailPage />}
                      />
                      <Route
                        path="/produto-premium/:id"
                        element={<PremiumProductDetailPage />}
                      />
                      <Route path="/carrinho" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      
                      {/* Customer Routes */}
                      <Route path="/dashboard" element={<CustomerDashboard />} />
                      <Route path="/perfil" element={<ProfilePage />} />
                      <Route path="/pedidos" element={<OrdersPage />} />
                      
                      {/* Admin Routes */}
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route
                        path="/admin/dashboard"
                        element={<AdminDashboard />}
                      />
                      <Route path="/admin/crm" element={<AdminCRMDashboard />} />
                      <Route
                        path="/admin/customer/:customerId"
                        element={<CustomerDetailView />}
                      />
                      <Route path="/admin/blog" element={<AdminBlogManager />} />
                      <Route
                        path="/admin/financeiro"
                        element={<AdminFinanceiroDashboard />}
                      />
                      <Route
                        path="/admin/financeiro/relatorios"
                        element={<AdminFinancialReports />}
                      />
                      <Route
                        path="/admin/estoque"
                        element={<AdminEstoqueDashboard />}
                      />
                      <Route
                        path="/admin/estoque-enterprise"
                        element={<AdminEstoqueDashboardEnterprise />}
                      />
                      <Route path="/admin/rh" element={<AdminRHDashboard />} />
                      <Route
                        path="/admin/vendas"
                        element={<AdminVendasDashboard />}
                      />
                      <Route
                        path="/admin/compras"
                        element={<AdminComprasDashboard />}
                      />
                      <Route
                        path="/admin/producao"
                        element={<AdminProducaoDashboard />}
                      />
                      <Route
                        path="/admin/contabilidade"
                        element={<AdminContabilidadeDashboard />}
                      />
                      <Route path="/admin/bi" element={<AdminBIDashboard />} />
                      <Route
                        path="/admin/config"
                        element={<AdminConfigDashboard />}
                      />
                      <Route
                        path="/admin/analytics"
                        element={<AdminAnalytics />}
                      />
                      
                      {/* Content Routes */}
                      <Route path="/gamificacao" element={<GamificationPage />} />
                      <Route path="/cursos" element={<CoursesPage />} />
                      <Route path="/blog" element={<BlogPage />} />
                      <Route
                        path="/blog/:slug"
                        element={<BlogPostDetailPage />}
                      />
                      <Route path="/forum" element={<ForumPage />} />
                      <Route path="/contato" element={<ContactPage />} />
                      <Route path="/sobre" element={<AboutPage />} />
                      <Route path="/localizacoes" element={<MapPage />} />
                      
                      {/* Dev Routes */}
                      <Route path="/design-system" element={<DesignSystemDemo />} />
                      <Route path="/product-cards-demo" element={<ProductCardsDemo />} />
                      
                      {/* 404 */}
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </Suspense>
                </main>
                <Footer />
              </div>
            </Router>
          </CartProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
