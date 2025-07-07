import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleQuantityChange = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      updateQuantity(id, quantity);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-coffee-white font-montserrat">
        <main className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-32 h-32 bg-coffee-cream rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="text-coffee-gold text-6xl">🛒</span>
            </div>
            
            <h1 className="font-cormorant font-bold text-4xl text-coffee-intense mb-4">
              Seu carrinho está vazio
            </h1>
            
            <p className="text-coffee-gray text-lg mb-8">
              Que tal explorar nossos cafés especiais e adicionar alguns ao seu carrinho?
            </p>
            
            <Link 
              to="/marketplace"
              className="btn-primary inline-flex items-center px-8 py-3"
            >
              Explorar Cafés
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-coffee-white font-montserrat">
      
      <main className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-cormorant font-bold text-4xl text-coffee-intense mb-4">
              Meu Carrinho
            </h1>
            <p className="text-coffee-gray text-lg">
              Confira os produtos selecionados e finalize sua compra
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Lista de Produtos */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="card">
                    <div className="flex items-center space-x-4">
                      {/* Imagem do Produto */}
                      <div className="w-24 h-24 bg-coffee-cream rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-coffee-gold text-2xl">☕</span>
                        )}
                      </div>

                      {/* Detalhes do Produto */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-cormorant font-bold text-xl text-coffee-intense mb-1">
                          {item.name}
                        </h3>
                        <p className="text-coffee-gray text-sm mb-2 line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex items-center space-x-4">
                          <span className="text-coffee-gold font-bold text-lg">
                            R$ {item.price.toFixed(2)}
                          </span>
                          {item.weight && (
                            <span className="text-coffee-gray text-sm">
                              {item.weight}g
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Controles de Quantidade */}
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-coffee-cream text-coffee-intense hover:bg-coffee-gold hover:text-coffee-white transition-colors flex items-center justify-center"
                        >
                          -
                        </button>
                        
                        <span className="w-12 text-center font-medium text-coffee-intense">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-coffee-cream text-coffee-intense hover:bg-coffee-gold hover:text-coffee-white transition-colors flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>

                      {/* Subtotal e Remover */}
                      <div className="text-right">
                        <div className="font-bold text-coffee-intense mb-2">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 text-sm transition-colors"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continuar Comprando */}
              <div className="mt-8">
                <Link 
                  to="/marketplace"
                  className="btn-secondary inline-flex items-center px-6 py-3"
                >
                  ← Continuar Comprando
                </Link>
              </div>
            </div>

            {/* Resumo do Pedido */}
            <div className="lg:col-span-1">
              <div className="card sticky top-8">
                <h2 className="font-cormorant font-bold text-2xl text-coffee-intense mb-6">
                  Resumo do Pedido
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-coffee-gray">Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'})</span>
                    <span className="text-coffee-intense font-medium">
                      R$ {getTotalPrice().toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-coffee-gray">Frete</span>
                    <span className="text-coffee-gold font-medium">
                      {getTotalPrice() >= 80 ? 'Grátis' : 'R$ 15,00'}
                    </span>
                  </div>

                  {getTotalPrice() < 80 && (
                    <div className="bg-coffee-cream p-3 rounded-lg">
                      <p className="text-coffee-gray text-sm">
                        Faltam R$ {(80 - getTotalPrice()).toFixed(2)} para frete grátis!
                      </p>
                    </div>
                  )}

                  <div className="border-t border-coffee-cream pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-cormorant font-bold text-xl text-coffee-intense">Total</span>
                      <span className="font-cormorant font-bold text-2xl text-coffee-gold">
                        R$ {(getTotalPrice() + (getTotalPrice() >= 80 ? 0 : 15)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="btn-primary w-full py-4 text-lg"
                >
                  Finalizar Compra
                </button>

                {!user && (
                  <p className="text-coffee-gray text-sm text-center mt-4">
                    Faça <Link to="/login" className="text-coffee-gold hover:text-coffee-intense">login</Link> para continuar
                  </p>
                )}

                {/* Métodos de Pagamento */}
                <div className="mt-8">
                  <h3 className="font-cormorant font-bold text-lg text-coffee-intense mb-4">
                    Métodos de Pagamento
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-coffee-cream p-2 rounded text-center text-xs text-coffee-gray">
                      PIX
                    </div>
                    <div className="bg-coffee-cream p-2 rounded text-center text-xs text-coffee-gray">
                      Cartão
                    </div>
                    <div className="bg-coffee-cream p-2 rounded text-center text-xs text-coffee-gray">
                      Boleto
                    </div>
                  </div>
                </div>

                {/* Garantias */}
                <div className="mt-8 space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-coffee-gold">🔒</span>
                    <span className="text-coffee-gray text-sm">Compra 100% segura</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-coffee-gold">🚚</span>
                    <span className="text-coffee-gray text-sm">Entrega garantida</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-coffee-gold">⭐</span>
                    <span className="text-coffee-gray text-sm">Qualidade premium</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CartPage;

