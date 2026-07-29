-- Is the data gone, or just hidden? Run these in Supabase → SQL Editor.
-- The SQL editor bypasses row-level security, so it sees the true contents.

-- 1. WHAT IS ACTUALLY IN THE DATABASE.
--    Row counts per table. If these are non-zero, nothing has been lost —
--    it is a permissions problem, not a data problem.
select relname as table_name, n_live_tup as approx_rows
from pg_stat_user_tables
where schemaname = 'public'
order by relname;


-- 2. TABLES THAT ARE INVISIBLE TO EVERYONE.
--    Row-level security is on, but no policy grants SELECT — so every reader,
--    signed in or not, gets zero rows. Anything listed here is the problem.
select c.relname as locked_table
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relrowsecurity
  and not exists (
    select 1 from pg_policies p
    where p.schemaname = 'public'
      and p.tablename = c.relname
      and p.cmd in ('SELECT', 'ALL')
  )
order by c.relname;


-- 3. EVERY READ POLICY CURRENTLY IN PLACE.
select tablename, policyname, cmd, qual as using_expression
from pg_policies
where schemaname = 'public'
  and cmd in ('SELECT', 'ALL')
order by tablename, policyname;
