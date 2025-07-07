import React from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts'

// Paleta de cores do tema
const COLORS = {
  primary: '#b58150', // brand-brown
  secondary: '#8b5a3c',
  accent: '#d4a574',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  dark: '#1e293b',
  light: '#f8fafc'
}

const CHART_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.accent,
  COLORS.success,
  COLORS.warning,
  COLORS.danger,
  COLORS.info
]

// Componente de Tooltip customizado
const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl">
        <p className="text-gray-200 font-medium mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.name}: ${formatter ? formatter(entry.value) : entry.value}`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// 1. Gráfico de Linha - Evolução temporal
export const LineChartComponent = ({ 
  data, 
  lines = [], 
  height = 300, 
  title,
  formatter = null 
}) => {
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis 
            dataKey="name" 
            stroke="#9ca3af"
            fontSize={12}
          />
          <YAxis stroke="#9ca3af" fontSize={12} />
          <Tooltip content={<CustomTooltip formatter={formatter} />} />
          <Legend />
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color || CHART_COLORS[index % CHART_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// 2. Gráfico de Área - Fluxo de caixa
export const AreaChartComponent = ({ 
  data, 
  areas = [], 
  height = 300, 
  title,
  formatter = null 
}) => {
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            {areas.map((area, index) => (
              <linearGradient key={area.dataKey} id={`color${area.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={area.color || CHART_COLORS[index]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={area.color || CHART_COLORS[index]} stopOpacity={0.1}/>
              </linearGradient>
            ))}
          </defs>
          <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
          <YAxis stroke="#9ca3af" fontSize={12} />
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <Tooltip content={<CustomTooltip formatter={formatter} />} />
          <Legend />
          {areas.map((area, index) => (
            <Area
              key={area.dataKey}
              type="monotone"
              dataKey={area.dataKey}
              name={area.name}
              stroke={area.color || CHART_COLORS[index]}
              fillOpacity={1}
              fill={`url(#color${area.dataKey})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// 3. Gráfico de Barras - Comparativos
export const BarChartComponent = ({ 
  data, 
  bars = [], 
  height = 300, 
  title,
  formatter = null 
}) => {
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
          <YAxis stroke="#9ca3af" fontSize={12} />
          <Tooltip content={<CustomTooltip formatter={formatter} />} />
          <Legend />
          {bars.map((bar, index) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.color || CHART_COLORS[index % CHART_COLORS.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// 4. Gráfico de Pizza - Distribuições
export const PieChartComponent = ({ 
  data, 
  height = 300, 
  title,
  formatter = null,
  showLabels = true 
}) => {
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (!showLabels) return null
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip formatter={formatter} />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

// 5. Gráfico Composto - Múltiplos tipos
export const ComposedChartComponent = ({ 
  data, 
  bars = [],
  lines = [],
  areas = [],
  height = 300, 
  title,
  formatter = null 
}) => {
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
          <YAxis stroke="#9ca3af" fontSize={12} />
          <Tooltip content={<CustomTooltip formatter={formatter} />} />
          <Legend />
          
          {/* Áreas */}
          {areas.map((area, index) => (
            <Area
              key={area.dataKey}
              type="monotone"
              dataKey={area.dataKey}
              name={area.name}
              fill={area.color || CHART_COLORS[index]}
              stroke={area.color || CHART_COLORS[index]}
            />
          ))}
          
          {/* Barras */}
          {bars.map((bar, index) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.color || CHART_COLORS[index + areas.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
          
          {/* Linhas */}
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color || CHART_COLORS[index + areas.length + bars.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

// 6. Componente de Métricas com Gráfico Pequeno (Sparkline)
export const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'positive',
  data = [],
  formatter = null,
  icon: Icon 
}) => {
  const changeColor = changeType === 'positive' ? 'text-green-500' : 
                     changeType === 'negative' ? 'text-red-500' : 'text-gray-500'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatter ? formatter(value) : value}
          </p>
          {change && (
            <p className={`text-sm ${changeColor}`}>
              {change > 0 ? '+' : ''}{change}%
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-brand-brown/10 rounded-full">
            <Icon className="w-6 h-6 text-brand-brown" />
          </div>
        )}
      </div>
      
      {data.length > 0 && (
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={COLORS.primary}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

// Função utilitária para formatar moeda
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

// Função utilitária para formatar percentual
export const formatPercent = (value) => {
  return `${value.toFixed(1)}%`
}

// Exportar todos os componentes
export default {
  LineChartComponent,
  AreaChartComponent,
  BarChartComponent,
  PieChartComponent,
  ComposedChartComponent,
  MetricCard,
  formatCurrency,
  formatPercent,
  COLORS,
  CHART_COLORS
} 