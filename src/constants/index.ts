export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const MESSAGE_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export const VALIDATION_RULES = {
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15,
    PATTERN: /^[0-9]+$/,
  },
  MESSAGE: {
    MAX_LENGTH: 4096,
  },
} as const;

export const FILE_PATHS = {
  STORAGE: 'scheduled-messages.json',
  AUTH: '.wwebjs_auth',
  LOGS: {
    APP: 'app',
    ERROR: 'error',
    WHATSAPP: 'whatsapp',
    MESSAGES: 'whatsapp-messages',
    STATUS: 'whatsapp-status',
  },
} as const;

export const API_RESPONSES = {
  SUCCESS: {
    MESSAGE_SENT: 'Message sent successfully',
    MESSAGE_SCHEDULED: 'Message scheduled successfully',
    MESSAGE_CANCELLED: 'Message cancelled successfully',
  },
  ERROR: {
    NOT_READY: 'WhatsApp service is not ready. Please scan the QR code first.',
    INVALID_PHONE: 'Phone number is not registered on WhatsApp',
    FUTURE_TIME: 'Scheduled time must be in the future',
    MESSAGE_NOT_FOUND: 'Scheduled message not found',
    REQUIRED_FIELDS: 'All required fields must be provided',
  },
} as const; 