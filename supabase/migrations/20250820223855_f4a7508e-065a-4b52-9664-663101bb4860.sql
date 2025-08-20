-- WARNING: This will delete ALL data from the application
-- This operation cannot be undone!

-- Disable triggers temporarily to avoid cascading issues
SET session_replication_role = replica;

-- Clear all main data tables (in dependency order)
TRUNCATE TABLE public.case_comments CASCADE;
TRUNCATE TABLE public.cases CASCADE;
TRUNCATE TABLE public.additional_borrowers CASCADE;
TRUNCATE TABLE public.contact_encrypted_fields CASCADE;
TRUNCATE TABLE public.contact_entities CASCADE;
TRUNCATE TABLE public.clients CASCADE;
TRUNCATE TABLE public.community_members CASCADE;
TRUNCATE TABLE public.communities CASCADE;
TRUNCATE TABLE public.custom_records CASCADE;
TRUNCATE TABLE public.custom_fields CASCADE;
TRUNCATE TABLE public.custom_objects CASCADE;
TRUNCATE TABLE public.approval_steps CASCADE;
TRUNCATE TABLE public.approval_requests CASCADE;
TRUNCATE TABLE public.approval_processes CASCADE;
TRUNCATE TABLE public.compliance_reports CASCADE;
TRUNCATE TABLE public.data_import_jobs CASCADE;
TRUNCATE TABLE public.document_analytics CASCADE;
TRUNCATE TABLE public.blockchain_records CASCADE;
TRUNCATE TABLE public.data_integrity_checks CASCADE;

-- Clear user-related tables
TRUNCATE TABLE public.profiles CASCADE;
TRUNCATE TABLE public.user_roles CASCADE;
TRUNCATE TABLE public.device_fingerprints CASCADE;
TRUNCATE TABLE public.active_sessions CASCADE;

-- Clear security and audit tables
TRUNCATE TABLE public.security_events CASCADE;
TRUNCATE TABLE public.audit_logs CASCADE;
TRUNCATE TABLE public.account_lockouts CASCADE;
TRUNCATE TABLE public.ai_bot_activity CASCADE;
TRUNCATE TABLE public.ai_bot_alerts CASCADE;
TRUNCATE TABLE public.ai_security_bots CASCADE;
TRUNCATE TABLE public.api_request_analytics CASCADE;

-- Clear any remaining tables
TRUNCATE TABLE public.threat_incidents CASCADE;
TRUNCATE TABLE public.emergency_events CASCADE;
TRUNCATE TABLE public.emergency_shutdown CASCADE;
TRUNCATE TABLE public.sensitive_data_permissions CASCADE;
TRUNCATE TABLE public.sensitive_data_access_logs CASCADE;
TRUNCATE TABLE public.secure_session_data CASCADE;
TRUNCATE TABLE public.failed_login_attempts CASCADE;
TRUNCATE TABLE public.immutable_audit_trail CASCADE;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Reset any sequences to start from 1 (if any exist)
-- This ensures IDs start from 1 again for any integer sequences

-- Clear auth.users table (this will delete all user accounts)
DELETE FROM auth.users;

COMMENT ON SCHEMA public IS 'Database cleared - all user data removed';