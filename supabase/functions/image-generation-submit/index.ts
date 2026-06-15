import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const HF_TOKEN = Deno.env.get('HF_TOKEN');
const HF_API_URL = 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          width: 768,
          height: 512,
          num_inference_steps: 30,
          guidance_scale: 7.5,
        },
      }),
    });

    // Model still loading — return estimated wait time
    if (response.status === 503) {
      const json = await response.json();
      return new Response(JSON.stringify({ status: 'loading', estimated_time: json.estimated_time || 20 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`HF error: ${err}`);
    }

    // Convert image blob to base64
    const arrayBuffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const imageUrl = `data:image/jpeg;base64,${base64}`;

    return new Response(JSON.stringify({ status: 'success', imageUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ status: 'error', error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});