-- Ejecutar DESPUÉS de schema.sql
create table rental_contracts(id uuid primary key default gen_random_uuid(), org_id uuid not null references organizations on delete cascade, unit_id uuid not null references units on delete cascade, tenant_id uuid not null references tenants on delete cascade, start_date date not null, end_date date not null, monthly_amount numeric not null, deposit numeric default 0, pay_day int default 1 check (pay_day between 1 and 31), status text default 'vigente', created_at timestamptz default now());
alter table rental_contracts enable row level security;
create policy rc_r on rental_contracts for select using (is_member(org_id));
create policy rc_i on rental_contracts for insert with check (is_staff(org_id));
create policy rc_u on rental_contracts for update using (is_staff(org_id)) with check (is_staff(org_id));
create policy rc_d on rental_contracts for delete using (is_staff(org_id));
