import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({ children, className = '', hover = false, padding = 'md' }: CardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-1' : '';

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-300 ${paddingClasses[padding]} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
}