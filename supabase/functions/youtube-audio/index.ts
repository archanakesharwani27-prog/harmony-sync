import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Piped instances - more reliable than Invidious for audio extraction
const PIPED_INSTANCES = [
  "https://pipedapi.kavin.rocks",
  "https://pipedapi.adminforge.de",
  "https://api.piped.yt",
  "https://pipedapi.darkness.services",
  "https://pipedapi.moomoo.me",
];

// Invidious fallback instances
const INVIDIOUS_INSTANCES = [
  "https://yewtu.be",
  "https://vid.puffyan.us",
  "https://invidious.snopyta.org",
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
        thumbnail: data.thumbnailUrl || "",
      };
    } catch (e) {
      console.error(`Piped ${base} error:`, e);
      continue;
    }
  }

  return null;
}

function absolutizeUrl(base: string, maybeRelative: string): string {
  if (!maybeRelative) return maybeRelative;
  if (maybeRelative.startsWith("http://") || maybeRelative.startsWith("https://")) return maybeRelative;
  if (maybeRelative.startsWith("//")) return `https:${maybeRelative}`;
  if (maybeRelative.startsWith("/")) return `${base}${maybeRelative}`;
  return `${base}/${maybeRelative}`;
}

async function getAudioFromInvidious(videoId: string): Promise<AudioResult | null> {
  for (const base of INVIDIOUS_INSTANCES) {
    try {
      const url = `${base}/api/v1/videos/${videoId}?local=true`;
      console.log("Trying Invidious:", url);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": UA,
          "Accept-Language": "en-US,en;q=0.9",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        console.log(`Invidious ${base} returned ${res.status}`);
        continue;
      }

      const text = await res.text();
      if (text.trim().startsWith("<")) {
        console.log(`Invidious ${base} returned HTML (skipping)`);
        continue;
      }

      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        console.log(`Invidious ${base} returned non-JSON (skipping)`);
        continue;
      }

      const formats: any[] = [
        ...(Array.isArray(data?.adaptiveFormats) ? data.adaptiveFormats : []),
        ...(Array.isArray(data?.formatStreams) ? data.formatStreams : []),
      ];

      const audioFormats = formats
        .filter((f) => {
          const type = String(f?.type ?? f?.mimeType ?? "");
          return type.startsWith("audio/") || type.includes("audio/");
        })
        .filter((f) => f?.url);

      if (!audioFormats.length) {
        console.log(`No audio formats found from ${base}`);
        continue;
      }

      audioFormats.sort((a, b) => (Number(b?.bitrate ?? 0) - Number(a?.bitrate ?? 0)));
      const best = audioFormats[0];

      const audioUrl = absolutizeUrl(base, String(best.url));
      const title = String(data?.title ?? "Unknown");
      const thumbnail = String(data?.videoThumbnails?.[0]?.url ?? "");

      console.log("Selected audio from Invidious:", best?.type ?? best?.mimeType, "bitrate:", best?.bitrate);

      return { audioUrl, title, thumbnail };
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

    // Try Piped first (more reliable)
    let result = await getAudioFromPiped(videoId);

    // Fallback to Invidious
    if (!result) {
      console.log("Piped failed, trying Invidious...");
      result = await getAudioFromInvidious(videoId);
    }

    if (!result) {
      return new Response(JSON.stringify({
        error: "Could not extract audio. All sources are down or rate-limiting. Try again in a minute.",
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