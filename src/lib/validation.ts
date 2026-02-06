/**
 * Form Validation Schemas using Zod
 *
 * Provides type-safe validation for all form inputs
 * to prevent XSS, SQL injection, and other input-based attacks.
 */

import { z } from 'zod';

// Common validation patterns
const DANGEROUS_PATTERNS = /[<>{}]/g; // Basic XSS prevention
const SQL_INJECTION_PATTERNS = /('|"|;|--|\*|\/\*|\*\/|xp_|exec|execute|insert|select|delete|update|drop|union|create|alter|truncate)/gi;

// Helper to sanitize input
const sanitizeInput = (input: string): string => {
  return input
    .replace(DANGEROUS_PATTERNS, '')
    .replace(SQL_INJECTION_PATTERNS, '')
    .trim();
};

// Custom sanitization transformer
const sanitizedString = (maxLength: number = 500) =>
  z.string()
    .max(maxLength)
    .transform(sanitizeInput);

// ================== AUTH SCHEMAS ==================

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(254, 'Email is too long')
  .transform((email) => email.toLowerCase().trim());

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long')
    .transform(sanitizeInput),
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// ================== PROFILE SCHEMAS ==================

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name is too long')
  .transform(sanitizeInput);

export const ageSchema = z
  .number()
  .int('Age must be a whole number')
  .min(18, 'You must be at least 18 years old')
  .max(120, 'Please enter a valid age');

export const bioSchema = z
  .string()
  .max(500, 'Bio is too long (max 500 characters)')
  .transform(sanitizeInput)
  .optional();

export const locationSchema = z
  .string()
  .max(100, 'Location is too long')
  .transform(sanitizeInput)
  .optional();

export const zipCodeSchema = z
  .string()
  .regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code')
  .optional();

export const occupationSchema = z
  .string()
  .max(100, 'Occupation is too long')
  .transform(sanitizeInput)
  .optional();

export const profileUpdateSchema = z.object({
  name: nameSchema.optional(),
  age: ageSchema.optional(),
  bio: bioSchema,
  location: locationSchema,
  zipCode: zipCodeSchema,
  occupation: occupationSchema,
  gender: z.enum(['man', 'woman', 'nonbinary']).nullable().optional(),
  lookingFor: z.enum(['men', 'women', 'everyone']).nullable().optional(),
});

// ================== MESSAGE SCHEMAS ==================

export const messageSchema = z
  .string()
  .min(1, 'Message cannot be empty')
  .max(2000, 'Message is too long (max 2000 characters)')
  .transform(sanitizeInput);

// ================== CUSTOM QUESTION SCHEMAS ==================

export const customQuestionSchema = z
  .string()
  .min(5, 'Question must be at least 5 characters')
  .max(200, 'Question is too long (max 200 characters)')
  .transform(sanitizeInput);

// ================== VALIDATION HELPERS ==================

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Validate data against a schema and return a friendly result
 */
export function validate<T>(
  schema: z.ZodType<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Return the first error message
      const zodError = error as z.ZodError<T>;
      const firstError = zodError.issues[0];
      return { success: false, error: firstError?.message ?? 'Validation failed' };
    }
    return { success: false, error: 'Validation failed' };
  }
}

/**
 * Validate email and return result
 */
export function validateEmail(email: string): ValidationResult<string> {
  return validate(emailSchema, email);
}

/**
 * Validate password and return result
 */
export function validatePassword(password: string): ValidationResult<string> {
  return validate(passwordSchema, password);
}

/**
 * Validate sign up data and return result
 */
export function validateSignUp(data: {
  email: string;
  password: string;
  name: string;
}): ValidationResult<{ email: string; password: string; name: string }> {
  return validate(signUpSchema, data);
}

/**
 * Validate sign in data and return result
 */
export function validateSignIn(data: {
  email: string;
  password: string;
}): ValidationResult<{ email: string; password: string }> {
  return validate(signInSchema, data);
}

/**
 * Validate message content
 */
export function validateMessage(message: string): ValidationResult<string> {
  return validate(messageSchema, message);
}

/**
 * Validate custom question
 */
export function validateCustomQuestion(question: string): ValidationResult<string> {
  return validate(customQuestionSchema, question);
}

export default {
  emailSchema,
  passwordSchema,
  signUpSchema,
  signInSchema,
  profileUpdateSchema,
  messageSchema,
  customQuestionSchema,
  validate,
  validateEmail,
  validatePassword,
  validateSignUp,
  validateSignIn,
  validateMessage,
  validateCustomQuestion,
};
