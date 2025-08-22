-- Auto-enroll the current user in the Halo Launch Pad Learn course
INSERT INTO course_enrollments (user_id, course_id, status)
VALUES (auth.uid(), 'halo-launch-pad-learn', 'active')
ON CONFLICT (user_id, course_id) DO NOTHING;