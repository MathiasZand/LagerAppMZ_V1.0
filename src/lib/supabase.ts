import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://innalyuwwxlxcqbvoxqj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlubmFseXV3d3hseGNxYnZveHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MDkyODksImV4cCI6MjA5ODM4NTI4OX0.e9-agWvrF-a0nG04HEujpkQdrMmdGrorG1Ymo0Lu_9I'
)

/*
── SQL SCHEMA – einmalig im Supabase SQL Editor ausführen ──────────────────────

create extension if not exists "uuid-ossp";

create table liegenschaften (
  id uuid primary key default uuid_generate_v4(),
  name text not null, adresse text default '',
  emoji text default '🏢', farbe text default '#0284c7',
  erstellt_am timestamptz default now()
);
create table benutzer (
  id uuid primary key default uuid_generate_v4(),
  name text not null, email text unique not null,
  rolle text default 'user' check (rolle in ('admin','user','guest')),
  initialen text default '', av_farbe text default '#0284c7'
);
create table benutzer_liegenschaft (
  benutzer_id uuid references benutzer(id) on delete cascade,
  liegenschaft_id uuid references liegenschaften(id) on delete cascade,
  rolle text default 'guest' check (rolle in ('admin','user','guest')),
  primary key (benutzer_id, liegenschaft_id)
);
create table kategorien (
  id uuid primary key default uuid_generate_v4(),
  liegenschaft_id uuid references liegenschaften(id) on delete cascade,
  name text not null, farbe text default '#0284c7',
  hintergrund text default 'rgba(2,132,199,0.15)'
);
create table raeume (
  id uuid primary key default uuid_generate_v4(),
  liegenschaft_id uuid references liegenschaften(id) on delete cascade,
  name text not null, emoji text default '🔧', stockwerk text default 'EG'
);
create table lagerplaetze (
  id uuid primary key default uuid_generate_v4(),
  raum_id uuid references raeume(id) on delete cascade,
  code text not null, bezeichnung text default '', regal text default ''
);
create table artikel (
  id uuid primary key default uuid_generate_v4(),
  liegenschaft_id uuid references liegenschaften(id) on delete cascade,
  name text not null, kategorie text default '',
  raum_id uuid references raeume(id),
  lagerplatz_id uuid references lagerplaetze(id),
  lagerplatz_code text default '', lagerplatz_bezeichnung text default '',
  bemerkung text default '', hinweise text[] default '{}',
  emoji text default '📦', foto_url text,
  erfasst_am timestamptz default now(), erfasst_von text default '',
  aktualisiert_am timestamptz default now()
);
create table rollen_berechtigungen (
  rolle text not null, berechtigung text not null, aktiv boolean default true,
  primary key (rolle, berechtigung)
);

-- Admin-Benutzer Mathias anlegen
insert into benutzer (name, email, rolle, initialen, av_farbe)
values ('Mathias', 'mathiaszand@gmail.com', 'admin', 'MZ', '#0284c7');

-- RLS (offen für Demo, nach Bedarf einschränken)
alter table liegenschaften enable row level security;
alter table benutzer enable row level security;
alter table benutzer_liegenschaft enable row level security;
alter table kategorien enable row level security;
alter table raeume enable row level security;
alter table lagerplaetze enable row level security;
alter table artikel enable row level security;
alter table rollen_berechtigungen enable row level security;

create policy "open" on liegenschaften for all using (true) with check (true);
create policy "open" on benutzer for all using (true) with check (true);
create policy "open" on benutzer_liegenschaft for all using (true) with check (true);
create policy "open" on kategorien for all using (true) with check (true);
create policy "open" on raeume for all using (true) with check (true);
create policy "open" on lagerplaetze for all using (true) with check (true);
create policy "open" on artikel for all using (true) with check (true);
create policy "open" on rollen_berechtigungen for all using (true) with check (true);

── Ende SQL ────────────────────────────────────────────────────────────────── */
