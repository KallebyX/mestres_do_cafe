import React, { useState, useEffect } from 'react';
// import { _BarChart3, _PieChart, _TrendingUp, _Activity, _Target, _Eye, _Download, _Filter, _Calendar, _Search, _Plus, _Edit } from 'lucide-react'; // Temporarily commented - unused import
import { _useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { _useNavigate } from 'react-router-dom';

const _AdminBIDashboard = () => {
  const { user, hasPermission } = useSupabaseAuth();
  const _navigate = useNavigate();

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
          <h1 className="text-3xl font-bold text-gray-900">BI & Relatórios</h1>
          <p className="text-gray-600 mt-1">Business Intelligence e análises avançadas</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Dashboard de BI</h2>
          <p className="text-gray-600">Módulo em desenvolvimento...</p>
        </div>
      </div>
    </div>
  );
};

export default AdminBIDashboard; 