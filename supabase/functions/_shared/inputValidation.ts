/**
 * Secure Input Validation Module
 * 
 * Provides runtime schema validation for edge function inputs
 * to prevent injection attacks and malformed data.
 */

// Validation result type
interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

// Schema field types
type FieldType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'email' | 'uuid';

interface FieldSchema {
  type: FieldType;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  maxItems?: number;
  minItems?: number;
  pattern?: RegExp;
  enum?: string[];
  itemType?: FieldType;
  properties?: Record<string, FieldSchema>;
}

type Schema = Record<string, FieldSchema>;

/**
 * Validate a value against a field schema
 */
function validateField(
  fieldName: string,
  value: unknown,
  schema: FieldSchema
): string[] {
  const errors: string[] = [];

  // Check required
  if (schema.required && (value === undefined || value === null)) {
    errors.push(`${fieldName} is required`);
    return errors;
  }

  // Skip further validation if value is not provided and not required
  if (value === undefined || value === null) {
    return errors;
  }

  // Type validation
  switch (schema.type) {
    case 'string':
      if (typeof value !== 'string') {
        errors.push(`${fieldName} must be a string`);
        break;
      }
      if (schema.minLength && value.length < schema.minLength) {
        errors.push(`${fieldName} must be at least ${schema.minLength} characters`);
      }
      if (schema.maxLength && value.length > schema.maxLength) {
        errors.push(`${fieldName} must be at most ${schema.maxLength} characters`);
      }
      if (schema.pattern && !schema.pattern.test(value)) {
        errors.push(`${fieldName} has invalid format`);
      }
      if (schema.enum && !schema.enum.includes(value)) {
        errors.push(`${fieldName} must be one of: ${schema.enum.join(', ')}`);
      }
      break;

    case 'email':
      if (typeof value !== 'string') {
        errors.push(`${fieldName} must be a string`);
        break;
      }
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        errors.push(`${fieldName} must be a valid email address`);
      }
      if (schema.maxLength && value.length > schema.maxLength) {
        errors.push(`${fieldName} must be at most ${schema.maxLength} characters`);
      }
      break;

    case 'uuid':
      if (typeof value !== 'string') {
        errors.push(`${fieldName} must be a string`);
        break;
      }
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidPattern.test(value)) {
        errors.push(`${fieldName} must be a valid UUID`);
      }
      break;

    case 'number':
      if (typeof value !== 'number' || isNaN(value)) {
        errors.push(`${fieldName} must be a number`);
        break;
      }
      if (schema.min !== undefined && value < schema.min) {
        errors.push(`${fieldName} must be at least ${schema.min}`);
      }
      if (schema.max !== undefined && value > schema.max) {
        errors.push(`${fieldName} must be at most ${schema.max}`);
      }
      break;

    case 'boolean':
      if (typeof value !== 'boolean') {
        errors.push(`${fieldName} must be a boolean`);
      }
      break;

    case 'array':
      if (!Array.isArray(value)) {
        errors.push(`${fieldName} must be an array`);
        break;
      }
      if (schema.maxItems !== undefined && value.length > schema.maxItems) {
        errors.push(`${fieldName} must have at most ${schema.maxItems} items`);
      }
      if (schema.minItems !== undefined && value.length < schema.minItems) {
        errors.push(`${fieldName} must have at least ${schema.minItems} items`);
      }
      // Validate array item types
      if (schema.itemType) {
        for (let i = 0; i < value.length; i++) {
          const itemErrors = validateField(
            `${fieldName}[${i}]`,
            value[i],
            { type: schema.itemType, required: true }
          );
          errors.push(...itemErrors);
        }
      }
      break;

    case 'object':
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        errors.push(`${fieldName} must be an object`);
        break;
      }
      // Validate nested properties if defined
      if (schema.properties) {
        for (const [propName, propSchema] of Object.entries(schema.properties)) {
          const propErrors = validateField(
            `${fieldName}.${propName}`,
            (value as Record<string, unknown>)[propName],
            propSchema
          );
          errors.push(...propErrors);
        }
      }
      break;
  }

  return errors;
}

/**
 * Validate input data against a schema
 */
export function validateInput<T>(
  data: unknown,
  schema: Schema
): ValidationResult<T> {
  const errors: string[] = [];

  // Check if data is an object
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return {
      success: false,
      errors: ['Input must be an object'],
    };
  }

  const inputData = data as Record<string, unknown>;

  // Validate each field
  for (const [fieldName, fieldSchema] of Object.entries(schema)) {
    const fieldErrors = validateField(fieldName, inputData[fieldName], fieldSchema);
    errors.push(...fieldErrors);
  }

  if (errors.length > 0) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    data: inputData as T,
  };
}

/**
 * Sanitize string input to prevent XSS and injection
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

/**
 * Create a safe identifier (alphanumeric + underscore/hyphen only)
 */
export function sanitizeIdentifier(input: string): string {
  return input.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 100);
}

// Pre-built schemas for common use cases

export const threatDetectionSchema: Schema = {
  events: {
    type: 'array',
    required: false,
    maxItems: 100, // Prevent DoS via large arrays
    itemType: 'object',
  },
  analysisType: {
    type: 'string',
    required: false,
    maxLength: 50,
    enum: ['batch', 'realtime', 'scheduled', 'manual'],
  },
};

export const adminOperationSchema: Schema = {
  operation: {
    type: 'string',
    required: true,
    maxLength: 100,
    enum: [
      'get_filtered_profiles',
      'assign_role',
      'revoke_role',
      'delete_user',
      'update_user_status',
      'get_audit_logs',
      'export_data',
    ],
  },
};

export const fileUploadSchema: Schema = {
  fileName: {
    type: 'string',
    required: true,
    maxLength: 255,
    pattern: /^[a-zA-Z0-9_\-. ]+$/,
  },
  fileSize: {
    type: 'number',
    required: true,
    min: 1,
    max: 50 * 1024 * 1024, // 50MB max
  },
  mimeType: {
    type: 'string',
    required: true,
    maxLength: 100,
    enum: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'video/mp4',
      'video/webm',
    ],
  },
  maxSize: {
    type: 'number',
    required: false,
    min: 1,
    max: 100 * 1024 * 1024, // 100MB max
  },
};

export const securityMonitorSchema: Schema = {
  action: {
    type: 'string',
    required: true,
    maxLength: 50,
    enum: [
      'get_security_alerts',
      'resolve_alert',
      'analyze_security_events',
      'get_security_dashboard',
      'create_test_alert',
    ],
  },
  alertId: {
    type: 'uuid',
    required: false,
  },
};
