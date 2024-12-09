import fs from 'fs';
import path from 'path';

type LogLevel = 'INFO' | 'ERROR' | 'DEBUG' | 'WARN';
type WhatsAppLogType = 'INCOMING' | 'OUTGOING' | 'STATUS' | 'EVENT' | 'ERROR';

interface LogMetadata {
  timestamp: string;
  level: LogLevel | WhatsAppLogType;
  [key: string]: any;
}

interface WhatsAppMessage {
  id?: string;
  from?: string;
  to?: string;
  body: string;
  timestamp: number;
  status?: string;
}

interface ErrorMetadata {
  errorMessage: string;
  stack?: string;
  code?: string | number;
  [key: string]: any;
}

class LoggerConfig {
  private readonly baseDir: string = 'logs';
  private readonly date: string;

  constructor() {
    this.date = new Date().toISOString().split('T')[0];
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir);
    }
  }

  public getLogPath(type: string): string {
    return path.join(this.baseDir, `${type}-${this.date}.log`);
  }
}

export class Logger {
  private static instance: Logger;
  private readonly config: LoggerConfig;
  private readonly logPaths: {
    app: string;
    error: string;
    whatsapp: string;
    messages: string;
    status: string;
  };

  private constructor() {
    this.config = new LoggerConfig();
    this.logPaths = {
      app: this.config.getLogPath('app'),
      error: this.config.getLogPath('error'),
      whatsapp: this.config.getLogPath('whatsapp'),
      messages: this.config.getLogPath('whatsapp-messages'),
      status: this.config.getLogPath('whatsapp-status')
    };
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatLog(level: LogLevel | WhatsAppLogType, message: string, meta?: any): string {
    const logData: LogMetadata = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(meta && { metadata: meta })
    };
    return JSON.stringify(logData, null, 2) + '\n';
  }

  private writeLog(filePath: string, content: string): void {
    try {
      fs.appendFileSync(filePath, content);
    } catch (error) {
      console.error(`Failed to write to log file ${filePath}:`, error);
    }
  }

  public info(message: string, meta?: any): void {
    const log = this.formatLog('INFO', message, meta);
    console.log(log);
    this.writeLog(this.logPaths.app, log);
  }

  public error(message: string, error?: Error | any): void {
    const errorMeta: ErrorMetadata = error instanceof Error ? {
      errorMessage: error.message,
      stack: error.stack,
      ...(error as any)
    } : error || {};

    const log = this.formatLog('ERROR', message, errorMeta);
    console.error(log);
    this.writeLog(this.logPaths.error, log);
  }

  public whatsappMessage(type: 'INCOMING' | 'OUTGOING', message: WhatsAppMessage): void {
    const log = this.formatLog(type, `WhatsApp message ${type.toLowerCase()}`, message);
    console.log(log);
    this.writeLog(this.logPaths.messages, log);
    this.writeLog(this.logPaths.whatsapp, log);
  }

  public whatsappStatus(status: string, meta?: any): void {
    const log = this.formatLog('STATUS', status, meta);
    console.log(log);
    this.writeLog(this.logPaths.status, log);
    this.writeLog(this.logPaths.whatsapp, log);
  }

  public whatsappEvent(event: string, meta?: any): void {
    const log = this.formatLog('EVENT', event, meta);
    console.log(log);
    this.writeLog(this.logPaths.status, log);
    this.writeLog(this.logPaths.whatsapp, log);
  }

  public whatsappError(message: string, error?: Error | any): void {
    const errorMeta: ErrorMetadata = error instanceof Error ? {
      errorMessage: error.message,
      stack: error.stack,
      ...(error as any)
    } : error || {};

    const log = this.formatLog('ERROR', message, errorMeta);
    console.error(log);
    this.writeLog(this.logPaths.error, log);
    this.writeLog(this.logPaths.status, log);
    this.writeLog(this.logPaths.whatsapp, log);
  }

  public getLogPaths(): typeof this.logPaths {
    return this.logPaths;
  }
} 