import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

// Páginas
import LandingPage from './pages/LandingPage';
import MarketplacePage from './pages/MarketplacePage';
import ProductPage from './pages/ProductPage';
import GamificationPage from './pages/GamificationPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';

// Páginas em construção
import Header from './components/Header';
import Footer from './components/Footer';
import { Link } from 'react-router-dom';

// Componente para páginas em construção
const ConstructionPage = ({ title, description }) => (
  <div className="min-h-screen bg-coffee-white font-montserrat">
    <Header />
    <div className="flex-1 flex items-center justify-center py-20">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-24 h-24 bg-gradient-coffee rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="text-4xl">🚧</span>
        </div>
        <h1 className="font-cormorant font-bold text-4xl text-coffee-intense mb-4">
          {title}
        </h1>
        <p className="text-coffee-gray mb-8 leading-relaxed">
          {description}
        </p>
        <Link to="/" className="btn-primary px-8 py-3">
          ← Voltar ao Início
        </Link>
      </div>
    </div>
    <Footer />
  </div>
);

// Página 404
const NotFoundPage = () => (
  <div className="min-h-screen bg-coffee-white font-montserrat">
    <Header />
    <div className="flex-1 flex items-center justify-center py-20">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-24 h-24 bg-gradient-coffee rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="text-4xl">☕</span>
        </div>
        <h1 className="font-cormorant font-bold text-6xl text-coffee-intense mb-4">
          404
        </h1>
        <p className="text-coffee-gray text-xl mb-6">
          Página não encontrada
        </p>
        <p className="text-coffee-gray mb-8">
          Parece que esta página se perdeu como um grão de café no armazém. 
          Que tal voltar ao início e descobrir nossos cafés especiais?
        </p>
        <Link to="/" className="btn-primary px-8 py-3">
          ← Voltar ao Início
        </Link>
      </div>
    </div>
    <Footer />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-coffee-white">
            <Routes>
              {/* Páginas principais */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/produto/:id" element={<ProductPage />} />
              <Route path="/gamificacao" element={<GamificationPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              
              {/* Autenticação */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Área do usuário */}
              <Route path="/cart" element={<CartPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/orders" element={<OrdersPage />} />
              
              {/* Páginas em construção */}
              <Route 
                path="/courses" 
                element={
                  <ConstructionPage 
                    title="Cursos de Barista"
                    description="Em breve ofereceremos cursos completos para você se tornar um expert em café. Aprenda técnicas de preparo, degustação e muito mais com nossos mestres."
                  />
                } 
              />
              <Route 
                path="/blog" 
                element={
                  <ConstructionPage 
                    title="Blog do Café"
                    description="Nosso blog está sendo preparado com muito carinho. Em breve você encontrará artigos exclusivos sobre o mundo dos cafés especiais, dicas e curiosidades."
                  />
                } 
              />
              <Route 
                path="/subscriptions" 
                element={
                  <ConstructionPage 
                    title="Planos de Assinatura"
                    description="Estamos desenvolvendo planos especiais para você receber os melhores cafés em casa mensalmente. Aguarde novidades incríveis!"
                  />
                } 
              />
              
              {/* Página 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

