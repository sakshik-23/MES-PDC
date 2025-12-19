import React from 'react';

export const Badge = ({ children, type }) => {
  const styles = {
    Counselling: "bg-purple-100 text-purple-800",
    Session: "bg-teal-100 text-teal-800",
    Active: "bg-green-100 text-green-800",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[type] || 'bg-gray-100'}`}>
      {children}
    </span>
  );
};