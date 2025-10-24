-- =====================================================
-- CRITICAL SECURITY FIX: Restore Proper Authorization
-- =====================================================

-- Step 1: Fix the is_admin() function to properly check roles
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = COALESCE(check_user_id, auth.uid())
      AND role IN ('admin', 'super_admin')
      AND is_active = true
  );
$$;

-- Step 2: Create is_super_admin helper function
CREATE OR REPLACE FUNCTION public.is_super_admin(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = COALESCE(check_user_id, auth.uid())
      AND role = 'super_admin'
      AND is_active = true
  );
$$;

-- Step 3: Drop ALL existing policies on user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_management_v2" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_user_view" ON public.user_roles;

-- Step 4: Drop ALL existing policies on profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_override_v2" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_view" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;

-- Step 5: Create NEW proper RLS policies for user_roles table
CREATE POLICY "user_roles_self_view_v3"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "user_roles_admin_view_v3"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "user_roles_super_admin_manage_v3"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

-- Step 6: Create NEW proper RLS policies for profiles table
CREATE POLICY "profiles_self_view_v3"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "profiles_self_update_v3"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_admin_view_v3"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "profiles_super_admin_manage_v3"
ON public.profiles
FOR ALL
TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

-- Step 7: Fix storage policies for course-content
DROP POLICY IF EXISTS "Admins can manage course content" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload course content" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update course content" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete course content" ON storage.objects;
DROP POLICY IF EXISTS "Enrolled users can view course content" ON storage.objects;

CREATE POLICY "course_content_admin_upload_v3"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-content' AND
  public.is_admin(auth.uid())
);

CREATE POLICY "course_content_admin_update_v3"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'course-content' AND
  public.is_admin(auth.uid())
);

CREATE POLICY "course_content_admin_delete_v3"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'course-content' AND
  public.is_admin(auth.uid())
);

CREATE POLICY "course_content_enrolled_view_v3"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'course-content' AND
  (
    public.is_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.course_enrollments
      WHERE user_id = auth.uid()
        AND status = 'active'
    )
  )
);

-- Step 8: Fix storage policies for cms-media
DROP POLICY IF EXISTS "Admins can manage CMS media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload CMS media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update CMS media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete CMS media" ON storage.objects;
DROP POLICY IF EXISTS "Public can view CMS media" ON storage.objects;

CREATE POLICY "cms_media_admin_upload_v3"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cms-media' AND
  public.is_admin(auth.uid())
);

CREATE POLICY "cms_media_admin_update_v3"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'cms-media' AND
  public.is_admin(auth.uid())
);

CREATE POLICY "cms_media_admin_delete_v3"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'cms-media' AND
  public.is_admin(auth.uid())
);

CREATE POLICY "cms_media_public_view_v3"
ON storage.objects
FOR SELECT
USING (bucket_id = 'cms-media');

-- Step 9: Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;