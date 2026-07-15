export interface Platform {
  name: string;
  isVideo: boolean;
}

// Hostname → platform metadata. isVideo drives the play-button overlay on
// link cards; it's a best-effort guess from the domain, not real content
// inspection (we don't have og:type piped through yet).
const PLATFORMS: Record<string, Platform> = {
  "instagram.com": { name: "Instagram", isVideo: true },
  "youtube.com": { name: "YouTube", isVideo: true },
  "youtu.be": { name: "YouTube", isVideo: true },
  "tiktok.com": { name: "TikTok", isVideo: true },
  "vimeo.com": { name: "Vimeo", isVideo: true },
  "twitter.com": { name: "X", isVideo: false },
  "x.com": { name: "X", isVideo: false },
  "reddit.com": { name: "Reddit", isVideo: false },
  "github.com": { name: "GitHub", isVideo: false },
  "linkedin.com": { name: "LinkedIn", isVideo: false },
  "facebook.com": { name: "Facebook", isVideo: false },
  "pinterest.com": { name: "Pinterest", isVideo: false },
  "medium.com": { name: "Medium", isVideo: false },
  "spotify.com": { name: "Spotify", isVideo: false },
};

export function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function faviconFor(url: string): string {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
  } catch {
    return "";
  }
}

export function detectPlatform(url: string): Platform | null {
  const host = hostname(url);
  return PLATFORMS[host] ?? null;
}
