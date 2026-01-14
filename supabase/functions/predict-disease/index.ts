import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const diseaseDatabase = {
  'healthy': {
    name: 'Healthy',
    description: 'The apple leaf appears healthy with no signs of disease.',
    treatment: 'Continue regular care and monitoring. Maintain proper irrigation and nutrition.',
    severity: 'low'
  },
  'apple_scab': {
    name: 'Apple Scab',
    description: 'A fungal disease causing dark, scabby lesions on leaves and fruit.',
    treatment: 'Apply fungicides containing myclobutanil or captan. Remove fallen leaves and improve air circulation.',
    severity: 'high'
  },
  'apple_rust': {
    name: 'Apple Rust',
    description: 'Cedar-apple rust causing orange spots and lesions on leaves.',
    treatment: 'Use fungicides with propiconazole. Remove nearby juniper trees if possible.',
    severity: 'medium'
  },
  'powdery_mildew': {
    name: 'Powdery Mildew',
    description: 'White powdery coating on leaves, stunting growth.',
    treatment: 'Apply sulfur-based fungicides. Ensure proper air circulation and avoid overhead watering.',
    severity: 'medium'
  },
  'fire_blight': {
    name: 'Fire Blight',
    description: 'Bacterial infection causing blackened, burned appearance.',
    treatment: 'Prune infected branches 8-12 inches below symptoms. Apply copper-based bactericides.',
    severity: 'high'
  },
  'black_rot': {
    name: 'Black Rot',
    description: 'Fungal disease causing circular brown spots with purple margins.',
    treatment: 'Remove infected plant material. Apply fungicides containing captan or myclobutanil.',
    severity: 'high'
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const formData = await req.formData();
    const imageFile = formData.get('image') as File;
    const modelId = formData.get('modelId') as string;

    if (!imageFile) {
      throw new Error('No image file provided');
    }

    // In a real implementation, you would:
    // 1. Load the trained model from storage
    // 2. Preprocess the image
    // 3. Run inference
    // 4. Return predictions

    // For now, simulate advanced prediction logic
    const startTime = Date.now();
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500));

    // Advanced simulation based on image characteristics
    // In production, this would be replaced with actual CNN inference
    const predictions: Record<string, number> = {};
    
    // Simulate feature extraction and prediction
    const imageSize = imageFile.size;
    const fileName = imageFile.name.toLowerCase();
    
    // Base probabilities with some randomness
    predictions.healthy = 0.15 + Math.random() * 0.3;
    predictions.apple_scab = 0.1 + Math.random() * 0.4;
    predictions.apple_rust = 0.1 + Math.random() * 0.3;
    predictions.powdery_mildew = 0.1 + Math.random() * 0.25;
    predictions.fire_blight = 0.1 + Math.random() * 0.3;
    predictions.black_rot = 0.1 + Math.random() * 0.35;

    // Adjust based on filename hints (for demo purposes)
    if (fileName.includes('healthy')) predictions.healthy *= 3;
    if (fileName.includes('scab')) predictions.apple_scab *= 3;
    if (fileName.includes('rust')) predictions.apple_rust *= 3;
    if (fileName.includes('mildew')) predictions.powdery_mildew *= 3;
    if (fileName.includes('blight')) predictions.fire_blight *= 3;
    if (fileName.includes('rot')) predictions.black_rot *= 3;

    // Normalize probabilities
    const total = Object.values(predictions).reduce((sum, val) => sum + val, 0);
    Object.keys(predictions).forEach(key => {
      predictions[key] = (predictions[key] / total) * 100;
    });

    // Create result
    const allClasses = Object.entries(predictions)
      .map(([key, probability]) => ({
        ...diseaseDatabase[key as keyof typeof diseaseDatabase],
        probability
      }))
      .sort((a, b) => b.probability - a.probability);

    const topClass = allClasses[0];
    const confidence = topClass.probability;
    const processingTime = Date.now() - startTime;

    const result = {
      topClass,
      allClasses,
      confidence,
      processingTime
    };

    return new Response(
      JSON.stringify(result),
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