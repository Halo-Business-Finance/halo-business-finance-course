-- Temporarily make course content accessible to all authenticated users
-- until proper enrollment is working

DROP POLICY IF EXISTS "Enrolled users and admins can view articles" ON course_articles;
CREATE POLICY "Authenticated users can view articles" ON course_articles
FOR SELECT USING (auth.uid() IS NOT NULL AND is_published = true);

DROP POLICY IF EXISTS "Enrolled users and admins can view assessments" ON course_assessments;
CREATE POLICY "Authenticated users can view assessments" ON course_assessments  
FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Enrolled users and admins can view documents" ON course_documents;
CREATE POLICY "Authenticated users can view documents" ON course_documents
FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Enrolled users and admins can view videos" ON course_videos;
CREATE POLICY "Authenticated users can view videos" ON course_videos
FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);

DROP POLICY IF EXISTS "Enrolled users and admins can view modules" ON course_modules;
CREATE POLICY "Authenticated users can view modules" ON course_modules
FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);