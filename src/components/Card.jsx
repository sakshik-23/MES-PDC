import React from 'react';

export const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md border border-gray-100 ${className}`}>
    {children}
  </div>
);