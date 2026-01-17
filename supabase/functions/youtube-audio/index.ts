import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Updated Piped instances - prioritize most reliable ones
const PIPED_INSTANCES = [
  "https://pipedapi.kavin.rocks",
  "https://api.piped.yt",
  "https://pipedapi.adminforge.de",
  "https://pipedapi.leptons.xyz",
  "https://piped-api.privacy.com.de",
  "https://pipedapi-libre.kavin.rocks",
];

// Invidious instances for fallback
const INVIDIOUS_INSTANCES = [
  "https://vid.puffyan.us",
  "https://invidious.snopyta.org",
  "https://yewtu.be",
  "https://invidious.kavin.rocks",
  "https://inv.riverside.rocks",
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
      const timeoutId = setTimeout(() => controller.abort(), 8000);

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

      // Sort by bitrate and get the best audio stream (prefer m4a/mp4 for broader compatibility)
      const audioStreams = data.audioStreams
        .filter((s: any) => s?.url && s?.mimeType?.startsWith("audio/"))
        .sort((a: any, b: any) => {
          // Prefer mp4/m4a for better compatibility
          const aM4a = a.mimeType?.includes("mp4") ? 1 : 0;
          const bM4a = b.mimeType?.includes("mp4") ? 1 : 0;
          if (aM4a !== bM4a) return bM4a - aM4a;
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

async function getAudioFromInvidious(videoId: string): Promise<AudioResult | null> {
  const shuffled = [...INVIDIOUS_INSTANCES].sort(() => Math.random() - 0.5);
  
  for (const base of shuffled) {
    try {
      const url = `${base}/api/v1/videos/${videoId}`;
      console.log("Trying Invidious:", url);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": UA,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        console.log(`Invidious ${base} returned ${res.status}`);
        continue;
      }

      const data = await res.json();

      if (data.error) {
        console.log(`Invidious ${base} error:`, data.error);
        continue;
      }

      // Invidious returns adaptiveFormats with audio streams
      const audioFormats = (data.adaptiveFormats || [])
        .filter((f: any) => f.type?.startsWith("audio/") && f.url)
        .sort((a: any, b: any) => {
          // Prefer mp4/m4a
          const aM4a = a.type?.includes("mp4") ? 1 : 0;
          const bM4a = b.type?.includes("mp4") ? 1 : 0;
          if (aM4a !== bM4a) return bM4a - aM4a;
          return (b.bitrate ?? 0) - (a.bitrate ?? 0);
        });

      if (audioFormats.length === 0) {
        console.log(`No audio formats from ${base}`);
        continue;
      }

      const best = audioFormats[0];
      console.log("Selected audio from Invidious:", best.type, "bitrate:", best.bitrate);

      return {
        audioUrl: best.url,
        title: data.title || "Unknown",
        thumbnail: data.videoThumbnails?.[0]?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      };
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      console.error(`Invidious ${base} error:`, errorMsg);
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

    // Try Piped instances first
    let result = await getAudioFromPiped(videoId);

    // Fallback to Invidious
    if (!result) {
      console.log("Piped failed, trying Invidious...");
      result = await getAudioFromInvidious(videoId);
    }

    if (!result) {
      return new Response(JSON.stringify({
        error: "Audio extraction unavailable. All sources failed.",
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
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});