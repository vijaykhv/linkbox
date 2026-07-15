-- Custom collection color/emoji, and public read-only sharing.
-- Run after 00000000000001_subcollections_pin.sql (via SQL editor or `supabase db push`).

alter table collections add column if not exists color_index integer;
alter table collections add column if not exists emoji text;
alter table collections add column if not exists share_token uuid not null default gen_random_uuid();
alter table collections add column if not exists is_shared boolean not null default false;
create unique index if not exists collections_share_token_idx on collections (share_token);

-- Public read path for shared collections. SECURITY DEFINER so it can read
-- past RLS, but it hand-picks safe columns only (no notes, no user_id) and
-- returns null unless is_shared is true, so existing private RLS policies
-- on collections/links stay untouched and viewers only ever see the exact
-- fields listed here.
create or replace function get_shared_collection(token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  col record;
  result jsonb;
begin
  select id, name, color_index, emoji into col
  from collections
  where share_token = token and is_shared = true;

  if col.id is null then
    return null;
  end if;

  select jsonb_build_object(
    'id', col.id,
    'name', col.name,
    'color_index', col.color_index,
    'emoji', col.emoji,
    'links', coalesce(jsonb_agg(jsonb_build_object(
      'id', l.id, 'url', l.url, 'title', l.title,
      'description', l.description, 'thumbnail_url', l.thumbnail_url,
      'created_at', l.created_at
    ) order by l.created_at desc) filter (where l.id is not null), '[]'::jsonb)
  ) into result
  from links l
  where l.collection_id = col.id;

  return result;
end;
$$;

grant execute on function get_shared_collection(uuid) to anon, authenticated;
