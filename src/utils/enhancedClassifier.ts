import { diseaseDatabase, DiseaseClass, PredictionResult } from '../types/disease';

// Enhanced mock CNN classifier with more sophisticated feature analysis
class EnhancedAppleDiseaseClassifier {
  private diseaseClasses = Object.keys(diseaseDatabase);
  
  async predict(features: number[]): Promise<PredictionResult> {
    // Simulate processing delay for realism
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500));
    
    const [rMean, gMean, bMean, rVar, gVar, bVar, edgeIntensity] = features;
    
    // More sophisticated prediction algorithm
    const predictions: { [key: string]: number } = {};
    
    // Calculate derived features
    const brightness = (rMean + gMean + bMean) / 3;
    const greenness = gMean - (rMean + bMean) / 2;
    const colorVariability = (rVar + gVar + bVar) / 3;
    const contrast = edgeIntensity;
    
    // Healthy prediction - high greenness, low variability, moderate contrast
    predictions.healthy = Math.max(0, 
      greenness * 2.0 + 
      brightness * 0.5 - 
      colorVariability * 1.5 - 
      Math.abs(contrast - 0.3) * 0.8 +
      (Math.random() - 0.5) * 0.3
    );
    
    // Apple Scab - dark lesions, high contrast, moderate variability
    predictions.apple_scab = Math.max(0,
      contrast * 1.8 +
      colorVariability * 0.6 +
      (1 - brightness) * 1.2 -
      greenness * 0.8 +
      (Math.random() - 0.5) * 0.4
    );
    
    // Apple Rust - orange/brown spots, medium brightness, specific color patterns
    const orangeness = rMean * 0.7 + gMean * 0.3 - bMean * 0.2;
    predictions.apple_rust = Math.max(0,
      orangeness * 1.5 +
      contrast * 0.8 +
      colorVariability * 0.5 +
      (Math.random() - 0.5) * 0.3
    );
    
    // Powdery Mildew - white/gray patches, high brightness, low color saturation
    const whiteness = Math.min(rMean, gMean, bMean) * 2 - Math.abs(rMean - gMean) - Math.abs(gMean - bMean);
    predictions.powdery_mildew = Math.max(0,
      whiteness * 1.4 +
      brightness * 1.0 -
      colorVariability * 0.8 +
      contrast * 0.3 +
      (Math.random() - 0.5) * 0.3
    );
    
    // Fire Blight - burned appearance, low brightness, high contrast
    predictions.fire_blight = Math.max(0,
      (1 - brightness) * 1.6 +
      contrast * 1.2 +
      (1 - greenness) * 1.0 +
      colorVariability * 0.4 +
      (Math.random() - 0.5) * 0.3
    );
    
    // Black Rot - circular dark spots, very low brightness, high contrast
    const darkness = 1 - brightness;
    predictions.black_rot = Math.max(0,
      darkness * 1.8 +
      contrast * 1.5 +
      colorVariability * 0.7 +
      (1 - greenness) * 0.6 +
      (Math.random() - 0.5) * 0.4
    );
    
    // Apply disease correlation adjustments
    if (predictions.apple_scab > 0.3 && predictions.black_rot > 0.3) {
      // These diseases can co-occur, but reduce individual probabilities
      predictions.apple_scab *= 0.8;
      predictions.black_rot *= 0.8;
    }
    
    if (predictions.healthy > 0.5) {
      // If healthy is strong, reduce disease probabilities
      Object.keys(predictions).forEach(key => {
        if (key !== 'healthy') {
          predictions[key] *= 0.6;
        }
      });
    }
    
    // Normalize probabilities to sum to 1
    const total = Object.values(predictions).reduce((sum, val) => sum + val, 0);
    if (total > 0) {
      Object.keys(predictions).forEach(key => {
        predictions[key] = predictions[key] / total;
      });
    } else {
      // Fallback if all predictions are 0
      predictions.healthy = 0.6;
      predictions.apple_scab = 0.4;
    }
    
    // Add some confidence variation based on image quality
    const imageQuality = Math.min(1, contrast * 2 + brightness);
    const confidenceMultiplier = 0.7 + imageQuality * 0.3;
    
    // Create disease class results
    const allClasses: DiseaseClass[] = Object.entries(predictions)
      .map(([key, probability]) => ({
        ...diseaseDatabase[key],
        probability: probability * 100
      }))
      .sort((a, b) => b.probability - a.probability);
    
    const topClass = allClasses[0];
    const confidence = Math.min(95, topClass.probability * confidenceMultiplier);
    
    return {
      topClass: { ...topClass, probability: confidence },
      allClasses: allClasses.map(cls => ({
        ...cls,
        probability: cls.probability * confidenceMultiplier
      })),
      confidence
    };
  }
}

export const enhancedClassifier = new EnhancedAppleDiseaseClassifier();