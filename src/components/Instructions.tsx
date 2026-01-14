import React from 'react';
import { Camera, Upload, Zap, FileText } from 'lucide-react';

export const Instructions: React.FC = () => {
  const steps = [
    {
      icon: <Camera className="w-6 h-6 text-green-600" />,
      title: "Capture Image",
      description: "Take a clear photo of an apple leaf with good lighting"
    },
    {
      icon: <Upload className="w-6 h-6 text-green-600" />,
      title: "Upload Photo",
      description: "Drag and drop or click to select your apple leaf image"
    },
    {
      icon: <Zap className="w-6 h-6 text-green-600" />,
      title: "AI Analysis",
      description: "Our trained CNN model analyzes the leaf for disease patterns"
    },
    {
      icon: <FileText className="w-6 h-6 text-green-600" />,
      title: "Get Results",
      description: "Receive disease diagnosis with confidence score and treatment advice"
    }
  ];

  return (
    <div className="card card-lg mb-8">
      <h2 className="text-2xl font-bold text-green-900 mb-2 text-center">🚀 How It Works</h2>
      <p className="text-gray-600 text-sm text-center mb-6">Simple steps to diagnose apple leaf diseases</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, index) => (
          <div key={index} className="text-center group">
            <div className="relative">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-100 transition-colors duration-300 group-hover:scale-110 transform border border-green-200">
                {step.icon}
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-green-200 to-transparent -translate-x-8"></div>
              )}
            </div>
            
            <h3 className="font-semibold text-gray-800 mb-2">{step.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};