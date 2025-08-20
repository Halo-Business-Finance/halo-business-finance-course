-- Drop the overly restrictive unique constraint that only allows one active role per user
-- The existing user_roles_user_id_role_key constraint already prevents duplicate role assignments
DROP INDEX IF EXISTS unique_active_role_per_user_idx;

-- This allows users to have multiple different active roles while still preventing duplicate role assignments