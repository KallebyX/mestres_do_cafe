import React from 'react';
import { TrendingUp, TrendingDown, BarChart3, Activity, DollarSign } from 'lucide-react';

// Componente de Gráfico de Linha
export const LineChart = ({ data, height = 200, color = '#8B4513' }) => {
  if (!data || data.length === 0) return <div className="h-40 bg-gray-100 rounded flex items-center justify-center text-gray-500">Sem dados</div>;

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((item.value - minValue) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="relative" style={{ height }}>
      <svg width="100%" height="100%" className="absolute inset-0">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Area under curve */}
        <path
          d={`M 0,100 L ${points} L 100,100 Z`}
          fill={`${color}20`}
          strokeWidth="0"
        />
        
        {/* Main line */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        
        {/* Data points */}
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - ((item.value - minValue) / range) * 100;
          return (
            <circle
              key={index}
              cx={`${x}%`}
              cy={`${y}%`}
              r="4"
              fill={color}
              className="drop-shadow-sm"
            />
          );
        })}
      </svg>
      
      {/* Labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 mt-2">
        {data.map((item, index) => (
          <span key={index} className="transform -rotate-45 origin-left">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
};

// Componente de Gráfico de Barras
export const BarChart = ({ data, height = 200, color = '#8B4513' }) => {
  if (!data || data.length === 0) return <div className="h-40 bg-gray-100 rounded flex items-center justify-center text-gray-500">Sem dados</div>;

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="relative" style={{ height }}>
      <div className="flex items-end justify-between h-full space-x-2 pb-8">
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * 80; // 80% of container height
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="relative group">
                <div
                  className="w-full rounded-t transition-all duration-500 hover:opacity-80"
                  style={{
                    height: `${barHeight}%`,
                    backgroundColor: color,
                    minHeight: '4px'
                  }}
                />
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {item.label}: {item.value.toLocaleString()}
                </div>
              </div>
              <span className="text-xs text-gray-600 mt-2 text-center transform -rotate-45 origin-center w-12">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Componente de Gráfico de Pizza
export const PieChartComponent = ({ data, size = 200 }) => {
  if (!data || data.length === 0) return <div className="h-40 bg-gray-100 rounded flex items-center justify-center text-gray-500">Sem dados</div>;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  const colors = [
    '#8B4513', '#D2691E', '#CD853F', '#DEB887', '#F4A460', 
    '#DAA520', '#B8860B', '#9ACD32', '#6B8E23', '#556B2F'
  ];

  return (
    <div className="flex items-center space-x-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (item.value / total) * 360;
            const radius = size / 2 - 10;
            const centerX = size / 2;
            const centerY = size / 2;

            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            
            const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
            const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
            const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
            const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);

            const largeArcFlag = angle > 180 ? 1 : 0;

            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
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
                className="hover:opacity-80 transition-opacity"
              />
            );
          })}
        </svg>
      </div>
      
      {/* Legend */}
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="text-sm text-gray-600">
              {item.label}: {((item.value / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente de Métrica com Tendência
export const MetricCard = ({ title, value, change, changeType, icon: Icon, color = '#8B4513' }) => {
  const isPositive = changeType === 'positive';
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendIcon className="w-4 h-4 mr-1" />
              {change}
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
        )}
      </div>
    </div>
  );
};

// Componente de Gráfico de Área
export const AreaChart = ({ data, height = 200, color = '#8B4513' }) => {
  if (!data || data.length === 0) return <div className="h-40 bg-gray-100 rounded flex items-center justify-center text-gray-500">Sem dados</div>;

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((item.value - minValue) / range) * 80; // 80% of height
    return { x, y, ...item };
  });

  const pathData = `M 0,100 L ${points.map(p => `${p.x},${p.y}`).join(' L ')} L 100,100 Z`;

  return (
    <div className="relative" style={{ height }}>
      <svg width="100%" height="100%" className="absolute inset-0">
        {/* Gradient definition */}
        <defs>
          <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.1 }} />
          </linearGradient>
        </defs>
        
        {/* Area */}
        <path
          d={pathData}
          fill={`url(#gradient-${color.replace('#', '')})`}
          strokeWidth="0"
        />
        
        {/* Border line */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points.map(p => `${p.x},${p.y}`).join(' ')}
        />
      </svg>
    </div>
  );
};

// Componente de Progress Ring
export const ProgressRing = ({ percentage, size = 120, strokeWidth = 8, color = '#8B4513' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-gray-700">{percentage.toFixed(0)}%</span>
      </div>
    </div>
  );
}; 