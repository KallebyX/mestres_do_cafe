import React from 'react';
import { TrendingUp, TrendingDown, BarChart3, Activity, DollarSign } from 'lucide-react';

// Função utilitária para validar e sanitizar dados de gráfico
const sanitizeData = (data) => {
  if (!data || !Array.isArray(data)) {
    return [];
  }
  
  return data.map(item => ({
    ...item,
    value: Number(item.value) || 0,
    label: String(item.label || ''),
  })).filter(item => !isNaN(item.value) && item.value >= 0);
};

// Função utilitária para validar dados de pie chart
const sanitizePieData = (data) => {
  if (!data || !Array.isArray(data)) {
    return [{ label: 'Sem dados', value: 100 }];
  }
  
  const validData = data.map(item => ({
    ...item,
    value: Number(item.value) || 0,
    label: String(item.label || 'Item'),
  })).filter(item => !isNaN(item.value) && item.value > 0);
  
  if (validData.length === 0) {
    return [{ label: 'Sem dados', value: 100 }];
  }
  
  return validData;
};

// Componente de Gráfico de Linha
export const LineChart = ({ data = [], height = 200, color = '#3b82f6' }) => {
  const sanitizedData = sanitizeData(data);
  
  if (sanitizedData.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-slate-400">Sem dados para exibir</p>
      </div>
    );
  }

  const maxValue = Math.max(...sanitizedData.map(d => d.value), 1);
  const minValue = Math.min(...sanitizedData.map(d => d.value), 0);
  const range = maxValue - minValue || 1; // Evitar divisão por zero
  
  const viewBoxWidth = 300;
  const viewBoxHeight = height;
  const padding = 20;
  const chartWidth = viewBoxWidth - 2 * padding;
  const chartHeight = viewBoxHeight - 2 * padding;

  const points = sanitizedData.map((point, index) => {
    const x = padding + (index / Math.max(sanitizedData.length - 1, 1)) * chartWidth;
    const y = padding + ((maxValue - point.value) / range) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className="w-full" style={{ height }}>
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Area fill */}
        {sanitizedData.length > 1 && (
          <polygon
            points={`${padding},${padding + chartHeight} ${points} ${padding + chartWidth},${padding + chartHeight}`}
            fill={color}
            fillOpacity="0.1"
          />
        )}
        
        {/* Line */}
        {sanitizedData.length > 1 && (
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        
        {/* Points */}
        {sanitizedData.map((point, index) => {
          const x = padding + (index / Math.max(sanitizedData.length - 1, 1)) * chartWidth;
          const y = padding + ((maxValue - point.value) / range) * chartHeight;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="3"
              fill={color}
            />
          );
        })}
      </svg>
      
      {/* Labels */}
      <div className="flex justify-between mt-2 text-xs text-slate-500">
        {sanitizedData.map((point, index) => (
          <span key={index}>{point.label}</span>
        ))}
      </div>
    </div>
  );
};

// Componente de Gráfico de Barras
export const BarChart = ({ data = [], height = 200, color = '#10b981' }) => {
  const sanitizedData = sanitizeData(data);
  
  if (sanitizedData.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-slate-400">Sem dados para exibir</p>
      </div>
    );
  }

  const maxValue = Math.max(...sanitizedData.map(d => d.value), 1);

  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-2" style={{ height }}>
        {sanitizedData.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className="w-full rounded-t"
              style={{
                height: `${(item.value / maxValue) * 80}%`,
                backgroundColor: color,
                minHeight: '4px'
              }}
            />
            <span className="text-xs text-slate-500 mt-2 truncate">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente de Gráfico de Pizza
export const PieChartComponent = ({ data = [], size = 160 }) => {
  const sanitizedData = sanitizePieData(data);
  
  const total = sanitizedData.reduce((sum, item) => sum + item.value, 0);
  
  if (total === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <p className="text-slate-400 text-sm">Sem dados</p>
      </div>
    );
  }

  const radius = size / 2 - 10;
  const center = size / 2;
  
  let currentAngle = 0;
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} className="flex-shrink-0">
        {sanitizedData.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const angle = (item.value / total) * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;
          
          // Calcular coordenadas do arco
          const startX = center + radius * Math.cos((startAngle - 90) * Math.PI / 180);
          const startY = center + radius * Math.sin((startAngle - 90) * Math.PI / 180);
          const endX = center + radius * Math.cos((endAngle - 90) * Math.PI / 180);
          const endY = center + radius * Math.sin((endAngle - 90) * Math.PI / 180);
          
          const largeArcFlag = angle > 180 ? 1 : 0;
          
          const pathData = [
            `M ${center} ${center}`,
            `L ${startX} ${startY}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            'Z'
          ].join(' ');

          currentAngle += angle;

          return (
            <path
              key={index}
              d={pathData}
              fill={colors[index % colors.length]}
              stroke="white"
              strokeWidth="2"
            />
          );
        })}
      </svg>
      
      {/* Legend */}
      <div className="flex flex-col gap-1">
        {sanitizedData.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="text-slate-600">{item.label}</span>
            <span className="text-slate-500">({((item.value / total) * 100).toFixed(1)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente de Métrica com Tendência
export const MetricCard = ({ title, value, change, icon: Icon, color = 'blue' }) => {
  const validValue = Number(value) || 0;
  const validChange = Number(change) || 0;
  
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    amber: 'from-amber-500 to-amber-600',
    red: 'from-red-500 to-red-600'
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center`}>
          {Icon && <Icon className="text-white w-6 h-6" />}
        </div>
        <div className={`text-sm font-medium ${validChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {validChange >= 0 ? '+' : ''}{validChange.toFixed(1)}%
        </div>
      </div>
      <h3 className="text-slate-700 font-medium mb-2">{title}</h3>
      <p className={`text-2xl font-bold text-${color}-600`}>
        {typeof validValue === 'number' ? validValue.toLocaleString('pt-BR') : validValue}
      </p>
    </div>
  );
};

// Componente de Gráfico de Área
export const AreaChart = ({ data = [], height = 200, color = '#8b5cf6' }) => {
  const sanitizedData = sanitizeData(data);
  
  if (sanitizedData.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-slate-400">Sem dados para exibir</p>
      </div>
    );
  }

  const maxValue = Math.max(...sanitizedData.map(d => d.value), 1);
  const minValue = Math.min(...sanitizedData.map(d => d.value), 0);
  const range = maxValue - minValue || 1;
  
  const viewBoxWidth = 300;
  const viewBoxHeight = height;
  const padding = 20;
  const chartWidth = viewBoxWidth - 2 * padding;
  const chartHeight = viewBoxHeight - 2 * padding;

  const points = sanitizedData.map((point, index) => {
    const x = padding + (index / Math.max(sanitizedData.length - 1, 1)) * chartWidth;
    const y = padding + ((maxValue - point.value) / range) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className="w-full" style={{ height }}>
        {/* Gradient definition */}
        <defs>
          <linearGradient id={`areaGradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.6 }} />
            <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.1 }} />
          </linearGradient>
        </defs>
        
        {/* Area fill */}
        {sanitizedData.length > 1 && (
          <polygon
            points={`${padding},${padding + chartHeight} ${points} ${padding + chartWidth},${padding + chartHeight}`}
            fill={`url(#areaGradient-${color.replace('#', '')})`}
          />
        )}
        
        {/* Line */}
        {sanitizedData.length > 1 && (
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
      
      {/* Labels */}
      <div className="flex justify-between mt-2 text-xs text-slate-500">
        {sanitizedData.map((point, index) => (
          <span key={index}>{point.label}</span>
        ))}
      </div>
    </div>
  );
};

// Componente de Progress Ring
export const ProgressRing = ({ percentage = 0, size = 120, strokeWidth = 8 }) => {
  const validPercentage = Math.max(0, Math.min(100, Number(percentage) || 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (validPercentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#3b82f6"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      <span className="absolute text-xl font-bold text-slate-700">
        {validPercentage.toFixed(0)}%
      </span>
    </div>
  );
};

export default {
  LineChart,
  BarChart,
  AreaChart,
  PieChartComponent,
  MetricCard,
  ProgressRing
}; 