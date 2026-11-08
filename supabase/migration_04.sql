-- Ejecutar DESPUÉS de migration_03.sql
alter table units add column if not exists photo_path text;
create function delete_my_account() returns void language plpgsql security definer set search_path=public as $$
begin
  delete from auth.users where id = auth.uid();
  delete from organizations o where not exists (select 1 from organization_members m where m.org_id = o.id);
end $$;
revoke all on function delete_my_account() from public, anon; grant execute on function delete_my_account() to authenticated;
