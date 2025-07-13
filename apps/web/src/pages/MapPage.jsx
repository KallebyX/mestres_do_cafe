/**
 * 🗺️ Página de Mapas - OpenStreetMap + Leaflet (GRATUITO)
 * Localização das cafeterias Mestres do Café
 */

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Phone, Clock, Star, Navigation, Truck } from 'lucide-react';

const MapPage = () => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [deliveryCheck, setDeliveryCheck] = useState('');
  const [deliveryResult, setDeliveryResult] = useState(null);
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);

  // Carregar Leaflet dinamicamente
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined' && !window.L) {
        // Carregar CSS do Leaflet
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Carregar JS do Leaflet
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
          setLoading(false);
          initializeMap();
        };
        document.head.appendChild(script);
      } else if (window.L) {
        setLoading(false);
        initializeMap();
      }
    };

    loadLeaflet();
  }, []);

  // Buscar localizações
  useEffect(() => {
    fetchLocations();
    getUserLocation();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/locations');
      const data = await response.json();
      
      if (data.success) {
        setLocations(data.locations);
      }
    } catch (error) {
      console.error('Erro ao carregar localizações:', error);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          }
      );
    }
  };

  const initializeMap = () => {
    if (!window.L || !mapRef.current || leafletMapRef.current) return;

    // Centro em Santa Maria/RS
    const center = [-29.6842, -53.8069];
    
    // Criar mapa
    const map = window.L.map(mapRef.current).setView(center, 13);

    // Adicionar camada do OpenStreetMap
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    leafletMapRef.current = map;

    // Adicionar marcadores quando localizações carregarem
    if (locations.length > 0) {
      addMarkersToMap(map);
    }
  };

  // Adicionar marcadores ao mapa
  useEffect(() => {
    if (leafletMapRef.current && locations.length > 0) {
      addMarkersToMap(leafletMapRef.current);
    }
  }, [locations, filter]);

  const addMarkersToMap = (map) => {
    // Limpar marcadores existentes
    map.eachLayer((layer) => {
      if (layer instanceof window.L.Marker) {
        map.removeLayer(layer);
      }
    });

    const filteredLocations = Array.isArray(locations) 
      ? (filter === 'all' ? locations : locations.filter(loc => loc.type === filter))
      : [];

    filteredLocations.forEach((location) => {
      const icon = getLocationIcon(location.type);
      
      const marker = window.L.marker([location.latitude, location.longitude], {
        icon: icon
      }).addTo(map);

      const popupContent = `
        <div class="p-3 min-w-[250px]">
          <h3 class="font-bold text-coffee-intense text-lg mb-2">${location.name}</h3>
          <p class="text-coffee-gray mb-2 flex items-center">
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
            </svg>
            ${location.address}
          </p>
          <p class="text-coffee-gray mb-2 flex items-center">
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
            </svg>
            ${location.phone}
          </p>
          <div class="flex items-center mb-2">
            ${[...Array(5)].map((_, i) => 
              `<svg class="w-4 h-4 ${i < Math.floor(location.rating) ? 'text-yellow-400' : 'text-gray-300'}" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>`
            ).join('')}
            <span class="ml-1 text-sm text-coffee-gray">${location.rating}</span>
          </div>
          <button 
            onclick="window.selectLocation(${location.id})"
            class="w-full bg-coffee-gold text-white px-4 py-2 rounded hover:bg-coffee-intense transition-colors"
          >
            Ver Detalhes
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
    });

    // Adicionar marcador do usuário se disponível
    if (userLocation) {
      const userIcon = window.L.divIcon({
        html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>`,
        className: 'user-location-marker',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      window.L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon
      }).addTo(map).bindPopup('📍 Sua localização');
    }
  };

  const getLocationIcon = (type) => {
    const colors = {
      loja: '#BC9F35',      // Dourado
      fazenda: '#4B2E2B',   // Marrom
      pickup: '#E0D2B6'     // Creme
    };

    const icons = {
      loja: '🏪',
      fazenda: '🌱',
      pickup: '📦'
    };

    return window.L.divIcon({
      html: `<div class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-lg" style="background-color: ${colors[type]}">${icons[type]}</div>`,
      className: 'custom-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });
  };

  // Função global para selecionar localização
  useEffect(() => {
    window.selectLocation = (id) => {
      const location = locations.find(loc => loc.id === id);
      setSelectedLocation(location);
    };

    return () => {
      delete window.selectLocation;
    };
  }, [locations]);

  const checkDeliveryArea = async () => {
    if (!deliveryCheck.trim()) return;

    try {
      const response = await fetch('http://localhost:5000/api/delivery/check-area', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: deliveryCheck }),
      });

      const result = await response.json();
      setDeliveryResult(result);
    } catch (error) {
      console.error('Erro ao verificar entrega:', error);
    }
  };

  const formatHours = (hours) => {
    const today = new Date().toLocaleLowerCase();
    const days = {
      sunday: 'sunday',
      monday: 'monday',
      tuesday: 'tuesday',
      wednesday: 'wednesday',
      thursday: 'thursday',
      friday: 'friday',
      saturday: 'saturday'
    };
    
    const currentDay = days[today] || 'monday';
    return hours[currentDay] || 'Horário não disponível';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-coffee-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-coffee-gold border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-coffee-gray">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-coffee-white">
      {/* Header */}
      <div className="bg-coffee-intense text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold font-cormorant mb-4">
            📍 Nossas Localizações
          </h1>
          <p className="text-coffee-cream text-lg">
            Encontre a cafeteria mais próxima de você em Santa Maria/RS
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Filtros */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-coffee-intense mb-4">Filtrar por tipo</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`w-full text-left px-4 py-2 rounded transition-colors ${
                    filter === 'all' 
                      ? 'bg-coffee-gold text-white' 
                      : 'bg-coffee-cream text-coffee-intense hover:bg-coffee-gold hover:text-white'
                  }`}
                >
                  🗺️ Todas as localizações
                </button>
                <button
                  onClick={() => setFilter('loja')}
                  className={`w-full text-left px-4 py-2 rounded transition-colors ${
                    filter === 'loja' 
                      ? 'bg-coffee-gold text-white' 
                      : 'bg-coffee-cream text-coffee-intense hover:bg-coffee-gold hover:text-white'
                  }`}
                >
                  🏪 Lojas
                </button>
                <button
                  onClick={() => setFilter('fazenda')}
                  className={`w-full text-left px-4 py-2 rounded transition-colors ${
                    filter === 'fazenda' 
                      ? 'bg-coffee-gold text-white' 
                      : 'bg-coffee-cream text-coffee-intense hover:bg-coffee-gold hover:text-white'
                  }`}
                >
                  🌱 Fazendas
                </button>
                <button
                  onClick={() => setFilter('pickup')}
                  className={`w-full text-left px-4 py-2 rounded transition-colors ${
                    filter === 'pickup' 
                      ? 'bg-coffee-gold text-white' 
                      : 'bg-coffee-cream text-coffee-intense hover:bg-coffee-gold hover:text-white'
                  }`}
                >
                  📦 Pontos de retirada
                </button>
              </div>
            </div>

            {/* Verificar área de entrega */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-coffee-intense mb-4 flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Área de Entrega
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Digite seu endereço..."
                  value={deliveryCheck}
                  onChange={(e) => setDeliveryCheck(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-coffee-cream rounded focus:border-coffee-gold outline-none"
                />
                <button
                  onClick={checkDeliveryArea}
                  className="w-full bg-coffee-gold text-white px-4 py-2 rounded hover:bg-coffee-intense transition-colors"
                >
                  Verificar entrega
                </button>
                
                {deliveryResult && (
                  <div className={`p-4 rounded ${
                    deliveryResult.success && deliveryResult.inDeliveryArea 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    <p className="font-semibold">{deliveryResult.message}</p>
                    {deliveryResult.success && deliveryResult.inDeliveryArea && (
                      <div className="mt-2 text-sm">
                        <p>📏 Distância: {deliveryResult.distanceText}</p>
                        <p>💰 Taxa de entrega: R$ {deliveryResult.deliveryFee?.toFixed(2)}</p>
                        <p>🆓 Frete grátis acima de R$ {deliveryResult.freeDeliveryMinimum?.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Lista de localizações */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-coffee-intense mb-4">Localizações</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Array.isArray(locations) && locations.length > 0 ? locations
                  .filter(loc => filter === 'all' || loc.type === filter)
                  .map((location) => (
                  <div
                    key={location.id}
                    className="border-l-4 border-coffee-gold pl-4 py-2 cursor-pointer hover:bg-coffee-cream transition-colors"
                    onClick={() => setSelectedLocation(location)}
                  >
                    <h4 className="font-semibold text-coffee-intense">{location.name}</h4>
                    <p className="text-sm text-coffee-gray flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {location.address}
                    </p>
                    <p className="text-sm text-coffee-gray flex items-center">
                      <Phone className="w-3 h-3 mr-1" />
                      {location.phone}
                    </p>
                    <div className="flex items-center mt-1">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-coffee-gray">{location.rating}</span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-4 text-coffee-gray">
                    <MapPin className="w-8 h-8 mx-auto mb-2 text-coffee-cream" />
                    <p>Nenhuma localização encontrada</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mapa */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div 
                ref={mapRef}
                className="w-full h-96 lg:h-[600px]"
                style={{ minHeight: '400px' }}
              />
            </div>

            {/* Detalhes da localização selecionada */}
            {selectedLocation && (
              <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-coffee-intense">
                    {selectedLocation.name}
                  </h3>
                  <button
                    onClick={() => setSelectedLocation(null)}
                    className="text-coffee-gray hover:text-coffee-intense"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-coffee-intense mb-2 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Endereço
                    </h4>
                    <p className="text-coffee-gray mb-4">
                      {selectedLocation.address}<br />
                      {selectedLocation.city}, {selectedLocation.state}<br />
                      CEP: {selectedLocation.zipCode}
                    </p>

                    <h4 className="font-semibold text-coffee-intense mb-2 flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      Contato
                    </h4>
                    <p className="text-coffee-gray mb-4">{selectedLocation.phone}</p>

                    <h4 className="font-semibold text-coffee-intense mb-2 flex items-center">
                      <Star className="w-4 h-4 mr-2" />
                      Avaliação
                    </h4>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(selectedLocation.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-coffee-gray">
                        {selectedLocation.rating} / 5.0
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-coffee-intense mb-2 flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Horário de Funcionamento
                    </h4>
                    <div className="text-coffee-gray space-y-1 text-sm mb-4">
                      <div className="flex justify-between">
                        <span>Segunda-feira:</span>
                        <span>{selectedLocation.hours.monday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Terça-feira:</span>
                        <span>{selectedLocation.hours.tuesday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quarta-feira:</span>
                        <span>{selectedLocation.hours.wednesday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quinta-feira:</span>
                        <span>{selectedLocation.hours.thursday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sexta-feira:</span>
                        <span>{selectedLocation.hours.friday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sábado:</span>
                        <span>{selectedLocation.hours.saturday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Domingo:</span>
                        <span>{selectedLocation.hours.sunday}</span>
                      </div>
                    </div>

                    <h4 className="font-semibold text-coffee-intense mb-2">Serviços</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedLocation.services.map((service, index) => (
                        <span
                          key={index}
                          className="bg-coffee-cream text-coffee-intense px-3 py-1 rounded-full text-sm"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-4">
                  <button
                    onClick={() => {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.latitude},${selectedLocation.longitude}`;
                      window.open(url, '_blank');
                    }}
                    className="flex items-center bg-coffee-gold text-white px-4 py-2 rounded hover:bg-coffee-intense transition-colors"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Como chegar
                  </button>
                  
                  <button
                    onClick={() => {
                      const phone = selectedLocation.phone.replace(/[^\d]/g, '');
                      window.open(`https://wa.me/55${phone}`, '_blank');
                    }}
                    className="flex items-center bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage; 