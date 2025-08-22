export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string | null
          data_classification:
            | Database["public"]["Enums"]["data_classification"]
            | null
          details: Json | null
          geolocation: Json | null
          id: string
          ip_address: string | null
          metadata_enhanced: Json | null
          risk_score: number | null
          session_id: string | null
          target_resource: string | null
          target_user_id: string | null
          user_agent: string | null
          user_agent_parsed: Json | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string | null
          data_classification?:
            | Database["public"]["Enums"]["data_classification"]
            | null
          details?: Json | null
          geolocation?: Json | null
          id?: string
          ip_address?: string | null
          metadata_enhanced?: Json | null
          risk_score?: number | null
          session_id?: string | null
          target_resource?: string | null
          target_user_id?: string | null
          user_agent?: string | null
          user_agent_parsed?: Json | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string | null
          data_classification?:
            | Database["public"]["Enums"]["data_classification"]
            | null
          details?: Json | null
          geolocation?: Json | null
          id?: string
          ip_address?: string | null
          metadata_enhanced?: Json | null
          risk_score?: number | null
          session_id?: string | null
          target_resource?: string | null
          target_user_id?: string | null
          user_agent?: string | null
          user_agent_parsed?: Json | null
        }
        Relationships: []
      }
      assessment_attempts: {
        Row: {
          answers: Json
          assessment_id: string | null
          attempt_number: number
          completed_at: string
          created_at: string
          id: string
          is_passed: boolean
          score: number
          started_at: string
          time_taken_minutes: number | null
          user_id: string | null
        }
        Insert: {
          answers: Json
          assessment_id?: string | null
          attempt_number: number
          completed_at?: string
          created_at?: string
          id?: string
          is_passed: boolean
          score: number
          started_at?: string
          time_taken_minutes?: number | null
          user_id?: string | null
        }
        Update: {
          answers?: Json
          assessment_id?: string | null
          attempt_number?: number
          completed_at?: string
          created_at?: string
          id?: string
          is_passed?: boolean
          score?: number
          started_at?: string
          time_taken_minutes?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_attempts_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "course_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      content_uploads: {
        Row: {
          content_type: string | null
          created_at: string
          file_size: number
          file_type: string
          filename: string
          id: string
          is_processed: boolean | null
          original_name: string
          related_content_id: string | null
          storage_path: string
          upload_user_id: string
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          file_size: number
          file_type: string
          filename: string
          id?: string
          is_processed?: boolean | null
          original_name: string
          related_content_id?: string | null
          storage_path: string
          upload_user_id: string
        }
        Update: {
          content_type?: string | null
          created_at?: string
          file_size?: number
          file_type?: string
          filename?: string
          id?: string
          is_processed?: boolean | null
          original_name?: string
          related_content_id?: string | null
          storage_path?: string
          upload_user_id?: string
        }
        Relationships: []
      }
      course_articles: {
        Row: {
          author_id: string | null
          category: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          is_published: boolean | null
          module_id: string | null
          order_index: number
          publish_date: string | null
          reading_time_minutes: number | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean | null
          module_id?: string | null
          order_index?: number
          publish_date?: string | null
          reading_time_minutes?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean | null
          module_id?: string | null
          order_index?: number
          publish_date?: string | null
          reading_time_minutes?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_articles_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["module_id"]
          },
        ]
      }
      course_assessments: {
        Row: {
          assessment_type: string
          created_at: string
          description: string | null
          id: string
          is_required: boolean | null
          max_attempts: number | null
          module_id: string | null
          order_index: number
          passing_score: number | null
          questions: Json
          time_limit_minutes: number | null
          title: string
          updated_at: string
        }
        Insert: {
          assessment_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_required?: boolean | null
          max_attempts?: number | null
          module_id?: string | null
          order_index: number
          passing_score?: number | null
          questions: Json
          time_limit_minutes?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          assessment_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_required?: boolean | null
          max_attempts?: number | null
          module_id?: string | null
          order_index?: number
          passing_score?: number | null
          questions?: Json
          time_limit_minutes?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_assessments_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["module_id"]
          },
        ]
      }
      course_documents: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          download_count: number | null
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          is_downloadable: boolean | null
          module_id: string | null
          tags: string[] | null
          title: string
          updated_at: string
          upload_user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          download_count?: number | null
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          is_downloadable?: boolean | null
          module_id?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          upload_user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          download_count?: number | null
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          is_downloadable?: boolean | null
          module_id?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          upload_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_documents_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["module_id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          course_id: string
          created_at: string | null
          enrolled_at: string | null
          id: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          enrolled_at?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          enrolled_at?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      course_modules: {
        Row: {
          created_at: string
          description: string | null
          duration: string | null
          id: string
          is_active: boolean | null
          lessons_count: number | null
          module_id: string
          order_index: number
          prerequisites: string[] | null
          skill_level: Database["public"]["Enums"]["skill_level"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          is_active?: boolean | null
          lessons_count?: number | null
          module_id: string
          order_index: number
          prerequisites?: string[] | null
          skill_level?: Database["public"]["Enums"]["skill_level"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          is_active?: boolean | null
          lessons_count?: number | null
          module_id?: string
          order_index?: number
          prerequisites?: string[] | null
          skill_level?: Database["public"]["Enums"]["skill_level"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      course_progress: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string
          id: string
          lesson_id: string | null
          module_id: string | null
          progress_percentage: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string
          id?: string
          lesson_id?: string | null
          module_id?: string | null
          progress_percentage?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string
          id?: string
          lesson_id?: string | null
          module_id?: string | null
          progress_percentage?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      course_videos: {
        Row: {
          created_at: string
          description: string | null
          duration_seconds: number | null
          id: string
          is_active: boolean | null
          module_id: string | null
          order_index: number
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          upload_user_id: string | null
          video_type: string
          video_url: string
          view_count: number | null
          youtube_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_active?: boolean | null
          module_id?: string | null
          order_index?: number
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          upload_user_id?: string | null
          video_type?: string
          video_url: string
          view_count?: number | null
          youtube_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_active?: boolean | null
          module_id?: string | null
          order_index?: number
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          upload_user_id?: string | null
          video_type?: string
          video_url?: string
          view_count?: number | null
          youtube_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_videos_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["module_id"]
          },
        ]
      }
      geolocation_rules: {
        Row: {
          country_codes: string[] | null
          created_at: string | null
          id: string
          ip_ranges: unknown[] | null
          is_active: boolean | null
          latitude_range: number[] | null
          longitude_range: number[] | null
          priority: number | null
          radius_km: number | null
          region_codes: string[] | null
          rule_type: string
          time_restrictions: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          country_codes?: string[] | null
          created_at?: string | null
          id?: string
          ip_ranges?: unknown[] | null
          is_active?: boolean | null
          latitude_range?: number[] | null
          longitude_range?: number[] | null
          priority?: number | null
          radius_km?: number | null
          region_codes?: string[] | null
          rule_type: string
          time_restrictions?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          country_codes?: string[] | null
          created_at?: string | null
          id?: string
          ip_ranges?: unknown[] | null
          is_active?: boolean | null
          latitude_range?: number[] | null
          longitude_range?: number[] | null
          priority?: number | null
          radius_km?: number | null
          region_codes?: string[] | null
          rule_type?: string
          time_restrictions?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      "Halo Launch Pad Learn": {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      instructors: {
        Row: {
          avatar_color: string
          avatar_initials: string
          bio: string
          company: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          name: string
          title: string
          updated_at: string
          years_experience: string
        }
        Insert: {
          avatar_color?: string
          avatar_initials: string
          bio: string
          company?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          title: string
          updated_at?: string
          years_experience: string
        }
        Update: {
          avatar_color?: string
          avatar_initials?: string
          bio?: string
          company?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          title?: string
          updated_at?: string
          years_experience?: string
        }
        Relationships: []
      }
      learning_tools: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          order_index: number
          tags: string[] | null
          title: string
          tool_type: string
          tool_url: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number
          tags?: string[] | null
          title: string
          tool_type?: string
          tool_url?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number
          tags?: string[] | null
          title?: string
          tool_type?: string
          tool_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      learning_webinars: {
        Row: {
          created_at: string
          current_attendees: number | null
          description: string | null
          id: string
          is_active: boolean | null
          max_attendees: number | null
          presenter: string
          recording_url: string | null
          registration_url: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          status: string
          tags: string[] | null
          timezone: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_attendees?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_attendees?: number | null
          presenter: string
          recording_url?: string | null
          registration_url?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: string
          tags?: string[] | null
          timezone?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_attendees?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_attendees?: number | null
          presenter?: string
          recording_url?: string | null
          registration_url?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: string
          tags?: string[] | null
          timezone?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          company: string | null
          course_progress: boolean | null
          created_at: string
          data_classification:
            | Database["public"]["Enums"]["data_classification"]
            | null
          date_format: string | null
          email: string | null
          email_notifications: boolean | null
          font_size: string | null
          id: string
          join_date: string
          language: string | null
          location: string | null
          marketing_communications: boolean | null
          marketing_emails: boolean | null
          name: string
          new_courses: boolean | null
          phone: string | null
          push_notifications: boolean | null
          reduced_motion: boolean | null
          state: string | null
          theme: string | null
          timezone: string | null
          title: string | null
          updated_at: string
          user_id: string
          webinar_reminders: boolean | null
          weekly_progress: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          company?: string | null
          course_progress?: boolean | null
          created_at?: string
          data_classification?:
            | Database["public"]["Enums"]["data_classification"]
            | null
          date_format?: string | null
          email?: string | null
          email_notifications?: boolean | null
          font_size?: string | null
          id?: string
          join_date?: string
          language?: string | null
          location?: string | null
          marketing_communications?: boolean | null
          marketing_emails?: boolean | null
          name: string
          new_courses?: boolean | null
          phone?: string | null
          push_notifications?: boolean | null
          reduced_motion?: boolean | null
          state?: string | null
          theme?: string | null
          timezone?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
          webinar_reminders?: boolean | null
          weekly_progress?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          company?: string | null
          course_progress?: boolean | null
          created_at?: string
          data_classification?:
            | Database["public"]["Enums"]["data_classification"]
            | null
          date_format?: string | null
          email?: string | null
          email_notifications?: boolean | null
          font_size?: string | null
          id?: string
          join_date?: string
          language?: string | null
          location?: string | null
          marketing_communications?: boolean | null
          marketing_emails?: boolean | null
          name?: string
          new_courses?: boolean | null
          phone?: string | null
          push_notifications?: boolean | null
          reduced_motion?: boolean | null
          state?: string | null
          theme?: string | null
          timezone?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
          webinar_reminders?: boolean | null
          weekly_progress?: boolean | null
        }
        Relationships: []
      }
      rate_limit_attempts: {
        Row: {
          attempt_count: number
          created_at: string
          data_classification:
            | Database["public"]["Enums"]["data_classification"]
            | null
          endpoint: string
          id: string
          ip_address: unknown
          is_blocked: boolean
          updated_at: string
          window_start: string
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          data_classification?:
            | Database["public"]["Enums"]["data_classification"]
            | null
          endpoint: string
          id?: string
          ip_address: unknown
          is_blocked?: boolean
          updated_at?: string
          window_start?: string
        }
        Update: {
          attempt_count?: number
          created_at?: string
          data_classification?:
            | Database["public"]["Enums"]["data_classification"]
            | null
          endpoint?: string
          id?: string
          ip_address?: unknown
          is_blocked?: boolean
          updated_at?: string
          window_start?: string
        }
        Relationships: []
      }
      security_alerts: {
        Row: {
          alert_type: string
          created_at: string
          description: string
          id: string
          is_resolved: boolean
          metadata: Json | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          title: string
          updated_at: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          description: string
          id?: string
          is_resolved?: boolean
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          title: string
          updated_at?: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          description?: string
          id?: string
          is_resolved?: boolean
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string
          data_classification:
            | Database["public"]["Enums"]["data_classification"]
            | null
          details: Json | null
          event_type: string
          id: string
          severity: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          data_classification?:
            | Database["public"]["Enums"]["data_classification"]
            | null
          details?: Json | null
          event_type: string
          id?: string
          severity: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          data_classification?:
            | Database["public"]["Enums"]["data_classification"]
            | null
          details?: Json | null
          event_type?: string
          id?: string
          severity?: string
          user_id?: string | null
        }
        Relationships: []
      }
      security_incidents: {
        Row: {
          affected_systems: string[] | null
          affected_users: string[] | null
          assigned_to: string | null
          created_at: string | null
          description: string | null
          id: string
          incident_type: string
          indicators: Json | null
          lessons_learned: string | null
          reported_by: string | null
          resolved_at: string | null
          response_actions: Json | null
          severity: string
          status: string | null
          timeline: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          affected_systems?: string[] | null
          affected_users?: string[] | null
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          incident_type: string
          indicators?: Json | null
          lessons_learned?: string | null
          reported_by?: string | null
          resolved_at?: string | null
          response_actions?: Json | null
          severity: string
          status?: string | null
          timeline?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          affected_systems?: string[] | null
          affected_users?: string[] | null
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          incident_type?: string
          indicators?: Json | null
          lessons_learned?: string | null
          reported_by?: string | null
          resolved_at?: string | null
          response_actions?: Json | null
          severity?: string
          status?: string | null
          timeline?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      security_policies: {
        Row: {
          applies_to: string[] | null
          approved_by: string | null
          created_at: string | null
          created_by: string | null
          effective_date: string | null
          enforcement_level: string | null
          expiry_date: string | null
          id: string
          is_active: boolean | null
          policy_name: string
          policy_rules: Json
          policy_type: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          applies_to?: string[] | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          effective_date?: string | null
          enforcement_level?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          policy_name: string
          policy_rules: Json
          policy_type: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          applies_to?: string[] | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          effective_date?: string | null
          enforcement_level?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          policy_name?: string
          policy_rules?: Json
          policy_type?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: []
      }
      threat_intelligence: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          description: string | null
          expires_at: string | null
          first_seen: string | null
          id: string
          indicator_type: string
          indicator_value: string
          is_active: boolean | null
          last_seen: string | null
          metadata: Json | null
          source: string | null
          threat_level: number
          threat_type: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          first_seen?: string | null
          id?: string
          indicator_type: string
          indicator_value: string
          is_active?: boolean | null
          last_seen?: string | null
          metadata?: Json | null
          source?: string | null
          threat_level: number
          threat_type: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          first_seen?: string | null
          id?: string
          indicator_type?: string
          indicator_value?: string
          is_active?: boolean | null
          last_seen?: string | null
          metadata?: Json | null
          source?: string | null
          threat_level?: number
          threat_type?: string
        }
        Relationships: []
      }
      user_behavior_patterns: {
        Row: {
          anomaly_score: number | null
          confidence_score: number | null
          created_at: string | null
          id: string
          last_updated: string | null
          pattern_data: Json
          pattern_type: string
          sample_count: number | null
          user_id: string
        }
        Insert: {
          anomaly_score?: number | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          pattern_data: Json
          pattern_type: string
          sample_count?: number | null
          user_id: string
        }
        Update: {
          anomaly_score?: number | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          pattern_data?: Json
          pattern_type?: string
          sample_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_biometrics: {
        Row: {
          biometric_hash: string
          biometric_type: string
          created_at: string | null
          device_id: string | null
          enrollment_date: string | null
          failure_count: number | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          quality_score: number | null
          template_data: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          biometric_hash: string
          biometric_type: string
          created_at?: string | null
          device_id?: string | null
          enrollment_date?: string | null
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          quality_score?: number | null
          template_data?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          biometric_hash?: string
          biometric_type?: string
          created_at?: string | null
          device_id?: string | null
          enrollment_date?: string | null
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          quality_score?: number | null
          template_data?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_biometrics_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "user_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      user_devices: {
        Row: {
          blocked_at: string | null
          blocked_reason: string | null
          browser_info: Json | null
          created_at: string | null
          device_fingerprint: string
          device_name: string | null
          device_type: string | null
          first_seen_at: string | null
          geolocation: Json | null
          hardware_info: Json | null
          id: string
          is_active: boolean | null
          is_trusted: boolean | null
          language: string | null
          last_ip: unknown | null
          last_seen_at: string | null
          os_info: Json | null
          screen_resolution: string | null
          security_flags: Json | null
          timezone: string | null
          trust_level: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          blocked_at?: string | null
          blocked_reason?: string | null
          browser_info?: Json | null
          created_at?: string | null
          device_fingerprint: string
          device_name?: string | null
          device_type?: string | null
          first_seen_at?: string | null
          geolocation?: Json | null
          hardware_info?: Json | null
          id?: string
          is_active?: boolean | null
          is_trusted?: boolean | null
          language?: string | null
          last_ip?: unknown | null
          last_seen_at?: string | null
          os_info?: Json | null
          screen_resolution?: string | null
          security_flags?: Json | null
          timezone?: string | null
          trust_level?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          blocked_at?: string | null
          blocked_reason?: string | null
          browser_info?: Json | null
          created_at?: string | null
          device_fingerprint?: string
          device_name?: string | null
          device_type?: string | null
          first_seen_at?: string | null
          geolocation?: Json | null
          hardware_info?: Json | null
          id?: string
          is_active?: boolean | null
          is_trusted?: boolean | null
          language?: string | null
          last_ip?: unknown | null
          last_seen_at?: string | null
          os_info?: Json | null
          screen_resolution?: string | null
          security_flags?: Json | null
          timezone?: string | null
          trust_level?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_enrollments: {
        Row: {
          completion_target_date: string | null
          created_at: string
          enrolled_at: string
          enrollment_type: string | null
          id: string
          is_active: boolean | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          completion_target_date?: string | null
          created_at?: string
          enrolled_at?: string
          enrollment_type?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          completion_target_date?: string | null
          created_at?: string
          enrolled_at?: string
          enrollment_type?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_mfa: {
        Row: {
          backup_codes: string[] | null
          created_at: string | null
          failure_count: number | null
          id: string
          is_enabled: boolean | null
          is_primary: boolean | null
          last_used_at: string | null
          locked_until: string | null
          method_name: string | null
          method_type: string
          secret_key: string | null
          updated_at: string | null
          user_id: string
          verified_at: string | null
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string | null
          failure_count?: number | null
          id?: string
          is_enabled?: boolean | null
          is_primary?: boolean | null
          last_used_at?: string | null
          locked_until?: string | null
          method_name?: string | null
          method_type: string
          secret_key?: string | null
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string | null
          failure_count?: number | null
          id?: string
          is_enabled?: boolean | null
          is_primary?: boolean | null
          last_used_at?: string | null
          locked_until?: string | null
          method_name?: string | null
          method_type?: string
          secret_key?: string | null
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed_at: string | null
          completion_percentage: number | null
          created_at: string
          id: string
          is_completed: boolean | null
          last_accessed_at: string | null
          module_id: string | null
          started_at: string | null
          time_spent_minutes: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string
          id?: string
          is_completed?: boolean | null
          last_accessed_at?: string | null
          module_id?: string | null
          started_at?: string | null
          time_spent_minutes?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string
          id?: string
          is_completed?: boolean | null
          last_accessed_at?: string | null
          module_id?: string | null
          started_at?: string | null
          time_spent_minutes?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["module_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_roles_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string | null
          device_id: string | null
          expires_at: string | null
          geolocation: Json | null
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          last_activity_at: string | null
          risk_score: number | null
          security_context: Json | null
          security_level: number | null
          session_token: string
          session_type: string | null
          terminated_at: string | null
          termination_reason: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_id?: string | null
          expires_at?: string | null
          geolocation?: Json | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity_at?: string | null
          risk_score?: number | null
          security_context?: Json | null
          security_level?: number | null
          session_token: string
          session_type?: string | null
          terminated_at?: string | null
          termination_reason?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_id?: string | null
          expires_at?: string | null
          geolocation?: Json | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity_at?: string | null
          risk_score?: number | null
          security_context?: Json | null
          security_level?: number | null
          session_token?: string
          session_type?: string | null
          terminated_at?: string | null
          termination_reason?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "user_devices"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      analyze_security_events: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      analyze_user_behavior_anomaly: {
        Args: { p_behavior_data: Json }
        Returns: Json
      }
      assign_user_role: {
        Args: {
          p_mfa_verified?: boolean
          p_new_role: string
          p_reason?: string
          p_target_user_id: string
        }
        Returns: boolean
      }
      can_access_classified_data: {
        Args: {
          classification: Database["public"]["Enums"]["data_classification"]
          resource_owner_id?: string
        }
        Returns: boolean
      }
      can_view_sensitive_profile_data: {
        Args: { profile_user_id: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          p_endpoint: string
          p_ip_address: unknown
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: Json
      }
      check_threat_indicators: {
        Args: {
          p_additional_indicators?: Json
          p_ip_address: unknown
          p_user_agent?: string
        }
        Returns: Json
      }
      check_user_has_role: {
        Args: { check_role: string }
        Returns: boolean
      }
      create_security_alert: {
        Args: {
          p_alert_type: string
          p_description: string
          p_metadata?: Json
          p_severity: string
          p_title: string
        }
        Returns: string
      }
      detect_potential_data_breach: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      detect_unusual_profile_access: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      emergency_security_lockdown: {
        Args: {
          p_affected_users?: string[]
          p_lockdown_type?: string
          p_reason: string
        }
        Returns: Json
      }
      get_admin_profile_data: {
        Args: { target_user_id: string }
        Returns: {
          email: string
          full_profile: Json
          location: string
          name: string
          phone: string
          user_id: string
        }[]
      }
      get_authenticated_user_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string
          city: string
          company: string
          created_at: string
          id: string
          join_date: string
          name: string
          state: string
          title: string
          user_id: string
        }[]
      }
      get_profiles_with_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          profile_city: string
          profile_company: string
          profile_created_at: string
          profile_email: string
          profile_join_date: string
          profile_name: string
          profile_phone: string
          profile_state: string
          profile_title: string
          profile_updated_at: string
          role: string
          role_created_at: string
          role_id: string
          role_is_active: boolean
          role_updated_at: string
          user_id: string
        }[]
      }
      get_user_role: {
        Args: { check_user_id?: string }
        Returns: string
      }
      has_any_role: {
        Args: { roles: string[] }
        Returns: boolean
      }
      is_admin: {
        Args: { check_user_id?: string }
        Returns: boolean
      }
      is_current_user_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          p_action: string
          p_details?: Json
          p_target_resource?: string
          p_target_user_id?: string
        }
        Returns: undefined
      }
      log_admin_profile_view: {
        Args: { viewed_user_id: string }
        Returns: undefined
      }
      log_auth_failure: {
        Args: { failure_reason: string; user_email?: string }
        Returns: undefined
      }
      log_critical_security_event: {
        Args: {
          event_details?: Json
          event_name: string
          severity_level?: string
        }
        Returns: undefined
      }
      log_sensitive_data_access: {
        Args: {
          access_reason?: string
          accessed_table: string
          accessed_user_id: string
        }
        Returns: undefined
      }
      mask_sensitive_profile_data: {
        Args: { profile_data: Json }
        Returns: Json
      }
      monitor_profile_access_patterns: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      register_device_fingerprint: {
        Args: { p_device_fingerprint: string; p_device_info?: Json }
        Returns: string
      }
      revoke_user_role: {
        Args: {
          p_mfa_verified?: boolean
          p_reason?: string
          p_target_user_id: string
        }
        Returns: boolean
      }
      run_comprehensive_security_analysis: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      run_customer_data_security_monitoring: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      run_security_configuration_check: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      secure_profile_access: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      security_health_check: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      validate_geolocation_access: {
        Args: {
          p_country_code?: string
          p_ip_address?: unknown
          p_latitude: number
          p_longitude: number
        }
        Returns: Json
      }
      validate_mfa_token: {
        Args: {
          p_backup_code?: boolean
          p_method_type: string
          p_token: string
        }
        Returns: boolean
      }
      validate_security_configuration: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      validate_sensitive_profile_access: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      validate_ultra_secure_profile_access: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      verify_profile_access_security: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
    }
    Enums: {
      data_classification: "public" | "internal" | "confidential" | "restricted"
      skill_level: "beginner" | "intermediate" | "expert"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      data_classification: ["public", "internal", "confidential", "restricted"],
      skill_level: ["beginner", "intermediate", "expert"],
    },
  },
} as const
