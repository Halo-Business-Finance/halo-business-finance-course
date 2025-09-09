import { pgTable, text, varchar, timestamp, boolean, integer, json, serial, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Users profile table - Core user information with PII protection
export const profiles = pgTable('profiles', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar('user_id').notNull(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  company: text('company'),
  title: text('title'),
  city: text('city'),
  state: text('state'),
  location: text('location'),
  avatar_url: text('avatar_url'),
  timezone: text('timezone'),
  language: text('language'),
  theme: text('theme'),
  font_size: text('font_size'),
  date_format: text('date_format'),
  
  // Encrypted PII fields
  encrypted_name: text('encrypted_name'),
  encrypted_email: text('encrypted_email'),
  encrypted_phone: text('encrypted_phone'),
  encryption_status: text('encryption_status'),
  data_classification: text('data_classification'),
  pii_access_level: text('pii_access_level'),
  
  // Notification preferences
  email_notifications: boolean('email_notifications').default(true),
  push_notifications: boolean('push_notifications').default(true),
  marketing_emails: boolean('marketing_emails').default(false),
  marketing_communications: boolean('marketing_communications').default(false),
  webinar_reminders: boolean('webinar_reminders').default(true),
  weekly_progress: boolean('weekly_progress').default(true),
  new_courses: boolean('new_courses').default(true),
  course_progress: boolean('course_progress').default(true),
  
  // Accessibility
  reduced_motion: boolean('reduced_motion').default(false),
  
  // Security
  last_security_audit: timestamp('last_security_audit'),
  
  // Timestamps
  join_date: text('join_date').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Courses table - Learning content management
export const courses = pgTable('courses', {
  id: varchar('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  level: text('level').notNull(),
  image_url: text('image_url'),
  is_active: boolean('is_active').default(true),
  order_index: integer('order_index'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Security Events table - Critical for security monitoring
export const security_events = pgTable('security_events', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar('user_id'),
  event_type: text('event_type').notNull(),
  severity: text('severity').notNull(),
  details: json('details'),
  
  // Security metadata
  data_classification: text('data_classification'),
  immutable: boolean('immutable').default(true),
  logged_via_secure_function: boolean('logged_via_secure_function').default(false),
  chain_verified: boolean('chain_verified').default(false),
  validation_signature: text('validation_signature'),
  
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Threat Detection Events table - AI-powered security monitoring
export const threat_detection_events = pgTable('threat_detection_events', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  event_type: text('event_type').notNull(),
  severity: text('severity').notNull(),
  source_ip: text('source_ip'),
  user_agent: text('user_agent'),
  request_path: text('request_path'),
  threat_indicators: json('threat_indicators'),
  geolocation: json('geolocation'),
  is_blocked: boolean('is_blocked').default(false),
  automated_response: text('automated_response'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Advanced Rate Limits table - Security rate limiting
export const advanced_rate_limits = pgTable('advanced_rate_limits', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  identifier: text('identifier').notNull(),
  endpoint: text('endpoint').notNull(),
  request_count: integer('request_count').default(0),
  window_start: timestamp('window_start').defaultNow(),
  is_blocked: boolean('is_blocked').default(false),
  block_until: timestamp('block_until'),
  threat_level: integer('threat_level').default(0),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// AI Threat Analyses table - Store AI-powered threat analysis results
export const ai_threat_analyses = pgTable('ai_threat_analyses', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  analysis_type: text('analysis_type').notNull(),
  threat_level: text('threat_level').notNull(),
  threat_type: text('threat_type').notNull(),
  confidence_score: integer('confidence_score'),
  risk_score: integer('risk_score'),
  reasoning: text('reasoning'),
  recommended_actions: json('recommended_actions'),
  detected_patterns: json('detected_patterns'),
  analysis_data: json('analysis_data'),
  events_analyzed: integer('events_analyzed'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Security Alerts table - High-priority security notifications
export const security_alerts = pgTable('security_alerts', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  alert_type: text('alert_type').notNull(),
  severity: text('severity').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  metadata: json('metadata'),
  is_resolved: boolean('is_resolved').default(false),
  resolved_at: timestamp('resolved_at'),
  resolved_by: varchar('resolved_by'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// User Roles table - Role-based access control
export const user_roles = pgTable('user_roles', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar('user_id').notNull(),
  role: text('role').notNull(),
  assigned_by: varchar('assigned_by'),
  assigned_at: timestamp('assigned_at').defaultNow().notNull(),
  is_active: boolean('is_active').default(true),
  metadata: json('metadata'),
});

// Course Progress table - Track learning progress
export const course_progress = pgTable('course_progress', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar('user_id').notNull(),
  course_id: varchar('course_id').notNull(),
  progress_percentage: integer('progress_percentage').default(0),
  completed_at: timestamp('completed_at'),
  last_accessed_at: timestamp('last_accessed_at'),
  time_spent_minutes: integer('time_spent_minutes').default(0),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// User Sessions table - Session management and security
export const user_sessions = pgTable('user_sessions', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar('user_id').notNull(),
  session_token: text('session_token'),
  ip_address: text('ip_address'),
  user_agent: text('user_agent'),
  device_id: text('device_id'),
  geolocation: json('geolocation'),
  is_active: boolean('is_active').default(true),
  expires_at: timestamp('expires_at'),
  terminated_at: timestamp('terminated_at'),
  termination_reason: text('termination_reason'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Export all tables for easy access
export const schema = {
  profiles,
  courses,
  security_events,
  threat_detection_events,
  advanced_rate_limits,
  ai_threat_analyses,
  security_alerts,
  user_roles,
  course_progress,
  user_sessions,
};