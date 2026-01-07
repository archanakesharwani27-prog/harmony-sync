import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function extractAudioUrl(videoId: string): Promise<{ audioUrl: string; title: string; thumbnail: string } | null> {
  try {
    console.log(`Extracting audio for video: ${videoId}`);
    
    // Fetch video page to get player config
    const videoPageUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const response = await fetch(videoPageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch video page:', response.status);
      return null;
    }

    const html = await response.text();
    
    // Extract player response from the page
    const playerResponseMatch = html.match(/var ytInitialPlayerResponse\s*=\s*({.+?});/s);
    if (!playerResponseMatch) {
      console.error('Could not find player response in page');
      return null;
    }

    const playerResponse = JSON.parse(playerResponseMatch[1]);
    
    // Get video details
    const videoDetails = playerResponse.videoDetails || {};
    const title = videoDetails.title || 'Unknown';
    const thumbnail = videoDetails.thumbnail?.thumbnails?.[0]?.url || '';

    // Get streaming data
    const streamingData = playerResponse.streamingData;
    if (!streamingData) {
      console.error('No streaming data found');
      return null;
    }

    // Look for audio-only formats (adaptive formats)
    const adaptiveFormats = streamingData.adaptiveFormats || [];
    
    // Find the best audio format (prefer m4a/mp4a)
    const audioFormats = adaptiveFormats.filter((f: any) => 
      f.mimeType?.includes('audio/') && f.url
    );

    if (audioFormats.length === 0) {
      console.log('No direct audio URLs, checking for regular formats');
      
      // Fallback to regular formats with audio
      const formats = streamingData.formats || [];
      const audioWithVideo = formats.find((f: any) => f.url);
      
      if (audioWithVideo?.url) {
        return { audioUrl: audioWithVideo.url, title, thumbnail };
      }
      
      return null;
    }

    // Sort by bitrate to get best quality
    audioFormats.sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0));
    
    const bestAudio = audioFormats[0];
    console.log(`Found audio format: ${bestAudio.mimeType}, bitrate: ${bestAudio.bitrate}`);

    return {
      audioUrl: bestAudio.url,
      title,
      thumbnail
    };

  } catch (error) {
    console.error('Error extracting audio:', error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
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
    
    const result = await extractAudioUrl(videoId);
    
    if (!result) {
      return new Response(
        JSON.stringify({ error: 'Could not extract audio URL. Video may be restricted or unavailable.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully extracted audio for: ${result.title}`);
    
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
