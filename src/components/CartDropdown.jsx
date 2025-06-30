import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag,
  ArrowRight,
  X 
} from 'lucide-react';
import { LoadingSpinner } from './LoadingStates';

const CartDropdown = () => {
  const { user } = useSupabaseAuth();
  const { 
    cartItems, 
    cartTotal, 
    isLoading, 
    requiresLogin,
    removeFromCart, 
    updateQuantity, 
    getCartItemsCountSafe 
  } = useCart();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQuantityChange = async (productId, newQuantity) => {
    await updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = async (productId) => {
    await removeFromCart(productId);
  };

  const cartCount = getCartItemsCountSafe();
  const hasItems = cartItems.length > 0;

  return (
    <div className="relative">
      {/* Botão do Carrinho */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="text-brand-dark hover:text-brand-brown hover:bg-brand-brown/10 relative p-2 rounded-md transition-colors"
        aria-label="Carrinho de Compras"
      >
        <ShoppingCart className="w-5 h-5" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-brand-brown text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {cartCount}
          </span>
        )}
      </button>

      {/* Dropdown do Carrinho */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-[500px] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="font-semibold text-lg text-brand-dark">
              Meu Carrinho ({cartCount})
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Conteúdo */}
          <div className="flex flex-col max-h-[400px]">
            {requiresLogin ? (
              /* 🔒 Login Necessário */
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-red-500" />
                </div>
                <h4 className="font-semibold text-brand-dark mb-2">
                  Login Necessário
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Faça login para acessar seu carrinho personalizado e seguro!
                </p>
                <div className="space-y-2">
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <button className="w-full bg-brand-brown hover:bg-brand-brown/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Fazer Login
                    </button>
                  </Link>
                  <Link to="/registro" onClick={() => setIsOpen(false)}>
                    <button className="w-full bg-white border-2 border-brand-brown text-brand-brown hover:bg-brand-brown/5 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Criar Conta
                    </button>
                  </Link>
                </div>
              </div>
            ) : isLoading ? (
              <div className="p-6">
                <LoadingSpinner size="sm" text="Carregando carrinho..." />
              </div>
            ) : !hasItems ? (
              /* Carrinho Vazio */
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-brand-brown/50" />
                </div>
                <h4 className="font-semibold text-brand-dark mb-2">
                  Carrinho vazio
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Adicione produtos incríveis ao seu carrinho!
                </p>
                <Link to="/marketplace" onClick={() => setIsOpen(false)}>
                  <button className="bg-brand-brown hover:bg-brand-brown/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Explorar Produtos
                  </button>
                </Link>
              </div>
            ) : (
              <>
                {/* Lista de Itens */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      {/* Imagem do Produto */}
                      <div className="w-12 h-12 bg-brand-light rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <ShoppingBag className="w-6 h-6 text-brand-brown" />
                        )}
                      </div>

                      {/* Detalhes do Produto */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-brand-dark truncate">
                          {item.name}
                        </h4>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-brand-brown font-semibold text-sm">
                            R$ {(item.price * item.quantity).toFixed(2)}
                          </span>
                          
                          {/* Controles de Quantidade */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                              disabled={isLoading}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                              disabled={isLoading}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Botão Remover */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        disabled={isLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Footer com Total e Ações */}
                <div className="border-t border-gray-100 p-4 space-y-3">
                  {/* Total */}
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-brand-dark">Total:</span>
                    <span className="font-bold text-lg text-brand-brown">
                      R$ {cartTotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Aviso de Frete */}
                  {cartTotal < 80 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                      <p className="text-xs text-amber-800">
                        Faltam R$ {(80 - cartTotal).toFixed(2)} para frete grátis!
                      </p>
                    </div>
                  )}

                  {/* Botões de Ação */}
                  <div className="space-y-2">
                    <Link to="/carrinho" onClick={() => setIsOpen(false)}>
                      <button className="w-full bg-white border-2 border-brand-brown text-brand-brown hover:bg-brand-brown/5 py-2 px-4 rounded-lg font-medium transition-colors">
                        Ver Carrinho
                      </button>
                    </Link>
                    
                    {user ? (
                      <Link to="/checkout" onClick={() => setIsOpen(false)}>
                        <button className="w-full bg-brand-brown hover:bg-brand-brown/90 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                          Finalizar Compra
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </Link>
                    ) : (
                      <Link to="/login" onClick={() => setIsOpen(false)}>
                        <button className="w-full bg-brand-brown hover:bg-brand-brown/90 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                          Fazer Login para Continuar
                        </button>
                      </Link>
                    )}
                  </div>

                  {/* Continue Comprando */}
                  <Link to="/marketplace" onClick={() => setIsOpen(false)}>
                    <button className="w-full text-sm text-brand-brown hover:text-brand-brown/80 py-1 transition-colors">
                      ← Continuar Comprando
                    </button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartDropdown; 