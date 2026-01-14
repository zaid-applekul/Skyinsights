import React from 'react';
import { Loader2, Microscope } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Analyzing apple leaf..." 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-fade-in">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-green-200 rounded-full animate-spin border-t-green-600"></div>
        <div className="w-20 h-20 border-4 border-green-100 rounded-full animate-spin border-b-green-500 absolute inset-0" style={{animationDirection: 'reverse', animationDuration: '1s'}}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Microscope className="w-8 h-8 text-green-600" />
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-gray-800 font-bold text-xl mb-1">🔬 {message}</p>
        <p className="text-sm text-gray-600">AI is analyzing the leaf patterns...</p>
        <div className="flex justify-center space-x-1 mt-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    </div>
  );
};