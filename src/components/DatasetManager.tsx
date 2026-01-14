import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FolderOpen, 
  Database, 
  BarChart3, 
  Settings, 
  Play,
  Trash2,
  Info,
  AlertCircle
} from 'lucide-react';
import { TrainingConfig } from '../types/dataset';
import type { Dataset, Model } from '../lib/supabase';

interface DatasetManagerProps {
  onDatasetUpload: (files: File[], type: 'train' | 'test' | 'validation', name: string, description?: string) => void;
  datasets: Dataset[];
  models: Model[];
  onStartTraining: (config: TrainingConfig) => void;
  isAuthenticated: boolean;
}

export const DatasetManager: React.FC<DatasetManagerProps> = ({
  onDatasetUpload,
  datasets,
  models,
  onStartTraining,
  isAuthenticated,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'manage' | 'train'>('upload');
  const [selectedDatasetType, setSelectedDatasetType] = useState<'train' | 'test' | 'validation'>('train');
  const [datasetName, setDatasetName] = useState('');
  const [datasetDescription, setDatasetDescription] = useState('');
  const [trainingConfig, setTrainingConfig] = useState<TrainingConfig>({
    epochs: 50,
    batchSize: 32,
    learningRate: 0.001,
    validationSplit: 0.2,
    augmentation: true
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!datasetName.trim()) {
      alert('Please enter a dataset name');
      return;
    }
    onDatasetUpload(acceptedFiles, selectedDatasetType, datasetName, datasetDescription);
    setDatasetName('');
    setDatasetDescription('');
  }, [onDatasetUpload, selectedDatasetType, datasetName, datasetDescription]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true
  });

  const handleStartTraining = () => {
    onStartTraining(trainingConfig);
  };

  const getDatasetTypeColor = (type: string) => {
    switch (type) {
      case 'train':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'test':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'validation':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="card card-lg">
      <div className="flex items-center space-x-3 mb-6">
        <Database className="w-8 h-8 text-green-600" />
        <h2 className="text-2xl font-bold text-green-900">📊 Dataset Management</h2>
        {!isAuthenticated && (
          <div className="flex items-center space-x-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Demo Mode</span>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'upload', label: 'Upload Dataset', icon: Upload },
          { id: 'manage', label: 'Manage Datasets', icon: FolderOpen },
          { id: 'train', label: 'Train Model', icon: Settings }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-green-600 shadow-sm border border-green-200'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          {!isAuthenticated && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-1">Demo Mode</h3>
                  <p className="text-amber-700 text-sm">
                    Sign in to upload real datasets and train actual models. In demo mode, uploads are simulated.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-800 mb-1">Dataset Structure</h3>
                <p className="text-green-700 text-sm mb-2">
                  Organize your images in folders by disease class:
                </p>
                <div className="bg-green-100 rounded-lg p-3 font-mono text-xs text-green-800">
                  <div>📁 your-dataset/</div>
                  <div className="ml-4">📁 healthy/</div>
                  <div className="ml-4">📁 apple_scab/</div>
                  <div className="ml-4">📁 apple_rust/</div>
                  <div className="ml-4">📁 powdery_mildew/</div>
                  <div className="ml-4">📁 fire_blight/</div>
                  <div className="ml-4">📁 black_rot/</div>
                </div>
              </div>
            </div>
          </div>

          {/* Dataset Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dataset Name *
              </label>
              <input
                type="text"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., Apple Disease Dataset v1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <input
                type="text"
                value={datasetDescription}
                onChange={(e) => setDatasetDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Brief description of the dataset"
              />
            </div>
          </div>

          {/* Dataset Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Dataset Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['train', 'test', 'validation'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedDatasetType(type)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    selectedDatasetType === type
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-800 capitalize">
                      {type}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {type === 'train' && 'Training data (70-80%)'}
                      {type === 'test' && 'Testing data (10-15%)'}
                      {type === 'validation' && 'Validation data (10-15%)'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Upload Area */}
          <div
            {...getRootProps()}
            className={`
              border-3 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
              ${isDragActive 
                ? 'border-green-500 bg-green-50 scale-105' 
                : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
              }
            `}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center space-y-4">
              <div className={`p-4 rounded-full transition-all duration-300 ${
                isDragActive ? 'bg-green-200' : 'bg-gray-100'
              }`}>
                <Upload className={`w-12 h-12 transition-colors duration-300 ${
                  isDragActive ? 'text-green-600' : 'text-gray-500'
                }`} />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  {isDragActive ? `Drop ${selectedDatasetType} images here` : `Upload ${selectedDatasetType} Dataset`}
                </p>
                <p className="text-sm text-gray-500">
                  Drag and drop multiple images or click to select • JPG, PNG, WebP
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Tab */}
      {activeTab === 'manage' && (
        <div className="space-y-6">
          {datasets.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg">No datasets uploaded yet</p>
              <p className="text-sm">Upload your first dataset to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {datasets.map((dataset, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">{dataset.name}</h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border mt-1 ${getDatasetTypeColor(dataset.type)}`}>
                        {dataset.type.toUpperCase()}
                      </span>
                    </div>
                    <button className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Classes:</span>
                      <span className="font-medium">{Object.keys(dataset.class_distribution).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Images:</span>
                      <span className="font-medium">{dataset.totalImages}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uploaded:</span>
                      <span className="font-medium">{new Date(dataset.upload_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button className="flex items-center space-x-2 text-green-600 hover:text-green-700 text-sm font-medium">
                      <BarChart3 className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Train Tab */}
      {activeTab === 'train' && (
        <div className="space-y-6">
          {!isAuthenticated && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-1">Demo Mode</h3>
                  <p className="text-amber-700 text-sm">
                    Sign in to train real models. Demo mode shows simulated training progress.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-800 mb-1">Training Requirements</h3>
                <p className="text-green-700 text-sm">
                  Ensure you have uploaded training, validation, and test datasets before starting training.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Training Configuration</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Epochs
                </label>
                <input
                  type="number"
                  value={trainingConfig.epochs}
                  onChange={(e) => setTrainingConfig(prev => ({ ...prev, epochs: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="1"
                  max="200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch Size
                </label>
                <select
                  value={trainingConfig.batchSize}
                  onChange={(e) => setTrainingConfig(prev => ({ ...prev, batchSize: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value={16}>16</option>
                  <option value={32}>32</option>
                  <option value={64}>64</option>
                  <option value={128}>128</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Learning Rate
                </label>
                <input
                  type="number"
                  value={trainingConfig.learningRate}
                  onChange={(e) => setTrainingConfig(prev => ({ ...prev, learningRate: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  step="0.0001"
                  min="0.0001"
                  max="0.1"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Advanced Options</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Validation Split
                </label>
                <input
                  type="number"
                  value={trainingConfig.validationSplit}
                  onChange={(e) => setTrainingConfig(prev => ({ ...prev, validationSplit: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  step="0.1"
                  min="0.1"
                  max="0.5"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="augmentation"
                  checked={trainingConfig.augmentation}
                  onChange={(e) => setTrainingConfig(prev => ({ ...prev, augmentation: e.target.checked }))}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="augmentation" className="text-sm font-medium text-gray-700">
                  Enable Data Augmentation
                </label>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">Dataset Summary</h4>
                <div className="space-y-1 text-sm text-green-700">
                  <div className="flex justify-between">
                    <span>Training sets:</span>
                    <span className="font-semibold">{datasets.filter(d => d.type === 'train').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Validation sets:</span>
                    <span className="font-semibold">{datasets.filter(d => d.type === 'validation').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Test sets:</span>
                    <span className="font-semibold">{datasets.filter(d => d.type === 'test').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trained models:</span>
                    <span className="font-semibold">{models.filter(m => m.status === 'completed').length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-6">
            <button
              onClick={handleStartTraining}
              disabled={datasets.filter(d => d.type === 'train').length === 0}
              className="btn-primary px-8 py-4 text-lg flex items-center space-x-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-6 h-6" />
              <span>Start Training</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};