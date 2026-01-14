export interface DiseaseClass {
  name: string;
  probability: number;
  description: string;
  treatment: string;
  severity: 'low' | 'medium' | 'high';
}

export interface PredictionResult {
  topClass: DiseaseClass;
  allClasses: DiseaseClass[];
  confidence: number;
}

export const diseaseDatabase: { [key: string]: Omit<DiseaseClass, 'probability'> } = {
  'healthy': {
    name: 'Healthy',
    description: 'The apple leaf appears healthy with no signs of disease.',
    treatment: 'Continue regular care and monitoring. Maintain proper irrigation and nutrition.',
    severity: 'low'
  },
  'apple_scab': {
    name: 'Apple Scab',
    description: 'A fungal disease causing dark, scabby lesions on leaves and fruit.',
    treatment: 'Apply fungicides containing myclobutanil or captan. Remove fallen leaves and improve air circulation.',
    severity: 'high'
  },
  'apple_rust': {
    name: 'Apple Rust',
    description: 'Cedar-apple rust causing orange spots and lesions on leaves.',
    treatment: 'Use fungicides with propiconazole. Remove nearby juniper trees if possible.',
    severity: 'medium'
  },
  'powdery_mildew': {
    name: 'Powdery Mildew',
    description: 'White powdery coating on leaves, stunting growth.',
    treatment: 'Apply sulfur-based fungicides. Ensure proper air circulation and avoid overhead watering.',
    severity: 'medium'
  },
  'fire_blight': {
    name: 'Fire Blight',
    description: 'Bacterial infection causing blackened, burned appearance.',
    treatment: 'Prune infected branches 8-12 inches below symptoms. Apply copper-based bactericides.',
    severity: 'high'
  },
  'black_rot': {
    name: 'Black Rot',
    description: 'Fungal disease causing circular brown spots with purple margins.',
    treatment: 'Remove infected plant material. Apply fungicides containing captan or myclobutanil.',
    severity: 'high'
  }
};