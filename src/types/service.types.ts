// Service Operation Types
export interface ServiceOperationOptions {
  errorMessage: string;
  context?: string;
  validateFn?: () => boolean | Promise<boolean>;
}

export interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  context?: string;
}

// Service Configuration Types
export interface WhatsAppConfig {
  authPath: string;
  clientId: string;
  qrMaxRetries: number;
  connectionTimeout: number;
  puppeteerOptions: {
    headless: boolean;
    args: string[];
  };
}

export interface StorageConfig {
  basePath: string;
  fileExtension: string;
  encoding: BufferEncoding;
}

export interface LogConfig {
  basePath: string;
  maxSize: string;
  maxFiles: number;
  datePattern: string;
}

// Service State Types
export interface ServiceState {
  isReady: boolean;
  isInitializing: boolean;
  lastError?: Error;
  lastSync?: Date;
}

// Service Event Types
export type ServiceEventType = 
  | 'ready'
  | 'error'
  | 'disconnected'
  | 'reconnecting'
  | 'reconnected';

export interface ServiceEvent {
  type: ServiceEventType;
  timestamp: Date;
  data?: unknown;
}

// Service Metrics Types
export interface ServiceMetrics {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageResponseTime: number;
  lastOperationTime?: Date;
}

// Service Health Types
export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  lastCheck: Date;
  metrics: ServiceMetrics;
  state: ServiceState;
}

// Add this at the top of the file
export enum ServiceType {
  WHATSAPP = 'whatsapp',
  SCHEDULER = 'scheduler',
  NOTIFICATION = 'notification'
} 