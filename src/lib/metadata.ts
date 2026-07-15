import { supabase } from "./supabase";

export interface FetchedMetadata {
  url: string;
  resolved_url: string;
  title: string | null;
  description: string | null;
  thumbnail_url: string | null;
}

export async function fetchLinkMetadata(url: string): Promise<FetchedMetadata | null> {
  const { data, error } = await supabase.functions.invoke<FetchedMetadata>("fetch-metadata", {
    body: { url },
  });
  if (error || !data) return null;
  return data;
}
