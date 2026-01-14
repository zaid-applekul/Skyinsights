import { diseaseDatabase, DiseaseClass, PredictionResult } from '../types/disease';

// Mock CNN model - in production, this would be a trained TensorFlow.js model
class MockCNNClassifier {
  private diseaseClasses = Object.keys(diseaseDatabase);
  
  predict(features: number[]): PredictionResult {
    // Simulate CNN prediction based on image features
    const predictions: { [key: string]: number } = {};
    
    // Simple heuristic-based classification for demo
    const [rMean, gMean, bMean, rVar, gVar, bVar, edgeIntensity] = features;
    
    // Healthy leaves typically have higher green values and lower variance
    predictions.healthy = Math.max(0, gMean * 0.8 - rVar * 0.5 - bVar * 0.5 + Math.random() * 0.2);
    
    // Scab - typically darker spots, higher edge intensity
    predictions.apple_scab = Math.max(0, edgeIntensity * 0.7 + rVar * 0.3 + Math.random() * 0.3);
    
    // Rust - orange/brown coloration
    predictions.apple_rust = Math.max(0, rMean * 0.6 + bMean * 0.4 - gMean * 0.2 + Math.random() * 0.25);
    
    // Powdery mildew - white/light coloration
    predictions.powdery_mildew = Math.max(0, (rMean + gMean + bMean) / 3 * 0.8 - rVar * 0.3 + Math.random() * 0.2);
    
    // Fire blight - darker, burned appearance
    predictions.fire_blight = Math.max(0, (1 - gMean) * 0.6 + edgeIntensity * 0.4 + Math.random() * 0.2);
    
    // Black rot - circular dark spots
    predictions.black_rot = Math.max(0, (1 - rMean - gMean - bMean) * 0.5 + edgeIntensity * 0.5 + Math.random() * 0.25);
    
    // Normalize probabilities
    const total = Object.values(predictions).reduce((sum, val) => sum + val, 0);
    Object.keys(predictions).forEach(key => {
      predictions[key] = total > 0 ? predictions[key] / total : 0;
    });
    
    // Create disease class results
    const allClasses: DiseaseClass[] = Object.entries(predictions)
      .map(([key, probability]) => ({
        ...diseaseDatabase[key],
        probability: probability * 100
      }))
      .sort((a, b) => b.probability - a.probability);
    
    const topClass = allClasses[0];
    const confidence = topClass.probability;
    
    return {
      topClass,
      allClasses,
      confidence
    };
  }
}

export const classifier = new MockCNNClassifier();