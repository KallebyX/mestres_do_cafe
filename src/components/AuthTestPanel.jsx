import React, { useState } from 'react';
import { _useAuth } from '../contexts/AuthContext';
import { _authAPI } from '../lib/api';
// import { _CheckCircle, _XCircle, _User, _Shield, _Coffee } from 'lucide-react'; // Temporarily commented - unused import

const _AuthTestPanel = () => {
  const { user, login, logout } = useAuth();
  const [testResults, setTestResults] = useState([]);
  const [isTesting, setIsTesting] = useState(false);

  const _addTestResult = (name, success, message) => {
    setTestResults(prev => [...prev, { name, success, message, timestamp: Date.now() }]);
  };

  const _runAuthTests = async () => {
    setIsTesting(true);
    setTestResults([]);

    // Test 1: API Connection
    try {
      const _response = await fetch('http://localhost:5000/api/health');
      const _data = await response.json();
      if (data.status === 'OK') {
        addTestResult('Conexão API', true, 'Servidor respondendo');
      } else {
        addTestResult('Conexão API', false, 'Servidor com problemas');
      }
    } catch (error) {
      addTestResult('Conexão API', false, `Erro: ${error.message}`);
    }

    // Test 2: Demo Login
    try {
      const _loginResult = await authAPI.demoLogin();
      if (loginResult.success) {
        addTestResult('Login Demo', true, 'Login funcionando');
      } else {
        addTestResult('Login Demo', false, loginResult.error);
      }
    } catch (error) {
      addTestResult('Login Demo', false, `Erro: ${error.message}`);
    }

    // Test 3: Token Verification
    try {
      const _token = authAPI.getToken();
      if (token) {
        const _verifyResult = await authAPI.verifyToken();
        if (verifyResult.success) {
          addTestResult('Verificação Token', true, 'Token válido');
        } else {
          addTestResult('Verificação Token', false, 'Token inválido');
        }
      } else {
        addTestResult('Verificação Token', false, 'Nenhum token encontrado');
      }
    } catch (error) {
      addTestResult('Verificação Token', false, `Erro: ${error.message}`);
    }

    // Test 4: User State
    const _currentUser = authAPI.getCurrentUser();
    if (currentUser) {
      addTestResult('Estado do Usuário', true, `Usuário: ${currentUser.name}`);
    } else {
      addTestResult('Estado do Usuário', false, 'Nenhum usuário logado');
    }

    setIsTesting(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto my-8">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-900">Painel de Teste - Autenticação</h2>
      </div>

      {/* Status do Usuário */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <User className="w-4 h-4" />
          Status Atual
        </h3>
        {user ? (
          <div className="text-green-600">
            ✅ Logado como: <strong>{user.name}</strong> ({user.email})
            <br />
            Tipo: {user.user_type}
          </div>
        ) : (
          <div className="text-orange-600">
            ⚠️ Não logado
          </div>
        )}
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <button
          onClick={runAuthTests}
          disabled={isTesting}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Coffee className="w-4 h-4" />
          {isTesting ? 'Testando...' : 'Executar Testes'}
        </button>

        {user ? (
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => login('cliente@teste.com', '123456')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Login Demo
          </button>
        )}
      </div>

      {/* Resultados dos Testes */}
      {testResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold">Resultados dos Testes:</h3>
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border-l-4 ${
                result.success
                  ? 'bg-green-50 border-green-400'
                  : 'bg-red-50 border-red-400'
              }`}
            >
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-medium">{result.name}</span>
              </div>
              <p className="text-sm text-gray-600 ml-7">{result.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Informações de Debug */}
      <details className="mt-6">
        <summary className="cursor-pointer font-medium text-gray-700">
          Informações de Debug
        </summary>
        <div className="mt-3 p-3 bg-gray-100 rounded text-xs font-mono">
          <div>Token: {authAPI.getToken() ? '✅ Presente' : '❌ Ausente'}</div>
          <div>LocalStorage User: {localStorage.getItem('user') ? '✅ Presente' : '❌ Ausente'}</div>
          <div>API URL: http://localhost:5000</div>
          <div>Frontend URL: {window.location.origin}</div>
        </div>
      </details>
    </div>
  );
};

export default AuthTestPanel; 