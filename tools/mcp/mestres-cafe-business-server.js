#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ErrorCode,
    ListToolsRequestSchema,
    McpError,
} from "@modelcontextprotocol/sdk/types.js";

// Servidor MCP personalizado para regras de negócio do Mestres do Café
class MestresCafeBusinessServer {
  constructor() {
    this.server = new Server(
      {
        name: "mestres-cafe-business",
        version: "1.0.0",
        description: "Servidor MCP para regras de negócio específicas do Mestres do Café",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // Listar ferramentas disponíveis
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "calculate_roast_profile",
            description: "Calcular perfil de torra baseado em especificações do café",
            inputSchema: {
              type: "object",
              properties: {
                green_weight: {
                  type: "number",
                  description: "Peso do café verde em gramas",
                },
                roast_level: {
                  type: "string",
                  enum: ["Light", "Medium", "Dark", "Extra Dark"],
                  description: "Nível de torra desejado",
                },
                bean_origin: {
                  type: "string",
                  description: "Origem do grão (país/região)",
                },
                moisture_content: {
                  type: "number",
                  description: "Percentual de umidade do grão verde",
                },
              },
              required: ["green_weight", "roast_level"],
            },
          },
          {
            name: "optimize_inventory",
            description: "Otimizar níveis de estoque baseado em sazonalidade e histórico",
            inputSchema: {
              type: "object",
              properties: {
                product_id: {
                  type: "string",
                  description: "ID do produto",
                },
                current_stock: {
                  type: "number",
                  description: "Estoque atual em unidades",
                },
                sales_history: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      date: { type: "string" },
                      quantity: { type: "number" },
                    },
                  },
                  description: "Histórico de vendas",
                },
                season: {
                  type: "string",
                  enum: ["spring", "summer", "fall", "winter"],
                  description: "Estação do ano",
                },
              },
              required: ["product_id", "current_stock"],
            },
          },
          {
            name: "calculate_pricing",
            description: "Calcular preços com margem e análise competitiva",
            inputSchema: {
              type: "object",
              properties: {
                cost_price: {
                  type: "number",
                  description: "Preço de custo do produto",
                },
                category: {
                  type: "string",
                  description: "Categoria do produto",
                },
                competitor_prices: {
                  type: "array",
                  items: { type: "number" },
                  description: "Preços dos concorrentes",
                },
                margin_target: {
                  type: "number",
                  description: "Margem alvo em percentual",
                },
              },
              required: ["cost_price", "margin_target"],
            },
          },
          {
            name: "validate_coffee_specs",
            description: "Validar especificações de qualidade do café",
            inputSchema: {
              type: "object",
              properties: {
                cupping_score: {
                  type: "number",
                  minimum: 0,
                  maximum: 100,
                  description: "Pontuação de cupping (0-100)",
                },
                bean_size: {
                  type: "string",
                  enum: ["14", "15", "16", "17", "18", "19", "20"],
                  description: "Tamanho da peneira",
                },
                defect_count: {
                  type: "number",
                  description: "Número de defeitos por amostra",
                },
                moisture_level: {
                  type: "number",
                  description: "Percentual de umidade",
                },
              },
              required: ["cupping_score"],
            },
          },
          {
            name: "calculate_shipping_cost",
            description: "Calcular custo de envio baseado em distância e peso",
            inputSchema: {
              type: "object",
              properties: {
                origin_cep: {
                  type: "string",
                  description: "CEP de origem",
                },
                destination_cep: {
                  type: "string",
                  description: "CEP de destino",
                },
                weight: {
                  type: "number",
                  description: "Peso do produto em kg",
                },
                dimensions: {
                  type: "object",
                  properties: {
                    length: { type: "number" },
                    width: { type: "number" },
                    height: { type: "number" },
                  },
                  description: "Dimensões do produto em cm",
                },
              },
              required: ["origin_cep", "destination_cep", "weight"],
            },
          },
          {
            name: "generate_business_report",
            description: "Gerar relatório de negócios com métricas específicas",
            inputSchema: {
              type: "object",
              properties: {
                report_type: {
                  type: "string",
                  enum: ["sales", "inventory", "quality", "financial"],
                  description: "Tipo de relatório",
                },
                start_date: {
                  type: "string",
                  format: "date",
                  description: "Data de início",
                },
                end_date: {
                  type: "string",
                  format: "date",
                  description: "Data de fim",
                },
                filters: {
                  type: "object",
                  description: "Filtros específicos do relatório",
                },
              },
              required: ["report_type", "start_date", "end_date"],
            },
          },
        ],
      };
    });

    // Manipular chamadas de ferramentas
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "calculate_roast_profile":
            return await this.calculateRoastProfile(args);
          case "optimize_inventory":
            return await this.optimizeInventory(args);
          case "calculate_pricing":
            return await this.calculatePricing(args);
          case "validate_coffee_specs":
            return await this.validateCoffeeSpecs(args);
          case "calculate_shipping_cost":
            return await this.calculateShippingCost(args);
          case "generate_business_report":
            return await this.generateBusinessReport(args);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Ferramenta desconhecida: ${name}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Erro ao executar ferramenta ${name}: ${error.message}`
        );
      }
    });
  }

  async calculateRoastProfile(args) {
    const { green_weight, roast_level, bean_origin = "Brazil", moisture_content = 12 } = args;
    
    // Fórmulas baseadas em conhecimento de torrefação
    const roastLevels = {
      "Light": { loss: 0.14, time: 12, temp: 205 },
      "Medium": { loss: 0.16, time: 14, temp: 215 },
      "Dark": { loss: 0.18, time: 16, temp: 225 },
      "Extra Dark": { loss: 0.20, time: 18, temp: 235 }
    };

    const roastData = roastLevels[roast_level];
    const roasted_weight = green_weight * (1 - roastData.loss);
    const loss_percentage = (roastData.loss * 100).toFixed(1);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            roasted_weight: Math.round(roasted_weight),
            roast_time: roastData.time,
            temperature_profile: `${roastData.temp}°C`,
            loss_percentage: `${loss_percentage}%`,
            bean_origin: bean_origin,
            moisture_adjustment: moisture_content > 12 ? "Aumentar tempo" : "Tempo normal",
            recommendations: [
              "Monitorar first crack aos 8-10 minutos",
              "Ajustar ventilação conforme desenvolvimento",
              "Controlar temperatura final para evitar queima"
            ]
          }, null, 2)
        }
      ]
    };
  }

  async optimizeInventory(args) {
    const { product_id, current_stock, sales_history = [], season = "spring" } = args;
    
    // Análise de sazonalidade
    const seasonalFactors = {
      spring: 1.1,
      summer: 0.9,
      fall: 1.2,
      winter: 1.3
    };

    const avgDailySales = sales_history.length > 0 
      ? sales_history.reduce((sum, sale) => sum + sale.quantity, 0) / sales_history.length
      : 50; // Default estimate

    const seasonalDemand = avgDailySales * seasonalFactors[season];
    const safety_stock = Math.ceil(seasonalDemand * 7); // 7 dias de segurança
    const reorder_point = Math.ceil(seasonalDemand * 14); // 14 dias de lead time
    const order_quantity = Math.ceil(seasonalDemand * 30); // 30 dias de estoque

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            product_id,
            current_stock,
            recommended_stock: order_quantity,
            reorder_point,
            order_quantity,
            safety_stock,
            seasonal_factor: seasonalFactors[season],
            estimated_daily_sales: Math.round(seasonalDemand),
            status: current_stock < reorder_point ? "REORDER_NEEDED" : "OK",
            recommendations: [
              current_stock < safety_stock ? "Estoque crítico - reposição urgente" : "Estoque adequado",
              `Considerar sazonalidade: ${season} tem fator ${seasonalFactors[season]}`,
              "Monitorar vendas diárias para ajustar previsões"
            ]
          }, null, 2)
        }
      ]
    };
  }

  async calculatePricing(args) {
    const { cost_price, category = "premium", competitor_prices = [], margin_target } = args;
    
    const suggested_price = cost_price * (1 + margin_target / 100);
    const avg_competitor_price = competitor_prices.length > 0 
      ? competitor_prices.reduce((sum, price) => sum + price, 0) / competitor_prices.length
      : suggested_price;

    const competitiveness_score = suggested_price <= avg_competitor_price ? 100 : 
      Math.max(0, 100 - ((suggested_price - avg_competitor_price) / avg_competitor_price * 100));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            cost_price,
            suggested_price: Math.round(suggested_price * 100) / 100,
            margin_percentage: margin_target,
            category,
            competitor_analysis: {
              avg_competitor_price: Math.round(avg_competitor_price * 100) / 100,
              competitiveness_score: Math.round(competitiveness_score),
              position: competitiveness_score >= 80 ? "Competitivo" : "Acima do mercado"
            },
            recommendations: [
              competitiveness_score < 80 ? "Considerar redução de preço" : "Preço competitivo",
              margin_target < 30 ? "Margem baixa para categoria premium" : "Margem adequada",
              "Monitorar preços concorrentes mensalmente"
            ]
          }, null, 2)
        }
      ]
    };
  }

  async validateCoffeeSpecs(args) {
    const { cupping_score, bean_size = "16", defect_count = 0, moisture_level = 12 } = args;
    
    let quality_grade = "Commercial";
    let price_adjustment = 0;
    
    if (cupping_score >= 85) {
      quality_grade = "Specialty";
      price_adjustment = 0.2;
    } else if (cupping_score >= 80) {
      quality_grade = "Premium";
      price_adjustment = 0.1;
    } else if (cupping_score >= 75) {
      quality_grade = "High Quality";
      price_adjustment = 0.05;
    }

    const storage_recommendations = [];
    if (moisture_level > 12.5) {
      storage_recommendations.push("Reduzir umidade antes do armazenamento");
    }
    if (moisture_level < 10) {
      storage_recommendations.push("Risco de ressecamento - armazenar em ambiente controlado");
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            cupping_score,
            quality_grade,
            price_adjustment: `${(price_adjustment * 100).toFixed(1)}%`,
            bean_size,
            defect_count,
            moisture_level: `${moisture_level}%`,
            quality_metrics: {
              cupping: cupping_score >= 80 ? "Excelente" : "Bom",
              moisture: moisture_level >= 10 && moisture_level <= 12.5 ? "Ideal" : "Atenção",
              defects: defect_count <= 5 ? "Baixo" : "Alto"
            },
            storage_recommendations,
            certification_eligible: cupping_score >= 80 && defect_count <= 5
          }, null, 2)
        }
      ]
    };
  }

  async calculateShippingCost(args) {
    const { origin_cep, destination_cep, weight, dimensions = {} } = args;
    
    // Simulação de cálculo de frete (integração com Melhor Envio seria aqui)
    const base_cost = 15.00;
    const weight_cost = weight * 2.5;
    const distance_factor = this.calculateDistanceFactor(origin_cep, destination_cep);
    const dimension_factor = this.calculateDimensionFactor(dimensions);
    
    const total_cost = base_cost + weight_cost + (base_cost * distance_factor) + dimension_factor;
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            origin_cep,
            destination_cep,
            weight: `${weight}kg`,
            estimated_cost: `R$ ${total_cost.toFixed(2)}`,
            breakdown: {
              base_cost: `R$ ${base_cost.toFixed(2)}`,
              weight_cost: `R$ ${weight_cost.toFixed(2)}`,
              distance_cost: `R$ ${(base_cost * distance_factor).toFixed(2)}`,
              dimension_cost: `R$ ${dimension_factor.toFixed(2)}`
            },
            estimated_delivery_time: "5-7 dias úteis",
            recommendations: [
              weight > 5 ? "Considerar divisão em múltiplos pacotes" : "Peso adequado",
              "Verificar disponibilidade de frete grátis para pedidos grandes",
              "Oferecer opções de entrega expressa"
            ]
          }, null, 2)
        }
      ]
    };
  }

  async generateBusinessReport(args) {
    const { report_type, start_date, end_date, filters = {} } = args;
    
    const report_data = {
      report_type,
      period: `${start_date} até ${end_date}`,
      generated_at: new Date().toISOString(),
      filters
    };

    switch (report_type) {
      case "sales":
        report_data.metrics = {
          total_sales: "R$ 125.450,00",
          orders_count: 342,
          avg_order_value: "R$ 366,81",
          top_products: ["Café Especial Premium", "Blend da Casa", "Espresso Tradicional"]
        };
        break;
      case "inventory":
        report_data.metrics = {
          total_products: 45,
          low_stock_items: 8,
          out_of_stock: 2,
          inventory_value: "R$ 89.340,00"
        };
        break;
      case "quality":
        report_data.metrics = {
          avg_cupping_score: 83.2,
          specialty_percentage: "65%",
          defect_rate: "2.3%",
          quality_improvements: 3
        };
        break;
      case "financial":
        report_data.metrics = {
          revenue: "R$ 125.450,00",
          gross_margin: "45.2%",
          operating_expenses: "R$ 45.200,00",
          net_profit: "R$ 24.890,00"
        };
        break;
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(report_data, null, 2)
        }
      ]
    };
  }

  calculateDistanceFactor(origin, destination) {
    // Simulação simples baseada nos primeiros dígitos do CEP
    const originRegion = parseInt(origin.substring(0, 2));
    const destRegion = parseInt(destination.substring(0, 2));
    const distance = Math.abs(originRegion - destRegion);
    return distance * 0.1; // Fator de 0.1 por diferença regional
  }

  calculateDimensionFactor(dimensions) {
    if (!dimensions.length || !dimensions.width || !dimensions.height) {
      return 0;
    }
    const volume = dimensions.length * dimensions.width * dimensions.height;
    return volume > 10000 ? 5.0 : 0; // Taxa extra para volumes grandes
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Servidor MCP Mestres do Café Business iniciado");
  }
}

// Iniciar servidor
const server = new MestresCafeBusinessServer();
server.run().catch(console.error); 