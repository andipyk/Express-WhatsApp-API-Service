import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

type ValidationSchema = {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required?: boolean;
    nested?: ValidationSchema;
    arrayType?: ValidationSchema;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean;
    errorMessage?: string;
  };
};

export const validateRequest = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    Object.entries(schema).forEach(([field, rules]) => {
      const value = req.body[field];

      // Check required fields
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        return;
      }

      // Skip validation if field is not required and not provided
      if (!rules.required && (value === undefined || value === null)) {
        return;
      }

      // Type validation
      if (rules.type === 'array' && !Array.isArray(value)) {
        errors.push(`${field} must be an array`);
      } else if (rules.type !== 'array' && typeof value !== rules.type) {
        errors.push(`${field} must be a ${rules.type}`);
      }

      // String specific validations
      if (rules.type === 'string' && typeof value === 'string') {
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters long`);
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${field} must be no more than ${rules.maxLength} characters long`);
        }
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`${field} format is invalid`);
        }
      }

      // Custom validation
      if (rules.custom && !rules.custom(value)) {
        errors.push(`${field} validation failed`);
      }
    });

    if (errors.length > 0) {
      throw new AppError(400, errors.join(', '));
    }

    next();
  };
};

// Common validation schemas
export const messageValidation = {
  to: {
    type: 'string' as const,
    required: true,
    pattern: /^[0-9]+$/,
    minLength: 10,
    maxLength: 15
  },
  message: {
    type: 'string' as const,
    required: true,
    minLength: 1,
    maxLength: 4096
  }
};

export const scheduledMessageValidation = {
  ...messageValidation,
  scheduledTime: {
    type: 'string' as const,
    required: true,
    custom: (value: string) => {
      const date = new Date(value);
      return !isNaN(date.getTime()) && date.getTime() > Date.now();
    }
  }
};

export const bulkScheduledMessageValidation = {
  messages: {
    type: 'array' as const,
    required: true,
    custom: (value: any[]) => {
      if (!Array.isArray(value)) return false;
      if (value.length === 0) return false;
      return value.every(msg => 
        typeof msg.to === 'string' &&
        typeof msg.message === 'string' &&
        typeof msg.scheduledTime === 'string' &&
        !isNaN(new Date(msg.scheduledTime).getTime())
      );
    }
  }
}; 