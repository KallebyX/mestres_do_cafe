/**
 * 🗺️ Maps Service - OpenStreetMap + Leaflet (GRATUITO)
 * Sistema de mapas para localização das cafeterias
 * Mestres do Café - Santa Maria/RS
 */

const axios = require('axios');

class MapsService {
  constructor() {
    // URLs dos serviços OpenStreetMap (gratuitos)
    this.nominatimUrl = 'https://nominatim.openstreetmap.org';
    this.overpassUrl = 'https://overpass-api.de/api/interpreter';
    
    // Dados das lojas (substituir por banco de dados real)
    this.locations = [
      {
        id: 1,
        name: 'Mestres do Café - Centro',
        address: 'Rua do Acampamento, 123',
        city: 'Santa Maria',
        state: 'RS',
        zipCode: '97010-000',
        phone: '(55) 3220-1234',
        latitude: -29.6842,
        longitude: -53.8069,
        type: 'loja',
        hours: {
          monday: '07:00-19:00',
          tuesday: '07:00-19:00',
          wednesday: '07:00-19:00',
          thursday: '07:00-19:00',
          friday: '07:00-19:00',
          saturday: '08:00-18:00',
          sunday: 'Fechado'
        },
        services: ['Venda', 'Degustação', 'Cursos', 'Wi-Fi'],
        rating: 4.8,
        photos: [
          'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
          'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400'
        ]
      },
      {
        id: 2,
        name: 'Mestres do Café - Camobi',
        address: 'Av. Roraima, 456',
        city: 'Santa Maria',
        state: 'RS',
        zipCode: '97105-900',
        phone: '(55) 3220-5678',
        latitude: -29.7208,
        longitude: -53.7264,
        type: 'loja',
        hours: {
          monday: '07:00-20:00',
          tuesday: '07:00-20:00',
          wednesday: '07:00-20:00',
          thursday: '07:00-20:00',
          friday: '07:00-20:00',
          saturday: '08:00-17:00',
          sunday: 'Fechado'
        },
        services: ['Venda', 'Drive-thru', 'Delivery', 'Wi-Fi'],
        rating: 4.7,
        photos: [
          'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400'
        ]
      },
      {
        id: 3,
        name: 'Mestres do Café - Norte',
        address: 'Rua Silva Jardim, 789',
        city: 'Santa Maria',
        state: 'RS',
        zipCode: '97015-372',
        phone: '(55) 3220-9012',
        latitude: -29.6667,
        longitude: -53.8028,
        type: 'loja',
        hours: {
          monday: '06:30-19:00',
          tuesday: '06:30-19:00',
          wednesday: '06:30-19:00',
          thursday: '06:30-19:00',
          friday: '06:30-19:00',
          saturday: '07:00-18:00',
          sunday: 'Fechado'
        },
        services: ['Venda', 'Café Express', 'Takeaway'],
        rating: 4.6,
        photos: [
          'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400'
        ]
      },
      {
        id: 4,
        name: 'Fazenda São Bento',
        address: 'Zona Rural, km 15',
        city: 'Santa Maria',
        state: 'RS',
        zipCode: '97001-000',
        phone: '(55) 3220-0000',
        latitude: -29.7500,
        longitude: -53.9000,
        type: 'fazenda',
        hours: {
          monday: 'Agendamento',
          tuesday: 'Agendamento',
          wednesday: 'Agendamento',
          thursday: 'Agendamento',
          friday: 'Agendamento',
          saturday: '08:00-16:00',
          sunday: '08:00-16:00'
        },
        services: ['Visitas', 'Turismo Rural', 'Degustação'],
        rating: 4.9,
        photos: [
          'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400'
        ]
      },
      {
        id: 5,
        name: 'Ponto de Entrega Express',
        address: 'Shopping Praça Nova, Loja 205',
        city: 'Santa Maria',
        state: 'RS',
        zipCode: '97010-491',
        phone: '(55) 99999-0000',
        latitude: -29.6914,
        longitude: -53.8008,
        type: 'pickup',
        hours: {
          monday: '10:00-22:00',
          tuesday: '10:00-22:00',
          wednesday: '10:00-22:00',
          thursday: '10:00-22:00',
          friday: '10:00-22:00',
          saturday: '10:00-22:00',
          sunday: '14:00-20:00'
        },
        services: ['Retirada', 'Ponto de Coleta'],
        rating: 4.5,
        photos: []
      }
    ];

    // Área de cobertura de delivery (Santa Maria)
    this.deliveryArea = {
      center: { lat: -29.6842, lng: -53.8069 },
      radius: 15, // km
      price: 8.50, // taxa de entrega
      freeDeliveryMinimum: 80.00 // frete grátis acima de R$ 80
    };
  }

  /**
   * 📍 Obter todas as localizações
   */
  async getAllLocations() {
    try {
      return {
        success: true,
        locations: this.locations,
        total: this.locations.length,
        center: this.deliveryArea.center,
        deliveryInfo: {
          radius: this.deliveryArea.radius,
          fee: this.deliveryArea.price,
          freeMinimum: this.deliveryArea.freeDeliveryMinimum
        }
      };
    } catch (error) {
      console.error('❌ Erro ao buscar localizações:', error);
      throw error;
    }
  }

  /**
   * 🔍 Buscar localização específica
   */
  async getLocationById(id) {
    try {
      const location = this.locations.find(loc => loc.id === parseInt(id));
      
      if (!location) {
        return {
          success: false,
          error: 'Localização não encontrada'
        };
      }

      return {
        success: true,
        location: location
      };
    } catch (error) {
      console.error('❌ Erro ao buscar localização:', error);
      throw error;
    }
  }

  /**
   * 📌 Buscar localizações por tipo
   */
  async getLocationsByType(type) {
    try {
      const filteredLocations = this.locations.filter(loc => loc.type === type);
      
      return {
        success: true,
        locations: filteredLocations,
        total: filteredLocations.length
      };
    } catch (error) {
      console.error('❌ Erro ao filtrar localizações:', error);
      throw error;
    }
  }

  /**
   * 🎯 Encontrar loja mais próxima
   */
  async findNearestLocation(latitude, longitude, type = 'loja') {
    try {
      const targetLocations = this.locations.filter(loc => loc.type === type);
      
      if (targetLocations.length === 0) {
        return {
          success: false,
          error: 'Nenhuma localização encontrada para o tipo especificado'
        };
      }

      // Calcular distâncias
      const locationsWithDistance = targetLocations.map(location => {
        const distance = this.calculateDistance(
          latitude, longitude,
          location.latitude, location.longitude
        );
        
        return {
          ...location,
          distance: distance,
          distanceText: distance < 1 ? 
            `${Math.round(distance * 1000)}m` : 
            `${distance.toFixed(1)}km`
        };
      });

      // Ordenar por distância
      locationsWithDistance.sort((a, b) => a.distance - b.distance);
      
      return {
        success: true,
        nearest: locationsWithDistance[0],
        allNearby: locationsWithDistance
      };
    } catch (error) {
      console.error('❌ Erro ao encontrar localização mais próxima:', error);
      throw error;
    }
  }

  /**
   * 🚚 Verificar se endereço está na área de delivery
   */
  async checkDeliveryArea(address) {
    try {
      // Geocodificar endereço usando Nominatim (gratuito)
      const coords = await this.geocodeAddress(address);
      
      if (!coords) {
        return {
          success: false,
          error: 'Endereço não encontrado'
        };
      }

      // Calcular distância do centro
      const distance = this.calculateDistance(
        this.deliveryArea.center.lat,
        this.deliveryArea.center.lng,
        coords.lat,
        coords.lng
      );

      const inDeliveryArea = distance <= this.deliveryArea.radius;
      const deliveryFee = inDeliveryArea ? this.deliveryArea.price : null;

      return {
        success: true,
        inDeliveryArea: inDeliveryArea,
        distance: distance,
        distanceText: `${distance.toFixed(1)}km`,
        deliveryFee: deliveryFee,
        freeDeliveryMinimum: this.deliveryArea.freeDeliveryMinimum,
        coordinates: coords,
        message: inDeliveryArea ? 
          'Endereço dentro da área de entrega!' : 
          'Endereço fora da área de entrega'
      };
    } catch (error) {
      console.error('❌ Erro ao verificar área de delivery:', error);
      throw error;
    }
  }

  /**
   * 🌍 Geocodificar endereço (converter endereço em coordenadas)
   */
  async geocodeAddress(address) {
    try {
      const query = `${address}, Santa Maria, RS, Brazil`;
      const url = `${this.nominatimUrl}/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'MestresDoCafe/1.0 (contato@mestrescafe.com.br)'
        }
      });

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          displayName: result.display_name
        };
      }

      return null;
    } catch (error) {
      console.error('❌ Erro na geocodificação:', error);
      return null;
    }
  }

  /**
   * 🗺️ Buscar endereço por coordenadas (geocodificação reversa)
   */
  async reverseGeocode(latitude, longitude) {
    try {
      const url = `${this.nominatimUrl}/reverse?format=json&lat=${latitude}&lon=${longitude}`;
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'MestresDoCafe/1.0 (contato@mestrescafe.com.br)'
        }
      });

      if (response.data) {
        const address = response.data.address;
        return {
          success: true,
          address: {
            street: address.road || '',
            number: address.house_number || '',
            neighborhood: address.neighbourhood || address.suburb || '',
            city: address.city || address.town || address.village || '',
            state: address.state || '',
            zipCode: address.postcode || '',
            country: address.country || '',
            fullAddress: response.data.display_name
          }
        };
      }

      return {
        success: false,
        error: 'Endereço não encontrado'
      };
    } catch (error) {
      console.error('❌ Erro na geocodificação reversa:', error);
      throw error;
    }
  }

  /**
   * 📏 Calcular distância entre dois pontos (fórmula de Haversine)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * 📐 Converter graus para radianos
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * 🛣️ Obter rota entre dois pontos usando OSRM (Open Source Routing Machine)
   */
  async getRoute(fromLat, fromLng, toLat, toLng) {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
      
      const response = await axios.get(url);
      
      if (response.data && response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        
        return {
          success: true,
          route: {
            distance: route.distance, // metros
            duration: route.duration, // segundos
            distanceText: `${(route.distance / 1000).toFixed(1)} km`,
            durationText: `${Math.round(route.duration / 60)} min`,
            geometry: route.geometry,
            steps: route.legs[0]?.steps || []
          }
        };
      }

      return {
        success: false,
        error: 'Rota não encontrada'
      };
    } catch (error) {
      console.error('❌ Erro ao calcular rota:', error);
      return {
        success: false,
        error: 'Erro ao calcular rota'
      };
    }
  }

  /**
   * ☕ Buscar cafeterias próximas usando Overpass API
   */
  async findNearbyCafes(latitude, longitude, radius = 5000) {
    try {
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="cafe"](around:${radius},${latitude},${longitude});
          way["amenity"="cafe"](around:${radius},${latitude},${longitude});
          relation["amenity"="cafe"](around:${radius},${latitude},${longitude});
        );
        out body;
        >;
        out skel qt;
      `;

      const response = await axios.post(this.overpassUrl, query, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.data && response.data.elements) {
        const cafes = response.data.elements
          .filter(element => element.tags && element.tags.name)
          .map(cafe => ({
            id: cafe.id,
            name: cafe.tags.name,
            latitude: cafe.lat,
            longitude: cafe.lon,
            address: this.formatAddress(cafe.tags),
            phone: cafe.tags.phone || '',
            website: cafe.tags.website || '',
            openingHours: cafe.tags.opening_hours || '',
            type: 'cafe_externo'
          }));

        return {
          success: true,
          cafes: cafes,
          total: cafes.length
        };
      }

      return {
        success: true,
        cafes: [],
        total: 0
      };
    } catch (error) {
      console.error('❌ Erro ao buscar cafeterias:', error);
      return {
        success: false,
        error: 'Erro ao buscar cafeterias próximas'
      };
    }
  }

  /**
   * 📝 Formatar endereço a partir das tags do OpenStreetMap
   */
  formatAddress(tags) {
    const parts = [];
    
    if (tags['addr:street']) parts.push(tags['addr:street']);
    if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
    if (tags['addr:neighbourhood']) parts.push(tags['addr:neighbourhood']);
    if (tags['addr:city']) parts.push(tags['addr:city']);
    
    return parts.join(', ') || 'Endereço não disponível';
  }

  /**
   * 🎯 Estatísticas da área de entrega
   */
  getDeliveryStats() {
    return {
      totalLocations: this.locations.length,
      locationsByType: {
        lojas: this.locations.filter(l => l.type === 'loja').length,
        fazendas: this.locations.filter(l => l.type === 'fazenda').length,
        pickups: this.locations.filter(l => l.type === 'pickup').length
      },
      deliveryArea: {
        radius: this.deliveryArea.radius,
        coverage: `${Math.PI * Math.pow(this.deliveryArea.radius, 2)} km²`,
        fee: this.deliveryArea.price,
        freeMinimum: this.deliveryArea.freeDeliveryMinimum
      },
      averageRating: (this.locations.reduce((sum, loc) => sum + loc.rating, 0) / this.locations.length).toFixed(1)
    };
  }
}

module.exports = MapsService; 