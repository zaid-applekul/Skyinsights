import { useState } from 'react';
import { TreePine } from 'lucide-react';
import { trainer } from '../services/tensorflowTrainer';

export function TrainingInterface({ modelId }: { modelId: string }) {
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [metrics, setMetrics] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const startTraining = async () => {
    try {
      setError(null);
      setIsTraining(true);

      const config = {
        epochs: 50,
        batchSize: 32,
        learningRate: 0.001,
        validationSplit: 0.2,
        augmentation: false
      };

      // Initialize training
      const initData = await trainer.initializeTraining(modelId, config);

      // Start training
      const result = await trainer.trainModel(
        modelId,
        initData.datasets,
        config,
        (epoch, logs) => {
          setCurrentEpoch(epoch);
          setProgress((epoch / config.epochs) * 100);
          setMetrics(logs);
        }
      );

      console.log('Training complete:', result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Training failed');
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="card card-lg max-w-xl animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-green-900 mb-1">🤖 Train Your Model</h2>
        <p className="text-gray-600 text-sm">Use your labeled datasets to improve accuracy</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
          <p className="text-red-800 font-medium text-sm">{error}</p>
        </div>
      )}

      {isTraining ? (
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-gray-700">Training Progress</span>
              <span className="badge badge-success">{progress.toFixed(1)}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-900 font-semibold text-sm">📊 Epoch: {currentEpoch} / 50</p>
          </div>

          {metrics && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-600 font-medium">Loss</p>
                  <p className="text-lg font-bold text-green-600 font-mono">{metrics.loss?.toFixed(4)}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-600 font-medium">Accuracy</p>
                  <p className="text-lg font-bold text-green-600 font-mono">{(metrics.acc * 100).toFixed(2)}%</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-600 font-medium">Val Loss</p>
                  <p className="text-lg font-bold text-amber-600 font-mono">{metrics.val_loss?.toFixed(4)}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-600 font-medium">Val Accuracy</p>
                  <p className="text-lg font-bold text-amber-600 font-mono">{(metrics.val_acc * 100).toFixed(2)}%</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={startTraining}
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          <TreePine className="w-5 h-5" />
          <span>Start Training</span>
        </button>
      )}
    </div>
  );
}
