import React from 'react';
import { AlertTriangle, CheckCircle, Info, Zap } from 'lucide-react';
import { PredictionResult } from '../types/disease';

interface PredictionResultsProps {
  result: PredictionResult;
}

export const PredictionResults: React.FC<PredictionResultsProps> = ({ result }) => {
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'border-green-200 bg-green-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'high':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Result */}
      <div className={`border-2 rounded-2xl p-6 ${getSeverityColor(result.topClass.severity)}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getSeverityIcon(result.topClass.severity)}
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{result.topClass.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`text-lg font-semibold metric-value ${getConfidenceColor(result.confidence)}`}>
                  {result.confidence.toFixed(1)}% confidence
                </span>
                <Zap className={`w-4 h-4 ${getConfidenceColor(result.confidence)}`} />
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-gray-700 mb-4 leading-relaxed">
          {result.topClass.description}
        </p>
        
        <div className="bg-white bg-opacity-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center space-x-2">
            <span>💡</span>
            <span>Recommended Treatment</span>
          </h4>
          <p className="text-gray-700 leading-relaxed">
            {result.topClass.treatment}
          </p>
        </div>
      </div>

      {/* All Predictions */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">All Disease Probabilities</h4>
        <div className="space-y-3">
          {result.allClasses.map((diseaseClass, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                {getSeverityIcon(diseaseClass.severity)}
                <span className="text-gray-700 font-medium">{diseaseClass.name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ease-out ${
                      diseaseClass.severity === 'low' ? 'bg-green-500' :
                      diseaseClass.severity === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${diseaseClass.probability}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600 w-12 text-right">
                  {diseaseClass.probability.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};