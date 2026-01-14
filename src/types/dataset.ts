export interface DatasetInfo {
  name: string;
  type: 'train' | 'test' | 'validation';
  classCount: number;
  totalImages: number;
  uploadDate: string;
  classes: string[];
}

export interface DatasetStats {
  totalDatasets: number;
  totalImages: number;
  classDistribution: { [key: string]: number };
}

export interface TrainingConfig {
  epochs: number;
  batchSize: number;
  learningRate: number;
  validationSplit: number;
  augmentation: boolean;
}