-- Linkbox schema: collections, links, tags, link_tags
-- Run this once against your Supabase project (SQL editor or `supabase db push`).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- collections
-- ---------------------------------------------------------------------------
create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  created_at timestamptz default now()
);

alter table collections enable row level security;

create policy "collections_select_own" on collections
  for select using (auth.uid() = user_id);
create policy "collections_insert_own" on collections
  for insert with check (auth.uid() = user_id);
create policy "collections_update_own" on collections
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "collections_delete_own" on collections
  for delete using (auth.uid() = user_id);

create index if not exists collections_user_id_idx on collections (user_id);

-- ---------------------------------------------------------------------------
-- links
-- ---------------------------------------------------------------------------
create table if not exists links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  url text not null,
  title text,
  description text,
  thumbnail_url text,
  collection_id uuid references collections(id) on delete set null,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table links enable row level security;

create policy "links_select_own" on links
  for select using (auth.uid() = user_id);
create policy "links_insert_own" on links
  for insert with check (auth.uid() = user_id);
create policy "links_update_own" on links
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "links_delete_own" on links
  for delete using (auth.uid() = user_id);

create index if not exists links_user_id_idx on links (user_id);
create index if not exists links_collection_id_idx on links (collection_id);
create index if not exists links_created_at_idx on links (created_at desc);
-- trigram index for fast ILIKE search across title/description/url
create extension if not exists pg_trgm;
create index if not exists links_search_idx on links
  using gin (
    (coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || url) gin_trgm_ops
  );

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists links_set_updated_at on links;
create trigger links_set_updated_at
  before update on links
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- tags
-- ---------------------------------------------------------------------------
create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  unique (user_id, name)
);

alter table tags enable row level security;

create policy "tags_select_own" on tags
  for select using (auth.uid() = user_id);
create policy "tags_insert_own" on tags
  for insert with check (auth.uid() = user_id);
create policy "tags_update_own" on tags
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tags_delete_own" on tags
  for delete using (auth.uid() = user_id);

create index if not exists tags_user_id_idx on tags (user_id);

-- ---------------------------------------------------------------------------
-- link_tags (many-to-many)
-- ---------------------------------------------------------------------------
create table if not exists link_tags (
  link_id uuid references links(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (link_id, tag_id)
);

alter table link_tags enable row level security;

-- link_tags has no user_id column, so ownership is checked via the parent link.
create policy "link_tags_select_own" on link_tags
  for select using (
    exists (select 1 from links where links.id = link_tags.link_id and links.user_id = auth.uid())
  );
create policy "link_tags_insert_own" on link_tags
  for insert with check (
    exists (select 1 from links where links.id = link_tags.link_id and links.user_id = auth.uid())
    and exists (select 1 from tags where tags.id = link_tags.tag_id and tags.user_id = auth.uid())
  );
create policy "link_tags_delete_own" on link_tags
  for delete using (
    exists (select 1 from links where links.id = link_tags.link_id and links.user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- realtime
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table links;
alter publication supabase_realtime add table collections;
alter publication supabase_realtime add table tags;
alter publication supabase_realtime add table link_tags;
