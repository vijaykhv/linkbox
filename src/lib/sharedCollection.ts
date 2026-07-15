import { supabase } from "./supabase";

export interface SharedLink {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  thumbnail_url: string | null;
  created_at: string;
}

export interface SharedCollection {
  id: string;
  name: string;
  color_index: number | null;
  emoji: string | null;
  links: SharedLink[];
}

export async function fetchSharedCollection(token: string): Promise<SharedCollection | null> {
  const { data, error } = await supabase.rpc("get_shared_collection", { token });
  if (error || !data) return null;
  return data as SharedCollection;
}
