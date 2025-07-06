import React, { useState, useEffect } from 'react';
import { 
  Calculator, FileText, PieChart, TrendingUp, Calendar, DollarSign,
  BarChart3, Filter, Download, Plus, Search, Eye, Edit
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminContabilidadeDashboard = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !hasPermission('admin')) {
      navigate('/dashboard');
      return;
    }
  }, [user, hasPermission, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Módulo de Contabilidade</h1>
          <p className="text-gray-600 mt-1">Gestão contábil e fiscal completa</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Dashboard Contábil</h2>
          <p className="text-gray-600">Módulo em desenvolvimento...</p>
        </div>
      </div>
    </div>
  );
};

export default AdminContabilidadeDashboard; 