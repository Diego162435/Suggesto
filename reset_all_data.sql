-- ==============================================================================
-- DANGER: THIS SCRIPT WILL DELETE ALL USERS AND DATA
-- ==============================================================================

-- 1. Delete data from dependent tables first (to avoid foreign key constraint errors)
TRUNCATE TABLE public.comments CASCADE;
TRUNCATE TABLE public.likes CASCADE;
TRUNCATE TABLE public.favorites CASCADE;
TRUNCATE TABLE public.wishlist CASCADE;
TRUNCATE TABLE public.user_ratings CASCADE;

-- 2. Delete all profiles (this links to auth.users)
DELETE FROM public.profiles;

-- 3. Delete all users from auth.users
-- Note: You need to be a superuser or have specific permissions to delete from auth.users
-- If you are running this in the Supabase Dashboard SQL Editor, it should work.
DELETE FROM auth.users;

-- 4. Verify that everything is gone
SELECT COUNT(*) as profiles_count FROM public.profiles;
SELECT COUNT(*) as users_count FROM auth.users;
