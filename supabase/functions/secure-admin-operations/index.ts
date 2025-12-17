import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const securityHeaders = {
  ...corsHeaders,
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

// Error sanitization utility to prevent information leakage
const ERROR_MAP: Record<string, string> = {
  'duplicate key': 'This operation conflicts with existing data',
  'foreign key': 'Related data not found',
  'not found': 'Resource not available',
  'permission denied': 'You do not have permission to perform this action',
  'rate limit': 'Too many requests. Please try again later',
  'constraint': 'Data validation failed',
  'violation': 'Operation not allowed',
};

function sanitizeError(error: Error | string | unknown): string {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();
  
  for (const [pattern, safeMessage] of Object.entries(ERROR_MAP)) {
    if (lowerMessage.includes(pattern)) {
      return safeMessage;
    }
  }
  
  return 'Operation failed. Please try again or contact support.';
}

function logError(context: string, error: unknown): void {
  if (Deno.env.get('ENV') === 'development') {
    console.error(`[${context}]`, error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: securityHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header and extract the JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required', code: 'ERR_401' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const jwt = authHeader.replace('Bearer ', '')
    const { data: user, error: userError } = await supabaseClient.auth.getUser(jwt)
    
    if (userError || !user.user) {
      logError('auth_validation', userError);
      return new Response(
        JSON.stringify({ error: 'Authentication failed', code: 'ERR_401' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify admin role using secure function
    const { data: hasAdminRole, error: roleError } = await supabaseClient
      .rpc('check_user_has_role', { check_role: 'admin' })
    
    if (roleError || !hasAdminRole) {
      logError('role_check', roleError);
      return new Response(
        JSON.stringify({ error: 'Access denied', code: 'ERR_403' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { operation, ...operationData } = await req.json()

    switch (operation) {
      case 'get_filtered_profiles':
        return await getFilteredProfiles(supabaseAdmin, user.user.id, operationData)
      case 'assign_role':
        return await assignRole(supabaseAdmin, user.user.id, operationData)
      case 'revoke_role':
        return await revokeRole(supabaseAdmin, user.user.id, operationData)
      case 'delete_user':
        return await deleteUser(supabaseAdmin, user.user.id, operationData)
      case 'create_admin_account':
        return await createAdminAccount(supabaseAdmin, user.user.id, operationData)
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid operation', code: 'ERR_400' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    logError('secure_admin_operations', error);
    return new Response(
      JSON.stringify({ error: sanitizeError(error), code: 'ERR_400' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function getFilteredProfiles(supabaseAdmin: any, adminUserId: string, { limit = 50, offset = 0 }) {
  // Log the profile access attempt
  await logAdminAction(supabaseAdmin, adminUserId, 'profile_access', null, 'profiles', { limit, offset })
  
  // Get profiles with proper filtering and limits
  const { data: profiles, error } = await supabaseAdmin
    .from('profiles')
    .select(`
      id,
      user_id, 
      name,
      email,
      created_at,
      updated_at
    `)
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false })
  
  if (error) {
    logError('fetch_profiles', error);
    throw new Error('Failed to retrieve user profiles');
  }

  // Get user roles for each profile (only return role info, not full access)
  const userIds = profiles.map((p: any) => p.user_id)
  const { data: userRoles, error: rolesError } = await supabaseAdmin
    .from('user_roles')
    .select('user_id, role, is_active')
    .in('user_id', userIds)
    .eq('is_active', true)

  if (rolesError) {
    logError('fetch_roles', rolesError);
    // Silent error for non-critical operation
  }

  // Combine profiles with roles
  const profilesWithRoles = profiles.map((profile: any) => ({
    ...profile,
    roles: userRoles?.filter((ur: any) => ur.user_id === profile.user_id).map((ur: any) => ur.role) || []
  }))

  return new Response(
    JSON.stringify({ profiles: profilesWithRoles }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function assignRole(supabaseAdmin: any, adminUserId: string, { targetUserId, role, reason }: any) {
  // Verify super admin for super_admin assignments
  if (role === 'super_admin') {
    const { data: isSuperAdmin } = await supabaseAdmin
      .rpc('check_user_has_role', { check_role: 'super_admin' })
    
    if (!isSuperAdmin) {
      throw new Error('Access denied');
    }
  }

  // For admin roles, validate email domain
  if (['admin', 'super_admin', 'tech_support_admin'].includes(role)) {
    // Get the target user's email
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(targetUserId);
    if (userError) {
      logError('get_user_data', userError);
      throw new Error('User validation failed');
    }
    
    // Check if email domain is valid for admin roles
    const { data: isValidDomain, error: validationError } = await supabaseAdmin.rpc('validate_email_domain_for_role', {
      email_address: userData.user.email,
      user_role: role
    });
    
    if (validationError) {
      logError('email_domain_validation', validationError);
      throw new Error('Validation failed');
    }
    
    if (!isValidDomain) {
      throw new Error('Admin roles require an authorized email domain');
    }
  }

  // Use the secure function
  const { data, error } = await supabaseAdmin
    .rpc('assign_user_role', {
      p_target_user_id: targetUserId,
      p_new_role: role,
      p_reason: reason,
      p_mfa_verified: false
    })

  if (error) {
    logError('assign_role', error);
    throw new Error('Role assignment failed');
  }

  await logAdminAction(supabaseAdmin, adminUserId, 'role_assigned', targetUserId, 'user_roles', { role, reason })

  return new Response(
    JSON.stringify({ success: true }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function revokeRole(supabaseAdmin: any, adminUserId: string, { targetUserId, reason }: any) {
  const { data, error } = await supabaseAdmin
    .rpc('revoke_user_role', {
      p_target_user_id: targetUserId,
      p_reason: reason,
      p_mfa_verified: false
    })

  if (error) {
    logError('revoke_role', error);
    throw new Error('Role revocation failed');
  }

  await logAdminAction(supabaseAdmin, adminUserId, 'role_revoked', targetUserId, 'user_roles', { reason })

  return new Response(
    JSON.stringify({ success: true }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function deleteUser(supabaseAdmin: any, adminUserId: string, { targetUserId, reason }: any) {
  // Prevent self-deletion
  if (targetUserId === adminUserId) {
    throw new Error('Cannot delete your own account');
  }

  // Use the secure delete-user function
  const { data, error } = await supabaseAdmin.functions.invoke('delete-user', {
    body: { userId: targetUserId, currentUserId: adminUserId }
  })

  if (error) {
    logError('delete_user', error);
    throw new Error('User deletion failed');
  }

  await logAdminAction(supabaseAdmin, adminUserId, 'user_deleted', targetUserId, 'auth.users', { reason })

  return new Response(
    JSON.stringify({ success: true }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function createAdminAccount(supabaseAdmin: any, requestingAdminId: string, { email, password, fullName, role }: any) {
  // Validate email domain for admin roles
  if (role && role !== 'trainee') {
    const { data: isValidDomain, error: domainError } = await supabaseAdmin.rpc('validate_email_domain_for_role', {
      email_address: email,
      user_role: role
    });

    if (domainError) {
      logError('email_domain_validation', domainError);
      throw new Error('Validation failed');
    }

    if (!isValidDomain) {
      throw new Error('Admin roles require an authorized email domain');
    }
  }

  // Verify requesting user has appropriate permissions
  if (role === 'super_admin') {
    const { data: isSuperAdmin } = await supabaseAdmin
      .rpc('check_user_has_role', { check_role: 'super_admin' })
    
    if (!isSuperAdmin) {
      throw new Error('Access denied');
    }
  }

  // Create the user account
  const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    user_metadata: { full_name: fullName },
    email_confirm: true
  })

  if (createError) {
    logError('create_user', createError);
    throw new Error('Account creation failed');
  }

  // Assign the role using the secure function (this will be validated by the database trigger)
  const { error: roleError } = await supabaseAdmin
    .rpc('assign_user_role', {
      p_target_user_id: newUser.user.id,
      p_new_role: role,
      p_reason: 'Admin account creation',
      p_mfa_verified: false
    })

  if (roleError) {
    // Clean up the user if role assignment fails
    await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
    logError('assign_role_new_user', roleError);
    throw new Error('Account setup failed');
  }

  await logAdminAction(supabaseAdmin, requestingAdminId, 'admin_account_created', newUser.user.id, 'auth.users', { 
    email, 
    role, 
    fullName,
    email_domain_validated: true
  })

  return new Response(
    JSON.stringify({ success: true, userId: newUser.user.id }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function logAdminAction(supabaseAdmin: any, adminUserId: string, action: string, targetUserId: string | null, targetResource: string, details: any) {
  try {
    await supabaseAdmin.rpc('log_admin_action', {
      p_action: action,
      p_target_user_id: targetUserId,
      p_target_resource: targetResource,
      p_details: details
    })
  } catch (error) {
    logError('log_admin_action', error);
    // Silent error - logging failure shouldn't break operations
  }
}
