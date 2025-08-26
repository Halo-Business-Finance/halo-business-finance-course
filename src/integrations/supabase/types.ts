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
      advanced_threat_intelligence: {
        Row: {
          attack_vectors: string[]
          attribution_data: Json | null
          auto_block: boolean | null
          behavioral_signatures: Json | null
          confidence_score: number
          created_at: string
          expires_at: string | null
          first_seen: string | null
          geolocation_data: Json | null
          id: string
          indicators_of_compromise: Json
          is_active: boolean | null
          last_seen: string | null
          mitigation_strategies: Json
          network_patterns: Json | null
          severity_level: number
          source: string
          temporal_patterns: Json | null
          threat_category: string
          threat_signature: string
          validation_status: string | null
        }
        Insert: {
          attack_vectors?: string[]
          attribution_data?: Json | null
          auto_block?: boolean | null
          behavioral_signatures?: Json | null
          confidence_score: number
          created_at?: string
          expires_at?: string | null
          first_seen?: string | null
          geolocation_data?: Json | null
          id?: string
          indicators_of_compromise?: Json
          is_active?: boolean | null
          last_seen?: string | null
          mitigation_strategies?: Json
          network_patterns?: Json | null
          severity_level: number
          source: string
          temporal_patterns?: Json | null
          threat_category: string
          threat_signature: string
          validation_status?: string | null
        }
        Update: {
          attack_vectors?: string[]
          attribution_data?: Json | null
          auto_block?: boolean | null
          behavioral_signatures?: Json | null
          confidence_score?: number
          created_at?: string
          expires_at?: string | null
          first_seen?: string | null
          geolocation_data?: Json | null
          id?: string
          indicators_of_compromise?: Json
          is_active?: boolean | null
          last_seen?: string | null
          mitigation_strategies?: Json
          network_patterns?: Json | null
          severity_level?: number
          source?: string
          temporal_patterns?: Json | null
          threat_category?: string
          threat_signature?: string
          validation_status?: string | null
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
          user_id: string
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
          user_id: string
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
          user_id?: string
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
      cms_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cms_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "cms_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_content_blocks: {
        Row: {
          category: string | null
          content: Json
          created_at: string
          description: string | null
          id: string
          is_global: boolean | null
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          content?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_global?: boolean | null
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          content?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_global?: boolean | null
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      cms_media: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string
          file_size: number
          file_type: string
          filename: string
          folder_path: string | null
          height: number | null
          id: string
          original_name: string
          public_url: string
          storage_path: string
          tags: string[] | null
          updated_at: string
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          file_size: number
          file_type: string
          filename: string
          folder_path?: string | null
          height?: number | null
          id?: string
          original_name: string
          public_url: string
          storage_path: string
          tags?: string[] | null
          updated_at?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          file_size?: number
          file_type?: string
          filename?: string
          folder_path?: string | null
          height?: number | null
          id?: string
          original_name?: string
          public_url?: string
          storage_path?: string
          tags?: string[] | null
          updated_at?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: []
      }
      cms_menu_items: {
        Row: {
          created_at: string
          css_class: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          menu_id: string
          page_id: string | null
          parent_id: string | null
          sort_order: number | null
          target: string | null
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          css_class?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          menu_id: string
          page_id?: string | null
          parent_id?: string | null
          sort_order?: number | null
          target?: string | null
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          css_class?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          menu_id?: string
          page_id?: string | null
          parent_id?: string | null
          sort_order?: number | null
          target?: string | null
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cms_menu_items_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "cms_menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cms_menu_items_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "cms_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cms_menu_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "cms_menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_menus: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          label: string
          location: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          label: string
          location?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          label?: string
          location?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      cms_page_tags: {
        Row: {
          page_id: string
          tag_id: string
        }
        Insert: {
          page_id: string
          tag_id: string
        }
        Update: {
          page_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cms_page_tags_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "cms_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cms_page_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "cms_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_pages: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: string
          created_at: string
          custom_css: string | null
          custom_js: string | null
          excerpt: string | null
          featured_image_url: string | null
          id: string
          is_homepage: boolean | null
          meta_description: string | null
          meta_keywords: string[] | null
          meta_title: string | null
          parent_id: string | null
          published_at: string | null
          slug: string
          sort_order: number | null
          status: string | null
          template: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content: string
          created_at?: string
          custom_css?: string | null
          custom_js?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_homepage?: boolean | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          parent_id?: string | null
          published_at?: string | null
          slug: string
          sort_order?: number | null
          status?: string | null
          template?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string
          created_at?: string
          custom_css?: string | null
          custom_js?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_homepage?: boolean | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          parent_id?: string | null
          published_at?: string | null
          slug?: string
          sort_order?: number | null
          status?: string | null
          template?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cms_pages_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "cms_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cms_pages_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "cms_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_settings: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      cms_tags: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      compliance_audit_trail: {
        Row: {
          access_justification: string | null
          action_details: Json
          action_type: string
          admin_user_id: string | null
          approval_required: boolean | null
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          audit_category: string
          audit_hash: string
          chain_integrity_verified: boolean | null
          compliance_framework: string
          created_at: string
          data_sensitivity: string
          id: string
          regulation_reference: string | null
          resource_id: string | null
          resource_type: string
          retention_period: unknown | null
          user_id: string | null
        }
        Insert: {
          access_justification?: string | null
          action_details?: Json
          action_type: string
          admin_user_id?: string | null
          approval_required?: boolean | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          audit_category: string
          audit_hash: string
          chain_integrity_verified?: boolean | null
          compliance_framework: string
          created_at?: string
          data_sensitivity: string
          id?: string
          regulation_reference?: string | null
          resource_id?: string | null
          resource_type: string
          retention_period?: unknown | null
          user_id?: string | null
        }
        Update: {
          access_justification?: string | null
          action_details?: Json
          action_type?: string
          admin_user_id?: string | null
          approval_required?: boolean | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          audit_category?: string
          audit_hash?: string
          chain_integrity_verified?: boolean | null
          compliance_framework?: string
          created_at?: string
          data_sensitivity?: string
          id?: string
          regulation_reference?: string | null
          resource_id?: string | null
          resource_type?: string
          retention_period?: unknown | null
          user_id?: string | null
        }
        Relationships: []
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
          public_preview: boolean | null
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
          public_preview?: boolean | null
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
          public_preview?: boolean | null
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
      daily_learning_activity: {
        Row: {
          activity_date: string
          assessments_taken: number | null
          created_at: string
          id: string
          modules_completed: number | null
          time_spent_minutes: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_date: string
          assessments_taken?: number | null
          created_at?: string
          id?: string
          modules_completed?: number | null
          time_spent_minutes?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_date?: string
          assessments_taken?: number | null
          created_at?: string
          id?: string
          modules_completed?: number | null
          time_spent_minutes?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      encrypted_course_content: {
        Row: {
          access_level: string
          content_hash: string
          content_type: string
          course_id: string
          created_at: string
          created_by: string | null
          encrypted_content: string
          encryption_algorithm: string
          id: string
          module_id: string | null
          updated_at: string
        }
        Insert: {
          access_level?: string
          content_hash: string
          content_type: string
          course_id: string
          created_at?: string
          created_by?: string | null
          encrypted_content: string
          encryption_algorithm?: string
          id?: string
          module_id?: string | null
          updated_at?: string
        }
        Update: {
          access_level?: string
          content_hash?: string
          content_type?: string
          course_id?: string
          created_at?: string
          created_by?: string | null
          encrypted_content?: string
          encryption_algorithm?: string
          id?: string
          module_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      encrypted_messages: {
        Row: {
          created_at: string
          encrypted_body: string
          encrypted_subject: string
          expires_at: string | null
          id: string
          is_read: boolean | null
          message_hash: string
          recipient_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          encrypted_body: string
          encrypted_subject: string
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message_hash: string
          recipient_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          encrypted_body?: string
          encrypted_subject?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message_hash?: string
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      enhanced_device_security: {
        Row: {
          behavioral_patterns: Json
          compliance_status: Json
          created_at: string
          device_fingerprint: string
          device_id: string
          hardware_signatures: Json
          id: string
          is_compromised: boolean | null
          last_security_scan: string | null
          network_signatures: Json
          quarantine_status: string | null
          risk_factors: Json
          security_features: Json
          software_signatures: Json
          threat_indicators: Json
          trust_score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          behavioral_patterns?: Json
          compliance_status?: Json
          created_at?: string
          device_fingerprint: string
          device_id: string
          hardware_signatures?: Json
          id?: string
          is_compromised?: boolean | null
          last_security_scan?: string | null
          network_signatures?: Json
          quarantine_status?: string | null
          risk_factors?: Json
          security_features?: Json
          software_signatures?: Json
          threat_indicators?: Json
          trust_score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          behavioral_patterns?: Json
          compliance_status?: Json
          created_at?: string
          device_fingerprint?: string
          device_id?: string
          hardware_signatures?: Json
          id?: string
          is_compromised?: boolean | null
          last_security_scan?: string | null
          network_signatures?: Json
          quarantine_status?: string | null
          risk_factors?: Json
          security_features?: Json
          software_signatures?: Json
          threat_indicators?: Json
          trust_score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      enhanced_mfa: {
        Row: {
          backup_codes: string[] | null
          certificate_fingerprint: string | null
          compliance_level: string | null
          created_at: string
          device_bound: boolean | null
          encryption_algorithm: string | null
          enrolled_at: string | null
          expires_at: string | null
          failure_count: number | null
          hardware_key_id: string | null
          id: string
          is_enabled: boolean | null
          is_primary: boolean | null
          last_used_at: string | null
          metadata: Json | null
          method_name: string | null
          method_type: string
          secret_key: string | null
          trust_level: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          certificate_fingerprint?: string | null
          compliance_level?: string | null
          created_at?: string
          device_bound?: boolean | null
          encryption_algorithm?: string | null
          enrolled_at?: string | null
          expires_at?: string | null
          failure_count?: number | null
          hardware_key_id?: string | null
          id?: string
          is_enabled?: boolean | null
          is_primary?: boolean | null
          last_used_at?: string | null
          metadata?: Json | null
          method_name?: string | null
          method_type: string
          secret_key?: string | null
          trust_level?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          certificate_fingerprint?: string | null
          compliance_level?: string | null
          created_at?: string
          device_bound?: boolean | null
          encryption_algorithm?: string | null
          enrolled_at?: string | null
          expires_at?: string | null
          failure_count?: number | null
          hardware_key_id?: string | null
          id?: string
          is_enabled?: boolean | null
          is_primary?: boolean | null
          last_used_at?: string | null
          metadata?: Json | null
          method_name?: string | null
          method_type?: string
          secret_key?: string | null
          trust_level?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      immutable_audit_chain: {
        Row: {
          chain_position: number
          created_at: string
          data_classification:
            | Database["public"]["Enums"]["data_classification"]
            | null
          data_hash: string
          entry_id: string
          id: string
          previous_hash: string
          timestamp: string
        }
        Insert: {
          chain_position: number
          created_at?: string
          data_classification?:
            | Database["public"]["Enums"]["data_classification"]
            | null
          data_hash: string
          entry_id: string
          id?: string
          previous_hash: string
          timestamp?: string
        }
        Update: {
          chain_position?: number
          created_at?: string
          data_classification?:
            | Database["public"]["Enums"]["data_classification"]
            | null
          data_hash?: string
          entry_id?: string
          id?: string
          previous_hash?: string
          timestamp?: string
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
      lead_submission_rate_limits: {
        Row: {
          created_at: string | null
          first_submission_at: string | null
          id: string
          ip_address: unknown
          is_blocked: boolean | null
          last_submission_at: string | null
          submission_count: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          first_submission_at?: string | null
          id?: string
          ip_address: unknown
          is_blocked?: boolean | null
          last_submission_at?: string | null
          submission_count?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          first_submission_at?: string | null
          id?: string
          ip_address?: unknown
          is_blocked?: boolean | null
          last_submission_at?: string | null
          submission_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          admin_notes: string | null
          assigned_to: string | null
          budget: string | null
          company: string
          company_size: string | null
          created_at: string
          email: string
          first_name: string
          follow_up_date: string | null
          form_load_time: number | null
          honeypot_field: string | null
          id: string
          job_title: string | null
          last_contacted: string | null
          last_name: string
          lead_source: string
          lead_type: string
          message: string | null
          phone: string | null
          status: string
          submission_ip: unknown | null
          timeline: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          assigned_to?: string | null
          budget?: string | null
          company: string
          company_size?: string | null
          created_at?: string
          email: string
          first_name: string
          follow_up_date?: string | null
          form_load_time?: number | null
          honeypot_field?: string | null
          id?: string
          job_title?: string | null
          last_contacted?: string | null
          last_name: string
          lead_source?: string
          lead_type?: string
          message?: string | null
          phone?: string | null
          status?: string
          submission_ip?: unknown | null
          timeline?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          assigned_to?: string | null
          budget?: string | null
          company?: string
          company_size?: string | null
          created_at?: string
          email?: string
          first_name?: string
          follow_up_date?: string | null
          form_load_time?: number | null
          honeypot_field?: string | null
          id?: string
          job_title?: string | null
          last_contacted?: string | null
          last_name?: string
          lead_source?: string
          lead_type?: string
          message?: string | null
          phone?: string | null
          status?: string
          submission_ip?: unknown | null
          timeline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      learning_achievements: {
        Row: {
          achievement_description: string | null
          achievement_title: string
          achievement_type: string
          earned_at: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          achievement_description?: string | null
          achievement_title: string
          achievement_type: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          achievement_description?: string | null
          achievement_title?: string
          achievement_type?: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      learning_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      learning_sessions: {
        Row: {
          activity_type: string
          created_at: string
          duration_minutes: number | null
          ended_at: string | null
          focus_score: number | null
          id: string
          interaction_count: number | null
          module_id: string | null
          started_at: string
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          focus_score?: number | null
          id?: string
          interaction_count?: number | null
          module_id?: string | null
          started_at?: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          focus_score?: number | null
          id?: string
          interaction_count?: number | null
          module_id?: string | null
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      learning_stats: {
        Row: {
          created_at: string
          current_streak_days: number | null
          id: string
          last_activity_at: string | null
          longest_streak_days: number | null
          total_assessments_passed: number | null
          total_modules_completed: number | null
          total_time_spent_minutes: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak_days?: number | null
          id?: string
          last_activity_at?: string | null
          longest_streak_days?: number | null
          total_assessments_passed?: number | null
          total_modules_completed?: number | null
          total_time_spent_minutes?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak_days?: number | null
          id?: string
          last_activity_at?: string | null
          longest_streak_days?: number | null
          total_assessments_passed?: number | null
          total_modules_completed?: number | null
          total_time_spent_minutes?: number | null
          updated_at?: string
          user_id?: string
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
      module_completions: {
        Row: {
          completed_at: string
          id: string
          module_id: string
          score: number | null
          time_spent_minutes: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          module_id: string
          score?: number | null
          time_spent_minutes?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          module_id?: string
          score?: number | null
          time_spent_minutes?: number | null
          user_id?: string
        }
        Relationships: []
      }
      network_security_events: {
        Row: {
          analyst_notes: string | null
          created_at: string
          created_by_function: string | null
          data_classification:
            | Database["public"]["Enums"]["data_classification"]
            | null
          destination_ip: unknown | null
          destination_port: number | null
          event_category: string
          event_signature: string
          false_positive: boolean | null
          flow_data: Json | null
          geolocation: Json | null
          id: string
          immutable: boolean | null
          is_blocked: boolean | null
          logged_via_secure_function: boolean | null
          mitigation_applied: string[] | null
          packet_data: Json | null
          protocol: string | null
          severity_level: number
          source_ip: unknown
          source_port: number | null
          system_validated: boolean | null
          threat_indicators: string[] | null
          validation_signature: string | null
        }
        Insert: {
          analyst_notes?: string | null
          created_at?: string
          created_by_function?: string | null
          data_classification?:
            | Database["public"]["Enums"]["data_classification"]
            | null
          destination_ip?: unknown | null
          destination_port?: number | null
          event_category: string
          event_signature: string
          false_positive?: boolean | null
          flow_data?: Json | null
          geolocation?: Json | null
          id?: string
          immutable?: boolean | null
          is_blocked?: boolean | null
          logged_via_secure_function?: boolean | null
          mitigation_applied?: string[] | null
          packet_data?: Json | null
          protocol?: string | null
          severity_level: number
          source_ip: unknown
          source_port?: number | null
          system_validated?: boolean | null
          threat_indicators?: string[] | null
          validation_signature?: string | null
        }
        Update: {
          analyst_notes?: string | null
          created_at?: string
          created_by_function?: string | null
          data_classification?:
            | Database["public"]["Enums"]["data_classification"]
            | null
          destination_ip?: unknown | null
          destination_port?: number | null
          event_category?: string
          event_signature?: string
          false_positive?: boolean | null
          flow_data?: Json | null
          geolocation?: Json | null
          id?: string
          immutable?: boolean | null
          is_blocked?: boolean | null
          logged_via_secure_function?: boolean | null
          mitigation_applied?: string[] | null
          packet_data?: Json | null
          protocol?: string | null
          severity_level?: number
          source_ip?: unknown
          source_port?: number | null
          system_validated?: boolean | null
          threat_indicators?: string[] | null
          validation_signature?: string | null
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
          encrypted_email: string | null
          encrypted_name: string | null
          encrypted_phone: string | null
          encryption_status: string | null
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
          encrypted_email?: string | null
          encrypted_name?: string | null
          encrypted_phone?: string | null
          encryption_status?: string | null
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
          encrypted_email?: string | null
          encrypted_name?: string | null
          encrypted_phone?: string | null
          encryption_status?: string | null
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
          chain_verified: boolean | null
          created_at: string
          data_classification:
            | Database["public"]["Enums"]["data_classification"]
            | null
          details: Json | null
          event_type: string
          id: string
          immutable: boolean | null
          logged_via_secure_function: boolean | null
          severity: string
          user_id: string | null
          validation_signature: string | null
        }
        Insert: {
          chain_verified?: boolean | null
          created_at?: string
          data_classification?:
            | Database["public"]["Enums"]["data_classification"]
            | null
          details?: Json | null
          event_type: string
          id?: string
          immutable?: boolean | null
          logged_via_secure_function?: boolean | null
          severity: string
          user_id?: string | null
          validation_signature?: string | null
        }
        Update: {
          chain_verified?: boolean | null
          created_at?: string
          data_classification?:
            | Database["public"]["Enums"]["data_classification"]
            | null
          details?: Json | null
          event_type?: string
          id?: string
          immutable?: boolean | null
          logged_via_secure_function?: boolean | null
          severity?: string
          user_id?: string | null
          validation_signature?: string | null
        }
        Relationships: []
      }
      security_incident_response: {
        Row: {
          actual_impact: Json | null
          affected_systems: string[] | null
          affected_users: string[] | null
          assigned_to: string | null
          attack_timeline: Json | null
          compliance_impact: Json | null
          contained_at: string | null
          containment_actions: Json | null
          created_at: string
          description: string
          detected_at: string
          eradication_actions: Json | null
          escalated_to: string | null
          estimated_impact: Json | null
          evidence_collected: Json | null
          external_notifications: Json | null
          id: string
          incident_id: string
          incident_type: string
          indicators_of_compromise: Json | null
          lessons_learned: string | null
          recovery_actions: Json | null
          resolved_at: string | null
          root_cause: string | null
          severity: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          actual_impact?: Json | null
          affected_systems?: string[] | null
          affected_users?: string[] | null
          assigned_to?: string | null
          attack_timeline?: Json | null
          compliance_impact?: Json | null
          contained_at?: string | null
          containment_actions?: Json | null
          created_at?: string
          description: string
          detected_at?: string
          eradication_actions?: Json | null
          escalated_to?: string | null
          estimated_impact?: Json | null
          evidence_collected?: Json | null
          external_notifications?: Json | null
          id?: string
          incident_id: string
          incident_type: string
          indicators_of_compromise?: Json | null
          lessons_learned?: string | null
          recovery_actions?: Json | null
          resolved_at?: string | null
          root_cause?: string | null
          severity: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          actual_impact?: Json | null
          affected_systems?: string[] | null
          affected_users?: string[] | null
          assigned_to?: string | null
          attack_timeline?: Json | null
          compliance_impact?: Json | null
          contained_at?: string | null
          containment_actions?: Json | null
          created_at?: string
          description?: string
          detected_at?: string
          eradication_actions?: Json | null
          escalated_to?: string | null
          estimated_impact?: Json | null
          evidence_collected?: Json | null
          external_notifications?: Json | null
          id?: string
          incident_id?: string
          incident_type?: string
          indicators_of_compromise?: Json | null
          lessons_learned?: string | null
          recovery_actions?: Json | null
          resolved_at?: string | null
          root_cause?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
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
          immutable: boolean | null
          last_updated: string | null
          logged_via_secure_function: boolean | null
          pattern_data: Json
          pattern_type: string
          sample_count: number | null
          user_id: string
          validation_hash: string | null
        }
        Insert: {
          anomaly_score?: number | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          immutable?: boolean | null
          last_updated?: string | null
          logged_via_secure_function?: boolean | null
          pattern_data: Json
          pattern_type: string
          sample_count?: number | null
          user_id: string
          validation_hash?: string | null
        }
        Update: {
          anomaly_score?: number | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          immutable?: boolean | null
          last_updated?: string | null
          logged_via_secure_function?: boolean | null
          pattern_data?: Json
          pattern_type?: string
          sample_count?: number | null
          user_id?: string
          validation_hash?: string | null
        }
        Relationships: []
      }
      user_behavioral_analytics: {
        Row: {
          access_patterns: Json | null
          alert_triggered: boolean | null
          anomaly_score: number | null
          baseline_established: boolean | null
          behavioral_fingerprint: Json
          confidence_level: number | null
          created_at: string
          deviation_threshold: number | null
          feature_vector: Json | null
          id: string
          immutable: boolean | null
          keystroke_dynamics: Json | null
          logged_via_secure_function: boolean | null
          ml_model_version: string | null
          mouse_dynamics: Json | null
          navigation_patterns: Json | null
          risk_indicators: string[] | null
          session_id: string | null
          timing_patterns: Json | null
          user_id: string
          validation_hash: string | null
        }
        Insert: {
          access_patterns?: Json | null
          alert_triggered?: boolean | null
          anomaly_score?: number | null
          baseline_established?: boolean | null
          behavioral_fingerprint?: Json
          confidence_level?: number | null
          created_at?: string
          deviation_threshold?: number | null
          feature_vector?: Json | null
          id?: string
          immutable?: boolean | null
          keystroke_dynamics?: Json | null
          logged_via_secure_function?: boolean | null
          ml_model_version?: string | null
          mouse_dynamics?: Json | null
          navigation_patterns?: Json | null
          risk_indicators?: string[] | null
          session_id?: string | null
          timing_patterns?: Json | null
          user_id: string
          validation_hash?: string | null
        }
        Update: {
          access_patterns?: Json | null
          alert_triggered?: boolean | null
          anomaly_score?: number | null
          baseline_established?: boolean | null
          behavioral_fingerprint?: Json
          confidence_level?: number | null
          created_at?: string
          deviation_threshold?: number | null
          feature_vector?: Json | null
          id?: string
          immutable?: boolean | null
          keystroke_dynamics?: Json | null
          logged_via_secure_function?: boolean | null
          ml_model_version?: string | null
          mouse_dynamics?: Json | null
          navigation_patterns?: Json | null
          risk_indicators?: string[] | null
          session_id?: string | null
          timing_patterns?: Json | null
          user_id?: string
          validation_hash?: string | null
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
      zero_trust_policies: {
        Row: {
          allowed_devices: string[] | null
          allowed_geolocations: string[] | null
          allowed_networks: unknown[] | null
          approved_by: string | null
          conditions: Json
          continuous_verification: boolean | null
          created_at: string
          created_by: string
          effective_date: string | null
          expiry_date: string | null
          id: string
          is_active: boolean | null
          policy_name: string
          policy_type: string
          priority: number | null
          required_mfa_level: number | null
          required_trust_score: number | null
          resource_path: string
          risk_tolerance: string | null
          session_duration: unknown | null
          time_restrictions: Json | null
          updated_at: string
        }
        Insert: {
          allowed_devices?: string[] | null
          allowed_geolocations?: string[] | null
          allowed_networks?: unknown[] | null
          approved_by?: string | null
          conditions?: Json
          continuous_verification?: boolean | null
          created_at?: string
          created_by: string
          effective_date?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          policy_name: string
          policy_type: string
          priority?: number | null
          required_mfa_level?: number | null
          required_trust_score?: number | null
          resource_path: string
          risk_tolerance?: string | null
          session_duration?: unknown | null
          time_restrictions?: Json | null
          updated_at?: string
        }
        Update: {
          allowed_devices?: string[] | null
          allowed_geolocations?: string[] | null
          allowed_networks?: unknown[] | null
          approved_by?: string | null
          conditions?: Json
          continuous_verification?: boolean | null
          created_at?: string
          created_by?: string
          effective_date?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          policy_name?: string
          policy_type?: string
          priority?: number | null
          required_mfa_level?: number | null
          required_trust_score?: number | null
          resource_path?: string
          risk_tolerance?: string | null
          session_duration?: unknown | null
          time_restrictions?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_emergency_mfa_reset: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      admin_get_profile_summary: {
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
      analyze_security_events: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      analyze_user_behavior: {
        Args: { p_session_data: Json; p_user_id: string }
        Returns: Json
      }
      analyze_user_behavior_anomaly: {
        Args: { p_behavior_data: Json }
        Returns: Json
      }
      assess_device_security_risk: {
        Args:
          | {
              p_device_fingerprint: string
              p_geolocation: Json
              p_ip_address: string
              p_user_agent: string
            }
          | {
              p_device_fingerprint: string
              p_geolocation?: Json
              p_ip_address: unknown
              p_user_agent: string
            }
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
      can_assign_role: {
        Args: { requesting_user_id: string; target_role: string }
        Returns: Json
      }
      can_delete_user: {
        Args:
          | { requesting_user_id: string; target_user_id: string }
          | { target_user_id: string }
        Returns: Json
      }
      can_view_sensitive_profile_data: {
        Args: { profile_user_id: string }
        Returns: boolean
      }
      check_current_user_admin_status: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      check_lead_rate_limit: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_lead_submission_rate_limit: {
        Args: { p_ip_address: unknown }
        Returns: Json
      }
      check_profile_access_rate_limit: {
        Args: { p_user_id: string }
        Returns: Json
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
      cleanup_old_security_events: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_comprehensive_audit_entry: {
        Args: {
          p_action: string
          p_after_state?: Json
          p_before_state?: Json
          p_classification?: Database["public"]["Enums"]["data_classification"]
          p_resource_id?: string
          p_resource_type: string
        }
        Returns: string
      }
      create_permission_alert: {
        Args: {
          error_context?: string
          table_name: string
          user_id_attempted: string
        }
        Returns: undefined
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
      current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      decrypt_pii_field: {
        Args: { encrypted_data: string; field_name: string }
        Returns: string
      }
      decrypt_sensitive_data: {
        Args: { context?: string; encrypted_data: string }
        Returns: string
      }
      detect_advanced_threats: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      detect_potential_data_breach: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      detect_real_time_threats: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      detect_security_data_tampering: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      detect_security_log_tampering: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      detect_suspicious_lead_access: {
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
      encrypt_course_content: {
        Args: {
          content_text: string
          content_type: string
          course_id: string
          module_id?: string
        }
        Returns: string
      }
      encrypt_existing_customer_pii: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      encrypt_existing_pii_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      encrypt_sensitive_data: {
        Args: { context?: string; plaintext: string }
        Returns: string
      }
      enforce_data_classification_access: {
        Args: {
          p_requested_classification: Database["public"]["Enums"]["data_classification"]
          p_resource_context?: Json
        }
        Returns: boolean
      }
      enhanced_audit_log: {
        Args: {
          p_action: string
          p_compliance_type?: string
          p_details?: Json
          p_target_resource?: string
          p_target_user_id?: string
        }
        Returns: undefined
      }
      evaluate_zero_trust_access: {
        Args: { p_context: Json; p_resource_path: string; p_user_id: string }
        Returns: Json
      }
      get_admin_all_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          profile_created_at: string
          profile_email: string
          profile_name: string
          role: string
          role_created_at: string
          role_is_active: boolean
          user_id: string
        }[]
      }
      get_admin_mfa_overview: {
        Args: Record<PropertyKey, never>
        Returns: {
          backup_codes_masked: string[]
          certificate_fingerprint: string
          compliance_level: string
          created_at: string
          device_bound: boolean
          enrolled_at: string
          expires_at: string
          failure_count: number
          hardware_key_id: string
          id: string
          is_enabled: boolean
          is_primary: boolean
          last_used_at: string
          metadata: Json
          method_name: string
          method_type: string
          secret_key_masked: string
          trust_level: number
          updated_at: string
          user_id: string
        }[]
      }
      get_admin_profile_access: {
        Args: { target_user_id: string }
        Returns: {
          avatar_url: string
          city: string
          company: string
          created_at: string
          email: string
          id: string
          join_date: string
          location: string
          name: string
          phone: string
          state: string
          title: string
          updated_at: string
          user_id: string
        }[]
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
      get_admin_profile_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          email_masked: string
          is_active: boolean
          join_date: string
          name_masked: string
          user_id: string
        }[]
      }
      get_admin_session_info: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          device_id: string
          expires_at: string
          geolocation: Json
          id: string
          ip_address: unknown
          is_active: boolean
          last_activity_at: string
          risk_score: number
          security_level: number
          session_type: string
          terminated_at: string
          termination_reason: string
          user_agent: string
          user_id: string
        }[]
      }
      get_admin_user_roles_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          id: string
          is_active: boolean
          profile_email: string
          profile_name: string
          role: string
          updated_at: string
          user_id: string
        }[]
      }
      get_all_user_profiles_with_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          company: string
          created_at: string
          email: string
          name: string
          phone: string
          role: string
          role_created_at: string
          role_is_active: boolean
          title: string
          updated_at: string
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
      get_masked_user_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string
          city: string
          company: string
          created_at: string
          email: string
          join_date: string
          name: string
          phone: string
          role: string
          role_created_at: string
          role_is_active: boolean
          state: string
          title: string
          updated_at: string
          user_id: string
        }[]
      }
      get_profile_encryption_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
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
      get_public_course_previews: {
        Args: Record<PropertyKey, never>
        Returns: {
          is_active: boolean
          module_id: string
          preview_description: string
          preview_duration: string
          skill_level: string
          title: string
        }[]
      }
      get_safe_user_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string
          city: string
          company: string
          created_at: string
          email: string
          id: string
          join_date: string
          name: string
          phone: string
          state: string
          title: string
          user_id: string
        }[]
      }
      get_secure_profile_data: {
        Args: { target_user_id: string }
        Returns: {
          avatar_url: string
          city: string
          company: string
          created_at: string
          email: string
          location: string
          name: string
          phone: string
          state: string
          title: string
          updated_at: string
          user_id: string
        }[]
      }
      get_security_headers: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_security_metrics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_trainee_progress_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          completed_courses: number
          course_progress_details: Json
          in_progress_courses: number
          join_date: string
          last_activity: string
          overall_progress_percentage: number
          total_courses: number
          trainee_company: string
          trainee_email: string
          trainee_name: string
          trainee_phone: string
          user_id: string
        }[]
      }
      get_user_encrypted_messages: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          encrypted_body: string
          encrypted_subject: string
          expires_at: string
          id: string
          is_read: boolean
          message_hash: string
          recipient_id: string
          sender_id: string
        }[]
      }
      get_user_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string
          city: string
          company: string
          course_progress: boolean
          created_at: string
          date_format: string
          email: string
          email_notifications: boolean
          font_size: string
          id: string
          join_date: string
          language: string
          location: string
          marketing_communications: boolean
          marketing_emails: boolean
          name: string
          new_courses: boolean
          phone: string
          push_notifications: boolean
          reduced_motion: boolean
          state: string
          theme: string
          timezone: string
          title: string
          updated_at: string
          user_id: string
          webinar_reminders: boolean
          weekly_progress: boolean
        }[]
      }
      get_user_role: {
        Args: { check_user_id?: string }
        Returns: string
      }
      get_user_session_info: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          device_id: string
          expires_at: string
          geolocation: Json
          id: string
          ip_address: unknown
          is_active: boolean
          last_activity_at: string
          risk_score: number
          security_level: number
          session_type: string
          terminated_at: string
          termination_reason: string
          user_agent: string
        }[]
      }
      has_any_role: {
        Args: { roles: string[] }
        Returns: boolean
      }
      is_admin: {
        Args: { check_user_id?: string }
        Returns: boolean
      }
      is_authenticated: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user_session: {
        Args: { session_user_id: string }
        Returns: boolean
      }
      is_current_user_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_production_environment: {
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
      log_admin_profile_access_detailed: {
        Args: {
          access_type: string
          fields_accessed: string[]
          reason?: string
          target_user_id: string
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
      log_client_security_event: {
        Args: {
          event_details?: Json
          event_severity: string
          event_type: string
        }
        Returns: string
      }
      log_compliance_audit: {
        Args: {
          p_action_details: Json
          p_action_type: string
          p_audit_category: string
          p_compliance_framework: string
          p_data_sensitivity?: string
          p_resource_id?: string
          p_resource_type: string
        }
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
      log_pii_access_attempt: {
        Args: {
          access_type: string
          accessed_user_id: string
          fields_accessed: string[]
        }
        Returns: undefined
      }
      log_pii_access_comprehensive: {
        Args: {
          access_reason?: string
          access_type: string
          accessed_user_id: string
          fields_accessed?: string[]
        }
        Returns: undefined
      }
      log_profile_access_comprehensive: {
        Args: { access_type?: string; accessed_user_id: string }
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
      log_sensitive_data_access_enhanced: {
        Args: {
          p_access_type?: string
          p_additional_context?: Json
          p_table_name: string
          p_user_id: string
        }
        Returns: undefined
      }
      log_successful_auth: {
        Args: { auth_type: string; user_email?: string }
        Returns: undefined
      }
      log_validated_security_event: {
        Args: {
          p_details: Json
          p_event_type: string
          p_severity: string
          p_source_function?: string
          p_user_id?: string
        }
        Returns: string
      }
      make_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      mask_profile_data_advanced: {
        Args: { profile_row: Record<string, unknown>; viewing_user_id: string }
        Returns: Json
      }
      mask_sensitive_data: {
        Args: {
          p_data: string
          p_field_type: string
          p_requesting_user_role?: string
        }
        Returns: string
      }
      mask_sensitive_profile_data: {
        Args: { profile_data: Json }
        Returns: Json
      }
      migrate_profile_to_encrypted: {
        Args: { profile_user_id: string }
        Returns: undefined
      }
      monitor_bulk_pii_access: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      monitor_bulk_pii_access_enhanced: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      monitor_encryption_security: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      monitor_profile_access_patterns: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      monitor_role_access_patterns: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      monitor_suspicious_user_behavior: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      register_device_fingerprint: {
        Args: { p_device_fingerprint: string; p_device_info?: Json }
        Returns: string
      }
      report_encryption_statistics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      revoke_user_role: {
        Args: {
          p_mfa_verified?: boolean
          p_reason?: string
          p_target_user_id: string
        }
        Returns: boolean
      }
      run_automated_security_maintenance: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      run_comprehensive_security_analysis: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      run_customer_data_security_monitoring: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      run_security_compliance_check: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      run_security_configuration_check: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      sanitize_error_response: {
        Args: { p_error_message: string; p_user_context?: Json }
        Returns: Json
      }
      secure_profile_access: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      security_health_check: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      send_encrypted_message: {
        Args: {
          expires_hours?: number
          message_body: string
          message_subject: string
          recipient_user_id: string
        }
        Returns: string
      }
      setup_initial_admin: {
        Args:
          | Record<PropertyKey, never>
          | { admin_email: string; admin_password: string }
        Returns: Json
      }
      trigger_emergency_security_lockdown: {
        Args: { p_reason: string; p_target_user_id?: string }
        Returns: Json
      }
      validate_and_sanitize_input: {
        Args: { input_text: string; max_length?: number }
        Returns: string
      }
      validate_biometric_access: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      validate_biometric_enrollment: {
        Args: {
          p_biometric_type: string
          p_device_fingerprint: string
          p_quality_score: number
          p_user_id: string
        }
        Returns: Json
      }
      validate_email_domain_for_role: {
        Args: { email_address: string; user_role?: string }
        Returns: boolean
      }
      validate_emergency_profile_access: {
        Args: { access_reason?: string; target_user_id: string }
        Returns: boolean
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
      validate_lead_submission: {
        Args: {
          p_company: string
          p_email: string
          p_first_name: string
          p_form_load_time: number
          p_honeypot: string
          p_last_name: string
        }
        Returns: Json
      }
      validate_mfa_access: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      validate_mfa_access_attempt: {
        Args: { p_method_type: string; p_user_id: string }
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
      validate_secure_profile_access: {
        Args: { target_user_id: string }
        Returns: Json
      }
      validate_secure_session: {
        Args: { p_require_mfa?: boolean }
        Returns: Json
      }
      validate_security_configuration: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      validate_sensitive_profile_access: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      validate_system_process: {
        Args:
          | { p_function_name: string; p_process_signature?: string }
          | { process_type: string }
        Returns: boolean
      }
      validate_ultra_secure_profile_access: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      validate_user_session: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      verify_complete_audit_chain: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      verify_profile_access_security: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      verify_security_implementation: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      verify_super_admin_privileges: {
        Args: { requesting_user_id: string }
        Returns: boolean
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
