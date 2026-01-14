import React from 'react';
import { Activity, Clock, TrendingUp, Zap } from 'lucide-react';

interface TrainingProgressProps {
  isTraining: boolean;
  currentEpoch: number;
  totalEpochs: number;
  loss: number;
  accuracy: number;
  valLoss: number;
  valAccuracy: number;
  eta: string;
}

export const TrainingProgress: React.FC<TrainingProgressProps> = ({
  isTraining,
  currentEpoch,
  totalEpochs,
  loss,
  accuracy,
  valLoss,
  valAccuracy,
  eta
}) => {
  const progress = (currentEpoch / totalEpochs) * 100;

  if (!isTraining) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
      <div className="flex items-center space-x-3 mb-6">
        <Activity className="w-8 h-8 text-blue-600 animate-pulse" />
        <h2 className="text-2xl font-bold text-gray-800">Training in Progress</h2>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Epoch {currentEpoch} of {totalEpochs}
          </span>
          <span className="text-sm font-medium text-blue-600">
            {progress.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Training Loss</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{loss.toFixed(4)}</div>
        </div>

        <div className="bg-green-50 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Training Accuracy</span>
          </div>
          <div className="text-2xl font-bold text-green-900">{(accuracy * 100).toFixed(1)}%</div>
        </div>

        <div className="bg-purple-50 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Val Loss</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">{valLoss.toFixed(4)}</div>
        </div>

        <div className="bg-orange-50 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">ETA</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">{eta}</div>
        </div>
      </div>

      {/* Real-time Chart Placeholder */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Training Metrics</h3>
        <div className="h-48 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-2 animate-pulse" />
            <p>Real-time training charts would appear here</p>
            <p className="text-sm">Loss curves, accuracy plots, etc.</p>
          </div>
        </div>
      </div>
    </div>
  );
};