import { useEffect, useState } from "react";
import { fetchSharedCollection, type SharedCollection } from "../lib/sharedCollection";
import { getCollectionColor } from "../lib/collectionColor";
import EmptyState from "../components/EmptyState";

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function faviconFor(url: string): string {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
  } catch {
    return "";
  }
}

interface SharedCollectionPageProps {
  token: string;
}

export default function SharedCollectionPage({ token }: SharedCollectionPageProps) {
  const [data, setData] = useState<SharedCollection | null | undefined>(undefined);

  useEffect(() => {
    fetchSharedCollection(token).then(setData);
  }, [token]);

  const color = data ? getCollectionColor(data) : null;

  return (
    <div className="min-h-svh bg-cream-100 dark:bg-ink-950">
      <div className="sticky top-0 z-10 bg-cream-100/90 dark:bg-ink-950/90 backdrop-blur border-b-2 border-ink-950 dark:border-cream-100/85">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-2.5">
          <a href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-violet-500 text-white flex items-center justify-center font-extrabold text-base pop-border pop-shadow-sm">
              L
            </div>
            <span className="font-extrabold text-lg tracking-tight text-ink-950 dark:text-cream-50">
              Linkbox
            </span>
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {data === undefined ? (
          <div className="flex justify-center py-20">
            <div className="h-6 w-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          </div>
        ) : data === null ? (
          <EmptyState
            icon="🔒"
            title="This collection isn't available"
            description="The link may be invalid, or the owner has turned off sharing."
          />
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div
                className="h-12 w-12 rounded-2xl flex items-center justify-center text-2xl pop-border pop-shadow-sm"
                style={{ backgroundColor: color!.bg }}
              >
                {color!.emoji}
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-ink-950 dark:text-cream-50">{data.name}</h1>
                <p className="text-xs font-medium text-ink-950/50 dark:text-cream-100/50">
                  {data.links.length} {data.links.length === 1 ? "link" : "links"} · shared via Linkbox
                </p>
              </div>
            </div>

            {data.links.length === 0 ? (
              <EmptyState icon="📭" title="No links yet" description="This collection is empty." />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {data.links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative rounded-2xl overflow-hidden bg-white dark:bg-ink-900 pop-border pop-shadow-sm hover:pop-shadow hover:-translate-y-0.5 transition-all"
                  >
                    <div className="aspect-[16/9] bg-cream-200 dark:bg-ink-800 flex items-center justify-center overflow-hidden border-b-2 border-ink-950 dark:border-cream-100/85">
                      {link.thumbnail_url ? (
                        <img
                          src={link.thumbnail_url}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <img src={faviconFor(link.url)} alt="" className="h-8 w-8 opacity-70" />
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-bold text-ink-950 dark:text-cream-50 line-clamp-1">
                        {link.title || hostname(link.url)}
                      </p>
                      {link.description && (
                        <p className="text-xs text-ink-950/50 dark:text-cream-100/50 line-clamp-2 mt-0.5">
                          {link.description}
                        </p>
                      )}
                      <p className="text-xs font-medium text-ink-950/40 dark:text-cream-100/40 truncate mt-2">
                        {hostname(link.url)}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
