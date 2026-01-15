import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Piped instances (free YouTube audio extraction)
const PIPED_INSTANCES = [
  "https://pipedapi.kavin.rocks",
  "https://pipedapi.adminforge.de", 
  "https://pipedapi.moomoo.me",
  "https://pipedapi.syncpundit.io",
  "https://api.piped.yt",
];

// Invidious instances as fallback
const INVIDIOUS_INSTANCES = [
  "https://invidious.fdn.fr",
  "https://invidious.io.lol",
  "https://vid.puffyan.us",
  "https://yt.artemislena.eu",
];

interface AudioResult {
  audioUrl: string;
  title: string;
  thumbnail: string;
}

async function getAudioFromPiped(videoId: string): Promise<AudioResult | null> {
  for (const base of PIPED_INSTANCES) {
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

      if (!data?.audioStreams || !Array.isArray(data.audioStreams) || data.audioStreams.length === 0) {
        console.log(`No audio streams from ${base}`);
        continue;
      }

      // Sort by bitrate and get the best audio stream
      const audioStreams = data.audioStreams
        .filter((s: any) => s?.url && s?.mimeType?.startsWith("audio/"))
        .sort((a: any, b: any) => (b?.bitrate ?? 0) - (a?.bitrate ?? 0));

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
      console.error(`Piped ${base} error:`, e);
      continue;
    }
  }

  return null;
}

async function getAudioFromInvidious(videoId: string): Promise<AudioResult | null> {
  for (const base of INVIDIOUS_INSTANCES) {
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

      if (!data?.adaptiveFormats || !Array.isArray(data.adaptiveFormats)) {
        console.log(`No adaptive formats from ${base}`);
        continue;
      }

      // Get audio-only formats
      const audioFormats = data.adaptiveFormats
        .filter((f: any) => f?.type?.startsWith("audio/") && f?.url)
        .sort((a: any, b: any) => (b?.bitrate ?? 0) - (a?.bitrate ?? 0));

      if (audioFormats.length === 0) {
        console.log(`No valid audio formats from ${base}`);
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
      console.error(`Invidious ${base} error:`, e);
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

    // Try Piped first
    let result = await getAudioFromPiped(videoId);

    // Fallback to Invidious
    if (!result) {
      console.log("Piped failed, trying Invidious...");
      result = await getAudioFromInvidious(videoId);
    }

    if (!result) {
      return new Response(JSON.stringify({
        error: "Could not extract audio. All sources are down. Try again later.",
      }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in youtube-audio function:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});