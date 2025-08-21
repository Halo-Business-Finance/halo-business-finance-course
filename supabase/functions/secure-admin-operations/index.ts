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
      throw new Error('Missing authorization header')
    }

    const jwt = authHeader.replace('Bearer ', '')
    const { data: user, error: userError } = await supabaseClient.auth.getUser(jwt)
    
    if (userError || !user.user) {
      throw new Error('Invalid authentication token')
    }

    // Verify admin role using secure function
    const { data: hasAdminRole, error: roleError } = await supabaseClient
      .rpc('check_user_has_role', { check_role: 'admin' })
    
    if (roleError || !hasAdminRole) {
      throw new Error('Insufficient permissions')
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
        throw new Error('Invalid operation')
    }

  } catch (error) {
    console.error('Error in secure admin operations:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
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
    throw new Error(`Failed to fetch profiles: ${error.message}`)
  }

  // Get user roles for each profile (only return role info, not full access)
  const userIds = profiles.map(p => p.user_id)
  const { data: userRoles, error: rolesError } = await supabaseAdmin
    .from('user_roles')
    .select('user_id, role, is_active')
    .in('user_id', userIds)
    .eq('is_active', true)

  if (rolesError) {
    console.error('Error fetching roles:', rolesError)
  }

  // Combine profiles with roles
  const profilesWithRoles = profiles.map(profile => ({
    ...profile,
    roles: userRoles?.filter(ur => ur.user_id === profile.user_id).map(ur => ur.role) || []
  }))

  return new Response(
    JSON.stringify({ profiles: profilesWithRoles }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function assignRole(supabaseAdmin: any, adminUserId: string, { targetUserId, role, reason }) {
  // Verify super admin for super_admin assignments
  if (role === 'super_admin') {
    const { data: isSuperAdmin } = await supabaseAdmin
      .rpc('check_user_has_role', { check_role: 'super_admin' })
    
    if (!isSuperAdmin) {
      throw new Error('Only super admins can assign super admin roles')
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
    throw new Error(`Failed to assign role: ${error.message}`)
  }

  await logAdminAction(supabaseAdmin, adminUserId, 'role_assigned', targetUserId, 'user_roles', { role, reason })

  return new Response(
    JSON.stringify({ success: true }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function revokeRole(supabaseAdmin: any, adminUserId: string, { targetUserId, reason }) {
  const { data, error } = await supabaseAdmin
    .rpc('revoke_user_role', {
      p_target_user_id: targetUserId,
      p_reason: reason,
      p_mfa_verified: false
    })

  if (error) {
    throw new Error(`Failed to revoke role: ${error.message}`)
  }

  await logAdminAction(supabaseAdmin, adminUserId, 'role_revoked', targetUserId, 'user_roles', { reason })

  return new Response(
    JSON.stringify({ success: true }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function deleteUser(supabaseAdmin: any, adminUserId: string, { targetUserId, reason }) {
  // Prevent self-deletion
  if (targetUserId === adminUserId) {
    throw new Error('Cannot delete your own account')
  }

  // Use the secure delete-user function
  const { data, error } = await supabaseAdmin.functions.invoke('delete-user', {
    body: { userId: targetUserId, currentUserId: adminUserId }
  })

  if (error) {
    throw new Error(`Failed to delete user: ${error.message}`)
  }

  await logAdminAction(supabaseAdmin, adminUserId, 'user_deleted', targetUserId, 'auth.users', { reason })

  return new Response(
    JSON.stringify({ success: true }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function createAdminAccount(supabaseAdmin: any, requestingAdminId: string, { email, password, fullName, role }) {
  // Verify requesting user has appropriate permissions
  if (role === 'super_admin') {
    const { data: isSuperAdmin } = await supabaseAdmin
      .rpc('check_user_has_role', { check_role: 'super_admin' })
    
    if (!isSuperAdmin) {
      throw new Error('Only super admins can create super admin accounts')
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
    throw new Error(`Failed to create user: ${createError.message}`)
  }

  // Assign the role using the secure function
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
    throw new Error(`Failed to assign role: ${roleError.message}`)
  }

  await logAdminAction(supabaseAdmin, requestingAdminId, 'admin_account_created', newUser.user.id, 'auth.users', { 
    email, 
    role, 
    fullName 
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
    console.error('Failed to log admin action:', error)
  }
}