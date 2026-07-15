-- Adds sub-collections (nested folders) and pinned links.
-- Run after 00000000000000_init.sql (via SQL editor or `supabase db push`).

alter table collections add column if not exists parent_id uuid
  references collections(id) on delete cascade;
create index if not exists collections_parent_id_idx on collections (parent_id);

alter table links add column if not exists pinned boolean not null default false;
create index if not exists links_pinned_idx on links (pinned);
