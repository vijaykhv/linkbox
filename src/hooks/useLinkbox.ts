import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import type { Collection, LinkRow, LinkWithTags, LinkboxExport, Tag } from "../types";

interface LinkTagJoinRow {
  link_id: string;
  tags: Tag | null;
}

function attachTags(links: LinkRow[], joins: LinkTagJoinRow[]): LinkWithTags[] {
  const byLink = new Map<string, Tag[]>();
  for (const j of joins) {
    if (!j.tags) continue;
    const list = byLink.get(j.link_id) ?? [];
    list.push(j.tags);
    byLink.set(j.link_id, list);
  }
  return links.map((l) => ({ ...l, tags: byLink.get(l.id) ?? [] }));
}

export function useLinkbox() {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [links, setLinks] = useState<LinkWithTags[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setError(null);
    const [collectionsRes, tagsRes, linksRes, joinsRes] = await Promise.all([
      supabase.from("collections").select("*").order("created_at", { ascending: true }),
      supabase.from("tags").select("*").order("name", { ascending: true }),
      supabase.from("links").select("*").order("created_at", { ascending: false }),
      supabase.from("link_tags").select("link_id, tags(*)"),
    ]);

    if (collectionsRes.error || tagsRes.error || linksRes.error || joinsRes.error) {
      setError(
        collectionsRes.error?.message ||
          tagsRes.error?.message ||
          linksRes.error?.message ||
          joinsRes.error?.message ||
          "Failed to load data",
      );
      setLoading(false);
      return;
    }

    setCollections(collectionsRes.data ?? []);
    setTags(tagsRes.data ?? []);
    setLinks(attachTags((linksRes.data ?? []) as LinkRow[], (joinsRes.data ?? []) as unknown as LinkTagJoinRow[]));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    setLoading(true);
    fetchAll();
  }, [fetchAll]);

  // Realtime: any change on these tables for the signed-in user triggers a refetch.
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`linkbox-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "links", filter: `user_id=eq.${user.id}` },
        () => fetchAll(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "collections", filter: `user_id=eq.${user.id}` },
        () => fetchAll(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tags", filter: `user_id=eq.${user.id}` },
        () => fetchAll(),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "link_tags" }, () =>
        fetchAll(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchAll]);

  const resolveTagIds = useCallback(
    async (names: string[]): Promise<string[]> => {
      if (!user) return [];
      const clean = [...new Set(names.map((n) => n.trim()).filter(Boolean))];
      if (clean.length === 0) return [];

      const { data: existing } = await supabase
        .from("tags")
        .select("*")
        .in(
          "name",
          clean,
        );
      const existingNames = new Set((existing ?? []).map((t) => t.name.toLowerCase()));
      const toCreate = clean.filter((n) => !existingNames.has(n.toLowerCase()));

      let created: Tag[] = [];
      if (toCreate.length > 0) {
        const { data, error } = await supabase
          .from("tags")
          .insert(toCreate.map((name) => ({ name, user_id: user.id })))
          .select("*");
        if (error) throw error;
        created = data ?? [];
      }

      return [...(existing ?? []), ...created].map((t) => t.id);
    },
    [user],
  );

  const addLink = useCallback(
    async (input: {
      url: string;
      title?: string | null;
      description?: string | null;
      thumbnail_url?: string | null;
      collection_id?: string | null;
      notes?: string | null;
      tagNames?: string[];
    }) => {
      if (!user) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("links")
        .insert({
          user_id: user.id,
          url: input.url,
          title: input.title ?? null,
          description: input.description ?? null,
          thumbnail_url: input.thumbnail_url ?? null,
          collection_id: input.collection_id ?? null,
          notes: input.notes ?? null,
        })
        .select("*")
        .single();
      if (error) throw error;

      if (input.tagNames && input.tagNames.length > 0) {
        const tagIds = await resolveTagIds(input.tagNames);
        if (tagIds.length > 0) {
          await supabase
            .from("link_tags")
            .insert(tagIds.map((tag_id) => ({ link_id: data.id, tag_id })));
        }
      }
      await fetchAll();
      return data as LinkRow;
    },
    [user, resolveTagIds, fetchAll],
  );

  const updateLink = useCallback(
    async (
      id: string,
      patch: Partial<
        Pick<
          LinkRow,
          "title" | "description" | "notes" | "collection_id" | "thumbnail_url" | "url" | "pinned"
        >
      >,
    ) => {
      const { error } = await supabase.from("links").update(patch).eq("id", id);
      if (error) throw error;
      await fetchAll();
    },
    [fetchAll],
  );

  const togglePin = useCallback(
    async (id: string, pinned: boolean) => {
      const { error } = await supabase.from("links").update({ pinned }).eq("id", id);
      if (error) throw error;
      await fetchAll();
    },
    [fetchAll],
  );

  const setLinkTags = useCallback(
    async (linkId: string, tagNames: string[]) => {
      const tagIds = await resolveTagIds(tagNames);
      await supabase.from("link_tags").delete().eq("link_id", linkId);
      if (tagIds.length > 0) {
        await supabase
          .from("link_tags")
          .insert(tagIds.map((tag_id) => ({ link_id: linkId, tag_id })));
      }
      await fetchAll();
    },
    [resolveTagIds, fetchAll],
  );

  const deleteLinks = useCallback(
    async (ids: string[]) => {
      const { error } = await supabase.from("links").delete().in("id", ids);
      if (error) throw error;
      await fetchAll();
    },
    [fetchAll],
  );

  const moveLinksToCollection = useCallback(
    async (ids: string[], collectionId: string | null) => {
      const { error } = await supabase
        .from("links")
        .update({ collection_id: collectionId })
        .in("id", ids);
      if (error) throw error;
      await fetchAll();
    },
    [fetchAll],
  );

  const addCollection = useCallback(
    async (
      name: string,
      parentId?: string | null,
      appearance?: { colorIndex?: number | null; emoji?: string | null },
    ) => {
      if (!user) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("collections")
        .insert({
          name,
          user_id: user.id,
          parent_id: parentId ?? null,
          color_index: appearance?.colorIndex ?? null,
          emoji: appearance?.emoji ?? null,
        })
        .select("*")
        .single();
      if (error) throw error;
      await fetchAll();
      return data as Collection;
    },
    [user, fetchAll],
  );

  const renameCollection = useCallback(
    async (id: string, name: string) => {
      const { error } = await supabase.from("collections").update({ name }).eq("id", id);
      if (error) throw error;
      await fetchAll();
    },
    [fetchAll],
  );

  const updateCollection = useCallback(
    async (
      id: string,
      patch: { name?: string; colorIndex?: number | null; emoji?: string | null },
    ) => {
      const { error } = await supabase
        .from("collections")
        .update({
          ...(patch.name !== undefined ? { name: patch.name } : {}),
          ...(patch.colorIndex !== undefined ? { color_index: patch.colorIndex } : {}),
          ...(patch.emoji !== undefined ? { emoji: patch.emoji } : {}),
        })
        .eq("id", id);
      if (error) throw error;
      await fetchAll();
    },
    [fetchAll],
  );

  const setCollectionShared = useCallback(
    async (id: string, shared: boolean) => {
      const { error } = await supabase.from("collections").update({ is_shared: shared }).eq("id", id);
      if (error) throw error;
      await fetchAll();
    },
    [fetchAll],
  );

  const regenerateShareToken = useCallback(
    async (id: string) => {
      const { error } = await supabase
        .from("collections")
        .update({ share_token: crypto.randomUUID() })
        .eq("id", id);
      if (error) throw error;
      await fetchAll();
    },
    [fetchAll],
  );

  const deleteCollection = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("collections").delete().eq("id", id);
      if (error) throw error;
      await fetchAll();
    },
    [fetchAll],
  );

  const exportAll = useCallback((): LinkboxExport => {
    return {
      exported_at: new Date().toISOString(),
      version: 1,
      collections,
      tags,
      links: links.map(({ tags: linkTags, ...rest }) => ({
        ...rest,
        tag_ids: linkTags.map((t) => t.id),
      })),
    };
  }, [collections, tags, links]);

  const importData = useCallback(
    async (data: LinkboxExport) => {
      if (!user) throw new Error("Not signed in");

      const collectionIdMap = new Map<string, string>();
      for (const c of data.collections) {
        const { data: inserted, error } = await supabase
          .from("collections")
          .insert({
            name: c.name,
            user_id: user.id,
            color_index: c.color_index,
            emoji: c.emoji,
          })
          .select("id")
          .single();
        if (error) throw error;
        collectionIdMap.set(c.id, inserted.id);
      }

      // Second pass: wire up parent_id now that every old id has a new one,
      // since a child can appear before its parent in the export array.
      for (const c of data.collections) {
        if (!c.parent_id) continue;
        const newId = collectionIdMap.get(c.id);
        const newParentId = collectionIdMap.get(c.parent_id);
        if (newId && newParentId) {
          const { error } = await supabase
            .from("collections")
            .update({ parent_id: newParentId })
            .eq("id", newId);
          if (error) throw error;
        }
      }

      const tagIdMap = new Map<string, string>();
      for (const t of data.tags) {
        const { data: inserted, error } = await supabase
          .from("tags")
          .insert({ name: t.name, user_id: user.id })
          .select("id")
          .single();
        if (error) throw error;
        tagIdMap.set(t.id, inserted.id);
      }

      for (const l of data.links) {
        const { data: inserted, error } = await supabase
          .from("links")
          .insert({
            user_id: user.id,
            url: l.url,
            title: l.title,
            description: l.description,
            thumbnail_url: l.thumbnail_url,
            notes: l.notes,
            pinned: l.pinned,
            collection_id: l.collection_id ? (collectionIdMap.get(l.collection_id) ?? null) : null,
          })
          .select("id")
          .single();
        if (error) throw error;

        const newTagIds = l.tag_ids.map((oldId) => tagIdMap.get(oldId)).filter(Boolean) as string[];
        if (newTagIds.length > 0) {
          await supabase
            .from("link_tags")
            .insert(newTagIds.map((tag_id) => ({ link_id: inserted.id, tag_id })));
        }
      }

      await fetchAll();
    },
    [user, fetchAll],
  );

  const unsortedCount = useMemo(
    () => links.filter((l) => !l.collection_id).length,
    [links],
  );

  return {
    collections,
    tags,
    links,
    loading,
    error,
    unsortedCount,
    addLink,
    updateLink,
    togglePin,
    setLinkTags,
    deleteLinks,
    moveLinksToCollection,
    addCollection,
    renameCollection,
    updateCollection,
    setCollectionShared,
    regenerateShareToken,
    deleteCollection,
    exportAll,
    importData,
    refetch: fetchAll,
  };
}
