-- Create a function to auto-enroll users in the course when they sign up
CREATE OR REPLACE FUNCTION auto_enroll_in_course()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-enroll new users in the main course
  INSERT INTO course_enrollments (user_id, course_id, status)
  VALUES (NEW.id, 'halo-launch-pad-learn', 'active');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-enroll users when they create a profile
CREATE OR REPLACE TRIGGER auto_enroll_user_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_enroll_in_course();

-- Also enroll existing users who don't have enrollments
INSERT INTO course_enrollments (user_id, course_id, status)
SELECT p.user_id, 'halo-launch-pad-learn', 'active'
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM course_enrollments ce 
  WHERE ce.user_id = p.user_id 
  AND ce.course_id = 'halo-launch-pad-learn'
);

-- Make sure RLS policies allow users to see content when enrolled
DROP POLICY IF EXISTS "Enrolled users and admins can view articles" ON course_articles;
CREATE POLICY "Enrolled users and admins can view articles" ON course_articles
FOR SELECT USING (
  is_admin(auth.uid()) OR 
  (is_published = true AND EXISTS (
    SELECT 1 FROM course_enrollments 
    WHERE user_id = auth.uid() 
    AND course_id = 'halo-launch-pad-learn' 
    AND status = 'active'
  ))
);

DROP POLICY IF EXISTS "Enrolled users and admins can view assessments" ON course_assessments;
CREATE POLICY "Enrolled users and admins can view assessments" ON course_assessments  
FOR SELECT USING (
  is_admin(auth.uid()) OR EXISTS (
    SELECT 1 FROM course_enrollments 
    WHERE user_id = auth.uid() 
    AND course_id = 'halo-launch-pad-learn' 
    AND status = 'active'
  )
);

DROP POLICY IF EXISTS "Enrolled users and admins can view documents" ON course_documents;
CREATE POLICY "Enrolled users and admins can view documents" ON course_documents
FOR SELECT USING (
  is_admin(auth.uid()) OR EXISTS (
    SELECT 1 FROM course_enrollments 
    WHERE user_id = auth.uid() 
    AND course_id = 'halo-launch-pad-learn' 
    AND status = 'active'
  )
);