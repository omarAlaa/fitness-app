begin;
create extension if not exists pgtap with schema extensions;
select plan(20);
insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
values
  ('10000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'profile-a@test.invalid', '', now(), '{}'::jsonb, '{}'::jsonb),
  ('10000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'profile-b@test.invalid', '', now(), '{}'::jsonb, '{}'::jsonb);
select is((select count(*)::integer from public.profiles where id = '10000000-0000-4000-8000-000000000001'), 1, 'Auth signup trigger creates a profile using only the Auth user id');
select is((select count(*)::integer from public.profiles where id = '10000000-0000-4000-8000-000000000002'), 1, 'Auth signup trigger creates a profile for each new user');
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
select is((select count(*)::integer from public.profiles), 1, 'User A can read their own profile only');
select is((select count(*)::integer from public.profiles where id = '10000000-0000-4000-8000-000000000002'), 0, 'User A cannot read User B profile');
select is((with changed as (update public.profiles set display_name = 'A profile' where id = '10000000-0000-4000-8000-000000000001' returning 1) select count(*)::integer from changed), 1, 'User A can update their own profile');
select is((with changed as (update public.profiles set display_name = 'tampered' where id = '10000000-0000-4000-8000-000000000002' returning 1) select count(*)::integer from changed), 0, 'User A cannot update User B profile');
select throws_ok($$ update public.profiles set id = '10000000-0000-4000-8000-000000000002' where id = '10000000-0000-4000-8000-000000000001' $$, '42501', null, 'Profile ownership column cannot be changed');
select throws_ok($$ delete from public.profiles where id = '10000000-0000-4000-8000-000000000001' $$, '42501', null, 'Profile rows cannot be directly deleted');
select lives_ok($$ insert into public.fitness_goals (user_id, title, target_value, target_unit) values ('10000000-0000-4000-8000-000000000001', 'Build strength', 10, 'reps') $$, 'User A can insert an owned fitness goal');
select throws_ok($$ insert into public.fitness_goals (user_id, title) values ('10000000-0000-4000-8000-000000000002', 'Forged owner') $$, '42501', null, 'User A cannot insert a goal for User B');
select is((select count(*)::integer from public.fitness_goals), 1, 'User A can read their own goal');
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000002', true);
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000002","role":"authenticated"}', true);
select lives_ok($$ insert into public.fitness_goals (user_id, title) values ('10000000-0000-4000-8000-000000000002', 'Run consistently') $$, 'User B can insert an owned fitness goal');
select is((select count(*)::integer from public.fitness_goals), 1, 'User B can read their own goal');
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
select is((with changed as (update public.fitness_goals set title = 'tampered' where user_id = '10000000-0000-4000-8000-000000000002' returning 1) select count(*)::integer from changed), 0, 'User A cannot update User B goal');
select is((with changed as (update public.fitness_goals set title = 'Strength goal updated' where user_id = '10000000-0000-4000-8000-000000000001' returning 1) select count(*)::integer from changed), 1, 'User A can update their own goal');
select throws_ok($$ update public.fitness_goals set user_id = '10000000-0000-4000-8000-000000000002' where user_id = '10000000-0000-4000-8000-000000000001' $$, '42501', null, 'Goal ownership column cannot be changed');
select is((with removed as (delete from public.fitness_goals where user_id = '10000000-0000-4000-8000-000000000002' returning 1) select count(*)::integer from removed), 0, 'User A cannot delete User B goal');
select is((with removed as (delete from public.fitness_goals where user_id = '10000000-0000-4000-8000-000000000001' returning 1) select count(*)::integer from removed), 1, 'User A can delete their own goal');
reset role;
delete from auth.users where id in ('10000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002');
select is((select count(*)::integer from public.profiles where id in ('10000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002')), 0, 'Deleting Auth users cascades to profile rows');
select is((select count(*)::integer from public.fitness_goals where user_id in ('10000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002')), 0, 'Deleting Auth users cascades to fitness goals');
select * from finish();
rollback;