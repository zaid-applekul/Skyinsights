import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { diseaseDatabase } from '../types/disease';

export const DiseasesInfo: React.FC = () => {
  const diseases = Object.entries(diseaseDatabase).map(([key, disease]) => ({
    key,
    ...disease
  }));

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'medium':
        return <Info className="w-5 h-5 text-yellow-500" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="card card-lg">
      <h2 className="text-2xl font-bold text-green-900 mb-2">🌾 Disease Database</h2>
      <p className="text-gray-600 text-sm mb-6">Learn about common apple diseases and their treatments</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {diseases.map((disease) => (
          <div key={disease.key} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-300 hover:border-green-300 hover:bg-green-50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                {getSeverityIcon(disease.severity)}
                <h3 className="text-lg font-semibold text-gray-800">{disease.name}</h3>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityBadge(disease.severity)}`}>
                {disease.severity.toUpperCase()}
              </span>
            </div>
            
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
              {disease.description}
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h4 className="font-medium text-green-800 mb-1 text-sm">💡 Treatment</h4>
              <p className="text-green-700 text-xs leading-relaxed">
                {disease.treatment}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};