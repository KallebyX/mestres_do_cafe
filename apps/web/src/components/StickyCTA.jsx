import React from 'react';
import { Briefcase, Phone } from 'lucide-react';

const StickyCTA = ({ 
  variant = 'whatsapp', 
  phone = '+55996458600',
  message = 'Olá! Gostaria de saber mais sobre os serviços B2B da Mestres do Café.',
  className = '' 
}) => {
  const openWhatsApp = () => {
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const openPhone = () => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleClick = variant === 'whatsapp' ? openWhatsApp : openPhone;
  const icon = variant === 'whatsapp' ? <Briefcase className="w-6 h-6" /> : <Phone className="w-6 h-6" />;

  return (
    <div className={`fixed bottom-6 right-6 z-50 md:hidden ${className}`}>
      <button 
        onClick={handleClick}
        className="bg-amber-600 hover:bg-amber-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        aria-label={variant === 'whatsapp' ? 'Abrir WhatsApp para contato B2B' : 'Ligar para contato'}
      >
        {icon}
      </button>
    </div>
  );
};

export default StickyCTA;
