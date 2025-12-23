import { useState, useEffect } from 'react';
import {
  Settings,
  CreditCard,
  Truck,
  Database,
  Cloud,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  TestTube,
  RefreshCw,
  Shield,
  Key,
  Globe,
  Loader2
} from 'lucide-react';
import { settingsAPI } from '../lib/api';

const AdminSettings = () => {
  // State for loading and messages
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(null);
  const [message, setMessage] = useState(null);

  // State for integration status
  const [integrationStatus, setIntegrationStatus] = useState(null);

  // State for Mercado Pago settings
  const [mpSettings, setMpSettings] = useState({
    test_access_token: '',
    test_public_key: '',
    prod_access_token: '',
    prod_public_key: '',
    environment: 'sandbox',
    webhook_url: ''
  });
  const [mpShowTokens, setMpShowTokens] = useState({
    test_access_token: false,
    test_public_key: false,
    prod_access_token: false,
    prod_public_key: false
  });
  const [mpTestResult, setMpTestResult] = useState(null);

  // State for Melhor Envio settings
  const [meSettings, setMeSettings] = useState({
    test_api_key: '',
    test_client_id: '',
    test_client_secret: '',
    prod_api_key: '',
    prod_client_id: '',
    prod_client_secret: '',
    environment: 'sandbox',
    origin_cep: '',
    webhook_url: ''
  });
  const [meShowTokens, setMeShowTokens] = useState({
    test_api_key: false,
    test_client_id: false,
    test_client_secret: false,
    prod_api_key: false,
    prod_client_id: false,
    prod_client_secret: false
  });
  const [meTestResult, setMeTestResult] = useState(null);

  // Load settings on mount
  useEffect(() => {
    loadAllSettings();
  }, []);

  const loadAllSettings = async () => {
    setLoading(true);
    try {
      const [statusResult, mpResult, meResult] = await Promise.all([
        settingsAPI.getIntegrationStatus(),
        settingsAPI.getMercadoPagoSettings(),
        settingsAPI.getMelhorEnvioSettings()
      ]);

      if (statusResult.success) {
        setIntegrationStatus(statusResult.data);
      }

      if (mpResult.success && mpResult.data.data) {
        const data = mpResult.data.data;
        setMpSettings(prev => ({
          ...prev,
          environment: data.environment || 'sandbox',
          webhook_url: data.webhook_url || ''
        }));
      }

      if (meResult.success && meResult.data.data) {
        const data = meResult.data.data;
        setMeSettings(prev => ({
          ...prev,
          environment: data.environment || 'sandbox',
          origin_cep: data.origin_cep || '',
          webhook_url: data.webhook_url || ''
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      showMessage('Erro ao carregar configurações', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  // Mercado Pago handlers
  const handleMpChange = (field, value) => {
    setMpSettings(prev => ({ ...prev, [field]: value }));
  };

  const saveMpSettings = async () => {
    setSaving(true);
    try {
      const result = await settingsAPI.updateMercadoPagoSettings(mpSettings);
      if (result.success) {
        showMessage('Configurações do Mercado Pago salvas com sucesso!', 'success');
        // Clear the tokens from local state (they're saved in the database)
        setMpSettings(prev => ({
          ...prev,
          test_access_token: '',
          test_public_key: '',
          prod_access_token: '',
          prod_public_key: ''
        }));
        loadAllSettings();
      } else {
        showMessage(result.error || 'Erro ao salvar configurações', 'error');
      }
    } catch (error) {
      showMessage('Erro ao salvar configurações', 'error');
    } finally {
      setSaving(false);
    }
  };

  const testMpConnection = async () => {
    setTesting('mp');
    setMpTestResult(null);
    try {
      const result = await settingsAPI.testMercadoPagoConnection(mpSettings.environment);
      if (result.success && result.data.success) {
        setMpTestResult({
          success: true,
          message: result.data.message,
          account: result.data.account
        });
        showMessage('Conexão com Mercado Pago estabelecida!', 'success');
      } else {
        setMpTestResult({
          success: false,
          error: result.data?.error || result.error || 'Erro ao testar conexão'
        });
        showMessage(result.data?.error || 'Erro ao testar conexão', 'error');
      }
    } catch (error) {
      setMpTestResult({
        success: false,
        error: 'Erro ao testar conexão'
      });
      showMessage('Erro ao testar conexão', 'error');
    } finally {
      setTesting(null);
    }
  };

  // Melhor Envio handlers
  const handleMeChange = (field, value) => {
    setMeSettings(prev => ({ ...prev, [field]: value }));
  };

  const saveMeSettings = async () => {
    setSaving(true);
    try {
      const result = await settingsAPI.updateMelhorEnvioSettings(meSettings);
      if (result.success) {
        showMessage('Configurações do Melhor Envio salvas com sucesso!', 'success');
        // Clear the tokens from local state
        setMeSettings(prev => ({
          ...prev,
          test_api_key: '',
          test_client_id: '',
          test_client_secret: '',
          prod_api_key: '',
          prod_client_id: '',
          prod_client_secret: ''
        }));
        loadAllSettings();
      } else {
        showMessage(result.error || 'Erro ao salvar configurações', 'error');
      }
    } catch (error) {
      showMessage('Erro ao salvar configurações', 'error');
    } finally {
      setSaving(false);
    }
  };

  const testMeConnection = async () => {
    setTesting('me');
    setMeTestResult(null);
    try {
      const result = await settingsAPI.testMelhorEnvioConnection(meSettings.environment);
      if (result.success && result.data.success) {
        setMeTestResult({
          success: true,
          message: result.data.message,
          account: result.data.account
        });
        showMessage('Conexão com Melhor Envio estabelecida!', 'success');
      } else {
        setMeTestResult({
          success: false,
          error: result.data?.error || result.error || 'Erro ao testar conexão'
        });
        showMessage(result.data?.error || 'Erro ao testar conexão', 'error');
      }
    } catch (error) {
      setMeTestResult({
        success: false,
        error: 'Erro ao testar conexão'
      });
      showMessage('Erro ao testar conexão', 'error');
    } finally {
      setTesting(null);
    }
  };

  // Token input component
  const TokenInput = ({ label, value, onChange, show, onToggleShow, placeholder }) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );

  // Status badge component
  const StatusBadge = ({ status }) => {
    if (status === 'configured') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3" />
          Configurado
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
        <AlertCircle className="w-3 h-3" />
        Não configurado
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        <span className="ml-2 text-gray-600">Carregando configurações...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Message Toast */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          message.type === 'success' ? 'bg-green-500 text-white' :
          message.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          {message.text}
        </div>
      )}

      {/* Integration Status Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-600" />
            Status das Integrações
          </h2>
          <button
            onClick={loadAllSettings}
            className="text-gray-500 hover:text-gray-700"
            title="Recarregar"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {integrationStatus && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">Mercado Pago</span>
              </div>
              <StatusBadge status={integrationStatus.mercado_pago?.status} />
              <p className="text-xs text-gray-500 mt-1">
                Ambiente: {integrationStatus.mercado_pago?.environment || 'N/A'}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">Melhor Envio</span>
              </div>
              <StatusBadge status={integrationStatus.melhor_envio?.status} />
              <p className="text-xs text-gray-500 mt-1">
                Ambiente: {integrationStatus.melhor_envio?.environment || 'N/A'}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900">Database</span>
              </div>
              <StatusBadge status={integrationStatus.database?.status} />
              <p className="text-xs text-gray-500 mt-1">
                Tipo: {integrationStatus.database?.type || 'N/A'}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Cloud className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-gray-900">Storage (S3)</span>
              </div>
              <StatusBadge status={integrationStatus.storage?.status} />
              <p className="text-xs text-gray-500 mt-1">
                Bucket: {integrationStatus.storage?.bucket || 'N/A'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mercado Pago Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <CreditCard className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Mercado Pago</h2>
          <span className="ml-auto">
            {integrationStatus?.mercado_pago && (
              <StatusBadge status={integrationStatus.mercado_pago.status} />
            )}
          </span>
        </div>

        {/* Environment Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Globe className="w-4 h-4 inline mr-1" />
            Ambiente Ativo
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mp_environment"
                value="sandbox"
                checked={mpSettings.environment === 'sandbox'}
                onChange={(e) => handleMpChange('environment', e.target.value)}
                className="text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm text-gray-700">Sandbox (Teste)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mp_environment"
                value="production"
                checked={mpSettings.environment === 'production'}
                onChange={(e) => handleMpChange('environment', e.target.value)}
                className="text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm text-gray-700">Production (Produção)</span>
            </label>
          </div>
        </div>

        {/* Test Credentials */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-semibold text-yellow-800 mb-4 flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            Credenciais de Teste (Sandbox)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TokenInput
              label="Access Token (Teste)"
              value={mpSettings.test_access_token}
              onChange={(v) => handleMpChange('test_access_token', v)}
              show={mpShowTokens.test_access_token}
              onToggleShow={() => setMpShowTokens(prev => ({ ...prev, test_access_token: !prev.test_access_token }))}
              placeholder="APP_USR-xxxx..."
            />
            <TokenInput
              label="Public Key (Teste)"
              value={mpSettings.test_public_key}
              onChange={(v) => handleMpChange('test_public_key', v)}
              show={mpShowTokens.test_public_key}
              onToggleShow={() => setMpShowTokens(prev => ({ ...prev, test_public_key: !prev.test_public_key }))}
              placeholder="APP_USR-xxxx..."
            />
          </div>
        </div>

        {/* Production Credentials */}
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-sm font-semibold text-green-800 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Credenciais de Produção
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TokenInput
              label="Access Token (Produção)"
              value={mpSettings.prod_access_token}
              onChange={(v) => handleMpChange('prod_access_token', v)}
              show={mpShowTokens.prod_access_token}
              onToggleShow={() => setMpShowTokens(prev => ({ ...prev, prod_access_token: !prev.prod_access_token }))}
              placeholder="APP_USR-xxxx..."
            />
            <TokenInput
              label="Public Key (Produção)"
              value={mpSettings.prod_public_key}
              onChange={(v) => handleMpChange('prod_public_key', v)}
              show={mpShowTokens.prod_public_key}
              onToggleShow={() => setMpShowTokens(prev => ({ ...prev, prod_public_key: !prev.prod_public_key }))}
              placeholder="APP_USR-xxxx..."
            />
          </div>
        </div>

        {/* Webhook URL */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Webhook URL (opcional)
          </label>
          <input
            type="url"
            value={mpSettings.webhook_url}
            onChange={(e) => handleMpChange('webhook_url', e.target.value)}
            placeholder="https://seu-dominio.com/api/webhooks/mercadopago"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        {/* Test Result */}
        {mpTestResult && (
          <div className={`mb-6 p-4 rounded-lg ${mpTestResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            {mpTestResult.success ? (
              <div>
                <p className="text-green-800 font-medium flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  {mpTestResult.message}
                </p>
                {mpTestResult.account && (
                  <div className="mt-2 text-sm text-green-700">
                    <p>ID: {mpTestResult.account.id}</p>
                    <p>Email: {mpTestResult.account.email}</p>
                    <p>Nickname: {mpTestResult.account.nickname}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-red-800 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                {mpTestResult.error}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={saveMpSettings}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar Configurações
          </button>
          <button
            onClick={testMpConnection}
            disabled={testing === 'mp'}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            {testing === 'mp' ? <Loader2 className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
            Testar Conexão
          </button>
        </div>
      </div>

      {/* Melhor Envio Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Truck className="w-6 h-6 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">Melhor Envio</h2>
          <span className="ml-auto">
            {integrationStatus?.melhor_envio && (
              <StatusBadge status={integrationStatus.melhor_envio.status} />
            )}
          </span>
        </div>

        {/* Environment Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Globe className="w-4 h-4 inline mr-1" />
            Ambiente Ativo
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="me_environment"
                value="sandbox"
                checked={meSettings.environment === 'sandbox'}
                onChange={(e) => handleMeChange('environment', e.target.value)}
                className="text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm text-gray-700">Sandbox (Teste)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="me_environment"
                value="production"
                checked={meSettings.environment === 'production'}
                onChange={(e) => handleMeChange('environment', e.target.value)}
                className="text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm text-gray-700">Production (Produção)</span>
            </label>
          </div>
        </div>

        {/* Test Credentials */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-semibold text-yellow-800 mb-4 flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            Credenciais de Teste (Sandbox)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TokenInput
              label="API Key (Teste)"
              value={meSettings.test_api_key}
              onChange={(v) => handleMeChange('test_api_key', v)}
              show={meShowTokens.test_api_key}
              onToggleShow={() => setMeShowTokens(prev => ({ ...prev, test_api_key: !prev.test_api_key }))}
              placeholder="eyJhbGciOi..."
            />
            <TokenInput
              label="Client ID (Teste)"
              value={meSettings.test_client_id}
              onChange={(v) => handleMeChange('test_client_id', v)}
              show={meShowTokens.test_client_id}
              onToggleShow={() => setMeShowTokens(prev => ({ ...prev, test_client_id: !prev.test_client_id }))}
              placeholder="1234"
            />
            <TokenInput
              label="Client Secret (Teste)"
              value={meSettings.test_client_secret}
              onChange={(v) => handleMeChange('test_client_secret', v)}
              show={meShowTokens.test_client_secret}
              onToggleShow={() => setMeShowTokens(prev => ({ ...prev, test_client_secret: !prev.test_client_secret }))}
              placeholder="xxxxxxxx..."
            />
          </div>
        </div>

        {/* Production Credentials */}
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-sm font-semibold text-green-800 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Credenciais de Produção
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TokenInput
              label="API Key (Produção)"
              value={meSettings.prod_api_key}
              onChange={(v) => handleMeChange('prod_api_key', v)}
              show={meShowTokens.prod_api_key}
              onToggleShow={() => setMeShowTokens(prev => ({ ...prev, prod_api_key: !prev.prod_api_key }))}
              placeholder="eyJhbGciOi..."
            />
            <TokenInput
              label="Client ID (Produção)"
              value={meSettings.prod_client_id}
              onChange={(v) => handleMeChange('prod_client_id', v)}
              show={meShowTokens.prod_client_id}
              onToggleShow={() => setMeShowTokens(prev => ({ ...prev, prod_client_id: !prev.prod_client_id }))}
              placeholder="1234"
            />
            <TokenInput
              label="Client Secret (Produção)"
              value={meSettings.prod_client_secret}
              onChange={(v) => handleMeChange('prod_client_secret', v)}
              show={meShowTokens.prod_client_secret}
              onToggleShow={() => setMeShowTokens(prev => ({ ...prev, prod_client_secret: !prev.prod_client_secret }))}
              placeholder="xxxxxxxx..."
            />
          </div>
        </div>

        {/* Origin CEP and Webhook */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CEP de Origem (Envio)
            </label>
            <input
              type="text"
              value={meSettings.origin_cep}
              onChange={(e) => handleMeChange('origin_cep', e.target.value.replace(/\D/g, '').slice(0, 8))}
              placeholder="00000000"
              maxLength={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">CEP do seu armazém/loja para cálculo de frete</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Webhook URL (opcional)
            </label>
            <input
              type="url"
              value={meSettings.webhook_url}
              onChange={(e) => handleMeChange('webhook_url', e.target.value)}
              placeholder="https://seu-dominio.com/api/webhooks/melhorenvio"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Test Result */}
        {meTestResult && (
          <div className={`mb-6 p-4 rounded-lg ${meTestResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            {meTestResult.success ? (
              <div>
                <p className="text-green-800 font-medium flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  {meTestResult.message}
                </p>
                {meTestResult.account && (
                  <div className="mt-2 text-sm text-green-700">
                    <p>ID: {meTestResult.account.id}</p>
                    <p>Nome: {meTestResult.account.name}</p>
                    <p>Email: {meTestResult.account.email}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-red-800 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                {meTestResult.error}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={saveMeSettings}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar Configurações
          </button>
          <button
            onClick={testMeConnection}
            disabled={testing === 'me'}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            {testing === 'me' ? <Loader2 className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
            Testar Conexão
          </button>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <Key className="w-5 h-5" />
          Como obter as credenciais?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Mercado Pago</h4>
            <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
              <li>Acesse <a href="https://www.mercadopago.com.br/developers" target="_blank" rel="noopener noreferrer" className="underline">mercadopago.com.br/developers</a></li>
              <li>Crie uma aplicação</li>
              <li>Vá em &quot;Credenciais&quot;</li>
              <li>Copie o Access Token e Public Key</li>
              <li>Use credenciais de teste para sandbox</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Melhor Envio</h4>
            <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
              <li>Acesse <a href="https://melhorenvio.com.br" target="_blank" rel="noopener noreferrer" className="underline">melhorenvio.com.br</a></li>
              <li>Faça login e vá em &quot;Integrações&quot;</li>
              <li>Crie uma aplicação</li>
              <li>Gere o token de acesso (API Key)</li>
              <li>Use o ambiente sandbox para testes</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
