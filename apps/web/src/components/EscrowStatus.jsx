import React, { useState, useEffect } from 'react';
import { Clock, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const EscrowStatus = ({ payment }) => {
  const [timeUntilRelease, setTimeUntilRelease] = useState('');

  useEffect(() => {
    if (payment.status === 'held' && payment.release_eligible_at) {
      const updateTimer = () => {
        const now = new Date();
        const releaseDate = new Date(payment.release_eligible_at);
        const timeDiff = releaseDate - now;

        if (timeDiff > 0) {
          const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
          
          setTimeUntilRelease(`${days}d ${hours}h ${minutes}m`);
        } else {
          setTimeUntilRelease('Eligible for release');
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [payment.status, payment.release_eligible_at]);

  const getStatusConfig = () => {
    switch (payment.status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          label: 'Pending',
          description: 'Payment is being processed'
        };
      case 'held':
        return {
          icon: Shield,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: 'Held in Escrow',
          description: payment.escrow_reason || 'Payment held for security',
          timeInfo: timeUntilRelease
        };
      case 'released':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Released',
          description: 'Payment released to vendor'
        };
      case 'disputed':
        return {
          icon: AlertTriangle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'Disputed',
          description: 'Payment is under dispute'
        };
      case 'failed':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'Failed',
          description: 'Payment failed'
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: 'Unknown',
          description: 'Status unknown'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`rounded-lg border p-4 ${config.bgColor} ${config.borderColor}`}>
      <div className="flex items-start space-x-3">
        <Icon className={`h-5 w-5 mt-0.5 ${config.color}`} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-medium ${config.color}`}>
              {config.label}
            </h3>
            <span className="text-sm text-gray-500">
              R$ {parseFloat(payment.amount).toFixed(2)}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mt-1">
            {config.description}
          </p>
          
          {config.timeInfo && (
            <div className="mt-2 text-sm text-gray-500">
              {timeUntilRelease === 'Eligible for release' ? (
                <span className="text-green-600 font-medium">
                  ✓ Eligible for automatic release
                </span>
              ) : (
                <span>
                  Release in: {timeUntilRelease}
                </span>
              )}
            </div>
          )}
          
          {payment.held_at && (
            <div className="mt-2 text-xs text-gray-500">
              Held since: {new Date(payment.held_at).toLocaleString()}
            </div>
          )}
          
          {payment.released_at && (
            <div className="mt-2 text-xs text-gray-500">
              Released: {new Date(payment.released_at).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EscrowStatus;