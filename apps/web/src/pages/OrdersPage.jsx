import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ShippingTracker from '../components/ShippingTracker';
import { Package, Truck, Eye, X } from 'lucide-react';

const OrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, completed, cancelled
  const [trackingModal, setTrackingModal] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    loadOrders();
  }, [user, navigate]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      // Dados simulados de pedidos do usuário
      const simulatedOrders = [
        {
          id: 'ORD-001',
          date: '2024-01-20',
          status: 'completed',
          total: 89.50,
          items: [
            {
              name: 'Café Santos Premium 250g',
              quantity: 2,
              price: 25.50
            },
            {
              name: 'Café Bourbon Amarelo 500g',
              quantity: 1,
              price: 38.50
            }
          ],
          shipping: {
            method: 'Entrega Expressa',
            address: 'Rua das Flores, 123 - São Paulo, SP',
            tracking: 'BR123456789'
          }
        },
        {
          id: 'ORD-002',
          date: '2024-01-25',
          status: 'pending',
          total: 127.00,
          items: [
            {
              name: 'Café Catuaí Vermelho 1kg',
              quantity: 1,
              price: 65.00
            },
            {
              name: 'Café Arábica Especial 500g',
              quantity: 2,
              price: 31.00
            }
          ],
          shipping: {
            method: 'Entrega Padrão',
            address: 'Rua das Flores, 123 - São Paulo, SP',
            tracking: null
          }
        }
      ];

      setOrders(simulatedOrders);
    } catch (error) {
      console.error('❌ Erro ao carregar pedidos:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' };
      case 'completed':
        return { label: 'Entregue', color: 'bg-green-100 text-green-800' };
      case 'cancelled':
        return { label: 'Cancelado', color: 'bg-red-100 text-red-800' };
      default:
        return { label: 'Desconhecido', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const filteredOrders = orders.filter(order => 
    filter === 'all' || order.status === filter
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-coffee-white font-montserrat">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-gold mx-auto mb-4"></div>
          <p className="text-coffee-gray">Carregando seus pedidos...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-coffee-white font-montserrat">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-32 h-32 bg-coffee-cream rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="text-coffee-gold text-6xl">📦</span>
          </div>
          
          <h1 className="font-cormorant font-bold text-4xl text-coffee-intense mb-4">
            Nenhum pedido encontrado
          </h1>
          
          <p className="text-coffee-gray text-lg mb-8">
            Você ainda não fez nenhum pedido. Que tal explorar nossos cafés especiais?
          </p>
          
          <button
            onClick={() => navigate('/marketplace')}
            className="btn-primary inline-flex items-center px-8 py-3"
          >
            Explorar Cafés
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-coffee-white font-montserrat">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-cormorant font-bold text-4xl text-coffee-intense mb-4">
            Meus Pedidos
          </h1>
          <p className="text-coffee-gray text-lg">
            Acompanhe o status dos seus pedidos e histórico de compras
          </p>
        </div>

        {/* Filtros */}
        <div className="mb-8">
          <div className="flex space-x-4 justify-center">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-full transition-colors ${
                filter === 'all' 
                  ? 'bg-coffee-gold text-coffee-white' 
                  : 'bg-coffee-cream text-coffee-gray hover:bg-coffee-gold/20'
              }`}
            >
              Todos ({orders.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-6 py-2 rounded-full transition-colors ${
                filter === 'pending' 
                  ? 'bg-coffee-gold text-coffee-white' 
                  : 'bg-coffee-cream text-coffee-gray hover:bg-coffee-gold/20'
              }`}
            >
              Pendentes ({orders.filter(o => o.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-6 py-2 rounded-full transition-colors ${
                filter === 'completed' 
                  ? 'bg-coffee-gold text-coffee-white' 
                  : 'bg-coffee-cream text-coffee-gray hover:bg-coffee-gold/20'
              }`}
            >
              Entregues ({orders.filter(o => o.status === 'completed').length})
            </button>
          </div>
        </div>

        {/* Lista de Pedidos */}
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            
            return (
              <div key={order.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="font-cormorant font-bold text-xl text-coffee-intense">
                        Pedido #{order.id}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-coffee-gray">
                      Realizado em {new Date(order.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-cormorant font-bold text-2xl text-coffee-gold">
                      R$ {order.total.toFixed(2)}
                    </div>
                    <p className="text-coffee-gray text-sm">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                    </p>
                  </div>
                </div>

                {/* Items do Pedido */}
                <div className="border-t border-coffee-cream pt-4 mb-4">
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-coffee-cream rounded-lg flex items-center justify-center">
                            <span className="text-coffee-gold">☕</span>
                          </div>
                          <div>
                            <p className="font-medium text-coffee-intense">{item.name}</p>
                            <p className="text-coffee-gray text-sm">Quantidade: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="text-coffee-gold font-medium">
                          R$ {item.price.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Informações de Entrega */}
                <div className="border-t border-coffee-cream pt-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-coffee-intense mb-2">Endereço de Entrega</h4>
                      <p className="text-coffee-gray text-sm">{order.shipping.address}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-coffee-intense mb-2">Método de Entrega</h4>
                      <p className="text-coffee-gray text-sm">{order.shipping.method}</p>
                      {order.shipping.tracking && (
                        <p className="text-coffee-gold text-sm">
                          Rastreamento: {order.shipping.tracking}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="border-t border-coffee-cream pt-4 mt-4">
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                      className="btn-secondary px-4 py-2 text-sm inline-flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {selectedOrder === order.id ? 'Ocultar Detalhes' : 'Ver Detalhes'}
                    </button>
                    
                    {order.shipping.tracking && (
                      <button
                        onClick={() => setTrackingModal(order)}
                        className="btn-secondary px-4 py-2 text-sm inline-flex items-center bg-blue-50 text-blue-700 hover:bg-blue-100"
                      >
                        <Truck className="w-4 h-4 mr-2" />
                        Rastrear Entrega
                      </button>
                    )}
                    
                    {order.status === 'completed' && (
                      <button
                        onClick={() => navigate('/marketplace')}
                        className="btn-primary px-4 py-2 text-sm"
                      >
                        Comprar Novamente
                      </button>
                    )}
                    
                    {order.status === 'pending' && (
                      <button
                        className="px-4 py-2 text-sm text-red-600 hover:text-red-800 transition-colors"
                      >
                        Cancelar Pedido
                      </button>
                    )}
                  </div>
                </div>

                {/* Detalhes Expandidos */}
                {selectedOrder === order.id && (
                  <div className="border-t border-coffee-cream pt-4 mt-4 bg-coffee-cream/30 -mx-6 -mb-6 px-6 pb-6 rounded-b-lg">
                    <h4 className="font-cormorant font-bold text-lg text-coffee-intense mb-4">
                      Detalhes do Pedido
                    </h4>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium text-coffee-intense mb-3">Timeline</h5>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-coffee-gold rounded-full"></div>
                            <span className="text-coffee-gray text-sm">Pedido realizado</span>
                          </div>
                          {order.status !== 'cancelled' && (
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${
                                order.status === 'completed' ? 'bg-coffee-gold' : 'bg-coffee-cream'
                              }`}></div>
                              <span className="text-coffee-gray text-sm">Em preparação</span>
                            </div>
                          )}
                          {order.status === 'completed' && (
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 bg-coffee-gold rounded-full"></div>
                              <span className="text-coffee-gray text-sm">Entregue</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-coffee-intense mb-3">Suporte</h5>
                        <div className="space-y-2">
                          <button className="text-coffee-gold hover:text-coffee-intense text-sm transition-colors">
                            Entrar em contato
                          </button>
                          <br />
                          <button className="text-coffee-gold hover:text-coffee-intense text-sm transition-colors">
                            Solicitar reembolso
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal de Rastreamento */}
        {trackingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="w-6 h-6 text-coffee-gold mr-3" />
                    <div>
                      <h3 className="text-lg font-bold text-coffee-intense">
                        Rastreamento - Pedido #{trackingModal.id}
                      </h3>
                      <p className="text-sm text-coffee-gray">
                        Código: {trackingModal.shipping.tracking}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setTrackingModal(null)}
                    className="text-gray-400 hover:text-gray-600 p-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <ShippingTracker 
                  trackingCode={trackingModal.shipping.tracking}
                  onStatusChange={(newStatus, oldStatus) => {
                    // Atualizar o status local do pedido se necessário
                    if (newStatus === 'delivered') {
                      setOrders(prevOrders => 
                        prevOrders.map(order => 
                          order.id === trackingModal.id 
                            ? { ...order, status: 'completed' }
                            : order
                        )
                      );
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage; 