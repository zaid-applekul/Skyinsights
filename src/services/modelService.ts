import { supabase } from '../lib/supabase';
import type { Model, TrainingSession } from '../lib/supabase';
import type { TrainingConfig } from '../types/dataset';

export class ModelService {
  async createModel(
    name: string,
    description: string,
    config: TrainingConfig
  ): Promise<Model> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: model, error } = await supabase
        .from('models')
        .insert({
          user_id: user.id,
          name,
          description,
          training_config: config,
          status: 'training'
        })
        .select()
        .single();

      if (error) throw error;
      return model;
    } catch (error) {
      console.error('Error creating model:', error);
      throw error;
    }
  }

  async updateTrainingProgress(
    modelId: string,
    epoch: number,
    metrics: {
      loss: number;
      accuracy: number;
      val_loss: number;
      val_accuracy: number;
      learning_rate: number;
      batch_size: number;
    }
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('training_sessions')
        .insert({
          model_id: modelId,
          epoch,
          ...metrics
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating training progress:', error);
      throw error;
    }
  }

  async completeTraining(
    modelId: string,
    performanceMetrics: Record<string, any>,
    modelFilePath?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('models')
        .update({
          status: 'completed',
          performance_metrics: performanceMetrics,
          model_file_path: modelFilePath,
          updated_at: new Date().toISOString()
        })
        .eq('id', modelId);

      if (error) throw error;
    } catch (error) {
      console.error('Error completing training:', error);
      throw error;
    }
  }

  async getModels(userId?: string): Promise<Model[]> {
    try {
      let query = supabase.from('models').select('*');
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
  }

  async getTrainingHistory(modelId: string): Promise<TrainingSession[]> {
    try {
      const { data, error } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('model_id', modelId)
        .order('epoch', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching training history:', error);
      throw error;
    }
  }

  async deleteModel(modelId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('models')
        .delete()
        .eq('id', modelId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting model:', error);
      throw error;
    }
  }
}