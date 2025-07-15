import React, { useState, useEffect } from 'react';
import { Shield, Clock, AlertTriangle, CheckCircle, DollarSign, Users, FileText, RefreshCw } from 'lucide-react';
import { apiClient } from '../config/api';
import EscrowStatus from './EscrowStatus';

const EscrowPanel = () => {
  const [stats, setStats] = useState({});
  const [heldPayments, setHeldPayments] = useState([]);
  const [eligiblePayments, setEligiblePayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchEscrowData();
  }, []);

  const fetchEscrowData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats usando apiClient configurado
      const statsResponse = await apiClient.get('/api/escrow/stats');
      setStats(statsResponse.data || {});
      
      // Fetch held payments
      const heldResponse = await apiClient.get('/api/escrow/held-payments');
      setHeldPayments(heldResponse.data.payments || []);
      
      // Fetch eligible for release
      const eligibleResponse = await apiClient.get('/api/escrow/eligible-for-release');
      setEligiblePayments(eligibleResponse.data.payments || []);
      
    } catch (error) {
      console.error('Error fetching escrow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReleasePayment = async (paymentId, force = false) => {
    try {
      const response = await apiClient.post('/api/escrow/release', {
        payment_id: paymentId,
        force: force
      });
      
      fetchEscrowData(); // Refresh data
      alert('Payment released successfully!');
    } catch (error) {
      console.error('Error releasing payment:', error);
      alert('Error releasing payment');
    }
  };

  const handleProcessAutomaticReleases = async () => {
    try {
      const response = await fetch('/api/escrow/process-automatic-releases', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        fetchEscrowData(); // Refresh data
        alert(`Processed ${data.released_count} automatic releases`);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error processing releases:', error);
      alert('Error processing automatic releases');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Escrow Management</h1>
        <p className="text-gray-600">Manage marketplace payment escrow system</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('held')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'held'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Held Payments ({heldPayments.length})
          </button>
          <button
            onClick={() => setActiveTab('eligible')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'eligible'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Eligible for Release ({eligiblePayments.length})
          </button>
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Held"
              value={stats.total_held || 0}
              icon={Shield}
              color="bg-blue-500"
              subtitle={`R$ ${parseFloat(stats.amount_held || 0).toFixed(2)}`}
            />
            <StatCard
              title="Total Released"
              value={stats.total_released || 0}
              icon={CheckCircle}
              color="bg-green-500"
              subtitle={`R$ ${parseFloat(stats.amount_released || 0).toFixed(2)}`}
            />
            <StatCard
              title="Disputed"
              value={stats.total_disputed || 0}
              icon={AlertTriangle}
              color="bg-red-500"
              subtitle={`R$ ${parseFloat(stats.amount_disputed || 0).toFixed(2)}`}
            />
            <StatCard
              title="Pending Release"
              value={stats.pending_releases || 0}
              icon={Clock}
              color="bg-yellow-500"
              subtitle="Ready for release"
            />
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleProcessAutomaticReleases}
                className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Process Automatic Releases
              </button>
              <button
                onClick={fetchEscrowData}
                className="w-full sm:w-auto ml-0 sm:ml-3 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Held Payments Tab */}
      {activeTab === 'held' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Held Payments</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {heldPayments.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No payments currently held in escrow
                </div>
              ) : (
                heldPayments.map((payment) => (
                  <div key={payment.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <EscrowStatus payment={payment} />
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => handleReleasePayment(payment.id, true)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          Force Release
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Eligible for Release Tab */}
      {activeTab === 'eligible' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Eligible for Release</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {eligiblePayments.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No payments eligible for release
                </div>
              ) : (
                eligiblePayments.map((payment) => (
                  <div key={payment.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <EscrowStatus payment={payment} />
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => handleReleasePayment(payment.id, false)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          Release
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EscrowPanel;