import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileName, fileSize, mimeType, maxSize = MAX_FILE_SIZE } = await req.json();

    // Validate file size
    if (fileSize > maxSize) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate MIME type
    if (!ALLOWED_TYPES[mimeType]) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'File type not allowed. Please upload an image, PDF, or video file.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate file extension matches MIME type
    const fileExt = fileName.split('.').pop()?.toLowerCase();
    if (!fileExt || !ALLOWED_TYPES[mimeType].includes(fileExt)) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'File extension does not match file type' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Sanitize filename
    const sanitizedName = fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .substring(0, 255);

    return new Response(
      JSON.stringify({ 
        valid: true, 
        sanitizedName,
        message: 'File validation passed' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ valid: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});