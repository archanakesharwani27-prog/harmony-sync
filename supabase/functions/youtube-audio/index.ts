import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// List of Invidious instances to try
const INVIDIOUS_INSTANCES = [
  'https://inv.nadeko.net',
  'https://invidious.nerdvpn.de',
  'https://invidious.privacyredirect.com',
  'https://iv.nboez.de',
  'https://invidious.protokolla.fi',
];

async function getAudioFromInvidious(videoId: string): Promise<{ audioUrl: string; title: string; thumbnail: string } | null> {
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      console.log(`Trying Invidious instance: ${instance}`);
      
      const response = await fetch(`${instance}/api/v1/videos/${videoId}`, {
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        console.log(`Instance ${instance} returned ${response.status}`);
        continue;
      }

      const data = await response.json();
      
      // Get audio-only format
      const audioFormats = data.adaptiveFormats?.filter((f: any) => 
        f.type?.startsWith('audio/') && f.url
      ) || [];

      if (audioFormats.length === 0) {
        console.log(`No audio formats found from ${instance}`);
        continue;
      }

      // Sort by bitrate and get best quality
      audioFormats.sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0));
      
      const bestAudio = audioFormats[0];
      console.log(`Found audio: ${bestAudio.type}, bitrate: ${bestAudio.bitrate}`);

      return {
        audioUrl: bestAudio.url,
        title: data.title || 'Unknown',
        thumbnail: data.videoThumbnails?.[0]?.url || ''
      };

    } catch (error) {
      console.error(`Error with instance ${instance}:`, error);
      continue;
    }
  }

  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoId } = await req.json();
    
    if (!videoId) {
      return new Response(
        JSON.stringify({ error: 'Video ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing request for video: ${videoId}`);
    
    const result = await getAudioFromInvidious(videoId);
    
    if (!result) {
      return new Response(
        JSON.stringify({ error: 'Could not extract audio. Try another song.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully got audio for: ${result.title}`);
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in youtube-audio function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
