import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
  console.log('Delete user function called:', req.method)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: securityHeaders });
  }

  try {
    // Verify this is a POST request
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    const { userId, currentUserId } = await req.json()
    console.log('Delete user request:', { userId, currentUserId })

    if (!userId) {
      throw new Error('User ID is required')
    }

    if (!currentUserId) {
      throw new Error('Current user ID is required')
    }

    // Prevent self-deletion
    if (userId === currentUserId) {
      throw new Error('Cannot delete your own account')
    }

    // Create Supabase admin client with service role key
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

    // Create regular client to verify permissions
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            Authorization: req.headers.get('Authorization') ?? ''
          }
        }
      }
    )

    // Verify current user can delete the target user using secure function
    const { data: canDelete, error: roleError } = await supabase
      .rpc('can_delete_user', { target_user_id: userId })

    if (roleError) {
      console.error('Error checking delete permissions:', roleError)
      throw new Error('Failed to verify permissions')
    }

    if (!canDelete) {
      throw new Error('Insufficient permissions. Only super admins can delete users.')
    }

    // Check if target user exists
    const { data: targetUser, error: userCheckError } = await supabaseAdmin.auth.admin.getUserById(userId)

    if (userCheckError || !targetUser.user) {
      console.error('User not found:', userCheckError)
      throw new Error('User not found')
    }

    console.log('Target user found:', targetUser.user.email)

    // Delete the user from Supabase Auth
    const { data: deleteResult, error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      throw new Error(`Failed to delete user: ${deleteError.message}`)
    }

    console.log('User deleted successfully:', deleteResult)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User deleted successfully',
        deletedUser: {
          id: userId,
          email: targetUser.user.email
        }
      }),
      {
        headers: { ...securityHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error: any) {
    console.error('Delete user error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      }),
      {
        headers: { ...securityHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})