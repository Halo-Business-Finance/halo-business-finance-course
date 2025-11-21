import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all course-related media that needs to be moved
    const { data: mediaToMove, error: fetchError } = await supabase
      .from('cms_media')
      .select('*')
      .eq('folder_path', '/Course Media')
      .like('storage_path', 'imported/%')

    if (fetchError) {
      throw fetchError
    }

    const results = []

    for (const media of mediaToMove || []) {
      try {
        const oldPath = media.storage_path
        const newPath = oldPath.replace('imported/', 'Course Media/')
        
        // Copy file to new location
        const { data: copyData, error: copyError } = await supabase.storage
          .from('cms-media')
          .copy(oldPath, newPath)

        if (copyError) {
          if (Deno.env.get('ENV') === 'development') {
            console.error(`Failed to copy ${oldPath} to ${newPath}:`, copyError);
          }
          results.push({ id: media.id, status: 'copy_failed', error: copyError.message })
          continue
        }

        // Delete old file
        const { error: deleteError } = await supabase.storage
          .from('cms-media')
          .remove([oldPath])

        if (deleteError) {
          if (Deno.env.get('ENV') === 'development') {
            console.error(`Failed to delete ${oldPath}:`, deleteError);
          }
          // File was copied but not deleted, update path anyway
        }

        // Update database record
        const { error: updateError } = await supabase
          .from('cms_media')
          .update({
            storage_path: newPath,
            public_url: `https://kagwfntxlgzrcngysmlt.supabase.co/storage/v1/object/public/cms-media/${encodeURIComponent(newPath)}`,
            updated_at: new Date().toISOString()
          })
          .eq('id', media.id)

        if (updateError) {
          if (Deno.env.get('ENV') === 'development') {
            console.error(`Failed to update database for ${media.id}:`, updateError);
          }
          results.push({ id: media.id, status: 'db_update_failed', error: updateError.message })
        } else {
          results.push({ id: media.id, status: 'success', oldPath, newPath })
        }

      } catch (error) {
        if (Deno.env.get('ENV') === 'development') {
          console.error(`Error processing ${media.id}:`, error);
        }
        results.push({ id: media.id, status: 'error', error: error.message })
      }
    }

    return new Response(
      JSON.stringify({ success: true, results, moved: results.filter(r => r.status === 'success').length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    if (Deno.env.get('ENV') === 'development') {
      console.error('Function error:', error);
    }
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})