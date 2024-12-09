import fs from 'fs';
import { 
  IScheduledMessageRepository, 
  ScheduledMessage 
} from '../../domain/entities/scheduled-message';
import { Logger } from '../../utils/logger';

export class FileScheduledMessageRepository implements IScheduledMessageRepository {
  private messages: Map<string, ScheduledMessage>;
  private readonly storageFile: string;
  private readonly logger: Logger;

  constructor(storageFile: string = 'scheduled-messages.json') {
    this.messages = new Map();
    this.storageFile = storageFile;
    this.logger = Logger.getInstance();
    this.loadMessages();
  }

  private loadMessages(): void {
    try {
      if (fs.existsSync(this.storageFile)) {
        const data = fs.readFileSync(this.storageFile, 'utf8');
        const messages = JSON.parse(data) as ScheduledMessage[];
        
        messages.forEach(msg => {
          const message = {
            ...msg,
            scheduledTime: new Date(msg.scheduledTime),
            createdAt: new Date(msg.createdAt),
            updatedAt: new Date(msg.updatedAt)
          };
          this.messages.set(message.id, message);
        });
        
        this.logger.info(`Loaded ${messages.length} scheduled messages from storage`);
      }
    } catch (error) {
      this.logger.error('Error loading messages from storage:', error);
    }
  }

  private saveMessages(): void {
    try {
      const messages = Array.from(this.messages.values());
      fs.writeFileSync(this.storageFile, JSON.stringify(messages, null, 2));
    } catch (error) {
      this.logger.error('Error saving messages to storage:', error);
    }
  }

  async save(message: ScheduledMessage): Promise<void> {
    this.messages.set(message.id, message);
    this.saveMessages();
  }

  async findById(id: string): Promise<ScheduledMessage | null> {
    const message = this.messages.get(id);
    return message || null;
  }

  async findAll(): Promise<ScheduledMessage[]> {
    return Array.from(this.messages.values());
  }

  async update(id: string, message: Partial<ScheduledMessage>): Promise<void> {
    const existingMessage = this.messages.get(id);
    if (existingMessage) {
      this.messages.set(id, { ...existingMessage, ...message });
      this.saveMessages();
    }
  }

  async delete(id: string): Promise<void> {
    this.messages.delete(id);
    this.saveMessages();
  }
} 