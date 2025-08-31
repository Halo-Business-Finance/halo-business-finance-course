-- Move all course-related images to Course Media folder
UPDATE cms_media 
SET 
  folder_path = '/Course Media',
  storage_path = REPLACE(storage_path, 'imported/', 'Course Media/'),
  public_url = REPLACE(public_url, 'imported/', 'Course%20Media/'),
  updated_at = now()
WHERE 
  -- Course-specific images
  original_name LIKE '%course%' 
  OR original_name LIKE '%professional%' 
  OR original_name LIKE '%credit%' 
  OR original_name LIKE '%lending%' 
  OR original_name LIKE '%sba%'
  OR original_name LIKE '%risk-%'
  OR original_name LIKE '%finance-%'
  OR original_name LIKE '%commercial-%'
  -- Add tags to identify these as course media
  OR (tags && ARRAY['imported', 'existing-content'] 
      AND (
        original_name ~* 'adaptive|analytics|digital|fintech|gamification|microlearning|specialist|analyst|officer|banker|advisor|manager'
      ));

-- Update storage objects to match new folder structure
-- Note: This will need to be done in storage as well through the storage API