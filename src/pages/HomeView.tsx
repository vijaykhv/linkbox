import type { Collection } from "../types";
import { getCollectionColor } from "../lib/collectionColor";
import CollectionCard from "../components/CollectionCard";
import IconButton from "../components/IconButton";
import AddLinkBar from "../components/AddLinkBar";
import EmptyState from "../components/EmptyState";

interface HomeViewProps {
  collections: Collection[];
  countByCollection: Record<string, number>;
  onOpenCollection: (id: string) => void;
  onOpenNewCollection: () => void;
  onOpenSearch: () => void;
  onCreateLink: (input: {
    url: string;
    title?: string | null;
    description?: string | null;
    thumbnail_url?: string | null;
    collection_id?: string | null;
  }) => Promise<{ id: string }>;
  onMetadataResolved: (
    id: string,
    patch: { title?: string | null; description?: string | null; thumbnail_url?: string | null },
  ) => Promise<void>;
}

export default function HomeView({
  collections,
  countByCollection,
  onOpenCollection,
  onOpenNewCollection,
  onOpenSearch,
  onCreateLink,
  onMetadataResolved,
}: HomeViewProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-5 pb-28">
      <div className="flex items-center justify-end gap-2 mb-6">
        <IconButton icon="📁" label="New collection" onClick={onOpenNewCollection} />
        <IconButton icon="🔍" label="Search" onClick={onOpenSearch} />
      </div>

      <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-ink-950 dark:text-cream-50 mb-5">
        Save now.
        <br />
        Find anytime.
      </h1>

      <AddLinkBar activeCollectionId={null} onCreate={onCreateLink} onMetadataResolved={onMetadataResolved} />

      <h2 className="text-lg font-extrabold text-ink-950 dark:text-cream-50 mt-8 mb-3">
        My Collections
      </h2>
      {collections.length === 0 ? (
        <EmptyState
          icon="📁"
          title="No collections yet"
          description="Tap the folder icon above to create your first one."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {collections.map((c) => (
            <CollectionCard
              key={c.id}
              name={c.name}
              color={getCollectionColor(c)}
              linkCount={countByCollection[c.id] ?? 0}
              onOpen={() => onOpenCollection(c.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
