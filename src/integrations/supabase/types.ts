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
          {
            foreignKeyName: "fk_user_roles_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      safe_profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          company: string | null
          created_at: string | null
          id: string | null
          join_date: string | null
          name: string | null
          state: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          company?: string | null
          created_at?: string | null
          id?: string | null
          join_date?: string | null
          name?: string | null
          state?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          company?: string | null
          created_at?: string | null
          id?: string | null
          join_date?: string | null
          name?: string | null
          state?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      analyze_security_events: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
      log_auth_failure: {
        Args: { failure_reason: string; user_email?: string }
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
      revoke_user_role: {
        Args: {
          p_mfa_verified?: boolean
          p_reason?: string
          p_target_user_id: string
        }
        Returns: boolean
      }
      security_health_check: {
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
