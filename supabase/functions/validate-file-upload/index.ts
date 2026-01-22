import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { 
  handleCorsPreflightRequest, 
  createSecureJsonResponse, 
  createSecureErrorResponse,
  getSecurityHeaders,
  validateOrigin
} from '../_shared/corsHelper.ts';
import { validateInput, fileUploadSchema } from '../_shared/inputValidation.ts';

// Allowed MIME types with file extensions
const ALLOWED_TYPES: Record<string, string[]> = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/gif': ['gif'],
  'image/webp': ['webp'],
  'application/pdf': ['pdf'],
  'video/mp4': ['mp4'],
  'video/webm': ['webm'],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB default

// Sanitize error messages to prevent information leakage
function sanitizeError(error: unknown): string {
  // Log detailed error server-side for debugging
  if (Deno.env.get('ENV') === 'development') {
    console.error('[validate-file-upload]', error);
  }
  
  // Return generic message to client
  return 'File validation failed. Please try again.';
}

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  // Validate origin
  const originError = validateOrigin(req);
  if (originError) return originError;

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    // ===== AUTHENTICATION CHECK =====
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return createSecureErrorResponse(req, 'Authentication required', 401, 'ERR_401');
    }

    // Verify the user's JWT token
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return createSecureErrorResponse(req, 'Authentication failed', 401, 'ERR_401');
    }
    // ===== END AUTHENTICATION CHECK =====

    // Parse and validate input with schema
    const requestBody = await req.json();
    const validation = validateInput<{ 
      fileName: string; 
      fileSize: number; 
      mimeType: string; 
      maxSize?: number 
    }>(requestBody, fileUploadSchema);

    if (!validation.success) {
      return createSecureErrorResponse(
        req, 
        validation.errors?.join(', ') || 'Invalid input', 
        400, 
        'ERR_VALIDATION'
      );
    }

    const { fileName, fileSize, mimeType, maxSize = MAX_FILE_SIZE } = validation.data!;

    // Validate file size
    if (fileSize > maxSize) {
      return createSecureErrorResponse(
        req,
        `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
        400,
        'ERR_FILE_TOO_LARGE'
      );
    }

    // Validate MIME type
    if (!ALLOWED_TYPES[mimeType]) {
      return createSecureErrorResponse(
        req,
        'File type not allowed. Please upload an image, PDF, or video file.',
        400,
        'ERR_INVALID_TYPE'
      );
    }

    // Validate file extension matches MIME type
    const fileExt = fileName.split('.').pop()?.toLowerCase();
    if (!fileExt || !ALLOWED_TYPES[mimeType].includes(fileExt)) {
      return createSecureErrorResponse(
        req,
        'File extension does not match file type',
        400,
        'ERR_TYPE_MISMATCH'
      );
    }

    // Sanitize filename
    const sanitizedName = fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .substring(0, 255);

    return createSecureJsonResponse(req, { 
      valid: true, 
      sanitizedName,
      message: 'File validation passed' 
    });

  } catch (error) {
    if (Deno.env.get('ENV') === 'development') {
      console.error('[validate-file-upload]', error);
    }
    return createSecureErrorResponse(req, sanitizeError(error), 500, 'ERR_500');
  }
});
