import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import AboutPage from "./pages/AboutPage";
import AccountActivationPage from "./pages/AccountActivationPage";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminBIDashboard from "./pages/AdminBIDashboard";
import AdminBlogManager from "./pages/AdminBlogManager";
import AdminComprasDashboard from "./pages/AdminComprasDashboard";
import AdminConfigDashboard from "./pages/AdminConfigDashboard";
import AdminContabilidadeDashboard from "./pages/AdminContabilidadeDashboard";
import AdminCRMDashboard from "./pages/AdminCRMDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEstoqueDashboard from "./pages/AdminEstoqueDashboard";
import AdminEstoqueDashboardEnterprise from "./pages/AdminEstoqueDashboardEnterprise";
import AdminFinanceiroDashboard from "./pages/AdminFinanceiroDashboard";
import AdminFinancialReports from "./pages/AdminFinancialReports";
import AdminProducaoDashboard from "./pages/AdminProducaoDashboard";
import AdminRHDashboard from "./pages/AdminRHDashboard";
import AdminVendasDashboard from "./pages/AdminVendasDashboard";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import BlogPage from "./pages/BlogPage";
import BlogPostDetailPage from "./pages/BlogPostDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ContactPage from "./pages/ContactPage";
import CoursesPage from "./pages/CoursesPage";
import CustomerDashboard from "./pages/CustomerDashboard";
import CustomerDetailView from "./pages/CustomerDetailView";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ForumPage from "./pages/ForumPage";
import GamificationPage from "./pages/GamificationPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import MapPage from "./pages/MapPage";
import MarketplacePage from "./pages/MarketplacePage";
import NotFoundPage from "./pages/NotFoundPage";
import OrdersPage from "./pages/OrdersPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <CartProvider>
            <Router>
              <div
                className="App min-h-screen transition-colors duration-300 bg-brand-light text-brand-dark"
                style={{
                  backgroundColor: "var(--color-bg-primary)",
                  color: "var(--color-text-primary)",
                }}
              >
                <Header />

                <main className="flex-1">
                  <Routes>
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
                    <Route path="/marketplace" element={<MarketplacePage />} />
                    <Route
                      path="/produto/:id"
                      element={<ProductDetailPage />}
                    />
                    <Route path="/carrinho" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/dashboard" element={<CustomerDashboard />} />
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
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
