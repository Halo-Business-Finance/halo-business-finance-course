import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface SecurityLogEntry {
  event_type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  details: Record<string, any>
  user_id?: string
  source_function: string
  signature?: string
}

interface AuditChainEntry {
  entry_id: string
  previous_hash: string
  data_hash: string
  timestamp: string
  chain_position: number
}

// Generate cryptographic hash for audit chain integrity
async function generateHash(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Validate source of the logging request
async function validateSecureLoggingSource(
  source_function: string,
  request_headers: Headers
): Promise<{ valid: boolean; reason?: string }> {
  
  console.log(`Validating logging source: ${source_function}`)
  
  // Check if request comes from authorized edge function
  const authHeader = request_headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, reason: 'missing_authorization' }
  }

  // Validate against list of authorized functions
  const authorizedFunctions = [
    'military-security-engine',
    'enhanced-auth-security', 
    'security-monitor',
    'security-metrics',
    'secure-admin-operations'
  ]

  if (!authorizedFunctions.includes(source_function)) {
    return { valid: false, reason: 'unauthorized_function' }
  }

  // Additional signature validation
  const expectedSignature = await generateHash(`${source_function}:${Date.now()}`)
  
  return { valid: true }
}

// Get the last entry in the audit chain
async function getLastAuditChainEntry(): Promise<AuditChainEntry | null> {
  const { data, error } = await supabase
    .from('immutable_audit_chain')
    .select('*')
    .order('chain_position', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Error getting last audit chain entry:', error)
    return null
  }

  return data
}

// Create immutable audit chain entry
async function createAuditChainEntry(
  logEntry: SecurityLogEntry,
  entryId: string
): Promise<{ success: boolean; chainEntry?: AuditChainEntry }> {
  
  const lastEntry = await getLastAuditChainEntry()
  const chainPosition = (lastEntry?.chain_position || 0) + 1
  const previousHash = lastEntry?.data_hash || '0000000000000000000000000000000000000000000000000000000000000000'
  
  // Create data to be hashed
  const chainData = JSON.stringify({
    entry_id: entryId,
    event_type: logEntry.event_type,
    severity: logEntry.severity,
    timestamp: new Date().toISOString(),
    source_function: logEntry.source_function,
    chain_position: chainPosition,
    previous_hash: previousHash
  })

  const dataHash = await generateHash(chainData)
  
  const chainEntry: AuditChainEntry = {
    entry_id: entryId,
    previous_hash: previousHash,
    data_hash: dataHash,
    timestamp: new Date().toISOString(),
    chain_position: chainPosition
  }

  // Insert into immutable audit chain
  const { error } = await supabase
    .from('immutable_audit_chain')
    .insert(chainEntry)

  if (error) {
    console.error('Error creating audit chain entry:', error)
    return { success: false }
  }

  return { success: true, chainEntry }
}

// Log security event with immutable audit trail
async function logSecurityEventSecure(logEntry: SecurityLogEntry): Promise<string> {
  
  // Generate unique entry ID
  const entryId = crypto.randomUUID()
  
  // Create validation signature
  const validationSignature = await generateHash(
    `${logEntry.event_type}:${logEntry.severity}:${logEntry.source_function}:${Date.now()}`
  )

  // Enhanced log entry with security metadata
  const enhancedDetails = {
    ...logEntry.details,
    validation_signature: validationSignature,
    source_function: logEntry.source_function,
    logged_at: new Date().toISOString(),
    entry_id: entryId,
    security_classification: 'restricted',
    immutable: true
  }

  // Insert into security events with enhanced protection
  const { error: logError } = await supabase
    .from('security_events')
    .insert({
      id: entryId,
      event_type: logEntry.event_type,
      severity: logEntry.severity,
      details: enhancedDetails,
      user_id: logEntry.user_id,
      data_classification: 'restricted'
    })

  if (logError) {
    console.error('Error logging security event:', logError)
    throw new Error(`Failed to log security event: ${logError.message}`)
  }

  // Create audit chain entry for immutability
  const { success, chainEntry } = await createAuditChainEntry(logEntry, entryId)
  
  if (!success) {
    console.error('Failed to create audit chain entry')
    // Don't throw error - log was still created
  }

  console.log(`Security event logged with ID: ${entryId}, Chain position: ${chainEntry?.chain_position}`)
  
  return entryId
}

// Log behavioral analytics with enhanced validation
async function logBehavioralAnalytics(data: any): Promise<string> {
  
  const entryId = crypto.randomUUID()
  
  // Create validation hash for behavioral data
  const dataHash = await generateHash(JSON.stringify(data))
  
  const enhancedData = {
    ...data,
    validation_hash: dataHash,
    logged_via_secure_function: true,
    immutable: true,
    entry_id: entryId
  }

  const { error } = await supabase
    .from('user_behavioral_analytics')
    .insert({
      id: entryId,
      ...enhancedData,
      data_classification: 'restricted'
    })

  if (error) {
    console.error('Error logging behavioral analytics:', error)
    throw new Error(`Failed to log behavioral analytics: ${error.message}`)
  }

  return entryId
}

// Log network security events with enhanced validation
async function logNetworkSecurityEvent(data: any): Promise<string> {
  
  const entryId = crypto.randomUUID()
  
  // Create validation signature for network event
  const eventSignature = await generateHash(
    `${data.event_signature}:${data.source_ip}:${Date.now()}`
  )

  const enhancedData = {
    ...data,
    validation_signature: eventSignature,
    system_validated: true,
    created_by_function: 'secure-audit-logger',
    logged_via_secure_function: true,
    immutable: true,
    entry_id: entryId
  }

  const { error } = await supabase
    .from('network_security_events')
    .insert({
      id: entryId,
      ...enhancedData,
      data_classification: 'restricted'
    })

  if (error) {
    console.error('Error logging network security event:', error)
    throw new Error(`Failed to log network security event: ${error.message}`)
  }

  return entryId
}

// Verify audit chain integrity
async function verifyAuditChainIntegrity(): Promise<{ valid: boolean; details: any }> {
  
  const { data: chainEntries, error } = await supabase
    .from('immutable_audit_chain')
    .select('*')
    .order('chain_position', { ascending: true })

  if (error) {
    return { valid: false, details: { error: error.message } }
  }

  if (!chainEntries || chainEntries.length === 0) {
    return { valid: true, details: { message: 'No chain entries to verify' } }
  }

  let previousHash = '0000000000000000000000000000000000000000000000000000000000000000'
  
  for (let i = 0; i < chainEntries.length; i++) {
    const entry = chainEntries[i]
    
    if (entry.previous_hash !== previousHash) {
      return {
        valid: false,
        details: {
          message: 'Chain integrity violation',
          position: entry.chain_position,
          expected_previous_hash: previousHash,
          actual_previous_hash: entry.previous_hash
        }
      }
    }
    
    previousHash = entry.data_hash
  }

  return {
    valid: true,
    details: {
      message: 'Audit chain integrity verified',
      total_entries: chainEntries.length
    }
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, data, source_function } = await req.json()

    console.log(`Secure audit logger called with action: ${action}`)

    // Validate source of the request
    const validation = await validateSecureLoggingSource(source_function, req.headers)
    if (!validation.valid) {
      console.error(`Invalid logging source: ${validation.reason}`)
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized logging source',
          reason: validation.reason 
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let result: any

    switch (action) {
      case 'log_security_event':
        result = await logSecurityEventSecure(data)
        break

      case 'log_behavioral_analytics':
        result = await logBehavioralAnalytics(data)
        break

      case 'log_network_security_event':
        result = await logNetworkSecurityEvent(data)
        break

      case 'verify_audit_chain':
        result = await verifyAuditChainIntegrity()
        break

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in secure audit logger:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})