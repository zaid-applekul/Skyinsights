import { supabase } from '../lib/supabase';
import type { Dataset, DatasetImage } from '../lib/supabase';

export class DatasetService {
  async uploadDataset(
    files: File[], 
    type: 'train' | 'test' | 'validation',
    name: string,
    description?: string
  ): Promise<Dataset> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: dataset, error: datasetError } = await supabase
        .from('datasets')
        .insert({
          user_id: user.id,
          name,
          type,
          description,
          total_images: files.length,
          status: 'uploading'
        })
        .select()
        .single();

      if (datasetError) throw datasetError;

      const classDistribution: Record<string, number> = {};

      const uploadPromises = files.map(async (file) => {
        // ----- FIXED CLASS NAME LOGIC -----
        const rel = file.webkitRelativePath || '';          // e.g. "Healthy/img1.jpg"
        const parts = rel.split('/').filter(Boolean);

        let diseaseClass = 'unknown';

        if (parts.length > 1) {
          // folder name
          diseaseClass = parts[parts.length - 2];
        } else {
          // fall back to filename heuristics
          const raw = file.name.toLowerCase();
          if (raw.includes('healthy')) diseaseClass = 'healthy';
          else if (raw.includes('scab')) diseaseClass = 'apple_scab';
          else if (raw.includes('rust')) diseaseClass = 'apple_rust';
          else if (raw.includes('black_rot') || raw.includes('blackrot') || raw.includes('black-rot')) diseaseClass = 'black_rot';
          // add more rules if you add more classes
        }

        console.log('RELATIVE PATH:', file.webkitRelativePath, 'NAME:', file.name, 'CLASS:', diseaseClass);
        // ----------------------------------

        classDistribution[diseaseClass] = (classDistribution[diseaseClass] || 0) + 1;

        const filePath = `${user.id}/${dataset.id}/${diseaseClass}/${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('datasets')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { error: imageError } = await supabase
          .from('dataset_images')
          .insert({
            dataset_id: dataset.id,
            filename: file.name,
            disease_class: diseaseClass,
            file_path: filePath,
            file_size: file.size,
            metadata: {
              originalPath: file.webkitRelativePath || file.name,
              type: file.type
            }
          });

        if (imageError) throw imageError;
      });

      await Promise.all(uploadPromises);

      const { data: updatedDataset, error: updateError } = await supabase
        .from('datasets')
        .update({
          class_distribution: classDistribution,
          status: 'ready',
          updated_at: new Date().toISOString()
        })
        .eq('id', dataset.id)
        .select()
        .single();

      if (updateError) throw updateError;

      return updatedDataset;
    } catch (error) {
      console.error('Error uploading dataset:', error);
      throw error;
    }
  }

  async getDatasets(userId?: string): Promise<Dataset[]> {
    try {
      let query = supabase.from('datasets').select('*');
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching datasets:', error);
      throw error;
    }
  }

  async getDatasetImages(datasetId: string): Promise<DatasetImage[]> {
    try {
      const { data, error } = await supabase
        .from('dataset_images')
        .select('*')
        .eq('dataset_id', datasetId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching dataset images:', error);
      throw error;
    }
  }

  async deleteDataset(datasetId: string): Promise<void> {
    try {
      const { data: images } = await supabase
        .from('dataset_images')
        .select('file_path')
        .eq('dataset_id', datasetId);

      if (images) {
        const filePaths = images.map(img => img.file_path);
        await supabase.storage.from('datasets').remove(filePaths);
      }

      const { error } = await supabase
        .from('datasets')
        .delete()
        .eq('id', datasetId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting dataset:', error);
      throw error;
    }
  }

  async getImageUrl(filePath: string): Promise<string> {
    try {
      const { data } = await supabase.storage
        .from('datasets')
        .createSignedUrl(filePath, 3600);

      return data?.signedUrl || '';
    } catch (error) {
      console.error('Error getting image URL:', error);
      return '';
    }
  }
}
