import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Piped instances (free YouTube audio extraction) - official list from TeamPiped
const PIPED_INSTANCES = [
  "https://pipedapi.kavin.rocks",
  "https://pipedapi.leptons.xyz",
  "https://pipedapi-libre.kavin.rocks",
  "https://piped-api.privacy.com.de",
  "https://pipedapi.adminforge.de",
  "https://api.piped.yt",
  "https://pipedapi.drgns.space",
  "https://pipedapi.owo.si",
  "https://pipedapi.ducks.party",
  "https://piped-api.codespace.cz",
];

interface AudioResult {
  audioUrl: string;
  title: string;
  thumbnail: string;
}

async function getAudioFromPiped(videoId: string): Promise<AudioResult | null> {
  // Shuffle instances for load balancing
  const shuffled = [...PIPED_INSTANCES].sort(() => Math.random() - 0.5);
  
  for (const base of shuffled) {
    try {
      const url = `${base}/streams/${videoId}`;
      console.log("Trying Piped:", url);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": UA,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        console.log(`Piped ${base} returned ${res.status}`);
        continue;
      }

      const data = await res.json();

      // Check for error response
      if (data.error) {
        console.log(`Piped ${base} error:`, data.error);
        continue;
      }

      if (!data?.audioStreams || !Array.isArray(data.audioStreams) || data.audioStreams.length === 0) {
        console.log(`No audio streams from ${base}`);
        continue;
      }

      // Sort by bitrate and get the best audio stream (prefer opus/webm for compatibility)
      const audioStreams = data.audioStreams
        .filter((s: any) => s?.url && s?.mimeType?.startsWith("audio/"))
        .sort((a: any, b: any) => {
          // Prefer webm/opus for better browser compatibility
          const aWebm = a.mimeType?.includes("webm") ? 1 : 0;
          const bWebm = b.mimeType?.includes("webm") ? 1 : 0;
          if (aWebm !== bWebm) return bWebm - aWebm;
          return (b?.bitrate ?? 0) - (a?.bitrate ?? 0);
        });

      if (audioStreams.length === 0) {
        console.log(`No valid audio streams from ${base}`);
        continue;
      }

      const best = audioStreams[0];
      console.log("Selected audio from Piped:", best.mimeType, "bitrate:", best.bitrate);

      return {
        audioUrl: best.url,
        title: data.title || "Unknown",
        thumbnail: data.thumbnailUrl || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      };
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      console.error(`Piped ${base} error:`, errorMsg);
      continue;
    }
  }

  return null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoId } = await req.json();

    if (!videoId || typeof videoId !== "string") {
      return new Response(JSON.stringify({ error: "Video ID is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing request for video: ${videoId}`);

    // Try Piped instances
    const result = await getAudioFromPiped(videoId);

    if (!result) {
      return new Response(JSON.stringify({
        error: "Audio extraction unavailable. Please try video mode.",
        fallbackToVideo: true,
      }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in youtube-audio function:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ 
      error: errorMessage,
      fallbackToVideo: true,
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
