import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface SecureProfileData {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  created_at: string;
  is_masked: boolean;
}

interface UseSecureProfileAccessResult {
  profiles: SecureProfileData[];
  loading: boolean;
  error: string | null;
  refreshProfiles: () => Promise<void>;
  accessLevel: 'none' | 'masked' | 'full';
  userRole: string | null;
}

export const useSecureProfileAccess = (): UseSecureProfileAccessResult => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<SecureProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessLevel, setAccessLevel] = useState<'none' | 'masked' | 'full'>('none');
  const [userRole, setUserRole] = useState<string | null>(null);

  const checkUserRole = useCallback(async () => {
    if (!user) return null;

    try {
      const { data: role, error } = await supabase.rpc('get_user_role_secure');
      if (error) throw error;
      
      setUserRole(role);
      
      // Determine access level based on role
      if (role === 'super_admin') {
        setAccessLevel('full');
      } else if (['admin', 'tech_support_admin'].includes(role)) {
        setAccessLevel('masked');
      } else {
        setAccessLevel('none');
      }
      
      return role;
    } catch (err) {
      console.error('Error checking user role:', err);
      setAccessLevel('none');
      return null;
    }
  }, [user]);

  const fetchSecureProfiles = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // First check user role
      const role = await checkUserRole();
      
      if (!role || !['admin', 'super_admin', 'tech_support_admin'].includes(role)) {
        setProfiles([]);
        setError('Insufficient privileges to access customer data');
        return;
      }

      // Use the secure function to get masked profiles
      const { data, error: profileError } = await supabase.rpc('get_masked_user_profiles');

      if (profileError) {
        throw profileError;
      }

      setProfiles(data || []);
      
      // Log successful access for audit trail
      await supabase.rpc('log_successful_auth', {
        auth_type: 'secure_profile_access',
        user_email: user.email
      });

    } catch (err: any) {
      console.error('Error fetching secure profiles:', err);
      setError(err.message || 'Failed to fetch customer profiles');
      
      // Show appropriate error message based on error type
      if (err.message?.includes('Access denied')) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view customer data",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to load customer profiles",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user, checkUserRole]);

  const refreshProfiles = useCallback(async () => {
    await fetchSecureProfiles();
  }, [fetchSecureProfiles]);

  useEffect(() => {
    fetchSecureProfiles();
  }, [fetchSecureProfiles]);

  return {
    profiles,
    loading,
    error,
    refreshProfiles,
    accessLevel,
    userRole
  };
};