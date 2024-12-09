import { 
  CreateScheduledMessageDto, 
  IScheduleMessageUseCase, 
  IScheduledMessageRepository, 
  ScheduledMessage 
} from '../../domain/entities/scheduled-message';
import { IWhatsAppService } from '../../domain/interfaces/whatsapp.service';
import { AppError } from '../../presentation/middlewares/errorHandler';
import { v4 as uuidv4 } from 'uuid';

export class ScheduleMessageUseCase implements IScheduleMessageUseCase {
  constructor(
    private readonly messageRepository: IScheduledMessageRepository,
    private readonly whatsappService: IWhatsAppService
  ) {}

  private validateScheduledTime(scheduledTime: Date): void {
    if (scheduledTime.getTime() <= Date.now()) {
      throw new AppError(400, 'Scheduled time must be in the future');
    }
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    retries: number = 3
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.withRetry(operation, retries - 1);
      }
      throw error;
    }
  }

  async schedule(dto: CreateScheduledMessageDto): Promise<ScheduledMessage> {
    if (!this.whatsappService.isReady()) {
      throw new AppError(503, 'WhatsApp service is not ready');
    }

    const scheduledTime = new Date(dto.scheduledTime);
    this.validateScheduledTime(scheduledTime);

    const message: ScheduledMessage = {
      id: uuidv4(),
      to: dto.to,
      message: dto.message,
      scheduledTime,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      await this.messageRepository.save(message);
      await this.whatsappService.scheduleMessage(message);
      return message;
    } catch (error) {
      await this.messageRepository.delete(message.id);
      throw error;
    }
  }

  async cancel(id: string): Promise<boolean> {
    const message = await this.messageRepository.findById(id);
    if (!message || message.status !== 'pending') {
      return false;
    }

    await this.messageRepository.update(id, { 
      status: 'cancelled',
      updatedAt: new Date()
    });
    await this.whatsappService.cancelScheduledMessage(id);

    return true;
  }

  async get(id: string): Promise<ScheduledMessage | null> {
    return this.messageRepository.findById(id);
  }

  async getAll(): Promise<ScheduledMessage[]> {
    return this.messageRepository.findAll();
  }
} 