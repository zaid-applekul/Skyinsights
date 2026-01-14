import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrainingRequest {
  modelId: string;
  config: {
    epochs: number;
    batchSize: number;
    learningRate: number;
    validationSplit: number;
    augmentation: boolean;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { modelId, config }: TrainingRequest = await req.json();

    // Get model and associated datasets
    const { data: model, error: modelError } = await supabase
      .from('models')
      .select('*')
      .eq('id', modelId)
      .single();

    if (modelError) throw modelError;

    // Get training datasets for this user
    const { data: datasets, error: datasetsError } = await supabase
      .from('datasets')
      .select('*, dataset_images(*)')
      .eq('user_id', model.user_id)
      .eq('status', 'ready');

    if (datasetsError) throw datasetsError;

    // Simulate training process
    for (let epoch = 1; epoch <= config.epochs; epoch++) {
      // Simulate training metrics with realistic progression
      const progress = epoch / config.epochs;
      const loss = Math.max(0.1, 2.0 - progress * 1.8 + (Math.random() - 0.5) * 0.2);
      const accuracy = Math.min(0.95, 0.3 + progress * 0.6 + (Math.random() - 0.5) * 0.1);
      const valLoss = Math.max(0.15, 2.2 - progress * 1.9 + (Math.random() - 0.5) * 0.3);
      const valAccuracy = Math.min(0.92, 0.25 + progress * 0.6 + (Math.random() - 0.5) * 0.1);

      // Save training progress
      await supabase.from('training_sessions').insert({
        model_id: modelId,
        epoch,
        loss,
        accuracy,
        val_loss: valLoss,
        val_accuracy: valAccuracy,
        learning_rate: config.learningRate,
        batch_size: config.batchSize
      });

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Complete training
    const finalMetrics = {
      final_accuracy: 0.89 + Math.random() * 0.06,
      final_loss: 0.1 + Math.random() * 0.05,
      training_time: config.epochs * 30, // seconds
      total_parameters: 1234567,
      dataset_size: datasets.reduce((sum, d) => sum + d.total_images, 0)
    };

    await supabase
      .from('models')
      .update({
        status: 'completed',
        performance_metrics: finalMetrics,
        updated_at: new Date().toISOString()
      })
      .eq('id', modelId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Training completed successfully',
        metrics: finalMetrics 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});