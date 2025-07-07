import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const CheckoutPage = () => {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    zipCode: '',
    paymentMethod: 'pix'
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirecionar se não estiver logado ou carrinho vazio
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }
  }, [user, cartItems, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simular processamento do pedido
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Limpar carrinho
      clearCart();
      
      // Redirecionar para página de sucesso
      alert('Pedido realizado com sucesso!');
      navigate('/orders');
    } catch {
      alert('Erro ao processar pedido. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const shippingCost = getTotalPrice() >= 80 ? 0 : 15;
  const totalWithShipping = getTotalPrice() + shippingCost;

  if (!user || cartItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-coffee-white font-montserrat">
      <main className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-cormorant font-bold text-4xl text-coffee-intense mb-4">
              Finalizar Compra
            </h1>
            <p className="text-coffee-gray text-lg">
              Revise seu pedido e complete as informações de entrega
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Formulário de Checkout */}
            <div className="card">
              <h2 className="font-cormorant font-bold text-2xl text-coffee-intense mb-6">
                Dados de Entrega
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="address" className="block text-coffee-intense font-medium mb-2">
                    Endereço Completo *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border-2 border-coffee-cream rounded-lg focus:border-coffee-gold focus:ring-2 focus:ring-coffee-gold/10 transition-all"
                    placeholder="Rua, número, complemento"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-coffee-intense font-medium mb-2">
                      Cidade *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border-2 border-coffee-cream rounded-lg focus:border-coffee-gold focus:ring-2 focus:ring-coffee-gold/10 transition-all"
                      placeholder="Sua cidade"
                    />
                  </div>

                  <div>
                    <label htmlFor="zipCode" className="block text-coffee-intense font-medium mb-2">
                      CEP *
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border-2 border-coffee-cream rounded-lg focus:border-coffee-gold focus:ring-2 focus:ring-coffee-gold/10 transition-all"
                      placeholder="00000-000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-coffee-intense font-medium mb-4">
                    Forma de Pagamento *
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border-2 border-coffee-cream rounded-lg cursor-pointer hover:bg-coffee-cream/50 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="pix"
                        checked={formData.paymentMethod === 'pix'}
                        onChange={handleChange}
                        className="text-coffee-gold focus:ring-coffee-gold"
                      />
                      <span className="ml-3 text-coffee-intense">
                        <span className="font-medium">PIX</span> - Aprovação instantânea
                      </span>
                    </label>

                    <label className="flex items-center p-4 border-2 border-coffee-cream rounded-lg cursor-pointer hover:bg-coffee-cream/50 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="credit"
                        checked={formData.paymentMethod === 'credit'}
                        onChange={handleChange}
                        className="text-coffee-gold focus:ring-coffee-gold"
                      />
                      <span className="ml-3 text-coffee-intense">
                        <span className="font-medium">Cartão de Crédito</span> - Em até 12x sem juros
                      </span>
                    </label>

                    <label className="flex items-center p-4 border-2 border-coffee-cream rounded-lg cursor-pointer hover:bg-coffee-cream/50 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="boleto"
                        checked={formData.paymentMethod === 'boleto'}
                        onChange={handleChange}
                        className="text-coffee-gold focus:ring-coffee-gold"
                      />
                      <span className="ml-3 text-coffee-intense">
                        <span className="font-medium">Boleto Bancário</span> - Vencimento em 3 dias
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="btn-primary w-full py-4 text-lg disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-coffee-white mr-2"></div>
                      Processando...
                    </div>
                  ) : (
                    'Finalizar Pedido'
                  )}
                </button>
              </form>
            </div>

            {/* Resumo do Pedido */}
            <div className="card sticky top-8">
              <h2 className="font-cormorant font-bold text-2xl text-coffee-intense mb-6">
                Resumo do Pedido
              </h2>

              {/* Produtos */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-coffee-cream rounded-lg flex items-center justify-center">
                      <span className="text-coffee-gold text-lg">☕</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-coffee-intense">{item.name}</h3>
                      <p className="text-coffee-gray text-sm">Quantidade: {item.quantity}</p>
                    </div>
                    <div className="text-coffee-gold font-medium">
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totais */}
              <div className="border-t border-coffee-cream pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-coffee-gray">Subtotal</span>
                  <span className="text-coffee-intense font-medium">
                    R$ {getTotalPrice().toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-coffee-gray">Frete</span>
                  <span className="text-coffee-gold font-medium">
                    {shippingCost === 0 ? 'Grátis' : `R$ ${shippingCost.toFixed(2)}`}
                  </span>
                </div>

                <div className="border-t border-coffee-cream pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-cormorant font-bold text-xl text-coffee-intense">Total</span>
                    <span className="font-cormorant font-bold text-2xl text-coffee-gold">
                      R$ {totalWithShipping.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Garantias */}
              <div className="mt-8 pt-6 border-t border-coffee-cream space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-coffee-gold">🔒</span>
                  <span className="text-coffee-gray text-sm">Pagamento 100% seguro</span>
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
      </main>
    </div>
  );
};

export default CheckoutPage;

