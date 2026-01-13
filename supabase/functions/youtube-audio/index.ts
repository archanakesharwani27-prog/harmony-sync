import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Cobalt API instances (free, reliable)
const COBALT_INSTANCES = [
  "https://api.cobalt.tools",
  "https://co.wuk.sh",
];

// Piped instances as fallback
const PIPED_INSTANCES = [
  "https://pipedapi.kavin.rocks",
  "https://pipedapi.adminforge.de",
  "https://pipedapi.moomoo.me",
];

interface AudioResult {
  audioUrl: string;
  title: string;
  thumbnail: string;
}

async function getAudioFromCobalt(videoId: string): Promise<AudioResult | null> {
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
  
  for (const base of COBALT_INSTANCES) {
    try {
      console.log("Trying Cobalt:", base);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(base, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "User-Agent": UA,
        },
        body: JSON.stringify({
          url: youtubeUrl,
          downloadMode: "audio",
          audioFormat: "mp3",
          audioBitrate: "320",
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        console.log(`Cobalt ${base} returned ${res.status}`);
        continue;
      }

      const data = await res.json();
      console.log("Cobalt response:", JSON.stringify(data));

      if (data.status === "error") {
        console.log(`Cobalt error: ${data.error?.code || data.text}`);
        continue;
      }

      // Handle tunnel/redirect response
      if ((data.status === "tunnel" || data.status === "redirect") && data.url) {
        return {
          audioUrl: data.url,
          title: data.filename || "Unknown",
          thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        };
      }

      // Handle picker response (multiple options)
      if (data.status === "picker" && data.picker?.[0]?.url) {
        const audioItem = data.picker.find((item: any) => 
          item.type === "audio" || item.url?.includes("audio")
        ) || data.picker[0];
        
        return {
          audioUrl: audioItem.url,
          title: data.filename || "Unknown",
          thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        };
      }

    } catch (e) {
      console.error(`Cobalt ${base} error:`, e);
      continue;
    }
  }

  return null;
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

    // Try Cobalt first (most reliable)
    let result = await getAudioFromCobalt(videoId);

    // Fallback to Piped
    if (!result) {
      console.log("Cobalt failed, trying Piped...");
      result = await getAudioFromPiped(videoId);
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