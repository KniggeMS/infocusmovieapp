-- RPC: Get all users (admin only)
DROP FUNCTION IF EXISTS public.admin_get_all_users();
CREATE FUNCTION public.admin_get_all_users()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSON;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
        RAISE EXCEPTION 'Permission denied: admin role required';
    END IF;

    SELECT json_agg(row_to_json(t))
    INTO result
    FROM (
        SELECT 
            p.id,
            p.email,
            p.role,
            p.username,
            p.display_name,
            p.created_at,
            p.last_login_at,
            p.avatar_url,
            p.theme
        FROM profiles p
        ORDER BY p.created_at DESC
    ) t;

    RETURN COALESCE(result, '[]'::JSON);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_all_users TO authenticated;

-- RPC: Update user role (admin only)
CREATE OR REPLACE FUNCTION public.admin_update_user_role(target_user_id UUID, new_role TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if caller is admin
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
        RAISE EXCEPTION 'Permission denied: admin role required';
    END IF;

    -- Validate role
    IF new_role NOT IN ('admin', 'manager', 'user') THEN
        RAISE EXCEPTION 'Invalid role: must be admin, manager, or user';
    END IF;

    UPDATE profiles SET role = new_role WHERE id = target_user_id;
END;
$$;

-- RPC: Delete a user (admin or manager)
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    caller_role TEXT;
BEGIN
    SELECT role INTO caller_role FROM profiles WHERE id = auth.uid();
    IF caller_role NOT IN ('admin', 'manager') THEN
        RAISE EXCEPTION 'Permission denied: admin or manager role required';
    END IF;
    IF caller_role = 'manager' AND EXISTS (SELECT 1 FROM profiles WHERE id = target_user_id AND role = 'admin') THEN
        RAISE EXCEPTION 'Managers cannot delete admin users';
    END IF;
    DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

-- RPC: Change user password (admin or manager)
-- Uses Supabase auth admin API to update user password
CREATE OR REPLACE FUNCTION public.admin_change_password(target_user_id UUID, new_password TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    caller_role TEXT;
BEGIN
    SELECT role INTO caller_role FROM profiles WHERE id = auth.uid();
    IF caller_role NOT IN ('admin', 'manager') THEN
        RAISE EXCEPTION 'Permission denied: admin or manager role required';
    END IF;
    IF caller_role = 'manager' AND EXISTS (SELECT 1 FROM profiles WHERE id = target_user_id AND role = 'admin') THEN
        RAISE EXCEPTION 'Managers cannot change admin passwords';
    END IF;

    -- Update password directly (auth.users trigger handles hashing)
    UPDATE auth.users SET encrypted_password = new_password WHERE id = target_user_id;
END;
$$;

-- Grant EXECUTE to authenticated users (RLS inside functions checks actual permissions)
GRANT EXECUTE ON FUNCTION public.admin_get_all_users TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_change_password TO authenticated;

-- Refresh schema cache
SELECT pg_notify('pgrst', 'reload schema');
