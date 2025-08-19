import { lazy, Suspense, useEffect } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import analytics from "./services/analytics";

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="mt-4 text-gray-600">Carregando...</p>
    </div>
  </div>
);

// 🔍 CORREÇÃO: APENAS PÁGINAS QUE EXISTEM
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
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const CustomerDashboard = lazy(() => import("./pages/CustomerDashboard"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const GamificacaoPage = lazy(() => import("./pages/GamificacaoPage"));
const CursosPage = lazy(() => import("./pages/CursosPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

// Admin pages - APENAS OS QUE EXISTEM
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const AdminEstoqueDashboard = lazy(() => import("./pages/AdminEstoqueDashboard"));

function App() {
  useEffect(() => {
    // Track page view inicial - analytics já é inicializado automaticamente
    analytics.trackPageView(window.location.pathname);
  }, []);

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
                      <Route path="/carrinho" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      
                      {/* Customer Routes */}
                      <Route path="/dashboard" element={<CustomerDashboard />} />
                      <Route path="/perfil" element={<ProfilePage />} />
                      <Route path="/pedidos" element={<OrdersPage />} />
                      
                      {/* Admin Routes - APENAS OS QUE EXISTEM */}
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route
                        path="/admin/dashboard"
                        element={<AdminDashboard />}
                      />
                      <Route
                        path="/admin/estoque"
                        element={<AdminEstoqueDashboard />}
                      />
                      <Route
                        path="/admin/analytics"
                        element={<AdminAnalytics />}
                      />
                      
                      {/* Content Routes - APENAS OS QUE EXISTEM */}
                      <Route path="/contato" element={<ContactPage />} />
                      <Route path="/sobre" element={<AboutPage />} />
                      <Route path="/gamificacao" element={<GamificacaoPage />} />
                      <Route path="/cursos" element={<CursosPage />} />
                      <Route path="/blog" element={<BlogPage />} />
                      
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
