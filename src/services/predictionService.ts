import { supabase } from '../lib/supabase';
import type { Prediction } from '../lib/supabase';
import type { PredictionResult } from '../types/disease';

export class PredictionService {
  async savePrediction(
    imageFile: File,
    result: PredictionResult,
    processingTime: number,
    modelId?: string
  ): Promise<Prediction> {
    try {
      // Upload image to predictions bucket
      const fileName = `${Date.now()}_${imageFile.name}`;
      const filePath = `predictions/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('predictions')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      // Get current user (optional for anonymous predictions)
      const { data: { user } } = await supabase.auth.getUser();

      // Save prediction record
      const { data: prediction, error } = await supabase
        .from('predictions')
        .insert({
          user_id: user?.id,
          model_id: modelId,
          image_filename: imageFile.name,
          image_path: filePath,
          predicted_class: result.topClass.name,
          confidence: result.confidence,
          all_probabilities: result.allClasses.reduce((acc, cls) => {
            acc[cls.name] = cls.probability;
            return acc;
          }, {} as Record<string, number>),
          processing_time: processingTime
        })
        .select()
        .single();

      if (error) throw error;
      return prediction;
    } catch (error) {
      console.error('Error saving prediction:', error);
      throw error;
    }
  }

  async getPredictions(userId?: string): Promise<Prediction[]> {
    try {
      let query = supabase.from('predictions').select('*');
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching predictions:', error);
      throw error;
    }
  }

  async getPredictionImageUrl(imagePath: string): Promise<string> {
    try {
      const { data } = await supabase.storage
        .from('predictions')
        .createSignedUrl(imagePath, 3600);

      return data?.signedUrl || '';
    } catch (error) {
      console.error('Error getting prediction image URL:', error);
      return '';
    }
  }
}