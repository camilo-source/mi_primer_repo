-- 1. Create Availability Table
create table public.availability (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.clientes(id) not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  is_booked boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Add Interview Date to Postulantes
alter table public.postulantes 
add column if not exists fecha_entrevista timestamp with time zone;

-- 3. RLS Policies for Availability
alter table public.availability enable row level security;

create policy "Users can manage own availability"
  on public.availability for all
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );
