-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Clientes (Users)
create table public.clientes (
  id uuid references auth.users not null primary key,
  google_id text,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Busquedas (Searches)
create table public.busquedas (
  id_busqueda_n8n text primary key,
  user_id uuid references public.clientes(id) not null,
  titulo text,
  estado text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Postulantes (Candidates)
create table public.postulantes (
  id uuid default uuid_generate_v4() primary key,
  id_busqueda_n8n text references public.busquedas(id_busqueda_n8n) not null,
  nombre text,
  email text,
  resumen_ia text,
  comentarios_admin text,
  estado_agenda text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.clientes enable row level security;
alter table public.busquedas enable row level security;
alter table public.postulantes enable row level security;

-- Policy: Users can view their own profile
create policy "Users can view own profile"
  on public.clientes for select
  using ( auth.uid() = id );

-- Policy: Users can insert their own profile
create policy "Users can insert own profile"
  on public.clientes for insert
  with check ( auth.uid() = id );

-- Policy: Users can view their own searches
create policy "Users can view own searches"
  on public.busquedas for select
  using ( auth.uid() = user_id );

-- Policy: Users can create searches
create policy "Users can create searches"
  on public.busquedas for insert
  with check ( auth.uid() = user_id );

-- Policy: Users can view candidates for their searches
create policy "Users can view candidates for own searches"
  on public.postulantes for select
  using ( exists (
    select 1 from public.busquedas
    where busquedas.id_busqueda_n8n = postulantes.id_busqueda_n8n
    and busquedas.user_id = auth.uid()
  ));

-- Policy: Users can update candidates for own searches
create policy "Users can update candidates for own searches"
  on public.postulantes for update
  using ( exists (
    select 1 from public.busquedas
    where busquedas.id_busqueda_n8n = postulantes.id_busqueda_n8n
    and busquedas.user_id = auth.uid()
  ));
