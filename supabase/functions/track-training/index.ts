import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrainingProgressRequest {
  modelId: string;
  epoch: number;
  loss: number;
  accuracy: number;
  val_loss: number;
  val_accuracy: number;
  learning_rate: number;
  batch_size: number;
}

interface TrainingCompleteRequest {
  modelId: string;
  finalMetrics: {
    final_accuracy: number;
    final_loss: number;
    val_accuracy: number;
    val_loss: number;
    training_time: number;
    total_parameters: number;
    dataset_size: number;
  };
  modelPath: string;
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

    const body = await req.json();

    // Route: Save training progress per epoch
    if (body.epoch !== undefined) {
      const progress: TrainingProgressRequest = body;

      await supabase.from('training_sessions').insert({
        model_id: progress.modelId,
        epoch: progress.epoch,
        loss: progress.loss,
        accuracy: progress.accuracy,
        val_loss: progress.val_loss,
        val_accuracy: progress.val_accuracy,
        learning_rate: progress.learning_rate,
        batch_size: progress.batch_size
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: `Epoch ${progress.epoch} saved`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: Mark training as complete
    if (body.modelPath !== undefined) {
      const completion: TrainingCompleteRequest = body;

      await supabase
        .from('models')
        .update({
          status: 'completed',
          performance_metrics: completion.finalMetrics,
          model_file_path: completion.modelPath,
          updated_at: new Date().toISOString()
        })
        .eq('id', completion.modelId);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Training completed and model saved',
          metrics: completion.finalMetrics
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid request body');

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
