import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Package, 
  ShoppingCart,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

// Stat Card Component
export const StatCard = ({ title, value, icon: Icon, trend, color = 'blue', className = '' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200'
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              {trend.direction === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.value}
              </span>
              <span className="text-sm text-gray-500 ml-1">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

// Quick Actions Widget
export const QuickActions = ({ actions = [] }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="flex items-center p-3 text-left text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150"
          >
            <action.icon className="h-5 w-5 mr-3 text-gray-400" />
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// Recent Activity Widget
export const RecentActivity = ({ activities = [], title = "Atividades Recentes" }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            Nenhuma atividade recente
          </p>
        ) : (
          activities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.title}
                </p>
                {activity.description && (
                  <p className="text-sm text-gray-500 mt-1">
                    {activity.description}
                  </p>
                )}
                <div className="flex items-center mt-2 text-xs text-gray-400">
                  <Clock className="h-3 w-3 mr-1" />
                  {activity.timestamp}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Data Table Widget
export const DataTable = ({ 
  title, 
  headers, 
  data = [], 
  actions = [],
  loading = false,
  emptyMessage = "Nenhum dado encontrado",
  maxHeight = "400px"
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      </div>
      
      <div className="overflow-x-auto" style={{ maxHeight }}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header.label}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {!Array.isArray(data) || data.length === 0 ? (
              <tr>
                <td 
                  colSpan={headers.length + (actions.length > 0 ? 1 : 0)} 
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {headers.map((header, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {header.render ? header.render(row[header.key], row) : row[header.key]}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {actions.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            onClick={() => action.onClick(row)}
                            className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md ${action.className || 'text-blue-600 bg-blue-100 hover:bg-blue-200'}`}
                          >
                            {action.icon && <action.icon className="h-3 w-3 mr-1" />}
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Search and Filter Widget
export const SearchAndFilter = ({ 
  searchTerm, 
  onSearchChange, 
  filters = [],
  onFilterChange,
  placeholder = "Pesquisar...",
  className = ""
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {filters.length > 0 && (
          <div className="flex items-center space-x-3">
            {filters.map((filter, index) => (
              <select
                key={index}
                value={filter.value}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{filter.placeholder}</option>
                {filter.options.map((option, optionIndex) => (
                  <option key={optionIndex} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Common predefined stat cards
export const CommonStatCards = {
  Revenue: ({ value, trend }) => (
    <StatCard
      title="Receita Total"
      value={value}
      icon={DollarSign}
      trend={trend}
      color="green"
    />
  ),
  
  Users: ({ value, trend }) => (
    <StatCard
      title="Usuários"
      value={value}
      icon={Users}
      trend={trend}
      color="blue"
    />
  ),
  
  Products: ({ value, trend }) => (
    <StatCard
      title="Produtos"
      value={value}
      icon={Package}
      trend={trend}
      color="purple"
    />
  ),
  
  Orders: ({ value, trend }) => (
    <StatCard
      title="Pedidos"
      value={value}
      icon={ShoppingCart}
      trend={trend}
      color="indigo"
    />
  )
};

export default {
  StatCard,
  QuickActions,
  RecentActivity,
  DataTable,
  SearchAndFilter,
  CommonStatCards
};