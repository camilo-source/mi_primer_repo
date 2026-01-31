-- Enable RLS
alter table public.busquedas enable row level security;
alter table public.postulantes enable row level security;

-- Policy for Busquedas (CRUD for owner)
create policy "Users can manage their own searches"
on public.busquedas
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Policy for Postulantes (CRUD linked to search)
-- Simplification: Allow if user can see the search. 
-- For strictness we could join, but for this app it's enough to check if the user is authenticated 
-- AND the client-side logic handles the ID link correctly. 
-- BETTER: Check via join.
create policy "Users can manage candidates of their searches"
on public.postulantes
for all
using (
  exists (
    select 1 from public.busquedas b
    where b.id_busqueda_n8n = postulantes.id_busqueda_n8n
    and b.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.busquedas b
    where b.id_busqueda_n8n = postulantes.id_busqueda_n8n
    and b.user_id = auth.uid()
  )
);

-- Fallback for Postulantes (Insert needs to verify parent search availability)
-- If row being inserted, we check the search id exists and belongs to user.
