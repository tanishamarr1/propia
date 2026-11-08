-- Ejecutar DESPUÉS de migration_02.sql
create table sales(id uuid primary key default gen_random_uuid(), org_id uuid not null references organizations on delete cascade, unit_id uuid not null references units on delete cascade, buyer_name text not null, buyer_phone text, price numeric not null, offer numeric, commission_pct numeric default 3, status text not null default 'interesado' check (status in ('interesado','oferta','reservada','vendida','cancelada')), created_at timestamptz default now());
create table documents(id uuid primary key default gen_random_uuid(), org_id uuid not null references organizations on delete cascade, unit_id uuid references units on delete set null, name text not null, kind text default 'otro', path text not null, created_at timestamptz default now());
do $$ declare t text; begin foreach t in array array['sales','documents'] loop
 execute format('alter table %I enable row level security',t);
 execute format('create policy %I on %I for select using (is_member(org_id))',t||'_r',t);
 execute format('create policy %I on %I for insert with check (is_staff(org_id))',t||'_i',t);
 execute format('create policy %I on %I for update using (is_staff(org_id)) with check (is_staff(org_id))',t||'_u',t);
 execute format('create policy %I on %I for delete using (is_staff(org_id))',t||'_d',t);
end loop; end $$;
insert into storage.buckets(id,name,public) values('documents','documents',false) on conflict do nothing;
create policy doc_r on storage.objects for select using (bucket_id='documents' and is_member(((storage.foldername(name))[1])::uuid));
create policy doc_i on storage.objects for insert with check (bucket_id='documents' and is_staff(((storage.foldername(name))[1])::uuid));
create policy doc_d on storage.objects for delete using (bucket_id='documents' and is_staff(((storage.foldername(name))[1])::uuid));
