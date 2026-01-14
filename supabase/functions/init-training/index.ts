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

    // Get model
    const { data: model, error: modelError } = await supabase
      .from('models')
      .select('*')
      .eq('id', modelId)
      .single();

    if (modelError) throw modelError;

    // Get training datasets
    const { data: datasets, error: datasetsError } = await supabase
      .from('datasets')
      .select('*, dataset_images(*)')
      .eq('user_id', model.user_id)
      .eq('status', 'ready');

    if (datasetsError) throw datasetsError;

    // Count total images
    const totalImages = datasets.reduce((sum: number, d: any) => sum + d.dataset_images.length, 0);

    // Update model status to training
    await supabase
      .from('models')
      .update({
        status: 'training',
        updated_at: new Date().toISOString()
      })
      .eq('id', modelId);

    // Return dataset info for client to process
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Training initialized. Client will now train the model.',
        modelId,
        datasets: datasets.map(d => ({
          id: d.id,
          name: d.name,
          imageCount: d.dataset_images.length,
          images: d.dataset_images.map((img: any) => ({
            id: img.id,
            file_path: img.file_path,
            disease_class: img.disease_class,
            disease_id: img.disease_id
          }))
        })),
        totalImages,
        config
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

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
