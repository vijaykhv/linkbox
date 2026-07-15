// Supabase Edge Function: fetch-metadata
//
// Fetches a URL server-side and extracts Open Graph / meta tags so the
// client never has to deal with CORS. Requires a valid Supabase session
// (default `verify_jwt` behavior), and defends against SSRF by rejecting
// requests to private/loopback/link-local addresses (including after
// redirects).
//
// Deploy with: supabase functions deploy fetch-metadata

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_BYTES = 2_000_000; // 2MB cap on response body we read
const FETCH_TIMEOUT_MS = 8000;
const MAX_REDIRECTS = 5;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function isPrivateIp(ip: string): boolean {
  // IPv4
  const v4 = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const [a, b] = [Number(v4[1]), Number(v4[2])];
    if (a === 127) return true; // loopback
    if (a === 10) return true; // private
    if (a === 0) return true;
    if (a === 169 && b === 254) return true; // link-local / cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true; // private
    if (a === 192 && b === 168) return true; // private
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    return false;
  }
  // IPv6
  const lower = ip.toLowerCase();
  if (lower === "::1") return true; // loopback
  if (lower.startsWith("fe80:")) return true; // link-local
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique local
  if (lower.startsWith("::ffff:")) {
    return isPrivateIp(lower.replace("::ffff:", ""));
  }
  return false;
}

async function assertSafeHostname(hostname: string) {
  const lower = hostname.toLowerCase();
  if (
    lower === "localhost" ||
    lower.endsWith(".localhost") ||
    lower.endsWith(".local") ||
    lower.endsWith(".internal")
  ) {
    throw new Error("Refusing to fetch a local/internal hostname");
  }

  // If the hostname is already a literal IP, check it directly.
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(lower) || lower.includes(":")) {
    if (isPrivateIp(lower)) throw new Error("Refusing to fetch a private IP");
    return;
  }

  try {
    const records = await Promise.allSettled([
      Deno.resolveDns(hostname, "A"),
      Deno.resolveDns(hostname, "AAAA"),
    ]);
    const ips = records.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
    if (ips.length === 0) throw new Error("Could not resolve hostname");
    for (const ip of ips) {
      if (isPrivateIp(ip)) throw new Error("Refusing to fetch a private IP");
    }
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Refusing")) throw err;
    throw new Error("Could not resolve hostname");
  }
}

async function safeFetch(startUrl: string): Promise<{ finalUrl: string; html: string }> {
  let currentUrl = startUrl;

  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    const parsed = new URL(currentUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("Only http(s) URLs are supported");
    }
    await assertSafeHostname(parsed.hostname);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(parsed.toString(), {
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; LinkboxBot/1.0; +https://linkbox.app)",
          Accept: "text/html,application/xhtml+xml",
        },
      });
    } finally {
      clearTimeout(timeout);
    }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) throw new Error("Redirect with no location header");
      currentUrl = new URL(location, parsed).toString();
      continue;
    }

    if (!res.ok) throw new Error(`Fetch failed with status ${res.status}`);

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
      throw new Error("URL did not return HTML");
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error("No response body");
    const chunks: Uint8Array[] = [];
    let received = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > MAX_BYTES) {
        await reader.cancel();
        break;
      }
      chunks.push(value);
    }
    const html = new TextDecoder("utf-8", { fatal: false }).decode(
      new Uint8Array(chunks.reduce<number[]>((acc, c) => acc.concat(Array.from(c)), [])),
    );
    return { finalUrl: currentUrl, html };
  }

  throw new Error("Too many redirects");
}

function extractMeta(html: string): Record<string, string> {
  const meta: Record<string, string> = {};
  const metaTagRe = /<meta\s+([^>]+?)\/?>/gi;
  let match: RegExpExecArray | null;
  while ((match = metaTagRe.exec(html))) {
    const attrs = match[1];
    const propMatch = attrs.match(/(?:property|name)\s*=\s*["']([^"']+)["']/i);
    const contentMatch = attrs.match(/content\s*=\s*["']([^"']*)["']/i);
    if (propMatch && contentMatch) {
      meta[propMatch[1].toLowerCase()] = decodeHtmlEntities(contentMatch[1]);
    }
  }
  return meta;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .trim();
}

function extractTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeHtmlEntities(match[1]) : null;
}

function extractIconHref(html: string): string | null {
  const linkTagRe = /<link\s+([^>]+?)\/?>/gi;
  let match: RegExpExecArray | null;
  let best: string | null = null;
  while ((match = linkTagRe.exec(html))) {
    const attrs = match[1];
    const relMatch = attrs.match(/rel\s*=\s*["']([^"']+)["']/i);
    const hrefMatch = attrs.match(/href\s*=\s*["']([^"']+)["']/i);
    if (relMatch && hrefMatch && /icon/i.test(relMatch[1])) {
      best = hrefMatch[1];
      if (/apple-touch-icon|32x32|shortcut icon/i.test(relMatch[1] + attrs)) break;
    }
  }
  return best;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const rawUrl = body.url?.trim();
  if (!rawUrl) return jsonResponse({ error: "Missing url" }, 400);

  let normalizedUrl: string;
  try {
    normalizedUrl = new URL(
      /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`,
    ).toString();
  } catch {
    return jsonResponse({ error: "Invalid URL" }, 400);
  }

  try {
    const { finalUrl, html } = await safeFetch(normalizedUrl);
    const meta = extractMeta(html);
    const origin = new URL(finalUrl).origin;

    const title = meta["og:title"] || meta["twitter:title"] || extractTitle(html) || null;
    const description =
      meta["og:description"] || meta["twitter:description"] || meta["description"] || null;
    let thumbnail = meta["og:image"] || meta["twitter:image"] || null;
    if (thumbnail && !/^https?:\/\//i.test(thumbnail)) {
      thumbnail = new URL(thumbnail, finalUrl).toString();
    }
    if (!thumbnail) {
      const icon = extractIconHref(html);
      thumbnail = icon
        ? /^https?:\/\//i.test(icon)
          ? icon
          : new URL(icon, finalUrl).toString()
        : `${origin}/favicon.ico`;
    }

    return jsonResponse({
      url: normalizedUrl,
      resolved_url: finalUrl,
      title,
      description,
      thumbnail_url: thumbnail,
    });
  } catch (err) {
    return jsonResponse(
      { error: err instanceof Error ? err.message : "Failed to fetch metadata" },
      422,
    );
  }
});
