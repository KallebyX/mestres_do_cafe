import React, { useState, useEffect } from 'react';
// import { _Settings, _Users, _Shield, _Database, _Globe, _Bell, _Key, _Mail, _Smartphone, _Server, _Lock, _Edit } from 'lucide-react'; // Temporarily commented - unused import
import { _useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { _useNavigate } from 'react-router-dom';

const _AdminConfigDashboard = () => {
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
          <h1 className="text-3xl font-bold text-gray-900">Configurações do Sistema</h1>
          <p className="text-gray-600 mt-1">Configurações gerais e administração</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Painel de Configurações</h2>
          <p className="text-gray-600">Módulo em desenvolvimento...</p>
        </div>
      </div>
    </div>
  );
};

export default AdminConfigDashboard; 