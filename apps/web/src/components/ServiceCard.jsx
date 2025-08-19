import React from 'react';

const ServiceCard = ({ service, className = '' }) => {
  const { icon: Icon, title, description, gradient } = service;

  return (
    <div className={`group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${className}`}>
      <div className="relative mb-8">
        <div className={`w-16 h-16 bg-gradient-to-r ${gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-slate-900 mb-4">
        {title}
      </h3>
      
      <p className="text-slate-600 leading-relaxed text-lg">
        {description}
      </p>
    </div>
  );
};

export default ServiceCard;
