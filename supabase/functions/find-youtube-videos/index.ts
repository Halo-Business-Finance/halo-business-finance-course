import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

    if (!YOUTUBE_API_KEY) {
      throw new Error('YOUTUBE_API_KEY not configured');
    }

    // ===== AUTHENTICATION CHECK =====
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required', success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Verify the user's JWT token
    const authClient = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired authentication token', success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Check if user is admin
    const { data: userRole } = await authClient.rpc('get_user_role');
    if (!['admin', 'super_admin', 'instructor'].includes(userRole)) {
      return new Response(
        JSON.stringify({ error: 'Admin privileges required', success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }
    // ===== END AUTHENTICATION CHECK =====

    // Get optional course_id filter and limit from request body
    const body = await req.json().catch(() => ({}));
    const courseIdFilter = body?.course_id;
    const limit = body?.limit || null;

    if (Deno.env.get('ENV') === 'development') {
      console.log('Starting YouTube video search for course modules...', {
        courseIdFilter,
        limit,
        requestedBy: user.id
      });
    }

    // Create Supabase client with service role for admin access
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Build query for course modules
    let query = supabase
      .from('course_content_modules')
      .select('id, title, description, course_id')
      .eq('is_active', true)
      .order('order_index');

    // Apply course filter if provided
    if (courseIdFilter) {
      query = query.eq('course_id', courseIdFilter);
    }

    // Apply limit if provided
    if (limit) {
      query = query.limit(limit);
    }

    const { data: modules, error: modulesError } = await query;

    if (modulesError) {
      if (Deno.env.get('ENV') === 'development') {
        console.error('Error fetching modules:', modulesError);
      }
      throw modulesError;
    }

    if (Deno.env.get('ENV') === 'development') {
      console.log(`Found ${modules?.length || 0} modules to process`);
    }

    const results = [];

    // Process each module
    for (const module of modules || []) {
      try {
        if (Deno.env.get('ENV') === 'development') {
          console.log(`Searching YouTube for: ${module.title}`);
        }

        // Search YouTube for the module title + "business finance lending"
        const searchQuery = encodeURIComponent(`${module.title} business finance commercial lending tutorial`);
        const youtubeSearchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${searchQuery}&type=video&key=${YOUTUBE_API_KEY}`;

        const youtubeResponse = await fetch(youtubeSearchUrl);
        
        if (!youtubeResponse.ok) {
          if (Deno.env.get('ENV') === 'development') {
            console.error(`YouTube API error for "${module.title}":`, await youtubeResponse.text());
          }
          results.push({
            module_id: module.id,
            title: module.title,
            status: 'error',
            error: 'YouTube API request failed'
          });
          continue;
        }

        const youtubeData = await youtubeResponse.json();

        if (!youtubeData.items || youtubeData.items.length === 0) {
          if (Deno.env.get('ENV') === 'development') {
            console.log(`No YouTube video found for: ${module.title}`);
          }
          results.push({
            module_id: module.id,
            title: module.title,
            status: 'no_results'
          });
          continue;
        }

        const video = youtubeData.items[0];
        const videoId = video.id.videoId;
        const videoTitle = video.snippet.title;
        const videoDescription = video.snippet.description;
        const thumbnailUrl = video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url;

        if (Deno.env.get('ENV') === 'development') {
          console.log(`Found video: ${videoTitle} (${videoId})`);
        }

        // Check if video already exists for this module
        const { data: existingVideo } = await supabase
          .from('course_videos')
          .select('id')
          .eq('module_id', module.id)
          .single();

        if (existingVideo) {
          // Update existing video
          const { error: updateError } = await supabase
            .from('course_videos')
            .update({
              youtube_id: videoId,
              video_url: `https://www.youtube.com/watch?v=${videoId}`,
              title: videoTitle,
              description: videoDescription,
              thumbnail_url: thumbnailUrl,
              video_type: 'youtube',
              is_active: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingVideo.id);

          if (updateError) {
            if (Deno.env.get('ENV') === 'development') {
              console.error(`Error updating video for ${module.title}:`, updateError);
            }
            results.push({
              module_id: module.id,
              title: module.title,
              status: 'error',
              error: updateError.message
            });
          } else {
            results.push({
              module_id: module.id,
              title: module.title,
              video_id: videoId,
              video_title: videoTitle,
              status: 'updated'
            });
          }
        } else {
          // Insert new video
          const { error: insertError } = await supabase
            .from('course_videos')
            .insert({
              module_id: module.id,
              youtube_id: videoId,
              video_url: `https://www.youtube.com/watch?v=${videoId}`,
              title: videoTitle,
              description: videoDescription,
              thumbnail_url: thumbnailUrl,
              video_type: 'youtube',
              is_active: true,
              order_index: 0
            });

          if (insertError) {
            if (Deno.env.get('ENV') === 'development') {
              console.error(`Error inserting video for ${module.title}:`, insertError);
            }
            results.push({
              module_id: module.id,
              title: module.title,
              status: 'error',
              error: insertError.message
            });
          } else {
            results.push({
              module_id: module.id,
              title: module.title,
              video_id: videoId,
              video_title: videoTitle,
              status: 'created'
            });
          }
        }

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        if (Deno.env.get('ENV') === 'development') {
          console.error(`Error processing module ${module.title}:`, error);
        }
        results.push({
          module_id: module.id,
          title: module.title,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const summary = {
      total: results.length,
      created: results.filter(r => r.status === 'created').length,
      updated: results.filter(r => r.status === 'updated').length,
      errors: results.filter(r => r.status === 'error').length,
      no_results: results.filter(r => r.status === 'no_results').length
    };

    if (Deno.env.get('ENV') === 'development') {
      console.log('YouTube video search completed:', summary);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        summary,
        results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    if (Deno.env.get('ENV') === 'development') {
      console.error('Error in find-youtube-videos function:', error);
    }
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});