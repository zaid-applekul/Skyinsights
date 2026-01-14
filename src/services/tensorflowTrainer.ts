import * as tf from '@tensorflow/tfjs';
import { supabase } from '../lib/supabase';

const DISEASE_CLASSES = ['healthy', 'apple_scab', 'apple_rust', 'powdery_mildew', 'fire_blight', 'black_rot'];

export class TensorFlowTrainer {
  async initializeTraining(modelId: string, config: any) {
    // Call init-training endpoint
    const { data, error } = await supabase.functions.invoke('init-training', {
      body: { modelId, config }
    });

    if (error) throw error;
    return data;
  }

  async trainModel(
    modelId: string,
    datasets: any[],
    config: any,
    onProgress: (epoch: number, metrics: any) => void
  ) {
    try {
      // Load and preprocess images
      console.log('Loading images from Supabase...');
      const { images, labels } = await this.loadAndPreprocessImages(datasets);

      // Build model
      console.log('Building CNN model...');
      const model = this.buildModel();

      // Train
      console.log('Starting training...');
      const startTime = Date.now();

      const history = await model.fit(images, labels, {
        epochs: config.epochs,
        batchSize: config.batchSize,
        validationSplit: config.validationSplit,
        shuffle: true,
        verbose: 1,
        callbacks: {
          onEpochEnd: async (epoch, logs) => {
            console.log(`Epoch ${epoch + 1}/${config.epochs}`);
            onProgress(epoch + 1, logs);

            // Save progress to backend
            await this.saveTrainingProgress(
              modelId,
              epoch + 1,
              logs
            );
          }
        }
      });

      const trainingTime = (Date.now() - startTime) / 1000;

      // Save model
      console.log('Saving model...');
      const modelPath = `indexeddb://${modelId}`;
      await model.save(modelPath);

      // Get model info
      const params = model.countParams();

      // Notify backend of completion
      await this.completeTraining(
        modelId,
        {
          final_accuracy: history.history.acc[history.history.acc.length - 1],
          final_loss: history.history.loss[history.history.loss.length - 1],
          val_accuracy: history.history.val_acc[history.history.val_acc.length - 1],
          val_loss: history.history.val_loss[history.history.val_loss.length - 1],
          training_time: Math.round(trainingTime),
          total_parameters: params,
          dataset_size: images.shape[0]
        },
        modelPath
      );

      images.dispose();
      labels.dispose();

      return {
        success: true,
        message: 'Model trained successfully',
        modelPath
      };

    } catch (error) {
      console.error('Training error:', error);
      throw error;
    }
  }

  private buildModel() {
    const model = tf.sequential({
      layers: [
        tf.layers.conv2d({
          inputShape: [224, 224, 3],
          kernelSize: 3,
          filters: 32,
          activation: 'relu',
          kernelInitializer: 'heNormal'
        }),
        tf.layers.batchNormalization(),
        tf.layers.maxPooling2d({ poolSize: 2 }),

        tf.layers.conv2d({
          kernelSize: 3,
          filters: 64,
          activation: 'relu',
          kernelInitializer: 'heNormal'
        }),
        tf.layers.batchNormalization(),
        tf.layers.maxPooling2d({ poolSize: 2 }),

        tf.layers.conv2d({
          kernelSize: 3,
          filters: 128,
          activation: 'relu',
          kernelInitializer: 'heNormal'
        }),
        tf.layers.batchNormalization(),
        tf.layers.maxPooling2d({ poolSize: 2 }),

        tf.layers.flatten(),

        tf.layers.dense({
          units: 128,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.5 }),

        tf.layers.dense({
          units: 6,
          activation: 'softmax'
        })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  private async loadAndPreprocessImages(datasets: any[]) {
    const images: tf.Tensor[] = [];
    const labels: number[][] = [];

    for (const dataset of datasets) {
      for (const image of dataset.images) {
        try {
          // Download from Supabase
          const { data: blob, error } = await supabase.storage
            .from('datasets')
            .download(image.file_path);

          if (error) {
            console.warn(`Failed to load ${image.file_path}:`, error);
            continue;
          }

          // Convert blob to tensor
          const img = await this.blobToTensor(blob);
          images.push(img);

          // One-hot encode label
          const oneHot = new Array(6).fill(0);
          const classIndex = DISEASE_CLASSES.indexOf(image.disease_id);
          oneHot[classIndex] = 1;
          labels.push(oneHot);

        } catch (error) {
          console.error(`Error processing ${image.file_path}:`, error);
        }
      }
    }

    return {
      images: tf.stack(images),
      labels: tf.tensor2d(labels)
    };
  }

  private async blobToTensor(blob: Blob): Promise<tf.Tensor3D> {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      
      img.onload = () => {
        const tensor = tf.browser.fromPixels(img, 3);
        const resized = tf.image.resizeBilinear(tensor, [224, 224]);
        const normalized = resized.div(tf.scalar(255));
        
        tensor.dispose();
        resized.dispose();
        URL.revokeObjectURL(url);
        
        resolve(normalized as tf.Tensor3D);
      };
      
      img.src = url;
    });
  }

  private async saveTrainingProgress(
    modelId: string,
    epoch: number,
    metrics: any
  ) {
    try {
      const { error } = await supabase.functions.invoke('track-training', {
        body: {
          modelId,
          epoch,
          loss: metrics.loss,
          accuracy: metrics.acc,
          val_loss: metrics.val_loss,
          val_accuracy: metrics.val_acc,
          learning_rate: 0.001,
          batch_size: 32
        }
      });

      if (error) console.warn('Failed to save progress:', error);
    } catch (error) {
      console.warn('Progress save error:', error);
    }
  }

  private async completeTraining(
    modelId: string,
    finalMetrics: any,
    modelPath: string
  ) {
    const { error } = await supabase.functions.invoke('track-training', {
      body: {
        modelId,
        finalMetrics,
        modelPath
      }
    });

    if (error) throw error;
  }
}

export const trainer = new TensorFlowTrainer();
