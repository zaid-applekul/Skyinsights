import { supabase } from '../lib/supabase';
import { PredictionResult } from '../types/disease';

export class RealAppleDiseaseClassifier {
  async predict(imageFile: File, modelId?: string): Promise<PredictionResult> {
    try {
      // Create form data for the edge function
      const formData = new FormData();
      formData.append('image', imageFile);
      if (modelId) {
        formData.append('modelId', modelId);
      }

      // Call the prediction edge function
      const { data, error } = await supabase.functions.invoke('predict-disease', {
        body: formData
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Prediction error:', error);
      throw new Error('Failed to analyze the image. Please try again.');
    }
  }

  async trainModel(modelId: string, config: any): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('train-model', {
        body: { modelId, config }
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Training error:', error);
      throw new Error('Failed to start model training. Please try again.');
    }
  }
}

export const realClassifier = new RealAppleDiseaseClassifier();