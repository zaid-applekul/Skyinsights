/*
  # Apple Disease Detection Database Schema

  1. New Tables
    - `datasets` - Store dataset metadata and information
    - `dataset_images` - Store individual image records with classifications
    - `models` - Store trained model information and metadata
    - `predictions` - Store prediction history and results
    - `training_sessions` - Track model training progress and metrics

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access where appropriate

  3. Storage
    - Create storage buckets for datasets and model files
    - Set up proper access policies for file uploads
*/

-- Create datasets table
CREATE TABLE IF NOT EXISTS datasets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('train', 'test', 'validation')),
  description text,
  total_images integer DEFAULT 0,
  class_distribution jsonb DEFAULT '{}',
  upload_date timestamptz DEFAULT now(),
  status text DEFAULT 'uploading' CHECK (status IN ('uploading', 'processing', 'ready', 'error')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create dataset_images table
CREATE TABLE IF NOT EXISTS dataset_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id uuid REFERENCES datasets(id) ON DELETE CASCADE,
  filename text NOT NULL,
  disease_class text NOT NULL,
  file_path text NOT NULL,
  file_size integer,
  width integer,
  height integer,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create models table
CREATE TABLE IF NOT EXISTS models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  architecture text DEFAULT 'CNN',
  training_config jsonb DEFAULT '{}',
  performance_metrics jsonb DEFAULT '{}',
  model_file_path text,
  status text DEFAULT 'training' CHECK (status IN ('training', 'completed', 'failed', 'deployed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create training_sessions table
CREATE TABLE IF NOT EXISTS training_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid REFERENCES models(id) ON DELETE CASCADE,
  epoch integer NOT NULL,
  loss real,
  accuracy real,
  val_loss real,
  val_accuracy real,
  learning_rate real,
  batch_size integer,
  timestamp timestamptz DEFAULT now()
);

-- Create predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  model_id uuid REFERENCES models(id),
  image_filename text,
  image_path text,
  predicted_class text NOT NULL,
  confidence real NOT NULL,
  all_probabilities jsonb DEFAULT '{}',
  processing_time real,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE dataset_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Datasets policies
CREATE POLICY "Users can manage their own datasets"
  ON datasets
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view completed datasets"
  ON datasets
  FOR SELECT
  TO anon
  USING (status = 'ready');

-- Dataset images policies
CREATE POLICY "Users can manage their dataset images"
  ON dataset_images
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM datasets 
      WHERE datasets.id = dataset_images.dataset_id 
      AND datasets.user_id = auth.uid()
    )
  );

-- Models policies
CREATE POLICY "Users can manage their own models"
  ON models
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Training sessions policies
CREATE POLICY "Users can view their training sessions"
  ON training_sessions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM models 
      WHERE models.id = training_sessions.model_id 
      AND models.user_id = auth.uid()
    )
  );

-- Predictions policies
CREATE POLICY "Users can manage their own predictions"
  ON predictions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anonymous users can create predictions"
  ON predictions
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('datasets', 'datasets', false),
  ('models', 'models', false),
  ('predictions', 'predictions', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for datasets bucket
CREATE POLICY "Authenticated users can upload datasets"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'datasets');

CREATE POLICY "Users can view their own dataset files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'datasets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for models bucket
CREATE POLICY "Authenticated users can upload models"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'models');

CREATE POLICY "Users can view their own model files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'models' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for predictions bucket (public read)
CREATE POLICY "Anyone can view prediction images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'predictions');

CREATE POLICY "Anyone can upload prediction images"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'predictions');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_datasets_user_id ON datasets(user_id);
CREATE INDEX IF NOT EXISTS idx_datasets_type ON datasets(type);
CREATE INDEX IF NOT EXISTS idx_dataset_images_dataset_id ON dataset_images(dataset_id);
CREATE INDEX IF NOT EXISTS idx_dataset_images_disease_class ON dataset_images(disease_class);
CREATE INDEX IF NOT EXISTS idx_models_user_id ON models(user_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_model_id ON training_sessions(model_id);
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_model_id ON predictions(model_id);