import { Message, ScheduledMessage } from '../entities/scheduled-message';

export interface IWhatsAppService {
  // Connection status
  isReady(): boolean;
  initialize(): Promise<void>;
  
  // Message operations
  sendMessage(message: Message): Promise<void>;
  scheduleMessage(message: ScheduledMessage): Promise<void>;
  cancelScheduledMessage(messageId: string): Promise<void>;
  
  // Event handlers
  onReady(callback: () => void): void;
  onDisconnected(callback: (reason: string) => void): void;
  onMessageReceived(callback: (message: Message) => void): void;
  onQRCodeGenerated(callback: (qrCode: string) => void): void;
} 