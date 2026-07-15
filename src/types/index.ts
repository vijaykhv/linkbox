export interface Collection {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
}

export interface LinkRow {
  id: string;
  user_id: string;
  url: string;
  title: string | null;
  description: string | null;
  thumbnail_url: string | null;
  collection_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LinkWithTags extends LinkRow {
  tags: Tag[];
}

export type ViewMode = "grid" | "list";

export interface LinkboxExport {
  exported_at: string;
  version: 1;
  collections: Collection[];
  tags: Tag[];
  links: (LinkRow & { tag_ids: string[] })[];
}
