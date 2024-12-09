import { Client, LocalAuth } from 'whatsapp-web.js';
import QRCode from 'qrcode';
import fs from 'fs';
import { AppError } from '../../presentation/middlewares/errorHandler';
import { Message, ScheduledMessage } from '../../domain/entities/scheduled-message';
import { IWhatsAppService } from '../../domain/interfaces/whatsapp.service';
import { whatsappConfig } from '../../config/whatsapp.config';
import { Logger } from '../../utils/logger';
import path from 'path';

// Constants
const CONSTANTS = {
  AUTH_PATH: '.wwebjs_auth',
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000,
  LOADING_FRAMES: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  LOADING_INTERVAL: 80,
  LOADING_DURATION: 3000
};

export class WhatsAppService implements IWhatsAppService {
  private static instance: WhatsAppService;
  private client!: Client;
  private readonly logger: Logger;
  private readonly scheduledMessages: Map<string, NodeJS.Timer>;
  private readonly state: {
    isReady: boolean;
    isInitializing: boolean;
  };

  private constructor() {
    this.logger = Logger.getInstance();
    this.scheduledMessages = new Map();
    this.state = {
      isReady: false,
      isInitializing: false
    };
    this.initializeClient();
    this.setupShutdownHandlers();
  }

  public static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  private setupShutdownHandlers(): void {
    process.on('SIGTERM', this.handleShutdown.bind(this));
    process.on('SIGINT', this.handleShutdown.bind(this));
  }

  private async handleShutdown(): Promise<void> {
    try {
      if (this.client) {
        this.logger.whatsappStatus('Gracefully shutting down WhatsApp client');
        await this.client.destroy();
      }
    } catch (error) {
      this.logger.whatsappError('Error during shutdown', error);
    }
  }

  public isReady(): boolean {
    return this.state.isReady;
  }

  public async initialize(): Promise<void> {
    if (this.state.isInitializing) {
      throw new AppError(503, 'WhatsApp client is already initializing');
    }

    this.state.isInitializing = true;
    try {
      await this.initializeWithRetry();
    } finally {
      this.state.isInitializing = false;
    }
  }

  private async initializeWithRetry(retries: number = CONSTANTS.MAX_RETRIES): Promise<void> {
    try {
      await this.client.initialize();
    } catch (error) {
      if (retries > 0) {
        this.logger.whatsappStatus(`Initialization failed, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, CONSTANTS.RETRY_DELAY));
        await this.initializeWithRetry(retries - 1);
      } else {
        throw error;
      }
    }
  }

  private initializeClient(): void {
    this.logger.whatsappEvent('Initializing WhatsApp service');
    
    try {
      const sessionPath = path.join(process.cwd(), CONSTANTS.AUTH_PATH, 'session');
      const hasExistingSession = fs.existsSync(sessionPath);

      this.client = new Client({
        ...whatsappConfig,
        authStrategy: new LocalAuth({
          clientId: 'whatsapp-api',
          dataPath: path.join(process.cwd(), CONSTANTS.AUTH_PATH)
        }),
        puppeteer: {
          ...whatsappConfig.puppeteer,
          userDataDir: hasExistingSession ? sessionPath : undefined
        }
      });

      this.setupEventHandlers();
      this.initialize().catch(error => {
        this.logger.whatsappError('Failed to initialize WhatsApp client', error);
      });
    } catch (error) {
      this.logger.whatsappError('Error creating WhatsApp client', error);
      throw new AppError(500, 'Failed to create WhatsApp client');
    }
  }

  private setupEventHandlers(): void {
    this.client
      .on('qr', this.handleQRCode.bind(this))
      .on('ready', this.handleReady.bind(this))
      .on('authenticated', this.handleAuthenticated.bind(this))
      .on('auth_failure', this.handleAuthFailure.bind(this))
      .on('disconnected', this.handleDisconnected.bind(this))
      .on('message', this.handleIncomingMessage.bind(this))
      .on('message_create', this.handleOutgoingMessage.bind(this));
  }

  private async handleQRCode(qr: string): Promise<void> {
    try {
      await this.showLoadingIndicator();
      const qrString = await QRCode.toString(qr, {
        type: 'terminal',
        small: true,
        margin: 0,
        scale: 1
      });
      this.logger.whatsappEvent('New QR code generated');
      this.qrCallback?.(qrString);
    } catch (error) {
      this.logger.whatsappError('Failed to generate QR code', error);
    }
  }

  private handleReady(): void {
    this.state.isReady = true;
    this.state.isInitializing = false;
    this.logger.whatsappStatus('WhatsApp client is ready');
    this.readyCallback?.();
  }

  private handleAuthenticated(): void {
    this.logger.whatsappStatus('WhatsApp client authenticated');
  }

  private async handleAuthFailure(error: Error): Promise<void> {
    this.state.isReady = false;
    this.logger.whatsappError('Authentication failed', error);
    await this.reinitialize();
  }

  private async handleDisconnected(reason: string): Promise<void> {
    this.state.isReady = false;
    this.logger.whatsappStatus('Client disconnected', { reason });
    this.disconnectedCallback?.(reason);
    await this.reinitialize();
  }

  private handleIncomingMessage(message: any): void {
    this.logger.whatsappMessage('INCOMING', {
      from: message.from,
      body: message.body,
      timestamp: message.timestamp
    });
    this.messageCallback?.(this.convertToMessage(message));
  }

  private handleOutgoingMessage(message: any): void {
    if (message.fromMe) {
      this.logger.whatsappMessage('OUTGOING', {
        to: message.to,
        body: message.body,
        timestamp: message.timestamp
      });
    }
  }

  private convertToMessage(whatsappMessage: any): Message {
    return {
      to: whatsappMessage.to || whatsappMessage.from,
      message: whatsappMessage.body
    };
  }

  private async showLoadingIndicator(): Promise<void> {
    let i = 0;
    return new Promise((resolve) => {
      const loadingInterval = setInterval(() => {
        process.stdout.write(`\r${CONSTANTS.LOADING_FRAMES[i]} Preparing WhatsApp client...`);
        i = (i + 1) % CONSTANTS.LOADING_FRAMES.length;
      }, CONSTANTS.LOADING_INTERVAL);

      setTimeout(() => {
        clearInterval(loadingInterval);
        process.stdout.write('\r\x1b[K');
        resolve();
      }, CONSTANTS.LOADING_DURATION);
    });
  }

  private async reinitialize(): Promise<void> {
    if (this.state.isInitializing) {
      this.logger.whatsappStatus('Already reinitializing');
      return;
    }

    this.state.isInitializing = true;
    this.state.isReady = false;

    try {
      await this.client.destroy();
      await new Promise(resolve => setTimeout(resolve, CONSTANTS.RETRY_DELAY));
      await this.initialize();
    } catch (error) {
      this.logger.whatsappError('Failed to reinitialize', error);
      throw new AppError(500, 'Failed to reinitialize WhatsApp client');
    }
  }

  // Event handler callbacks
  private readyCallback?: () => void;
  private disconnectedCallback?: (reason: string) => void;
  private messageCallback?: (message: Message) => void;
  private qrCallback?: (qrCode: string) => void;

  public onReady(callback: () => void): void {
    this.readyCallback = callback;
  }

  public onDisconnected(callback: (reason: string) => void): void {
    this.disconnectedCallback = callback;
  }

  public onMessageReceived(callback: (message: Message) => void): void {
    this.messageCallback = callback;
  }

  public onQRCodeGenerated(callback: (qrCode: string) => void): void {
    this.qrCallback = callback;
  }

  public async sendMessage(message: Message): Promise<void> {
    if (!this.state.isReady) {
      throw new AppError(503, 'WhatsApp service is not ready');
    }

    try {
      const formattedNumber = this.formatPhoneNumber(message.to);
      await this.validatePhoneNumber(formattedNumber);
      await this.client.sendMessage(formattedNumber, message.message);
    } catch (error) {
      await this.handleSendMessageError(error);
    }
  }

  public async scheduleMessage(message: ScheduledMessage): Promise<void> {
    const delay = message.scheduledTime.getTime() - Date.now();
    const timeoutId = setTimeout(
      () => this.handleScheduledMessage(message),
      delay
    );
    this.scheduledMessages.set(message.id, timeoutId);
  }

  public async cancelScheduledMessage(messageId: string): Promise<void> {
    const timeoutId = this.scheduledMessages.get(messageId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledMessages.delete(messageId);
    }
  }

  private async handleScheduledMessage(message: ScheduledMessage): Promise<void> {
    try {
      await this.sendMessage(message);
      this.scheduledMessages.delete(message.id);
    } catch (error) {
      this.logger.whatsappError('Failed to send scheduled message', {
        messageId: message.id,
        error
      });
    }
  }

  private formatPhoneNumber(phone: string): string {
    const cleanNumber = phone.replace(/\D/g, '');
    if (cleanNumber.includes('@c.us')) {
      return cleanNumber;
    }
    const numberWithCountryCode = cleanNumber.startsWith('62')
      ? cleanNumber
      : `62${cleanNumber.startsWith('0') ? cleanNumber.slice(1) : cleanNumber}`;
    return `${numberWithCountryCode}@c.us`;
  }

  private async validatePhoneNumber(phoneNumber: string): Promise<void> {
    const numberExists = await this.client.isRegisteredUser(phoneNumber);
    if (!numberExists) {
      throw new AppError(404, 'Phone number is not registered on WhatsApp');
    }
  }

  private async handleSendMessageError(error: unknown): Promise<never> {
    if (this.isSessionError(error)) {
      await this.reinitialize();
      throw new AppError(503, 'Session expired. Please scan the QR code again.');
    }
    throw new AppError(500, 'Failed to send WhatsApp message');
  }

  private isSessionError(error: unknown): boolean {
    return error instanceof Error &&
      (error.message.includes('Session') || error.message.includes('Connection'));
  }
} 