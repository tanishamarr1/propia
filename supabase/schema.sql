-- Ejecutar completo en Supabase > SQL Editor
create type app_role as enum ('superadmin','admin','agent','employee','owner','tenant');
create table organizations(id uuid primary key default gen_random_uuid(), name text not null, created_at timestamptz default now());
create table profiles(id uuid primary key references auth.users on delete cascade, full_name text);
create table organization_members(org_id uuid references organizations on delete cascade, user_id uuid references auth.users on delete cascade, role app_role not null default 'admin', primary key(org_id,user_id));
create table buildings(id uuid primary key default gen_random_uuid(), org_id uuid not null references organizations on delete cascade, name text not null, address text);
create table tenants(id uuid primary key default gen_random_uuid(), org_id uuid not null references organizations on delete cascade, full_name text not null, phone text, email text);
create table units(id uuid primary key default gen_random_uuid(), org_id uuid not null references organizations on delete cascade, building_id uuid references buildings on delete set null, name text not null, type text not null default 'Apartamento', bedrooms int default 0, bathrooms int default 0, area_m2 numeric, rent numeric not null default 0, status text not null default 'disponible' check (status in ('disponible','alquilada','reservada','mantenimiento','vendida')), tenant_id uuid references tenants on delete set null, created_at timestamptz default now());
create table payments(id uuid primary key default gen_random_uuid(), org_id uuid not null references organizations on delete cascade, unit_id uuid references units on delete cascade, tenant_id uuid references tenants, amount numeric not null check (amount>0), method text, period text, paid_at timestamptz default now());
create table maintenance_requests(id uuid primary key default gen_random_uuid(), org_id uuid not null references organizations on delete cascade, unit_id uuid references units on delete cascade, description text not null, priority text default 'media', status text default 'abierta', cost numeric default 0, created_at timestamptz default now());

create function is_member(o uuid) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from organization_members where org_id=o and user_id=auth.uid()) $$;
create function is_staff(o uuid) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from organization_members where org_id=o and user_id=auth.uid() and role in ('superadmin','admin','agent','employee')) $$;
create function create_organization(p_name text) returns uuid language plpgsql security definer set search_path=public as $$
declare o uuid; begin insert into organizations(name) values(p_name) returning id into o;
insert into organization_members(org_id,user_id,role) values(o,auth.uid(),'admin'); return o; end $$;
create function handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into profiles(id,full_name) values(new.id,new.raw_user_meta_data->>'full_name'); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

alter table organizations enable row level security; alter table profiles enable row level security; alter table organization_members enable row level security;
create policy org_read on organizations for select using (is_member(id));
create policy prof_own on profiles for all using (id=auth.uid()) with check (id=auth.uid());
create policy mem_own on organization_members for select using (user_id=auth.uid());
do $$ declare t text; begin foreach t in array array['buildings','tenants','units','payments','maintenance_requests'] loop
 execute format('alter table %I enable row level security',t);
 execute format('create policy %I on %I for select using (is_member(org_id))',t||'_r',t);
 execute format('create policy %I on %I for insert with check (is_staff(org_id))',t||'_i',t);
 execute format('create policy %I on %I for update using (is_staff(org_id)) with check (is_staff(org_id))',t||'_u',t);
 execute format('create policy %I on %I for delete using (is_staff(org_id))',t||'_d',t);
end loop; end $$;
