import React from 'react';

const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} border-t-primary-500 border-r-transparent border-b-primary-200 border-l-transparent rounded-full animate-spin`}
      />
      <span className="text-sm font-medium tracking-wide text-dark-300 animate-pulse">
        Processing...
      </span>
    </div>
  );
};

export default LoadingSpinner;
