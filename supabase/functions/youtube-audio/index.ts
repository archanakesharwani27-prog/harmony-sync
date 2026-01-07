import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Last-resort fallback list (may go down / rate limit)
const FALLBACK_INSTANCES = [
  "https://yewtu.be",
  "https://vid.puffyan.us",
  "https://invidious.snopyta.org",
];

type InstancesApiRow = [
  string,
  {
    uri?: string;
    api?: boolean;
    cors?: boolean;
    type?: string;
    monitor?: {
      down?: boolean;
      last_status?: number;
      uptime?: number;
    };
  },
];

let cachedInstances: { at: number; list: string[] } | null = null;

async function getHealthyInstances(): Promise<string[]> {
  // Cache for 10 minutes to avoid hammering instances-api
  const now = Date.now();
  if (cachedInstances && now - cachedInstances.at < 10 * 60 * 1000) {
    return cachedInstances.list;
  }

  try {
    const res = await fetch(
      "https://api.invidious.io/instances.json?pretty=0&sort_by=health,users",
      {
        headers: {
          Accept: "application/json",
          "User-Agent": UA,
        },
      },
    );

    if (!res.ok) {
      console.log("instances-api returned", res.status);
      cachedInstances = { at: now, list: FALLBACK_INSTANCES };
      return cachedInstances.list;
    }

    const rows = (await res.json()) as InstancesApiRow[];

    const list = rows
      .map(([, meta]) => meta)
      .filter((m) => m?.uri)
      // Prefer instances that explicitly advertise API support and are up
      .filter((m) => m.api === true)
      .filter((m) => m.monitor?.down === false)
      .filter((m) => (m.monitor?.last_status ?? 200) === 200)
      .map((m) => String(m.uri))
      // Prefer https
      .filter((u) => u.startsWith("https://"))
      .slice(0, 12);

    cachedInstances = { at: now, list: list.length ? list : FALLBACK_INSTANCES };
    console.log("Using instances:", cachedInstances.list.join(", "));
    return cachedInstances.list;
  } catch (e) {
    console.error("Failed to fetch instances list:", e);
    cachedInstances = { at: now, list: FALLBACK_INSTANCES };
    return cachedInstances.list;
  }
}

function absolutizeUrl(base: string, maybeRelative: string): string {
  if (!maybeRelative) return maybeRelative;
  if (maybeRelative.startsWith("http://") || maybeRelative.startsWith("https://")) return maybeRelative;
  if (maybeRelative.startsWith("//")) return `https:${maybeRelative}`;
  if (maybeRelative.startsWith("/")) return `${base}${maybeRelative}`;
  return `${base}/${maybeRelative}`;
}

async function getAudioFromInvidious(
  videoId: string,
): Promise<{ audioUrl: string; title: string; thumbnail: string } | null> {
  const instances = await getHealthyInstances();

  for (const base of instances) {
    try {
      const url = `${base}/api/v1/videos/${videoId}?local=true`;
      console.log("Trying:", url);

      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": UA,
          "Accept-Language": "en-US,en;q=0.9",
        },
      });

      if (!res.ok) {
        console.log(`Instance ${base} returned ${res.status}`);
        continue;
      }

      const text = await res.text();
      // Some instances return HTML blocks (rate limit / WAF)
      if (text.trim().startsWith("<")) {
        console.log(`Instance ${base} returned HTML (skipping)`);
        continue;
      }

      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        console.log(`Instance ${base} returned non-JSON (skipping)`);
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

      console.log("Selected audio:", best?.type ?? best?.mimeType, "bitrate:", best?.bitrate);

      return { audioUrl, title, thumbnail };
    } catch (e) {
      console.error(`Error with instance ${base}:`, e);
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

    const result = await getAudioFromInvidious(videoId);

    if (!result) {
      // 404 makes the client treat this as a missing/unsupported item
      return new Response(JSON.stringify({
        error: "Could not extract audio. This happens when instances are down/rate-limiting. Try another song or retry in a minute.",
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

